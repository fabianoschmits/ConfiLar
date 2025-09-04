'use client'

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSupabaseMessages, ConversationWithParticipant } from '@/hooks/useSupabaseMessages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { ContactAgreementProposal } from '@/components/chat/ContactAgreementProposal'
import { AppointmentRequest } from '@/components/chat/AppointmentRequest'
import { AppointmentResponse } from '@/components/chat/AppointmentResponse'
import { AppointmentMessage } from '@/components/chat/AppointmentMessage'
import { toast } from 'sonner'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { 
  PaperPlane as SendPhosphor,
  Paperclip as PaperclipPhosphor,
  Smiley,
  Microphone,
  Phone as PhonePhosphor,
  VideoCamera,
  DotsThreeVertical,
  MagnifyingGlass,
  ChatTeardrop,
  Check as CheckPhosphor,
  CheckCircle,
  User as UserPhosphor,
  Image as ImagePhosphor,
  File as FilePhosphor,
  Camera as CameraPhosphor,
  MapPin as MapPinPhosphor,
  Heart as HeartPhosphor,
  Plus as PlusPhosphor,
  Trash
} from '@phosphor-icons/react'

function MensagensContent() {
  const { profile, user, loading } = useAuthContext()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [newMessage, setNewMessage] = useState('')
  
  // Estado para o seletor de emojis
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  // Estados para agendamentos
  const [showAppointmentRequest, setShowAppointmentRequest] = useState(false)
  const [showAppointmentResponse, setShowAppointmentResponse] = useState(false)
  const [currentAppointmentRequest, setCurrentAppointmentRequest] = useState<{
    id: string;
    clientId: string;
    clientName: string;
    requestedDate: Date;
    requestedTime: string;
    duration: string;
    serviceDescription: string;
    address: string;
    specialRequirements: string;
    status: 'pending' | 'accepted' | 'rejected';
  } | null>(null)
  
  // Lista de emojis populares
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
    '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
    '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
    '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
    '😶', '😐', '😑', '😯', '😦', '😧', '😮', '😲',
    '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮',
    '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻',
    '💀', '☠️', '👽', '👾', '🤖', '😺', '😸', '😹',
    '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉',
    '🙊', '👶', '👧', '🧒', '👦', '👩', '🧑', '👨',
    '👵', '🧓', '👴', '👮', '🕵️', '👷', '👸', '🤴',
    '👳', '👲', '🧕', '🤵', '👰', '🤰', '🤱', '👼',
    '🎅', '🤶', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞',
    '🧟', '🧌', '👹', '👺', '🤡', '👻', '👽', '👾',
    '🤖', '😀', '😃', '😄', '😁', '😆', '😅', '😂'
  ]
  
  // Ref para o container de mensagens para auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Função para fazer scroll automático para o final das mensagens
  const scrollToBottom = (instant = false) => {
    if (messagesEndRef.current) {
      const behavior = instant ? 'auto' : 'smooth'
      messagesEndRef.current.scrollIntoView({ 
        behavior,
        block: 'end',
        inline: 'nearest'
      })
    }
  }

  const {
    conversations,
    messages,
    selectedConversation,
    isLoading,
    totalUnread,
    fetchConversations,
    fetchMessages,
    sendMessage,
    setSelectedConversation,
    createConversation
  } = useSupabaseMessages()

  const [filteredConversations, setFilteredConversations] = useState<ConversationWithParticipant[]>([])

  // Detectar se um profissional foi selecionado na busca e criar conversa automaticamente
  const hasCreatedConversation = useRef(false)
  
  // Auto-scroll sempre que as mensagens mudarem
  useEffect(() => {
    // Scroll suave para mudanças normais, instantâneo para novas mensagens
    const isNewMessage = messages.length > 0
    scrollToBottom(!isNewMessage)
  }, [messages])

  // Fechar seletor de emojis quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isEmojiPickerOpen && !target.closest('.emoji-picker')) {
        setIsEmojiPickerOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isEmojiPickerOpen])

  // Scroll automático quando uma nova mensagem for enviada
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      await sendMessage(selectedConversation, newMessage.trim())
      setNewMessage('')
      
      // Scroll instantâneo para a nova mensagem
      setTimeout(() => {
        scrollToBottom(true)
      }, 100)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem')
    }
  }, [newMessage, selectedConversation, sendMessage])

  // Funções para gerenciar agendamentos
  const handleAppointmentRequest = async (requestData: {
    professionalId: string;
    professionalName: string;
    requestedDate: Date;
    requestedTime: string;
    duration: string;
    serviceDescription: string;
    address: string;
    specialRequirements: string;
  }) => {
    if (!selectedConversation) return

    try {
      // Enviar mensagem especial de agendamento
      const appointmentMessage = {
        type: 'appointment_request',
        appointmentData: {
          requestedDate: requestData.requestedDate.toISOString(),
          requestedTime: requestData.requestedTime,
          duration: requestData.duration,
          serviceDescription: requestData.serviceDescription,
          address: requestData.address,
          specialRequirements: requestData.specialRequirements,
          status: 'pending'
        }
      }

      await sendMessage(selectedConversation, JSON.stringify(appointmentMessage))
      setShowAppointmentRequest(false)
      toast.success('Solicitação de agendamento enviada!')
    } catch (error) {
      console.error('Erro ao enviar solicitação de agendamento:', error)
      toast.error('Erro ao enviar solicitação')
    }
  }

  const handleAppointmentResponse = async (appointmentId: string, response: 'accepted' | 'rejected', message: string) => {
    if (!selectedConversation) return

    try {
      // Enviar resposta ao agendamento
      const responseMessage = {
        type: 'appointment_response',
        appointmentData: {
          appointmentId,
          status: response,
          responseMessage: response === 'accepted' ? message : undefined,
          responseReason: response === 'rejected' ? message : undefined
        }
      }

      await sendMessage(selectedConversation, JSON.stringify(responseMessage))
      setShowAppointmentResponse(false)
      toast.success(`Agendamento ${response === 'accepted' ? 'aceito' : 'recusado'}!`)
    } catch (error) {
      console.error('Erro ao responder agendamento:', error)
      toast.error('Erro ao enviar resposta')
    }
  }

  // Criar conversa automaticamente quando houver parâmetros de profissional
  useEffect(() => {
    console.log('🔄 useEffect - Verificando parâmetros:', {
      professionalId: searchParams.get('professional'),
      professionalName: searchParams.get('name'),
      hasProfile: !!profile,
      hasCreatedConversation: hasCreatedConversation.current
    })
    
    const professionalId = searchParams.get('professional')
    const professionalName = searchParams.get('name')
    
    console.log('🎯 IDs para debug:', {
      professionalIdFromParams: professionalId,
      professionalIdType: typeof professionalId,
      profileId: profile?.id,
      profileIdType: typeof profile?.id
    })
    
    if (professionalId && professionalName && profile && !hasCreatedConversation.current) {
      hasCreatedConversation.current = true
      console.log('🚀 Iniciando criação automática de conversa...')
      
      const createConversationAutomatically = async () => {
        try {
          console.log('🔍 Criando conversa com profissional:', {
            professionalId,
            professionalIdType: typeof professionalId,
            profileId: profile?.id,
            profileIdType: typeof profile?.id
          })
          const conversationId = await createConversation(professionalId)
          
          if (conversationId) {
            console.log('✅ Conversa criada com sucesso:', conversationId)
            
            // Limpar os parâmetros da URL
            window.history.replaceState({}, '', '/mensagens')
            
            // Aguardar um pouco para as conversas serem carregadas
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Selecionar a conversa criada
            console.log('🎯 Selecionando conversa criada:', conversationId)
            setSelectedConversation(conversationId)
            
            // Buscar mensagens da conversa
            await fetchMessages(conversationId)
            
            // Recarregar conversas para garantir que apareça na sidebar
            await fetchConversations()
            
            console.log('✅ Conversa iniciada e selecionada com sucesso!')
          } else {
            console.error('❌ Falha ao criar conversa')
            toast.error('Erro ao iniciar conversa')
          }
        } catch (error) {
          console.error('❌ Erro ao criar conversa automaticamente:', error)
          toast.error('Erro ao iniciar conversa')
        }
      }
      
      createConversationAutomatically()
    }
  }, [searchParams, profile, createConversation, fetchMessages, fetchConversations])

  // Filtrar conversas por termo de busca
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = conversations.filter(conv =>
        conv.participant.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredConversations(filtered)
    } else {
      setFilteredConversations(conversations)
    }
  }, [searchTerm, conversations])

  const handleConversationSelect = (conversationId: string) => {
    console.log('🎯 Selecionando conversa:', conversationId)
    setSelectedConversation(conversationId)
    fetchMessages(conversationId)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Função para obter o status de online/offline
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }

  // Função para obter ícone de status da mensagem
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckPhosphor size={16} weight="light" className="text-gray-400" />
      case 'delivered':
        return <CheckCircle size={16} weight="light" className="text-blue-500" />
      case 'read':
        return <CheckCircle size={16} weight="light" className="text-green-500" />
      default:
        return null
    }
  }

  // Função para formatar data/hora
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else if (days === 1) {
      return 'Ontem'
    } else if (days < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      })
    }
  }

  // Função para adicionar emoji
  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  // Função para excluir conversa
  const handleDeleteConversation = async () => {
    if (!selectedConversation) return

    const confirmed = window.confirm('Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.')
    if (!confirmed) return

    // Implementar lógica de exclusão aqui
    toast.success('Conversa excluída com sucesso')
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedConversation) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data, error } = await supabase.storage
        .from('messages')
        .upload(`${selectedConversation}/${Date.now()}-${file.name}`, file)

      if (error) {
        throw error
      }

      const { data: publicUrlData } = supabase.storage
        .from('messages')
        .getPublicUrl(`${selectedConversation}/${Date.now()}-${file.name}`)

      if (publicUrlData) {
        const messageContent = `![${file.name}](${publicUrlData.publicUrl})`
        await sendMessage(selectedConversation, messageContent)
        setNewMessage('') // Clear input after sending photo
        scrollToBottom(true)
      }
    } catch (error) {
      console.error('Erro ao enviar foto:', error)
      toast.error('Erro ao enviar foto')
    }
  }


  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

      if (diffInHours < 1) {
        return 'Agora'
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h atrás`
      } else {
        return date.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit' 
        })
      }
    } catch {
      return 'Data desconhecida'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // DEBUG: Logar informações de autenticação
  console.log('🔍 DEBUG - Status da autenticação:', {
    profile: profile ? '✅ Carregado' : '❌ Não carregado',
    user: user ? '✅ Logado' : '❌ Não logado',
    loading: loading ? '⏳ Carregando...' : '✅ Carregado',
    profileId: profile?.id,
    userEmail: user?.email
  })

  // DEBUG: Logar parâmetros da URL
  console.log('🔍 DEBUG - Parâmetros da URL:', {
    professional: searchParams.get('professional'),
    name: searchParams.get('name'),
    conversation: searchParams.get('conversation')
  })

  // Verificar se há uma conversa específica na URL
  const conversationId = searchParams.get('conversation')
  
  // Selecionar conversa específica se fornecida na URL
  useEffect(() => {
    if (conversationId && profile && !hasCreatedConversation.current) {
      console.log('🎯 Conversa específica detectada na URL:', conversationId)
      hasCreatedConversation.current = true
      
      const selectSpecificConversation = async () => {
        try {
          // Buscar conversas primeiro
          await fetchConversations()
          
          // Selecionar a conversa específica
          setSelectedConversation(conversationId)
          
          // Buscar mensagens da conversa
          await fetchMessages(conversationId)
          
          console.log('✅ Conversa específica selecionada:', conversationId)
        } catch (error) {
          console.error('❌ Erro ao selecionar conversa específica:', error)
        }
      }
      
      selectSpecificConversation()
    }
  }, [conversationId, profile, fetchConversations, fetchMessages, setSelectedConversation])

  // DEBUG: Logar URL completa (apenas no cliente)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🔍 DEBUG - URL completa:', window.location.href)
    }
  }, [])
  
  // Remover verificação de login - permitir acesso para todos
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 lg:p-4">
        <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden h-screen-mobile lg:h-[600px]">
          {/* Header Mobile */}
          <div className="lg:hidden p-3 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-gray-900">Mensagens</h1>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
                {totalUnread > 0 ? `${totalUnread} não lidas` : 'Todas lidas'}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row h-full chat-container">
            {/* Lista de Conversas */}
            <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col h-1/3 lg:h-full">
              <div className="p-3 lg:p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <h2 className="text-base lg:text-xl font-semibold text-gray-900">Conversas</h2>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                    {conversations.length} conversas
                  </Badge>
                </div>
                
                <div className="relative">
                  <MagnifyingGlass size={16} weight="light" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar conversas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-sm h-9"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation.id)}
                    className={`p-2 lg:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <div className="relative flex-shrink-0">
                        <UserAvatar
                          src={conversation.participant?.avatar_url}
                          alt={conversation.participant?.full_name || 'Usuário'}
                          className="w-8 h-8 lg:w-10 lg:h-10"
                        />
                        <div className={`absolute bottom-0 right-0 w-2 h-2 lg:w-3 lg:h-3 rounded-full border-2 border-white ${getStatusColor('online')}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {conversation.participant?.full_name || 'Usuário'}
                          </h3>
                          <span className="text-xs text-gray-500 ml-2">
                            {conversation.updated_at ? formatTime(new Date(conversation.updated_at)) : ''}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-600 truncate flex-1 mr-2">
                            {typeof conversation.last_message === 'string' ? conversation.last_message : 'Nenhuma mensagem'}
                          </p>
                          {conversation.unread_count && conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs flex-shrink-0">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>

            {/* Área do Chat */}
            <div className="flex-1 flex flex-col h-2/3 lg:h-full">
              {selectedConversation ? (
                <>
                  {/* Header do Chat */}
                  <div className="bg-white border-b border-gray-200 p-2 lg:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        {(() => {
                          const selectedConv = conversations.find(c => c.id === selectedConversation)
                          return (
                            <>
                              <UserAvatar
                                src={selectedConv?.participant?.avatar_url}
                                alt={selectedConv?.participant?.full_name || 'Usuário'}
                                className="w-8 h-8 lg:w-10 lg:h-10"
                              />
                              <div>
                                <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                                  {selectedConv?.participant?.full_name || 'Usuário'}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${getStatusColor('online')}`} />
                                  <span className="text-xs lg:text-sm text-gray-500 capitalize">
                                    online
                                  </span>
                                </div>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                      
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 lg:h-10 lg:w-10 p-0">
                          <PhonePhosphor size={16} weight="light" className="lg:w-5 lg:h-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 lg:h-10 lg:w-10 p-0">
                          <VideoCamera size={16} weight="light" className="lg:w-5 lg:h-5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 lg:h-10 lg:w-10 p-0">
                              <DotsThreeVertical size={16} weight="light" className="lg:w-5 lg:h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleDeleteConversation} className="text-red-600">
                              <Trash size={16} weight="light" className="mr-2" />
                              Excluir conversa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  {/* Mensagens */}
                  <ScrollArea className="flex-1 p-2 lg:p-4 bg-gray-50 chat-messages">
                    <div className="space-y-3 lg:space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="flex items-end space-x-1 lg:space-x-2 max-w-[75%] lg:max-w-[70%]">
                            {message.sender_id !== user?.id && (() => {
                              const selectedConv = conversations.find(c => c.id === selectedConversation)
                              return (
                                <UserAvatar
                                  src={selectedConv?.participant?.avatar_url}
                                  alt={selectedConv?.participant?.full_name || 'Usuário'}
                                  className="w-6 h-6 lg:w-8 lg:h-8 flex-shrink-0"
                                />
                              )
                            })()}
                            <div
                              className={`px-3 py-2 lg:px-4 lg:py-2 rounded-lg ${
                                message.sender_id === user?.id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-900 border border-gray-200'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
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

                  {/* Input de Mensagem */}
                  <div className="bg-white border-t border-gray-200 p-2 lg:p-4 pb-safe chat-input">
                    <div className="flex items-end space-x-2 lg:space-x-3">
                      <div className="flex-1">
                        <Textarea
                          placeholder="Digite sua mensagem..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="min-h-[50px] lg:min-h-[60px] max-h-[100px] lg:max-h-[120px] resize-none text-sm border-gray-300 focus:border-blue-500 chat-textarea"
                          rows={1}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <div className="relative">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 lg:h-10 lg:w-10 p-0"
                            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                          >
                            <PaperclipPhosphor size={16} weight="light" className="lg:w-5 lg:h-5" />
                          </Button>
                          {showAttachmentMenu && (
                            <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                              <div className="grid grid-cols-2 gap-2">
                                <Button variant="ghost" size="sm" className="flex flex-col items-center p-2">
                                  <ImagePhosphor size={16} weight="light" />
                                  <span className="text-xs">Foto</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="flex flex-col items-center p-2">
                                  <CameraPhosphor size={16} weight="light" />
                                  <span className="text-xs">Câmera</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="flex flex-col items-center p-2">
                                  <FilePhosphor size={16} weight="light" />
                                  <span className="text-xs">Arquivo</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="flex flex-col items-center p-2">
                                  <MapPinPhosphor size={16} weight="light" />
                                  <span className="text-xs">Local</span>
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 lg:h-10 lg:w-10 p-0"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <Smiley size={16} weight="light" className="lg:w-5 lg:h-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 lg:h-10 lg:w-10 p-0">
                          <Microphone size={16} weight="light" className="lg:w-5 lg:h-5" />
                        </Button>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white h-8 w-8 lg:h-10 lg:w-10 p-0"
                        >
                          <SendPhosphor size={16} weight="light" className="lg:w-5 lg:h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Seletor de Emojis */}
                    {showEmojiPicker && (
                      <div className="mt-2 p-2 bg-white border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-6 lg:grid-cols-8 gap-1 max-h-24 lg:max-h-32 overflow-y-auto">
                          {emojis.map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => addEmoji(emoji)}
                              className="p-1 hover:bg-gray-100 rounded text-base lg:text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ChatTeardrop size={48} weight="light" className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Selecione uma conversa
                    </h3>
                    <p className="text-gray-600">
                      Escolha um contato para começar a conversar
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
   )
}

export default function MensagensPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <MensagensContent />
    </Suspense>
  )
}
