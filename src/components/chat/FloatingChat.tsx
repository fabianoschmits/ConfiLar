'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
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
  Edit3,
  X as XIcon,
  Search
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'
import { useMessages } from '@/hooks/useMessages'
import { useFavorites } from '@/hooks/useFavorites'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { UserStatusDot } from '@/components/ui/UserStatusDot'
import { ConversationMenu } from './ConversationMenu'
import { MessageMenu } from './MessageMenu'
import { RateLimitStatus } from '@/components/security/RateLimitStatus'
import { RequestEvaluationButton } from './RequestEvaluationButton'

export function FloatingChat() {
  const { user, profile } = useAuthContext()
  const { isOpen, closeChat, selectedConversationId, selectConversation, openChat } = useFloatingChat()
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
  
  const { favorites, isFavorite } = useFavorites()
  
  // Estados do componente
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFavoritesSearch, setShowFavoritesSearch] = useState(false)
  const [lastConversationId, setLastConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Função para fazer scroll automático para o final
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Função para fazer scroll imediato para o final (sem animação)
  const scrollToBottomImmediate = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' })
    }
  }
  
  // Filtrar favoritos baseado na busca
  const filteredFavorites = favorites.filter(favorite => {
    if (!searchQuery) return true
    const name = favorite.professional?.full_name?.toLowerCase() || ''
    const services = favorite.professional?.professional_services?.join(' ').toLowerCase() || ''
    const location = `${favorite.professional?.location_city || ''} ${favorite.professional?.location_state || ''}`.toLowerCase()
    const query = searchQuery.toLowerCase()
    
    return name.includes(query) || services.includes(query) || location.includes(query)
  })
  
  // Função para formatar tempo de forma amigável
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${diffInMinutes}min`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  // Função para iniciar conversa com favorito
  const startConversationWithFavorite = async (favorite: any) => {
    if (!favorite.professional?.id) return
    
    try {
      // Verificar se já existe conversa
      const existingConversation = conversations.find(conv => 
        (conv.client_id === user?.id && conv.professional_id === favorite.professional.id) ||
        (conv.professional_id === user?.id && conv.client_id === favorite.professional.id)
      )
      
      if (existingConversation) {
        // Abrir conversa existente
        selectConversation(existingConversation.id)
      } else {
        // Criar nova conversa usando o contexto
        await openChat(favorite.professional.id, favorite.professional.full_name)
      }
      
      // Fechar busca de favoritos
      setShowFavoritesSearch(false)
      setSearchQuery('')
    } catch (error) {
      console.error('❌ Erro ao iniciar conversa com favorito:', error)
    }
  }
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
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
        console.log('💬 Conversa encontrada na lista, carregando mensagens:', conversation.id)
        setSelectedConversation(conversation)
        loadMessages(conversation.id)
        markMessagesAsRead(conversation.id)
      } else {
        // Se a conversa não está na lista ainda, carregar mensagens diretamente
        console.log('💬 Conversa não encontrada na lista, carregando mensagens diretamente:', selectedConversationId)
        loadMessages(selectedConversationId)
        markMessagesAsRead(selectedConversationId)
      }
    } else {
      setSelectedConversation(null)
    }
  }, [selectedConversationId, conversations])

  // Scroll automático quando mensagens são carregadas pela primeira vez
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      console.log('📨 Mensagens carregadas, fazendo scroll para última mensagem')
      // Usar scroll imediato para carregamento inicial
      setTimeout(() => {
        scrollToBottomImmediate()
      }, 100)
    }
  }, [selectedConversation?.id, messages.length])

  // Carregar conversas quando o chat expande
  useEffect(() => {
    if (isExpanded && user?.id) {
      console.log('💬 Chat expandido, carregando conversas...')
      loadConversations()
    }
  }, [isExpanded, user?.id])

  // Carregar conversas quando selectedConversationId é definido mas conversas não estão carregadas
  useEffect(() => {
    if (selectedConversationId && user?.id && conversations.length === 0) {
      console.log('💬 selectedConversationId definido mas conversas não carregadas, carregando...')
      loadConversations()
    }
  }, [selectedConversationId, user?.id, conversations.length])


  // Fechar busca de favoritos quando não há query
  useEffect(() => {
    if (!searchQuery) {
      setShowFavoritesSearch(false)
    }
  }, [searchQuery])


  // Auto-scroll quando receber novas mensagens (apenas se for mensagem nova)
  useEffect(() => {
    if (messages.length > 0 && selectedConversation) {
      const lastMessage = messages[messages.length - 1]
      // Fazer scroll apenas se a última mensagem não foi enviada pelo usuário atual
      if (lastMessage.sender_id !== user?.id) {
        console.log('📨 Nova mensagem recebida, fazendo scroll')
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }, [messages.length, selectedConversation, user?.id])


  // Auto-scroll quando uma NOVA conversa for selecionada
  useEffect(() => {
    if (selectedConversation && selectedConversation.id !== lastConversationId) {
      console.log('🆕 Nova conversa selecionada, fazendo scroll:', selectedConversation.id)
      setLastConversationId(selectedConversation.id)
      // Aguardar um pouco mais para garantir que as mensagens foram carregadas
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    }
  }, [selectedConversation, lastConversationId])

  // Removido auto-scroll automático - usuário tem controle total

  // Detectar quando o usuário rola manualmente (apenas para controle visual)
  const handleScroll = () => {
    // Função mantida para compatibilidade, mas não faz nada
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
      // Fazer scroll automático para a nova mensagem
      setTimeout(() => scrollToBottom(), 100)
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
      <div className="fixed bottom-20 right-6 z-50 md:bottom-20">
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
                  
                  {/* Campo de busca para favoritos */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar favoritos para conversar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowFavoritesSearch(true)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    {/* Lista de favoritos filtrados */}
                    {showFavoritesSearch && searchQuery && (
                      <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-lg">
                        {filteredFavorites.length > 0 ? (
                          filteredFavorites.map((favorite) => (
                            <div
                              key={favorite.id}
                              onClick={() => startConversationWithFavorite(favorite)}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <UserAvatar
                                    src={favorite.professional?.avatar_url}
                                    alt={favorite.professional?.full_name || 'Usuário'}
                                    fallback={favorite.professional?.full_name?.charAt(0) || 'U'}
                                    size="sm"
                                  />
                                  <UserStatusDot 
                                    userId={favorite.professional?.id} 
                                    size="sm"
                                    className="border-2 border-white"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">
                                    {favorite.professional?.full_name || 'Usuário'}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {favorite.professional?.location_city && favorite.professional?.location_state
                                      ? `${favorite.professional.location_city}, ${favorite.professional.location_state}`
                                      : 'Localização não informada'
                                    }
                                  </p>
                                </div>
                                <MessageCircle className="h-4 w-4 text-blue-500" />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-gray-500 text-sm">
                            Nenhum favorito encontrado
                          </div>
                        )}
                      </div>
                    )}
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
                        const unreadCount = conversation.unread_count || 0

                        return (
                          <div
                            key={conversation.id}
                            onClick={() => selectConversation(conversation.id)}
                            className={`bg-white border rounded-xl p-3 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 ${
                              unreadCount > 0 
                                ? 'border-blue-200 bg-blue-50/30' 
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <UserAvatar
                                  src={otherUser.avatar_url}
                                  alt={otherUser.full_name}
                                  fallback={otherUser.full_name.charAt(0).toUpperCase()}
                                  size="md"
                                  className="w-12 h-12"
                                />
                                <UserStatusDot 
                                  userId={otherUser.id} 
                                  size="sm"
                                  className="border-2 border-white"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h5 className="font-semibold text-gray-900 text-sm truncate">
                                    {otherUser.full_name}
                                  </h5>
                                  <div className="flex items-center gap-2">
                                    {conversation.last_message?.created_at && (
                                      <span className="text-xs text-gray-400 font-medium">
                                        {formatTime(conversation.last_message.created_at)}
                                      </span>
                                    )}
                                    {unreadCount > 0 && (
                                      <Badge className="bg-red-500 text-white font-medium text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                                        {unreadCount}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                {conversation.last_message ? (
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-gray-600 truncate flex-1">
                                      {conversation.last_message.sender_id === user?.id ? (
                                        <span className="text-gray-500">Você: </span>
                                      ) : (
                                        <span className="text-gray-500">{otherUser.full_name.split(' ')[0]}: </span>
                                      )}
                                      <span className={conversation.last_message.sender_id !== user?.id && unreadCount > 0 ? 'font-medium text-gray-900' : ''}>
                                        {conversation.last_message.content}
                                      </span>
                                    </p>
                                    {conversation.last_message.sender_id === user?.id && (
                                      <CheckCheck className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400 italic">
                                    Nenhuma mensagem ainda
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
                      <Link 
                        href={`/perfil/${user.id === selectedConversation.client_id 
                          ? selectedConversation.professional.id
                          : selectedConversation.client.id}`}
                        className="flex items-center gap-3 flex-1"
                      >
                        <div className="relative">
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
                          <UserStatusDot 
                            userId={user.id === selectedConversation.client_id 
                              ? selectedConversation.professional.id
                              : selectedConversation.client.id} 
                            size="sm"
                            className="border-2 border-white"
                          />
                        </div>
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
                      </Link>
                      
                      {/* Botões de Ação - Canto Direito */}
                      <div className="flex items-center gap-0.5 ml-4">
                        <RequestEvaluationButton
                          targetUserId={user.id === selectedConversation.client_id 
                            ? selectedConversation.professional.id
                            : selectedConversation.client.id}
                          targetUserName={user.id === selectedConversation.client_id 
                            ? selectedConversation.professional.full_name
                            : selectedConversation.client.full_name}
                        />
                        <ConversationMenu
                          conversationId={selectedConversation.id}
                          onDelete={async (conversationId) => {
                            const success = await deleteConversation(conversationId)
                            if (success) {
                              goBackToConversations()
                            }
                          }}
                          disabled={sending}
                          conversationData={selectedConversation}
                          messages={messages}
                        />
                      </div>
                    </div>
                  </div>

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
                            className={`max-w-[80%] rounded-2xl relative ${
                              isOwn 
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2' 
                                : 'bg-gray-100 text-gray-900 p-3'
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
                                <div className="flex items-center justify-end gap-2 mt-2">
                                  <div className="flex items-center gap-1">
                                    {message.is_read ? (
                                      <CheckCheck className="h-2.5 w-2.5 text-green-500" />
                                    ) : (
                                      <Check className="h-2.5 w-2.5 text-gray-400" />
                                    )}
                                    <span className="text-[10px] opacity-70">
                                      {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                      {message.updated_at && 
                                       message.updated_at !== message.created_at &&
                                       new Date(message.updated_at).getTime() - new Date(message.created_at).getTime() > 30000 && (
                                        <span className="ml-1 text-xs opacity-50">(editado)</span>
                                      )}
                                    </span>
                                  </div>
                                  {!isOwn && (
                                    <MessageMenu
                                      messageId={message.id}
                                      messageContent={message.content}
                                      onDelete={deleteMessage}
                                      onEdit={handleStartEdit}
                                      disabled={sending}
                                      isOwnMessage={false}
                                    />
                                  )}
                                  {isOwn && (
                                    <MessageMenu
                                      messageId={message.id}
                                      messageContent={message.content}
                                      onDelete={deleteMessage}
                                      onEdit={handleStartEdit}
                                      disabled={sending}
                                      isOwnMessage={true}
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

                  {/* Rate Limit Status */}
                  <div className="px-3 py-2">
                    <RateLimitStatus 
                      type="message_sending" 
                      showDetails={false}
                      className="text-xs"
                    />
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