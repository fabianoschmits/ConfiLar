import { useState, useCallback, useEffect } from 'react'
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
// import { useNotifications } from '@/hooks/useSupabaseNotifications'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  is_read: boolean
}

interface Conversation {
  id: string
  client_id: string
  professional_id: string
  last_message_at: string
  created_at: string
  updated_at: string
  client?: {
    id: string
    full_name: string
    avatar_url: string
    user_type: string
  }
  professional?: {
    id: string
    full_name: string
    avatar_url: string
    user_type: string
  }
  unread_count?: number
}

export function useOptimizedMessages() {
  const { user } = useAuthContext()
  // const { addNotification } = useNotifications()
  const queryClient = useQueryClient()
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  // Query otimizada para conversas
  const {
    data: conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

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

      // Buscar contadores de mensagens não lidas para cada conversa
      const conversationIds = data?.map(c => c.id) || []
      if (conversationIds.length > 0) {
        const { data: unreadCounts } = await supabase
          .from('messages')
          .select('conversation_id')
          .eq('receiver_id', user.id)
          .eq('is_read', false)
          .in('conversation_id', conversationIds)

        // Mapear contadores
        const unreadMap = new Map<string, number>()
        unreadCounts?.forEach(msg => {
          const count = unreadMap.get(msg.conversation_id) || 0
          unreadMap.set(msg.conversation_id, count + 1)
        })

        // Adicionar contadores às conversas
        return data?.map(conv => ({
          ...conv,
          unread_count: unreadMap.get(conv.id) || 0
        })) || []
      }

      return data || []
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // Cache por 2 minutos
    gcTime: 1000 * 60 * 10, // Manter no cache por 10 minutos
  })

  // Query otimizada para mensagens com paginação infinita
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages
  } = useInfiniteQuery({
    queryKey: ['messages', selectedConversationId],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      if (!selectedConversationId) return []

      const MESSAGES_PER_PAGE = 20
      const { data, error } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, receiver_id, content, created_at, is_read')
        .eq('conversation_id', selectedConversationId)
        .order('created_at', { ascending: false })
        .range(pageParam * MESSAGES_PER_PAGE, (pageParam + 1) * MESSAGES_PER_PAGE - 1)

      if (error) throw error
      return data || []
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length : undefined
    },
    enabled: !!selectedConversationId,
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
    gcTime: 1000 * 60 * 30, // Manter no cache por 30 minutos
  })

  // Flatten das mensagens de todas as páginas (ordenadas do mais antigo para o mais recente)
  const messages = messagesData?.pages.flat().reverse() || []

  // Mutation para enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      if (!user?.id) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          is_read: false
        })
        .select('id, conversation_id, sender_id, receiver_id, content, created_at, is_read')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (newMessage) => {
      // Invalidar cache de mensagens para forçar refetch
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] })
      
      // Invalidar cache de conversas para atualizar last_message_at
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] })
    }
  })

  // Mutation para marcar mensagens como lidas
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user?.id) return

      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', user.id)
        .eq('is_read', false)

      if (error) throw error
    },
    onSuccess: () => {
      // Invalidar cache de conversas para atualizar contadores
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] })
    }
  })

  // Funções auxiliares
  const loadMessages = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId)
  }, [])

  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    try {
      await sendMessageMutation.mutateAsync({ conversationId, content })
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      throw error
    }
  }, [sendMessageMutation])

  const markMessagesAsRead = useCallback((conversationId: string) => {
    markAsReadMutation.mutate(conversationId)
  }, [markAsReadMutation])

  const loadMoreMessages = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Calcular total de mensagens não lidas
  const totalUnreadMessages = conversations?.reduce((total, conv: any) => total + (conv.unread_count || 0), 0) || 0

  return {
    // Dados
    conversations: conversations || [],
    messages,
    selectedConversationId,
    
    // Estados de loading
    conversationsLoading,
    messagesLoading,
    isFetchingNextPage,
    isSendingMessage: sendMessageMutation.isPending,
    isMarkingAsRead: markAsReadMutation.isPending,
    
    // Estados de erro
    conversationsError,
    messagesError,
    
    // Funções
    loadMessages,
    sendMessage,
    markMessagesAsRead,
    loadMoreMessages,
    refetchConversations,
    refetchMessages,
    
    // Estatísticas
    totalUnreadMessages,
    hasNextPage
  }
}
