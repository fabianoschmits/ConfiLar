'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSupabaseMessages, ConversationWithParticipant } from '@/hooks/useSupabaseMessages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  PaperPlane as SendPhosphor,
  ChatTeardrop,
  X,
  CheckCircle,
  Check as CheckPhosphor,
  ArrowsInSimple,
  ArrowsOutSimple,
  ArrowLeft,
  Envelope
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface FloatingChatProps {
  isOpen: boolean
  onToggle: () => void
  onMinimize: () => void
  onMaximize: () => void
  selectedConversationId?: string
  onSelectConversation?: (conversationId?: string) => void
  targetUserId?: string
  targetUserName?: string
}

export function FloatingChat({ 
  isOpen, 
  onToggle, 
  onMinimize, 
  onMaximize,
  selectedConversationId,
  onSelectConversation,
  targetUserId,
  targetUserName
}: FloatingChatProps) {
  const { user, profile } = useAuthContext()
  const [newMessage, setNewMessage] = useState('')
  const [showConversations, setShowConversations] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    conversations,
    messages,
    selectedConversation,
    totalUnread,
    sendMessage,
    setSelectedConversation,
    fetchMessages,
    createConversation
  } = useSupabaseMessages()

  // Auto-scroll para o final das mensagens
  const scrollToBottom = useCallback((instant = false) => {
    if (messagesEndRef.current) {
      const behavior = instant ? 'auto' : 'smooth'
      messagesEndRef.current.scrollIntoView({ 
        behavior,
        block: 'end',
        inline: 'nearest'
      })
    }
  }, [])

  // Scroll automático quando mensagens mudam
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true) // Rolagem instantânea para a última mensagem
    }
  }, [messages, scrollToBottom])

  // Selecionar conversa quando prop mudar
  useEffect(() => {
    if (selectedConversationId && selectedConversationId !== selectedConversation) {
      setSelectedConversation(selectedConversationId)
      fetchMessages(selectedConversationId)
      scrollToBottom(true) // Rolagem ao mudar de conversa
    }
  }, [selectedConversationId, selectedConversation, setSelectedConversation, fetchMessages, scrollToBottom])

  // Quando há targetUserId, focar no campo de mensagem
  useEffect(() => {
    if (targetUserId && targetUserName && isOpen) {
      // Se não há conversa selecionada, focar no campo de mensagem
      if (!selectedConversationId) {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }
    }
  }, [targetUserId, targetUserName, isOpen, selectedConversationId])

  // Enviar mensagem
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) return

    try {
      let currentConversationId = selectedConversation
      let isNewConversation = false

      // Se há targetUserId mas não há conversa selecionada, criar uma nova conversa
      if (targetUserId && !currentConversationId) {
        console.log('🆕 Criando nova conversa com:', targetUserId)
        const conversationId = await createConversation(targetUserId)
        
        if (conversationId) {
          currentConversationId = conversationId
          isNewConversation = true
          setSelectedConversation(conversationId)
          await fetchMessages(conversationId)
          onSelectConversation?.(conversationId)
        } else {
          throw new Error('Erro ao criar conversa')
        }
      }

      // Se ainda não há conversa selecionada, não pode enviar
      if (!currentConversationId) {
        console.error('❌ Nenhuma conversa selecionada')
        toast.error('Erro: Nenhuma conversa selecionada')
        return
      }

      await sendMessage(currentConversationId, newMessage.trim())
      setNewMessage('')
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      
      scrollToBottom(true)
      
      // Se foi uma nova conversa, notificar o contexto para limpar targetUserId
      if (isNewConversation && targetUserId) {
        // Após enviar a primeira mensagem, limpar o targetUserId para que o botão de voltar vá para a lista
        setTimeout(() => {
          // Chamar onSelectConversation sem parâmetros para limpar o targetUserId
          onSelectConversation?.()
        }, 100)
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem')
    }
  }, [newMessage, selectedConversation, targetUserId, sendMessage, createConversation, setSelectedConversation, fetchMessages, onSelectConversation, scrollToBottom])

  // Enviar com Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)
    
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  // Formatar hora
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Obter ícone de status da mensagem
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckPhosphor size={12} weight="light" className="text-gray-400" />
      case 'delivered':
        return <CheckCircle size={12} weight="light" className="text-blue-500" />
      case 'read':
        return <CheckCircle size={12} weight="light" className="text-green-500" />
      default:
        return null
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-24 right-4 z-50">
        <Button
          onClick={onToggle}
          size="lg"
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <Envelope size={24} weight="light" />
          {totalUnread > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {totalUnread > 99 ? '99+' : totalUnread}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 w-64 h-72 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col floating-chat lg:w-64 lg:h-72">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          {selectedConversationId ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectConversation?.()}
              className="h-8 w-8 p-0 hover:bg-gray-200"
              title="Voltar para conversas"
            >
              <ArrowLeft size={16} weight="light" className="text-gray-600" />
            </Button>
          ) : (
            <Envelope size={20} weight="light" className="text-blue-600" />
          )}
          <h3 className="text-sm font-semibold text-gray-900">
            {selectedConversationId ? 'Conversa' : targetUserName ? `Chat com ${targetUserName}` : 'Chat'}
          </h3>
          {!selectedConversationId && totalUnread > 0 && (
            <Badge variant="destructive" className="text-xs">
              {totalUnread}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMinimize}
            className="h-8 w-8 p-0"
          >
            <ArrowsInSimple size={16} weight="light" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMaximize}
            className="h-8 w-8 p-0"
          >
            <ArrowsOutSimple size={16} weight="light" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
          >
            <X size={16} weight="light" />
          </Button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedConversationId ? (
          <>
                          {/* Header da conversa */}
              <div className="p-3 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                {(() => {
                  const selectedConv = conversations.find(c => c.id === selectedConversation)
                  return (
                    <>
                      <UserAvatar
                        src={selectedConv?.participant?.avatar_url}
                        alt={selectedConv?.participant?.full_name || 'Usuário'}
                        className="w-8 h-8"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-xs">
                          {selectedConv?.participant?.full_name || 'Usuário'}
                        </h4>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-xs text-gray-500">online</span>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>

            {/* Mensagens - Área com espaço suficiente */}
            <ScrollArea className="flex-1 bg-gray-50 messages-area">
              <div className="space-y-2 p-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-end space-x-1 max-w-[85%]">
                      {message.sender_id !== user?.id && (() => {
                        const selectedConv = conversations.find(c => c.id === selectedConversation)
                        return (
                          <UserAvatar
                            src={selectedConv?.participant?.avatar_url}
                            alt={selectedConv?.participant?.full_name || 'Usuário'}
                            className="w-6 h-6 flex-shrink-0"
                          />
                        )
                      })()}
                      <div
                        className={`px-3 py-2 rounded-lg ${
                          message.sender_id === user?.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="text-xs leading-relaxed">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${
                            message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(new Date(message.created_at))}
                          </span>
                          {message.sender_id === user?.id && (
                            <div className="ml-2">
                              {getStatusIcon('read')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input de mensagem - Sempre visível */}
            <div className="p-2 border-t border-gray-200 bg-white input-area">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={handleTextareaChange}
                    onKeyPress={handleKeyPress}
                    className="min-h-[40px] max-h-[80px] lg:min-h-[45px] lg:max-h-[90px] resize-none text-xs border-gray-300 focus:border-blue-500 placeholder:text-xs"
                    rows={1}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 p-0 flex-shrink-0"
                >
                  <SendPhosphor size={16} weight="light" />
                </Button>
              </div>
            </div>
          </>
        ) : targetUserId && targetUserName ? (
          // Nova conversa com usuário específico
          <div className="flex-1 flex flex-col">
            <div className="p-3 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <UserAvatar
                  src={null}
                  alt={targetUserName}
                  className="w-8 h-8"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-xs">
                    {targetUserName}
                  </h4>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-500">online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Área de nova conversa */}
            <div className="flex-1 bg-gray-50 flex items-center justify-center p-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Envelope size={24} weight="light" className="text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 text-sm mb-2">
                  Iniciar conversa com {targetUserName}
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  Digite sua mensagem abaixo para começar a conversa
                </p>
              </div>
            </div>

            {/* Input de mensagem para nova conversa */}
            <div className="p-2 border-t border-gray-200 bg-white input-area">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    placeholder={`Digite sua mensagem para ${targetUserName}...`}
                    value={newMessage}
                    onChange={handleTextareaChange}
                    onKeyPress={handleKeyPress}
                    className="min-h-[40px] max-h-[80px] lg:min-h-[45px] lg:max-h-[90px] resize-none text-xs border-gray-300 focus:border-blue-500 placeholder:text-xs"
                    rows={1}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 p-0 flex-shrink-0"
                >
                  <SendPhosphor size={16} weight="light" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Lista de conversas
          <div className="flex-1 flex flex-col">
            <div className="p-3 border-b border-gray-200">
              <h4 className="font-medium text-gray-900 text-xs mb-2">Conversas Recentes</h4>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {conversations.slice(0, 5).map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation.id)
                      fetchMessages(conversation.id)
                      onSelectConversation?.(conversation.id)
                    }}
                    className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <UserAvatar
                        src={conversation.participant?.avatar_url}
                        alt={conversation.participant?.full_name || 'Usuário'}
                        className="w-10 h-10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-900 text-xs truncate">
                            {conversation.participant?.full_name || 'Usuário'}
                          </h5>
                          {conversation.unread_count && conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {typeof conversation.last_message === 'string' 
                            ? conversation.last_message 
                            : 'Nenhuma mensagem'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-3 border-t border-gray-200">
              <Button
                onClick={() => window.location.href = '/mensagens'}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Ver todas as conversas
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}