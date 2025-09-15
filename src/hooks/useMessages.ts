'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNotifications } from '@/components/notifications/NotificationProvider'
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
            .single()

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

  // Carregar mensagens de uma conversa
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])
    } catch (err) {
      console.error('❌ Erro ao buscar mensagens:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Criar notificação para nova mensagem
  const createMessageNotification = useCallback(async (message: Message, conversation: Conversation) => {
    if (!user?.id || message.sender_id === user.id) return // Não notificar mensagens próprias

    try {
      // Determinar quem é o remetente e destinatário
      const sender = conversation.client_id === message.sender_id ? conversation.client : conversation.professional
      const receiver = conversation.client_id === message.receiver_id ? conversation.client : conversation.professional

      // Só criar notificação se o destinatário for o usuário atual
      if (receiver?.id !== user.id) return

      const senderName = sender?.full_name || 'Usuário'
      const messagePreview = message.content.length > 50 
        ? message.content.substring(0, 50) + '...' 
        : message.content

      await addNotification({
        user_id: user.id,
        title: `Nova mensagem de ${senderName}`,
        message: messagePreview,
        type: 'message',
        category: 'messages',
        action_url: `/mensagens?conversation=${conversation.id}`,
        action_label: 'Responder',
        metadata: {
          conversation_id: conversation.id,
          message_id: message.id,
          sender_id: message.sender_id,
          sender_name: senderName
        }
      })
    } catch (error) {
      console.error('❌ Erro ao criar notificação de mensagem:', error)
    }
  }, [user?.id, addNotification])

  // Criar notificação para acordo
  const createAgreementNotification = useCallback(async (agreement: any, type: 'proposal' | 'accepted' | 'rejected') => {
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
      }

      await addNotification({
        user_id: type === 'proposal' ? agreement.client_id : agreement.professional_id,
        title,
        message,
        type: notificationType,
        category: 'messages',
        action_url: `/mensagens?conversation=${agreement.conversation_id}`,
        action_label: 'Ver Acordo',
        metadata: {
          agreement_id: agreement.id,
          conversation_id: agreement.conversation_id,
          agreement_type: type
        }
      })
    } catch (error) {
      console.error('❌ Erro ao criar notificação de acordo:', error)
    }
  }, [user?.id, addNotification])

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
        .single()

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
        .single()

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
        .single()

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
        .single()

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
        const { data: unreadMessages, error } = await supabase
          .from('messages')
          .select(`
            *,
            conversations!inner(
              id,
              client_id,
              professional_id,
              client:profiles!conversations_client_id_fkey(id, full_name, avatar_url, user_type),
              professional:profiles!conversations_professional_id_fkey(id, full_name, avatar_url, user_type)
            )
          `)
          .eq('receiver_id', user.id)
          .eq('is_read', false)
          .neq('sender_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) {
          console.error('❌ Erro ao verificar mensagens não lidas:', error)
          return
        }

        // Criar notificações para mensagens não lidas
        if (unreadMessages && unreadMessages.length > 0) {
          for (const message of unreadMessages) {
            const conversation = message.conversations
            if (conversation) {
              await createMessageNotification(message, conversation)
            }
          }
        }
      } catch (error) {
        console.error('❌ Erro ao verificar mensagens não lidas:', error)
      }
    }

    // Verificar imediatamente
    checkUnreadMessages()

    // Verificar a cada 30 segundos
    const interval = setInterval(checkUnreadMessages, 30000)

    // Cleanup
    return () => {
      clearInterval(interval)
      if (realtimeChannel) {
        realtimeChannel.unsubscribe()
        setRealtimeChannel(null)
      }
    }
  }, [user?.id, loadConversations, createMessageNotification])

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
    createAgreementNotification
  }
}