'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSupabaseNotifications } from './useSupabaseNotifications'
import { toast } from 'sonner'

// Função para criar notificação
const createNotification = async (
  recipientId: string,
  title: string,
  message: string,
  conversationId: string,
  senderId: string,
  senderName: string
) => {
  try {
    // Inserir apenas os campos que existem na tabela
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: recipientId,
        title,
        message,
        type: 'message',
        category: 'messages',
        priority: 'normal',
        metadata: {
          sender_id: senderId,
          sender_name: senderName,
          conversation_id: conversationId
        }
      })

    if (error) {
      console.error('❌ Erro ao criar notificação:', error)
      // Não vamos falhar o envio da mensagem por causa da notificação
      return false
    }

    console.log('✅ Notificação criada com sucesso para:', recipientId)
    return true
  } catch (error) {
    console.error('❌ Erro geral ao criar notificação:', error)
    // Não vamos falhar o envio da mensagem por causa da notificação
    return false
  }
}

export interface SupabaseMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  read_at?: string | null
}

export interface SupabaseConversation {
  id: string
  created_at: string
  updated_at: string
}

export interface ConversationWithParticipant extends SupabaseConversation {
  participant: {
    id: string
    full_name: string
    avatar_url: string | null
    user_type: 'client' | 'professional'
  }
  last_message?: SupabaseMessage
  unread_count?: number
}

