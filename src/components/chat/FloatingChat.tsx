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
  X as XIcon,
  Handshake
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
    getTotalUnreadCount,
    sendNewConversationNotification 
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
      
      // Verificar se é a primeira mensagem da conversa
      const isFirstMessage = messages.length === 0
      
      await sendMessage(selectedConversation.id, newMessage.trim())
      
      // Se for a primeira mensagem, enviar notificação automática
      if (isFirstMessage) {
        await sendNewConversationNotification(selectedConversation)
      }
      
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
          <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl">
            <CardContent className="p-0">
              {!selectedConversation ? (
                /* Lista de Conversas */
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      Conversas Ativas
                    </h4>
                    <Badge className="bg-blue-500 text-white font-medium px-2 py-1 rounded-full">
                      {conversations.length}
                    </Badge>
                  </div>

                  {conversations.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="font-medium text-gray-900 mb-1">Nenhuma conversa</p>
                        <p className="text-sm text-gray-500">
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
                            className="bg-white border border-gray-200 rounded-xl p-3 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                src={otherUser.avatar_url}
                                alt={otherUser.full_name}
                                fallback={otherUser.full_name.charAt(0).toUpperCase()}
                                size="md"
                                className="w-10 h-10"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-gray-900 text-sm truncate">
                                    {otherUser.full_name}
                                  </h5>
                                  {unreadCount > 0 && (
                                    <Badge className="bg-red-500 text-white font-medium text-xs px-2 py-1 rounded-full">
                                      {unreadCount}
                                    </Badge>
                                  )}
                                </div>
                                {conversation.last_message_preview && (
                                  <p className="text-xs text-gray-600 truncate mt-1">
                                    {conversation.last_message_preview}
                                  </p>
                                )}
                                {conversation.last_message_at && (
                                  <p className="text-xs text-gray-400 mt-1">
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
                  {/* Header da Conversa */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-white" />
                        <h3 className="font-medium text-white text-sm">
                          Chat
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={goBackToConversations}
                          className="text-white hover:bg-white/20 p-1 rounded-lg"
                          title="Voltar para conversas"
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCloseChat}
                          className="text-white hover:bg-white/20 p-1 rounded-lg"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Header da Conversa */}
                  <div className="bg-gray-50 border-b border-gray-200 p-3">
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
                          className="w-10 h-10"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {user.id === selectedConversation.client_id 
                              ? selectedConversation.professional.full_name
                              : selectedConversation.client.full_name}
                          </h4>
                          <p className="text-xs text-gray-500 capitalize">
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
                          onProposeAgreement={() => setShowAgreementModal(true)}
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
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl">
                          <div className="flex items-center gap-3">
                            <Handshake className="h-6 w-6 text-white" />
                            <h2 className="text-xl font-semibold text-white">
                              Propor Acordo de Serviço
                            </h2>
                          </div>
                          <p className="text-white/90 mt-2">
                            Crie uma proposta de trabalho para {user.id === selectedConversation.client_id 
                              ? selectedConversation.professional.full_name
                              : selectedConversation.client.full_name}. 
                            Após o acordo ser aceito, vocês poderão se avaliar após 20 horas.
                          </p>
                        </div>
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
                          isInModal={true}
                          onClose={() => setShowAgreementModal(false)}
                        />
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
                            className={`max-w-[80%] p-3 rounded-2xl relative ${
                              isOwn 
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            {isEditing ? (
                              // Modo de edição
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <Edit3 className="h-3 w-3" />
                                  <span className="text-xs font-medium">Editando mensagem...</span>
                                </div>
                                <Input
                                  value={editingContent}
                                  onChange={(e) => setEditingContent(e.target.value)}
                                  className="bg-white text-gray-900 border border-gray-300 focus:border-blue-500 rounded-lg"
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
                                      className="h-6 px-2 text-xs border border-gray-300 hover:border-gray-500 rounded-lg"
                                    >
                                      <XIcon className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={handleSaveEdit}
                                      disabled={!editingContent.trim() || editingContent.trim() === message.content}
                                      className="h-6 px-2 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // Modo normal de visualização
                              <>
                                <p className="text-sm leading-relaxed break-words pr-8">{message.content}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-1">
                                    {message.is_read ? (
                                      <CheckCheck className="h-3 w-3 text-green-500" />
                                    ) : (
                                      <Check className="h-3 w-3 text-gray-400" />
                                    )}
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
                                  </div>
                                  {isOwn && (
                                    <MessageMenu
                                      messageId={message.id}
                                      messageContent={message.content}
                                      onDelete={deleteMessage}
                                      onEdit={handleStartEdit}
                                      disabled={sending}
                                    />
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
                  <div className="border-t border-gray-200 p-3">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 bg-white border border-gray-300 focus:border-blue-500 rounded-xl px-4 py-2 text-gray-900 placeholder:text-gray-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={sending}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
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
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-200 p-4 rounded-full relative"
          >
            <MessageCircle className="h-6 w-6" />
            {totalUnread > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white font-medium text-xs min-w-5 h-5 flex items-center justify-center rounded-full">
                {totalUnread}
              </Badge>
            )}
          </Button>
        )}
      </div>
    </>
  )
}