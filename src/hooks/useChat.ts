import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/contexts/SupabaseContext'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'audio'
  created_at: string
  updated_at: string
  is_read: boolean
  sender?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

export interface ChatConversation {
  id: string
  participant_ids: string[]
  last_message?: ChatMessage
  unread_count: number
  created_at: string
  updated_at: string
  participants?: {
    id: string
    full_name: string
    avatar_url?: string
    online_status: 'online' | 'offline' | 'away'
  }[]
}

export function useChat(userId: string) {
  const { supabase } = useSupabase()
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  // Buscar conversas do usuário
  const fetchConversations = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            user_id,
            profiles(id, full_name, avatar_url, online_status)
          ),
          last_message:messages(
            id,
            content,
            created_at,
            sender_id
          )
        `)
        .contains('participant_ids', [userId])
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Processar dados das conversas
      const processedConversations = data?.map(conv => ({
        id: conv.id,
        participant_ids: conv.participant_ids,
        last_message: conv.last_message?.[0],
        unread_count: conv.unread_count || 0,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        participants: conv.participants?.map(p => p.profiles)
      })) || []

      setConversations(processedConversations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar conversas')
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  // Buscar mensagens de uma conversa
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(id, full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar mensagens')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Enviar mensagem
  const sendMessage = useCallback(async (content: string, receiverId: string) => {
    if (!userId || !content.trim()) return

    try {
      // Verificar se já existe uma conversa
      let conversationId = currentConversation?.id

      if (!conversationId) {
        // Criar nova conversa
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            participant_ids: [userId, receiverId],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (convError) throw convError
        conversationId = newConversation.id
        setCurrentConversation(newConversation)
      }

      // Enviar mensagem
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          receiver_id: receiverId,
          content: content.trim(),
          message_type: 'text',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          sender:profiles(id, full_name, avatar_url)
        `)
        .single()

      if (msgError) throw msgError

      // Adicionar mensagem à lista local
      setMessages(prev => [...prev, message])

      // Atualizar última mensagem da conversa
      await supabase
        .from('conversations')
        .update({ 
          updated_at: new Date().toISOString(),
          last_message_id: message.id
        })
        .eq('id', conversationId)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem')
    }
  }, [userId, currentConversation, supabase])

  // Marcar mensagens como lidas
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!userId || !conversationId) return

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', userId)
        .eq('is_read', false)

      // Atualizar contador local
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      )
    } catch (err) {
      console.error('Erro ao marcar como lida:', err)
    }
  }, [userId, supabase])

  // Configurar Realtime para mensagens
  useEffect(() => {
    if (!userId) return

    const newChannel = supabase
      .channel(`chat:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage
          
          // Adicionar mensagem se for da conversa atual
          if (currentConversation && newMessage.conversation_id === currentConversation.id) {
            setMessages(prev => [...prev, newMessage])
          }

          // Atualizar conversas
          fetchConversations()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          const updatedMessage = payload.new as ChatMessage
          
          // Atualizar mensagem na lista
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          )
        }
      )
      .subscribe()

    setChannel(newChannel)

    return () => {
      newChannel.unsubscribe()
    }
  }, [userId, currentConversation, supabase, fetchConversations])

  // Carregar conversas ao montar
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  return {
    conversations,
    currentConversation,
    messages,
    isLoading,
    error,
    sendMessage,
    fetchMessages,
    markAsRead,
    setCurrentConversation,
    fetchConversations
  }
}
