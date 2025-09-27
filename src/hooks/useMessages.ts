'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNotifications } from '@/components/notifications/NotificationProviderSimple'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  content: string
  message_type?: string
  reply_to_id?: string
  created_at: string
  updated_at: string
  is_read: boolean
  sender?: {
    id: string
    full_name: string
    avatar_url?: string
    user_type?: string
  }
}

export interface Conversation {
  id: string
  client_id: string
  professional_id: string
  ad_id?: string
  last_message_at: string | null
  last_message_preview?: string
  unread_count_client?: number
  unread_count_professional?: number
  status?: string
  created_at: string
  updated_at: string
  client?: {
    id: string
    full_name: string
    avatar_url?: string
    user_type?: string
  }
  professional?: {
    id: string
    full_name: string
    avatar_url?: string
    user_type?: string
  }
  last_message?: {
    content: string
    created_at: string
    sender_id: string
  }
  unread_count?: number
  ad?: {
    title: string
    category: string
  }
}

export interface ContactAgreement {
  id: string
  conversation_id: string
  client_id: string
  professional_id: string
  ad_id: string
  status: 'pending' | 'accepted' | 'rejected'
  terms: string
  notes: string | null
  created_at: string
  updated_at: string
}

export function useMessages() {
  const { user } = useAuthContext()
  const { addNotification } = useNotifications()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [contactAgreements, setContactAgreements] = useState<ContactAgreement[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null)

  // Carregar conversas do usuário
  const loadConversations = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          client_id,
          professional_id,
          last_message_at,
          created_at,
          updated_at,
          client:client_id(id, full_name, avatar_url, user_type),
          professional:professional_id(id, full_name, avatar_url, user_type)
        `)
        .or(`client_id.eq.${user.id},professional_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })
        .limit(20) // Limitar a 20 conversas por vez

      if (error) throw error

      // Buscar última mensagem e contador de não lidas para cada conversa
      const conversationsWithMessages = await Promise.all(
        (data || []).map(async (conversation) => {
          // Última mensagem
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          // Contador de mensagens não lidas
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversation.id)
            .eq('receiver_id', user.id)
            .eq('is_read', false)

          return {
            ...conversation,
            // Garantir que client e professional sejam objetos únicos, não arrays
            client: Array.isArray(conversation.client) ? conversation.client[0] : conversation.client,
            professional: Array.isArray(conversation.professional) ? conversation.professional[0] : conversation.professional,
            last_message: lastMessage,
            unread_count: unreadCount || 0
          }
        })
      )

      setConversations(conversationsWithMessages)
    } catch (err) {
      console.error('❌ Erro ao buscar conversas:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase])

  // Carregar mensagens de uma conversa (otimizado)
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, receiver_id, content, created_at, is_read, updated_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(50) // Limitar a 50 mensagens por vez

      if (error) throw error

      setMessages(data || [])
    } catch (err) {
      console.error('❌ Erro ao buscar mensagens:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Criar notificação para nova mensagem - REMOVIDO para evitar duplicação
  const createMessageNotification = useCallback(async (message: Message, conversation: Conversation) => {
    // Função removida para evitar duplicação de notificações
    return
  }, [])

  // Criar notificação para acordo
  const createAgreementNotification = useCallback(async (agreement: any, type: 'proposal' | 'accepted' | 'rejected' | 'review_available') => {
    if (!user?.id) return

    try {
      let title = ''
      let message = ''
      let notificationType: 'info' | 'success' | 'warning' | 'error' | 'message' | 'review' | 'booking' | 'verification' | 'achievement' | 'system' = 'info'

      switch (type) {
        case 'proposal':
          title = 'Nova proposta de acordo'
          message = `${agreement.professional?.full_name || 'Profissional'} enviou uma proposta de acordo`
          notificationType = 'info'
          break
        case 'accepted':
          title = 'Acordo aceito'
          message = `${agreement.client?.full_name || 'Cliente'} aceitou sua proposta de acordo`
          notificationType = 'success'
          break
        case 'rejected':
          title = 'Acordo rejeitado'
          message = `${agreement.client?.full_name || 'Cliente'} rejeitou sua proposta de acordo`
          notificationType = 'warning'
          break
        case 'review_available':
          title = 'Avaliação disponível!'
          message = `Você já pode avaliar ${agreement.client?.full_name || 'Cliente'} após o acordo aceito`
          notificationType = 'review'
          break
      }

      // Determinar o destinatário da notificação
      let recipientId: string
      
      if (type === 'proposal') {
        // Para proposta: enviar para quem NÃO fez a proposta
        // Se quem propôs é o cliente, enviar para o profissional
        // Se quem propôs é o profissional, enviar para o cliente
        recipientId = agreement.proposed_by === agreement.client_id 
          ? agreement.professional_id 
          : agreement.client_id
      } else if (type === 'accepted') {
        // Para aceito: enviar para quem fez a proposta
        recipientId = agreement.proposed_by
      } else if (type === 'review_available') {
        // Para avaliação disponível: enviar para ambos os usuários
        // Esta função será chamada duas vezes (uma para cada usuário)
        recipientId = user.id === agreement.client_id ? agreement.professional_id : agreement.client_id
      } else {
        // Para rejeitado: enviar para quem fez a proposta
        recipientId = agreement.proposed_by
      }

      console.log('📤 Enviando notificação:', {
        type,
        recipientId,
        proposedBy: agreement.proposed_by,
        clientId: agreement.client_id,
        professionalId: agreement.professional_id,
        title,
        message
      })

      await addNotification({
        user_id: recipientId,
        title,
        message,
        type: notificationType,
        action_url: `/mensagens?conversation=${agreement.conversation_id}`,
        priority: 'normal'
      })
    } catch (error) {
      console.error('❌ Erro ao criar notificação de acordo:', error)
    }
  }, [user?.id, addNotification])

  // Função para enviar notificação automática de nova conversa
  const sendNewConversationNotification = useCallback(async (conversation: Conversation) => {
    if (!user?.id) return

    try {
      // Determinar quem recebe a notificação (quem não iniciou a conversa)
      const recipientId = user.id === conversation.client_id 
        ? conversation.professional_id 
        : conversation.client_id

      const recipientName = user.id === conversation.client_id 
        ? conversation.professional?.full_name || 'Profissional'
        : conversation.client?.full_name || 'Cliente'

      const senderName = conversation.client_id === user.id 
        ? conversation.client?.full_name || 'Usuário'
        : conversation.professional?.full_name || 'Usuário'

      await addNotification({
        user_id: recipientId,
        title: 'Nova conversa iniciada',
        message: `${senderName} iniciou uma conversa com você. Clique para responder!`,
        type: 'message',
        action_url: `/mensagens?conversation=${conversation.id}`,
        priority: 'normal'
      })

      console.log('📨 Notificação de nova conversa enviada para:', recipientName)
    } catch (error) {
      console.error('Erro ao enviar notificação de nova conversa:', error)
    }
  }, [user, addNotification])

  // Enviar mensagem
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!user?.id) return false

    try {
      setSending(true)
      setError(null)

      // Determinar receiver_id baseado na conversa
      const conversation = conversations.find(c => c.id === conversationId)
      if (!conversation) throw new Error('Conversa não encontrada')

      const receiverId = conversation.client_id === user.id 
        ? conversation.professional_id 
        : conversation.client_id

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: receiverId,
          content: content.trim(),
          is_read: false
        })
        .select()
        .single()

      if (error) throw error

      // Atualizar last_message_at na conversa
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId)

      // Recarregar mensagens
      await loadMessages(conversationId)
      
      return true
    } catch (err) {
      console.error('❌ Erro ao enviar mensagem:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    } finally {
      setSending(false)
    }
  }, [user?.id, conversations, loadMessages])

  // Marcar mensagens como lidas
  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    if (!user?.id) return

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', user.id)
        .eq('is_read', false)

      // Recarregar conversas para atualizar contadores
      await loadConversations()
    } catch (err) {
      console.error('❌ Erro ao marcar mensagens como lidas:', err)
    }
  }, [user?.id, loadConversations])

  // Buscar acordos de contato
  const loadContactAgreements = useCallback(async (conversationId: string) => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('contact_agreements')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setContactAgreements(data || [])
    } catch (err) {
      console.error('❌ Erro ao buscar acordos de contato:', err)
    }
  }, [user?.id])

  // Criar ou encontrar conversa
  const createOrFindConversation = useCallback(async (clientId: string, professionalId: string, adId?: string) => {
    if (!user?.id) return null

    try {
      // Verificar se já existe conversa
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(client_id.eq.${clientId},professional_id.eq.${professionalId}),and(client_id.eq.${professionalId},professional_id.eq.${clientId})`)
        .maybeSingle()

      if (existingConversation) {
        return existingConversation.id
      }

      // Criar nova conversa
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          client_id: clientId,
          professional_id: professionalId,
          ad_id: adId
        })
        .select()
        .single()

      if (error) throw error

      return data.id
    } catch (err) {
      console.error('❌ Erro ao criar/encontrar conversa:', err)
      return null
    }
  }, [user?.id])

  // Deletar conversa
  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!user?.id) return false

    try {
      setLoading(true)
      setError(null)

      // Verificar se o usuário tem permissão para deletar a conversa
      const { data: conversation } = await supabase
        .from('conversations')
        .select('client_id, professional_id')
        .eq('id', conversationId)
        .maybeSingle()

      if (!conversation) {
        throw new Error('Conversa não encontrada')
      }

      // Verificar se o usuário é participante da conversa
      if (conversation.client_id !== user.id && conversation.professional_id !== user.id) {
        throw new Error('Você não tem permissão para deletar esta conversa')
      }

      // Deletar todas as mensagens da conversa primeiro
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId)

      if (messagesError) throw messagesError

      // Deletar acordos de contato relacionados
      const { error: agreementsError } = await supabase
        .from('contact_agreements')
        .delete()
        .eq('conversation_id', conversationId)

      if (agreementsError) throw agreementsError

      // Deletar a conversa
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)

      if (conversationError) throw conversationError

      // Recarregar lista de conversas
      await loadConversations()
      
      return true
    } catch (err) {
      console.error('❌ Erro ao deletar conversa:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    } finally {
      setLoading(false)
    }
  }, [user?.id, loadConversations])

  // Deletar mensagem
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return false

    try {
      setLoading(true)
      setError(null)

      // Verificar se a mensagem existe e se o usuário é o remetente
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .select('id, sender_id, conversation_id')
        .eq('id', messageId)
        .maybeSingle()

      if (messageError) throw messageError

      if (!message) {
        throw new Error('Mensagem não encontrada')
      }

      // Verificar se o usuário é o remetente da mensagem
      if (message.sender_id !== user.id) {
        throw new Error('Você só pode deletar suas próprias mensagens')
      }

      // Deletar a mensagem
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (deleteError) throw deleteError

      // Recarregar mensagens da conversa
      await loadMessages(message.conversation_id)
      
      return true
    } catch (err) {
      console.error('❌ Erro ao deletar mensagem:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    } finally {
      setLoading(false)
    }
  }, [user?.id, loadMessages])

  // Editar mensagem
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!user?.id) return false

    try {
      setLoading(true)
      setError(null)

      // Verificar se a mensagem existe e se o usuário é o remetente
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .select('id, sender_id, conversation_id, content')
        .eq('id', messageId)
        .maybeSingle()

      if (messageError) throw messageError

      if (!message) {
        throw new Error('Mensagem não encontrada')
      }

      // Verificar se o usuário é o remetente da mensagem
      if (message.sender_id !== user.id) {
        throw new Error('Você só pode editar suas próprias mensagens')
      }

      // Validar novo conteúdo
      if (!newContent || newContent.trim().length === 0) {
        throw new Error('O conteúdo da mensagem não pode estar vazio')
      }

      if (newContent.length > 1000) {
        throw new Error('A mensagem não pode ter mais de 1000 caracteres')
      }

      // Atualizar a mensagem
      const { error: updateError } = await supabase
        .from('messages')
        .update({ 
          content: newContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)

      if (updateError) throw updateError

      // Recarregar mensagens para mostrar a atualização
      await loadMessages(message.conversation_id)

      return true
    } catch (err) {
      console.error('❌ Erro ao editar mensagem:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    } finally {
      setLoading(false)
    }
  }, [user?.id, loadMessages])

  // Carregar dados iniciais (SEM REALTIME TEMPORARIAMENTE)
  useEffect(() => {
    if (!user?.id) return

    // Carregar dados iniciais apenas uma vez
    loadConversations()

    // Verificar mensagens não lidas periodicamente
    const checkUnreadMessages = async () => {
      try {
        // Verificar se a tabela messages existe primeiro
        const { data: testData, error: testError } = await supabase
          .from('messages')
          .select('id')
          .limit(1)

        if (testError) {
          console.log('⚠️ Tabela messages não encontrada, pulando verificação de mensagens não lidas')
          return
        }

        const { data: unreadMessages, error } = await supabase
          .from('messages')
          .select(`
            id,
            conversation_id,
            sender_id,
            receiver_id,
            content,
            created_at
          `)
          .eq('receiver_id', user.id)
          .eq('is_read', false)
          .neq('sender_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) {
          console.log('⚠️ Erro ao verificar mensagens não lidas:', error.message)
          return
        }

        // Log apenas se houver mensagens não lidas
        if (unreadMessages && unreadMessages.length > 0) {
          console.log(`📨 ${unreadMessages.length} mensagens não lidas encontradas`)
        }
      } catch (error) {
        console.log('⚠️ Erro ao verificar mensagens não lidas:', error.message)
      }
    }

    // Verificar imediatamente
    checkUnreadMessages()

    // Verificar a cada 5 minutos (reduzido de 30 segundos)
    const interval = setInterval(checkUnreadMessages, 5 * 60 * 1000)

    // Cleanup
    return () => {
      clearInterval(interval)
      if (realtimeChannel) {
        realtimeChannel.unsubscribe()
        setRealtimeChannel(null)
      }
    }
  }, [user?.id, loadConversations])

  // Calcular total de mensagens não lidas
  const getTotalUnreadCount = useCallback(() => {
    return conversations.reduce((total, conversation) => {
      if (conversation.unread_count) {
        return total + conversation.unread_count
      }
      return total
    }, 0)
  }, [conversations])

  return {
    conversations,
    messages,
    contactAgreements,
    loading,
    sending,
    error,
    loadConversations,
    loadMessages,
    sendMessage,
    markMessagesAsRead,
    loadContactAgreements,
    createConversation: createOrFindConversation,
    createOrFindConversation,
    deleteConversation,
    deleteMessage,
    editMessage,
    getTotalUnreadCount,
    createAgreementNotification,
    sendNewConversationNotification
  }
}