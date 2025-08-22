'use client'

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSupabaseMessages, ConversationWithParticipant } from '@/hooks/useSupabaseMessages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, Send, Search, Plus, MessageCircle, Paperclip, Smile, Calendar } from 'lucide-react'
import { ContactAgreementProposal } from '@/components/chat/ContactAgreementProposal'
import { AppointmentRequest } from '@/components/chat/AppointmentRequest'
import { AppointmentResponse } from '@/components/chat/AppointmentResponse'
import { AppointmentMessage } from '@/components/chat/AppointmentMessage'
import { toast } from 'sonner'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

function MensagensContent() {
  const { profile, user, loading } = useAuthContext()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [newMessage, setNewMessage] = useState('')
  
  // Estado para o seletor de emojis
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  
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
    fetchMessages(conversationId)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mensagens
              </h1>
              <p className="text-gray-600">
                {profile ? 'Gerencie suas conversas e comunique-se com profissionais e clientes' : 'Inicie conversas com profissionais e clientes'}
              </p>
            </div>
            {profile && (
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="text-sm">
                  {totalUnread} novas
                </Badge>
              </div>
            )}
          </div>
        </div>

        {!profile ? (
          // Interface para usuários não logados - foco na criação de conta
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Crie sua conta para iniciar conversas
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
              Para iniciar conversas com profissionais ou clientes na plataforma ConfiLar, 
              você precisa ter uma conta. É rápido e gratuito!
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto mb-8">
              <h3 className="font-semibold text-blue-900 mb-3">Por que criar uma conta?</h3>
              <ul className="text-left text-blue-800 space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">✓</span>
                  Iniciar conversas com profissionais
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">✓</span>
                  Receber propostas de serviços
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">✓</span>
                  Acessar dados de contato completos
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">✓</span>
                  Gerenciar seus serviços e contratos
                </li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <Link href="/cadastro">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                  Criar Conta Gratuita
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" size="lg" className="px-8 py-3">
                  Já tenho conta
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-gray-500 mt-6">
              A criação de conta é gratuita e leva menos de 2 minutos
            </p>
          </div>
        ) : (
          // Interface normal para usuários logados
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Lista de Conversas */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Conversas</CardTitle>
                <Badge variant="outline">{conversations.length}</Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar conversas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar conversas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 focus:ring-0 focus:outline-none bg-gray-50"
                  />
                </div>
                
                <Separator className="mb-4" />
                
                <ScrollArea className="h-[500px] pr-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 p-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          onClick={() => handleConversationSelect(conversation.id)}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedConversation === conversation.id
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conversation.participant.avatar_url || undefined} />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {getInitials(conversation.participant.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {conversation.participant.full_name}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={conversation.participant.user_type === 'professional' ? 'default' : 'secondary'}>
                                    {conversation.participant.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                                  </Badge>
                                  <span className="text-xs text-gray-400">
                                    {conversation.last_message ? formatDate(conversation.last_message.created_at) : ''}
                                  </span>
                                </div>
                              </div>
                              {conversation.last_message && (
                                <p className="text-sm text-gray-600 truncate mt-1">
                                  {conversation.last_message.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          {/* Área de Mensagens */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                {/* Header da Conversa */}
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {(() => {
                        const conversation = conversations.find(c => c.id === selectedConversation)
                        if (!conversation) return null
                        
                        return (
                          <>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conversation.participant.avatar_url || undefined} />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {getInitials(conversation.participant.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {conversation.participant.full_name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {conversation.participant.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                              </p>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                    
                    {/* Menu de opções da conversa */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Paperclip className="h-4 w-4 mr-2" />
                          Enviar arquivo
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Smile className="h-4 w-4 mr-2" />
                          Enviar emoji
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Ver histórico
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                {/* Proposta de Acordo */}
                <div className="p-4 border-b border-gray-100">
                  {(() => {
                    const conversation = conversations.find(c => c.id === selectedConversation)
                    if (!conversation) return null
                    
                    return (
                      <ContactAgreementProposal
                        conversationId={selectedConversation}
                        otherUserId={conversation.participant.id}
                        otherUserName={conversation.participant.full_name}
                        otherUserType={conversation.participant.user_type || 'client'}
                      />
                    )
                  })()}
                </div>

                {/* Mensagens */}
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px] p-4">
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">Nenhuma mensagem ainda</p>
                          <p className="text-gray-400 text-xs mt-1">Inicie a conversa enviando uma mensagem</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender_id === profile.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                      message.sender_id === profile.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                    }`}
                                  >
                                    {/* Verificar se é uma imagem */}
                                    {message.content.startsWith('![') && message.content.includes('](') && message.content.endsWith(')') ? (
                                      <div>
                                        <img 
                                          src={message.content.match(/\]\((.*?)\)/)?.[1]} 
                                          alt="Imagem enviada"
                                          className="max-w-full h-auto rounded"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                          }}
                                        />
                                        <p className="text-sm hidden">
                                          {message.content.match(/\[(.*?)\]/)?.[1] || 'Imagem'}
                                        </p>
                                      </div>
                                    ) : (
                                      <p className="text-sm">{message.content}</p>
                                    )}
                                    
                                    <div className={`flex items-center justify-end mt-1 space-x-1 ${
                                      message.sender_id === profile.id ? 'text-blue-200' : 'text-gray-500'
                                    }`}>
                                      <span className="text-xs">
                                        {formatDate(message.created_at)}
                                      </span>
                                      {message.sender_id === profile.id && (
                                        <span className="text-xs">
                                          <Check className="h-3 w-3" />
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{formatDate(message.created_at)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        ))
                      )}
                      {/* Elemento de referência para auto-scroll */}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input de Mensagem */}
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center space-x-2">
                      {/* Input de arquivo para fotos */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="relative">
                              <input
                                type="file"
                                id="photo-upload"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                              />
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => document.getElementById('photo-upload')?.click()}
                                type="button"
                              >
                                <Paperclip className="h-4 w-4" />
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enviar foto</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {/* Botão de Agendamento */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setShowAppointmentRequest(true)}
                              type="button"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Solicitar agendamento</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {/* Seletor de Emojis */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="relative">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                                type="button"
                              >
                                <Smile className="h-4 w-4" />
                              </Button>
                              
                              {/* Picker de Emojis */}
                              {isEmojiPickerOpen && (
                                <div className="absolute bottom-full right-0 mb-3 bg-white border-2 border-gray-300 rounded-xl shadow-2xl p-4 z-50 emoji-picker min-w-[320px]">
                                  {/* Indicador visual (seta) */}
                                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-300"></div>
                                  
                                  {/* Título do seletor */}
                                  <div className="text-center mb-3 pb-2 border-b border-gray-200 relative">
                                    <span className="text-sm font-medium text-gray-700">Selecionar Emoji</span>
                                    <button
                                      onClick={() => setIsEmojiPickerOpen(false)}
                                      className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 transition-colors"
                                      type="button"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  
                                  <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                                    {emojis.map((emoji) => (
                                      <button
                                        key={emoji}
                                        onClick={() => {
                                          setNewMessage(prev => prev + emoji)
                                          setIsEmojiPickerOpen(false)
                                        }}
                                        className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 hover:scale-110 rounded-lg transition-all duration-200 cursor-pointer"
                                        type="button"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Selecionar emoji</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <div className="flex-1">
                        <Input
                          placeholder="Digite sua mensagem..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="border-0 focus:ring-0 focus:outline-none"
                        />
                      </div>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={handleSendMessage}
                              disabled={!newMessage.trim()}
                              size="sm"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enviar mensagem</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecione uma conversa
                  </h3>
                  <p className="text-gray-500">
                    Escolha uma conversa da lista para começar a trocar mensagens
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
        )}
        
        {/* Modal de Solicitação de Agendamento */}
        {showAppointmentRequest && selectedConversation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <AppointmentRequest
                professionalId={conversations.find(c => c.id === selectedConversation)?.participant.id || ''}
                professionalName={conversations.find(c => c.id === selectedConversation)?.participant.full_name || ''}
                onSendRequest={handleAppointmentRequest}
                onCancel={() => setShowAppointmentRequest(false)}
              />
            </div>
          </div>
        )}
        
        {/* Modal de Resposta ao Agendamento */}
        {showAppointmentResponse && currentAppointmentRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <AppointmentResponse
                appointmentRequest={currentAppointmentRequest}
                onAccept={(id, message) => handleAppointmentResponse(id, 'accepted', message)}
                onReject={(id, reason) => handleAppointmentResponse(id, 'rejected', reason)}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        )}
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
