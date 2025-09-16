'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  X, 
  Send, 
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  Edit3,
  X as XIcon
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContext'
import { useMessages } from '@/hooks/useMessages'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { ConversationMenu } from './ConversationMenu'
import { MessageMenu } from './MessageMenu'
import { ContactAgreementChat } from './ContactAgreementChat'
import { AgreementButton } from './AgreementButton'

export function FloatingChat() {
  const { user, profile } = useAuthContext()
  const { isOpen, closeChat, selectedConversationId, selectConversation } = useFloatingChat()
  const { 
    conversations, 
    messages, 
    loadConversations, 
    loadMessages, 
    sendMessage, 
    markMessagesAsRead,
    deleteConversation,
    deleteMessage,
    editMessage,
    getTotalUnreadCount 
  } = useMessages()
  
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [showAgreementModal, setShowAgreementModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Sincronizar isOpen do contexto com isExpanded local
  useEffect(() => {
    setIsExpanded(isOpen)
  }, [isOpen])

  // Sincronizar com contexto quando selectedConversationId muda
  useEffect(() => {
    if (selectedConversationId) {
      const conversation = conversations.find(c => c.id === selectedConversationId)
      if (conversation) {
        setSelectedConversation(conversation)
        loadMessages(conversation.id)
        markMessagesAsRead(conversation.id)
        // Não forçar scroll - usuário tem controle total
        setShouldAutoScroll(false)
        setIsUserScrolling(false)
      }
    } else {
      setSelectedConversation(null)
    }
  }, [selectedConversationId, conversations])

  // Carregar conversas quando o chat expande
  useEffect(() => {
    if (isExpanded && user?.id) {
      loadConversations()
    }
  }, [isExpanded, user?.id])

  // Atualizar mensagens quando conversa muda (SEM LOOP)
  useEffect(() => {
    if (selectedConversation && user?.id) {
      loadMessages(selectedConversation.id)
      markMessagesAsRead(selectedConversation.id)
      // Não forçar scroll automático ao abrir conversa
      setShouldAutoScroll(false)
      setIsUserScrolling(false)
    }
  }, [selectedConversation?.id, user?.id]) // Usar apenas o ID da conversa


  // Verificar se o usuário está próximo do final do chat
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true
    
    const container = messagesContainerRef.current
    const threshold = 100 // pixels do final
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    
    return distanceFromBottom <= threshold
  }

  // Scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Removido auto-scroll automático - usuário tem controle total

  // Detectar quando o usuário rola manualmente - sem interferir
  const handleScroll = () => {
    // Apenas detectar scroll, sem forçar comportamento
    const nearBottom = isNearBottom()
    setIsUserScrolling(!nearBottom)
  }

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user?.id || sending) return

    try {
      setSending(true)
      await sendMessage(selectedConversation.id, newMessage.trim())
      setNewMessage('')
      // Não forçar scroll automático - deixar o usuário decidir
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setSending(false)
    }
  }

  // Função para fechar o chat
  const handleCloseChat = () => {
    setIsExpanded(false)
    closeChat()
  }

  // Voltar para lista de conversas
  const goBackToConversations = () => {
    setSelectedConversation(null)
    selectConversation(undefined)
    // Resetar estado de scroll
    setIsUserScrolling(false)
  }

  // Iniciar edição de mensagem
  const handleStartEdit = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId)
    setEditingContent(currentContent)
  }

  // Cancelar edição
  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditingContent('')
  }

  // Salvar edição
  const handleSaveEdit = async () => {
    if (!editingMessageId || !editingContent.trim()) return

    try {
      const success = await editMessage(editingMessageId, editingContent.trim())
      if (success) {
        setEditingMessageId(null)
        setEditingContent('')
      }
    } catch (error) {
      console.error('Erro ao editar mensagem:', error)
    }
  }

  // Calcular total de mensagens não lidas
  const totalUnread = getTotalUnreadCount()

  if (!user || !profile) return null

  return (
    <>
      {/* Overlay para fechar ao clicar fora */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleCloseChat}
        />
      )}

      {/* Chat Flutuante */}
      <div className="fixed bottom-6 right-6 z-50">
        {isExpanded ? (
          <div className="w-80 max-w-[calc(100vw-2rem)]">
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
            <CardContent className="p-0">
              {!selectedConversation ? (
                /* Lista de Conversas */
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black text-black uppercase">
                      CONVERSAS ATIVAS
                    </h4>
                    <Badge className="bg-blue-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black">
                      {conversations.length}
                    </Badge>
                  </div>

                  {conversations.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-4">
                        <MessageCircle className="h-8 w-8 text-black mx-auto mb-2" />
                        <p className="font-black text-black">NENHUMA CONVERSA</p>
                        <p className="text-sm text-gray-600 font-bold">
                          Inicie uma conversa com outro usuário
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {conversations.map((conversation) => {
                        const otherUser = user.id === conversation.client_id 
                          ? conversation.professional 
                          : conversation.client
                        const unreadCount = user.id === conversation.client_id 
                          ? conversation.unread_count_client 
                          : conversation.unread_count_professional

                        return (
                          <div
                            key={conversation.id}
                            onClick={() => selectConversation(conversation.id)}
                            className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 cursor-pointer hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                src={otherUser.avatar_url}
                                alt={otherUser.full_name}
                                fallback={otherUser.full_name.charAt(0).toUpperCase()}
                                size="md"
                                className="w-8 h-8 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-black text-black text-sm truncate">
                                    {otherUser.full_name}
                                  </h5>
                                  {unreadCount > 0 && (
                                    <Badge className="bg-red-500 text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] font-black text-xs">
                                      {unreadCount}
                                    </Badge>
                                  )}
                                </div>
                                {conversation.last_message_preview && (
                                  <p className="text-xs text-gray-600 font-bold truncate">
                                    {conversation.last_message_preview}
                                  </p>
                                )}
                                {conversation.last_message_at && (
                                  <p className="text-xs text-gray-500 font-bold">
                                    {new Date(conversation.last_message_at).toLocaleTimeString('pt-BR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Chat da Conversa */
                <div className="flex flex-col h-[360px] md:h-[480px]">
                  {/* Header Amarelo da Conversa */}
                  <div className="bg-yellow-400 border-b-2 border-black p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-black" />
                        <h3 className="font-black text-black text-sm uppercase">
                          CHAT
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={goBackToConversations}
                          className="bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black p-1 rounded-none"
                          title="Voltar para conversas"
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCloseChat}
                          className="bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black p-1 rounded-none"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Header da Conversa */}
                  <div className="bg-gray-100 border-b-2 border-black p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={user.id === selectedConversation.client_id 
                            ? selectedConversation.professional.avatar_url
                            : selectedConversation.client.avatar_url}
                          alt={user.id === selectedConversation.client_id 
                            ? selectedConversation.professional.full_name
                            : selectedConversation.client.full_name}
                          fallback={user.id === selectedConversation.client_id 
                            ? selectedConversation.professional.full_name.charAt(0).toUpperCase()
                            : selectedConversation.client.full_name.charAt(0).toUpperCase()}
                          size="md"
                          className="w-8 h-8 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                        />
                        <div className="flex-1">
                          <h4 className="font-black text-black text-sm">
                            {user.id === selectedConversation.client_id 
                              ? selectedConversation.professional.full_name
                              : selectedConversation.client.full_name}
                          </h4>
                          <p className="text-xs text-gray-600 font-bold">
                            {user.id === selectedConversation.client_id 
                              ? selectedConversation.professional.user_type
                              : selectedConversation.client.user_type}
                          </p>
                        </div>
                        
                        {/* Botão de Acordo */}
                        <AgreementButton
                          conversationId={selectedConversation.id}
                          otherUserId={user.id === selectedConversation.client_id 
                            ? selectedConversation.professional.id
                            : selectedConversation.client.id}
                          otherUserName={user.id === selectedConversation.client_id 
                            ? selectedConversation.professional.full_name
                            : selectedConversation.client.full_name}
                          otherUserType={user.id === selectedConversation.client_id 
                            ? selectedConversation.professional.user_type as 'professional' | 'client'
                            : selectedConversation.client.user_type as 'professional' | 'client'}
                          onAgreementClick={() => setShowAgreementModal(true)}
                        />
                      </div>
                      <ConversationMenu
                        conversationId={selectedConversation.id}
                        onDelete={async (conversationId) => {
                          const success = await deleteConversation(conversationId)
                          if (success) {
                            goBackToConversations()
                          }
                        }}
                        disabled={sending}
                      />
                    </div>
                  </div>

                  {/* Sistema de Acordos - Modal */}
                  {showAgreementModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <ContactAgreementChat
                          conversationId={selectedConversation.id}
                          otherUserId={user.id === selectedConversation.client_id 
                            ? selectedConversation.professional.id
                            : selectedConversation.client.id}
                          otherUserName={user.id === selectedConversation.client_id 
                            ? selectedConversation.professional.full_name
                            : selectedConversation.client.full_name}
                          otherUserType={user.id === selectedConversation.client_id 
                            ? selectedConversation.professional.user_type as 'professional' | 'client'
                            : selectedConversation.client.user_type as 'professional' | 'client'}
                        />
                        <div className="bg-gray-100 border-t-4 border-black p-4 flex justify-end">
                          <Button 
                            onClick={() => setShowAgreementModal(false)}
                            className="bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                          >
                            FECHAR
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mensagens */}
                  <div 
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-3 space-y-2"
                  >
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user.id
                      const isEditing = editingMessageId === message.id
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                        >
                          <div
                            className={`max-w-[80%] p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative ${
                              isOwn 
                                ? 'bg-black text-yellow-400' 
                                : 'bg-white text-black'
                            }`}
                          >
                            {isEditing ? (
                              // Modo de edição
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <Edit3 className="h-3 w-3" />
                                  <span className="text-xs font-bold">Editando mensagem...</span>
                                </div>
                                <Input
                                  value={editingContent}
                                  onChange={(e) => setEditingContent(e.target.value)}
                                  className="bg-white text-black border-2 border-gray-300 focus:border-black"
                                  placeholder="Digite sua mensagem..."
                                  maxLength={1000}
                                  autoFocus
                                />
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    {editingContent.length}/1000 caracteres
                                  </span>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancelEdit}
                                      className="h-6 px-2 text-xs border-2 border-gray-300 hover:border-gray-500"
                                    >
                                      <XIcon className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={handleSaveEdit}
                                      disabled={!editingContent.trim() || editingContent.trim() === message.content}
                                      className="h-6 px-2 text-xs bg-green-500 hover:bg-green-600 text-white border-2 border-black"
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // Modo normal de visualização
                              <>
                                <p className="font-bold text-sm pr-8">{message.content}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs opacity-70">
                                    {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                    {message.updated_at && 
                                     new Date(message.updated_at).getTime() - new Date(message.created_at).getTime() > 1000 && (
                                      <span className="ml-1 text-xs opacity-50">(editado)</span>
                                    )}
                                  </span>
                                  {isOwn && (
                                    <div className="flex items-center gap-1">
                                      {message.is_read ? (
                                        <CheckCheck className="h-3 w-3 text-blue-400" />
                                      ) : (
                                        <Check className="h-3 w-3" />
                                      )}
                                      <MessageMenu
                                        messageId={message.id}
                                        messageContent={message.content}
                                        onDelete={deleteMessage}
                                        onEdit={handleStartEdit}
                                        disabled={sending}
                                      />
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input de Mensagem */}
                  <div className="border-t-2 border-black p-3">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="DIGITE SUA MENSAGEM..."
                        className="flex-1 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-black placeholder:text-gray-500 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={sending}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black px-4 rounded-none"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        ) : (
          /* Botão Minimizado */
          <Button
            onClick={() => setIsExpanded(true)}
            className="bg-black text-yellow-400 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all font-black p-4 rounded-none"
          >
            <MessageCircle className="h-6 w-6" />
            {totalUnread > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-xs min-w-5 h-5 flex items-center justify-center">
                {totalUnread}
              </Badge>
            )}
          </Button>
        )}
      </div>
    </>
  )
}