export function useSupabaseMessages() {
  const { profile } = useAuthContext()
  const { markMessageNotificationsAsRead } = useSupabaseNotifications()
  const [conversations, setConversations] = useState<ConversationWithParticipant[]>([])
  const [messages, setMessages] = useState<SupabaseMessage[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [totalUnread, setTotalUnread] = useState(0)

  // Buscar conversas do usuário - VERSÃO CORRIGIDA
  const fetchConversations = useCallback(async () => {
    if (!profile?.id) return

    setIsLoading(true)
    try {
      console.log('🔍 Buscando conversas para usuário:', profile.id)

      // Buscar conversas onde o usuário é cliente ou profissional
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          client_id,
          professional_id,
          last_message_at,
          created_at
        `)
        .or(`client_id.eq.${profile.id},professional_id.eq.${profile.id}`)
        .order('last_message_at', { ascending: false })

      if (conversationsError) {
        console.error('❌ Erro ao buscar conversas:', conversationsError)
        throw conversationsError
      }

      if (!conversationsData || conversationsData.length === 0) {
        console.log('📝 Nenhuma conversa encontrada')
        setConversations([])
        setTotalUnread(0)
        return
      }

      console.log('📝 Conversas encontradas:', conversationsData.length)

      // Buscar informações completas das conversas
      const conversationsWithParticipants = await Promise.all(
        conversationsData.map(async (conversation) => {
          // Determinar o outro participante
          const otherUserId = conversation.client_id === profile.id 
            ? conversation.professional_id 
            : conversation.client_id

          // Buscar perfil do outro participante
          const { data: otherProfile, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, user_type')
            .eq('id', otherUserId)
            .single()

          if (profileError || !otherProfile) {
            console.error('❌ Erro ao buscar perfil do participante:', profileError)
            return null
          }

          // Buscar última mensagem da conversa
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          // Contar mensagens não lidas
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversation.id)
            .neq('sender_id', profile.id)
            .is('read_at', null)

          return {
            id: conversation.id,
            participant: {
              id: otherProfile.id,
              profile_id: otherProfile.id,
              full_name: otherProfile.full_name,
              avatar_url: otherProfile.avatar_url,
              user_type: otherProfile.user_type
            },
            last_message: lastMessage?.content || '',
            unread_count: unreadCount || 0,
            created_at: conversation.created_at,
            updated_at: conversation.last_message_at
          }
        })
      )

      // Filtrar conversas válidas
      const validConversations = conversationsWithParticipants.filter(Boolean) as ConversationWithParticipant[]

      console.log('✅ Conversas processadas:', validConversations.length)
      setConversations(validConversations)
      
      // Calcular total de não lidas
      const totalUnreadMessages = validConversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
      setTotalUnread(totalUnreadMessages)
    } catch (error) {
      console.error('❌ Erro ao buscar conversas:', error)
      toast.error('ERRO AO CARREGAR CONVERSAS')
    } finally {
      setIsLoading(false)
    }
  }, [profile?.id])

  // Marcar notificações como lidas
  const markNotificationsAsRead = useCallback(async (conversationId: string) => {
    if (!profile?.id) return

    try {
      console.log('🔔 Marcando notificações como lidas para conversa:', conversationId)
      
      // Usar a função do hook de notificações
      await markMessageNotificationsAsRead()
    } catch (error) {
      console.error('❌ Erro geral ao marcar notificações:', error)
    }
  }, [profile?.id, markMessageNotificationsAsRead])

  // Buscar mensagens de uma conversa - VERSÃO CORRIGIDA
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return

    try {
      console.log('🔍 Buscando mensagens para conversa:', conversationId)

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Erro ao buscar mensagens:', error)
        throw error
      }

      console.log('✅ Mensagens carregadas:', data?.length || 0)
      setMessages(data || [])
      setSelectedConversation(conversationId)

      // Marcar mensagens como lidas (usando campo read_at)
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', profile?.id)
        .is('read_at', null)

      // Marcar notificações como lidas
      await markNotificationsAsRead(conversationId)

    } catch (error) {
      console.error('❌ Erro ao buscar mensagens:', error)
      toast.error('ERRO AO CARREGAR MENSAGENS')
    }
  }, [profile?.id, markNotificationsAsRead])

  // Enviar mensagem - VERSÃO CORRIGIDA COM REALTIME
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!profile?.id || !content.trim()) {
      console.error('❌ Dados inválidos para envio de mensagem:', { profileId: profile?.id, content: content.trim() })
      return null
    }

    try {
      console.log('📤 Enviando mensagem:', { conversationId, content: content.substring(0, 50) + '...' })

      // Criar mensagem temporária para feedback imediato
      const tempMessage: SupabaseMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: profile.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
        read_at: null
      }

      // Adicionar mensagem temporária à lista local (otimistic update)
      setMessages(prev => [...prev, tempMessage])

      // Enviar mensagem para o servidor
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: profile.id,
          content: content.trim()
        })
        .select('id, conversation_id, sender_id, content, created_at')
        .single()

      if (error) {
        console.error('❌ Erro ao enviar mensagem:', error)
        // Remover mensagem temporária em caso de erro
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
        throw error
      }

      console.log('✅ Mensagem enviada:', data.id)

      // Substituir mensagem temporária pela real
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id ? data : msg
        )
      )

      // Atualizar last_message_at da conversa
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId)

      // Buscar o outro participante da conversa para notificação
      const { data: conversation } = await supabase
        .from('conversations')
        .select('client_id, professional_id')
        .eq('id', conversationId)
        .single()

      if (conversation) {
        const otherUserId = conversation.client_id === profile.id 
          ? conversation.professional_id 
          : conversation.client_id
        
        // Buscar informações dos perfis
        const [senderProfile, recipientProfile] = await Promise.all([
          supabase
            .from('profiles')
            .select('full_name')
            .eq('id', profile.id)
            .single(),
          supabase
            .from('profiles')
            .select('full_name')
            .eq('id', otherUserId)
            .single()
        ])

        // Criar notificação (não vai falhar se der erro)
        const notificationTitle = `Nova mensagem de ${senderProfile.data?.full_name || 'Usuário'}`
        const notificationMessage = content.length > 50 ? `${content.substring(0, 50)}...` : content
        
        // Tentar criar notificação, mas não falhar se der erro
        try {
          await createNotification(
            otherUserId,
            notificationTitle,
            notificationMessage,
            conversationId,
            profile.id,
            senderProfile.data?.full_name || 'Usuário'
          )
          
          console.log('✅ Notificação enviada para:', otherUserId)
        } catch (notificationError) {
          console.warn('⚠️ Erro ao criar notificação (não crítico):', notificationError)
          // Não vamos falhar o envio da mensagem por causa da notificação
        }

        // Enviar notificação por email (não crítico)
        try {
          // Buscar email do destinatário
          const { data: recipientData } = await supabase
            .from('profiles')
            .select('email, user_type')
            .eq('id', otherUserId)
            .single()

          if (recipientData?.email) {
            // Enviar email diretamente usando a Edge Function
            const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email', {
              body: {
                to: recipientData.email,
                subject: `💬 Nova mensagem de ${senderProfile.data?.full_name || 'Usuário'} - ConfiLar`,
                template: 'message',
                data: {
                  userName: recipientProfile.data?.full_name || 'Usuário',
                  senderName: senderProfile.data?.full_name || 'Usuário',
                  senderNameInitial: (senderProfile.data?.full_name || 'U').charAt(0).toUpperCase(),
                  senderType: profile.user_type === 'professional' ? 'Profissional' : 'Cliente',
                  messagePreview: notificationMessage,
                  messageTime: new Date().toLocaleString('pt-BR'),
                  chatUrl: `${window.location.origin}/mensagens`
                }
              }
            })

            if (emailError) {
              console.warn('⚠️ Erro ao enviar email de notificação:', emailError)
            } else {
              console.log('✅ Email de notificação enviado para:', recipientData.email)
            }
          }
        } catch (emailError) {
          console.warn('⚠️ Erro ao enviar email de notificação (não crítico):', emailError)
          // Não vamos falhar o envio da mensagem por causa do email
        }
      }

      // Recarregar conversas para atualizar ordem
      await fetchConversations()

      return data
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error)
      toast.error('ERRO AO ENVIAR MENSAGEM')
      return null
    }
  }, [profile?.id, fetchConversations])

  // Criar nova conversa - VERSÃO SIMPLIFICADA
  const createConversation = useCallback(async (otherUserId: string) => {
    if (!profile?.id) {
      console.error('❌ Usuário não autenticado')
      return null
    }

    try {
      console.log('🆕 Criando conversa com usuário:', otherUserId)
      console.log('👤 Usuário atual:', profile.id)

      // Verificar se já existe conversa
      const existingConversationId = await checkExistingConversation(otherUserId)
      if (existingConversationId) {
        console.log('✅ Conversa existente encontrada:', existingConversationId)
        await fetchConversations()
        return existingConversationId
      }

      // Criar nova conversa - determinar client_id e professional_id baseado no tipo de usuário
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', profile.id)
        .single()

      const { data: otherUserProfile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', otherUserId)
        .single()

      // Determinar quem é cliente e quem é profissional
      let clientId: string
      let professionalId: string

      if (currentUserProfile?.user_type === 'professional' && otherUserProfile?.user_type === 'client') {
        // Usuário atual é profissional, outro é cliente
        clientId = otherUserId
        professionalId = profile.id
      } else if (currentUserProfile?.user_type === 'client' && otherUserProfile?.user_type === 'professional') {
        // Usuário atual é cliente, outro é profissional
        clientId = profile.id
        professionalId = otherUserId
      } else {
        // Ambos são do mesmo tipo ou tipo indefinido - usar ordem padrão
        clientId = profile.id
        professionalId = otherUserId
      }

      console.log('👥 Definindo participantes:', { clientId, professionalId })

      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          client_id: clientId,
          professional_id: professionalId,
          last_message_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (convError) {
        console.error('❌ Erro ao criar conversa:', convError)
        throw convError
      }

      console.log('✅ Conversa criada:', newConversation.id)
      await fetchConversations()
      return newConversation.id
    } catch (error) {
      console.error('❌ Erro ao criar conversa:', error)
      toast.error('ERRO AO CRIAR CONVERSA')
      return null
    }
  }, [profile?.id, fetchConversations])

  // Verificar conversa existente
  const checkExistingConversation = useCallback(async (otherUserId: string): Promise<string | null> => {
    if (!profile?.id) return null
    
    try {
      console.log('🔍 Verificando conversa existente entre:', profile.id, 'e', otherUserId)
      
      // Buscar conversa existente usando o schema correto
      const { data: existingConversation, error } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(client_id.eq.${profile.id},professional_id.eq.${otherUserId}),and(client_id.eq.${otherUserId},professional_id.eq.${profile.id})`)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar conversa existente:', error)
        return null
      }

      console.log('🔍 Resultado da verificação:', existingConversation?.id || 'Nenhuma conversa encontrada')
      return existingConversation?.id || null
    } catch (error) {
      console.error('❌ Erro ao verificar conversa existente:', error)
      return null
    }
  }, [profile?.id])

  // Excluir conversa
  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!profile?.id) {
      console.error('❌ Usuário não autenticado')
      return false
    }

    try {
      console.log('🗑️ Excluindo conversa:', conversationId)

      // Verificar se o usuário é participante da conversa
      const { data: conversationData, error: checkError } = await supabase
        .from('conversations')
        .select('client_id, professional_id')
        .eq('id', conversationId)
        .single()

      if (checkError) {
        console.error('❌ Erro ao verificar conversa:', checkError)
        toast.error('ERRO AO VERIFICAR CONVERSA')
        return false
      }

      if (!conversationData || (conversationData.client_id !== profile.id && conversationData.professional_id !== profile.id)) {
        console.error('❌ Usuário não é participante desta conversa')
        toast.error('VOCÊ NÃO TEM PERMISSÃO PARA EXCLUIR ESTA CONVERSA')
        return false
      }

      console.log('✅ Usuário autorizado a excluir conversa')

      // Excluir mensagens da conversa
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId)

      if (messagesError) {
        console.error('❌ Erro ao excluir mensagens:', messagesError)
        // Continuar mesmo com erro nas mensagens
      } else {
        console.log('✅ Mensagens excluídas')
      }

      // Excluir a conversa
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)

      if (conversationError) {
        console.error('❌ Erro ao excluir conversa:', conversationError)
        toast.error('ERRO AO EXCLUIR CONVERSA')
        return false
      }

      console.log('✅ Conversa excluída com sucesso')
      toast.success('CONVERSA EXCLUÍDA COM SUCESSO')

      // Limpar conversa selecionada se for a mesma
      if (selectedConversation === conversationId) {
        setSelectedConversation(null)
        setMessages([])
      }

      // Recarregar lista de conversas
      await fetchConversations()

      return true
    } catch (error) {
      console.error('❌ Erro ao excluir conversa:', error)
      toast.error('ERRO AO EXCLUIR CONVERSA')
      return false
    }
  }, [profile?.id, selectedConversation, fetchConversations])

  // Sincronização em tempo real para todas as conversas (DESABILITADO TEMPORARIAMENTE)
  useEffect(() => {
    if (!profile?.id) return

    // REALTIME DESABILITADO TEMPORARIAMENTE PARA EVITAR LOOPS
    console.log('🔕 Realtime desabilitado temporariamente para conversas')
    return

    const channel = supabase
      .channel(`all-messages-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new
          
          // Verificar se a mensagem é para uma conversa do usuário atual
          if (newMessage.sender_id !== profile.id) {
            // Buscar informações da conversa para mostrar notificação
            const checkAndNotify = async () => {
              try {
                const { data: conversationData } = await supabase
                  .from('conversations')
                  .select('client_id, professional_id')
                  .eq('id', newMessage.conversation_id)
                  .single()

                if (conversationData && (conversationData.client_id === profile.id || conversationData.professional_id === profile.id)) {
                  // Buscar informações do remetente
                  const { data: senderProfile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', newMessage.sender_id)
                    .single()

                  // Nova mensagem recebida - apenas atualizar contadores
                  // Não mostrar toast - apenas atualizar estado
                  
                  // Recarregar conversas para atualizar contadores
                  fetchConversations()
                }
              } catch (error) {
                console.error('Erro ao verificar conversa para notificação:', error)
              }
            }
            
            checkAndNotify()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id, selectedConversation]) // Removido fetchConversations das dependências para evitar loop

  // Sincronização em tempo real para conversas (DESABILITADO TEMPORARIAMENTE)
  useEffect(() => {
    if (!profile?.id) return

    // REALTIME DESABILITADO TEMPORARIAMENTE PARA EVITAR LOOPS
    console.log('🔕 Realtime desabilitado temporariamente para conversas')
    return

    console.log('🔔 Configurando Realtime para conversas')

    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('📝 Conversa atualizada:', payload.new)
          const updatedConversation = payload.new as ConversationWithParticipant
          
          // Atualizar conversa na lista local
          setConversations(prev => 
            prev.map(conv => 
              conv.id === updatedConversation.id ? updatedConversation : conv
            )
          )
        }
      )
      .subscribe()

    return () => {
      console.log('🔕 Removendo subscription de conversas')
      supabase.removeChannel(channel)
    }
  }, [profile?.id])

  // Sincronização em tempo real para conversa selecionada (DESABILITADO TEMPORARIAMENTE)
  useEffect(() => {
    if (!profile?.id || !selectedConversation) return

    // REALTIME DESABILITADO TEMPORARIAMENTE PARA EVITAR LOOPS
    console.log('🔕 Realtime desabilitado temporariamente para conversa selecionada')
    return

    console.log('🔔 Configurando Realtime para conversa:', selectedConversation)

    const channel = supabase
      .channel(`messages:${selectedConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`
        },
        (payload) => {
          console.log('📨 Nova mensagem recebida:', payload.new)
          const newMessage = payload.new as SupabaseMessage
          
          // Adicionar mensagem apenas se não for do usuário atual (para evitar duplicação)
          if (newMessage.sender_id !== profile.id) {
            setMessages(prev => [...prev, newMessage])
            
            // Marcar como lida automaticamente
            supabase
              .from('messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', newMessage.id)
              .then(() => {
                console.log('✅ Mensagem marcada como lida')
              })

            // Marcar notificações relacionadas como lidas
            markNotificationsAsRead(selectedConversation)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`
        },
        (payload) => {
          console.log('📝 Mensagem atualizada:', payload.new)
          const updatedMessage = payload.new as SupabaseMessage
          
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          )
        }
      )
      .subscribe()

    return () => {
      console.log('🔕 Removendo subscription Realtime')
      supabase.removeChannel(channel)
    }
  }, [profile?.id, selectedConversation])

  // Carregar conversas iniciais
  useEffect(() => {
    if (profile?.id) {
      fetchConversations()
    }
  }, [profile?.id, fetchConversations])

  return {
    conversations,
    messages,
    selectedConversation,
    isLoading,
    totalUnread,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    checkExistingConversation,
    deleteConversation,
    setSelectedConversation,
    markNotificationsAsRead
  }
}
