import { useEffect, useRef, useCallback } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { useQueryClient } from '@tanstack/react-query'
import { QueryKeys } from '@/lib/queryClient'

interface RealtimeConfig {
  // Configurações de mensagens
  enableMessages: boolean
  // Configurações de notificações
  enableNotifications: boolean
  // Configurações de posts
  enablePosts: boolean
  // Configurações de avaliações
  enableReviews: boolean
}

const DEFAULT_CONFIG: RealtimeConfig = {
  enableMessages: true,
  enableNotifications: true,
  enablePosts: false, // Desabilitado por padrão para economizar
  enableReviews: false // Desabilitado por padrão para economizar
}

export function useOptimizedRealtime(config: Partial<RealtimeConfig> = {}) {
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map())
  
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  // Função para criar canal otimizado
  const createChannel = useCallback((name: string, table: string, filter?: string) => {
    if (!user?.id) return null

    const channelName = `${name}-${user.id}`
    
    // Remover canal existente se houver
    const existingChannel = channelsRef.current.get(channelName)
    if (existingChannel) {
      existingChannel.unsubscribe()
      channelsRef.current.delete(channelName)
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: filter || `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log(`📡 Realtime ${name}:`, payload)
          
          // Invalidar cache específico baseado na tabela
          switch (table) {
            case 'messages':
              queryClient.invalidateQueries({ queryKey: QueryKeys.messages })
              queryClient.invalidateQueries({ queryKey: QueryKeys.conversations(user.id) })
              break
            case 'notifications':
              queryClient.invalidateQueries({ queryKey: QueryKeys.notifications(user.id) })
              break
            case 'feed_posts':
              queryClient.invalidateQueries({ queryKey: ['timeline'] })
              break
            case 'reviews':
              queryClient.invalidateQueries({ queryKey: QueryKeys.reviews })
              queryClient.invalidateQueries({ queryKey: ['review-stats'] })
              break
          }
        }
      )
      .subscribe()

    channelsRef.current.set(channelName, channel)
    return channel
  }, [user?.id, queryClient])

  // Configurar canais baseado na configuração
  useEffect(() => {
    if (!user?.id) return

    // Canal de mensagens (sempre ativo se habilitado)
    if (finalConfig.enableMessages) {
      createChannel('messages', 'messages', `receiver_id=eq.${user.id}`)
    }

    // Canal de notificações (sempre ativo se habilitado)
    if (finalConfig.enableNotifications) {
      createChannel('notifications', 'notifications', `user_id=eq.${user.id}`)
    }

    // Canal de posts (opcional)
    if (finalConfig.enablePosts) {
      createChannel('posts', 'feed_posts')
    }

    // Canal de avaliações (opcional)
    if (finalConfig.enableReviews) {
      createChannel('reviews', 'reviews', `reviewed_id=eq.${user.id}`)
    }

    // Cleanup
    return () => {
      channelsRef.current.forEach((channel) => {
        channel.unsubscribe()
      })
      channelsRef.current.clear()
    }
  }, [user?.id, finalConfig, createChannel])

  // Função para ativar/desativar canais específicos
  const toggleChannel = useCallback((channelName: string, enabled: boolean) => {
    const channel = channelsRef.current.get(channelName)
    
    if (enabled && !channel) {
      // Criar canal se não existir
      switch (channelName) {
        case 'messages':
          if (finalConfig.enableMessages) {
            createChannel('messages', 'messages', `receiver_id=eq.${user?.id}`)
          }
          break
        case 'notifications':
          if (finalConfig.enableNotifications) {
            createChannel('notifications', 'notifications', `user_id=eq.${user?.id}`)
          }
          break
        case 'posts':
          if (finalConfig.enablePosts) {
            createChannel('posts', 'feed_posts')
          }
          break
        case 'reviews':
          if (finalConfig.enableReviews) {
            createChannel('reviews', 'reviews', `reviewed_id=eq.${user?.id}`)
          }
          break
      }
    } else if (!enabled && channel) {
      // Remover canal se existir
      channel.unsubscribe()
      channelsRef.current.delete(channelName)
    }
  }, [user?.id, finalConfig, createChannel])

  // Função para verificar status dos canais
  const getChannelStatus = useCallback(() => {
    const status: Record<string, boolean> = {}
    channelsRef.current.forEach((channel, name) => {
      status[name] = channel.state === 'joined'
    })
    return status
  }, [])

  // Função para reconectar todos os canais
  const reconnectAll = useCallback(() => {
    channelsRef.current.forEach((channel) => {
      channel.unsubscribe()
    })
    channelsRef.current.clear()
    
    // Recriar canais
    if (finalConfig.enableMessages) {
      createChannel('messages', 'messages', `receiver_id=eq.${user?.id}`)
    }
    if (finalConfig.enableNotifications) {
      createChannel('notifications', 'notifications', `user_id=eq.${user?.id}`)
    }
    if (finalConfig.enablePosts) {
      createChannel('posts', 'feed_posts')
    }
    if (finalConfig.enableReviews) {
      createChannel('reviews', 'reviews', `reviewed_id=eq.${user?.id}`)
    }
  }, [user?.id, finalConfig, createChannel])

  return {
    toggleChannel,
    getChannelStatus,
    reconnectAll,
    isConnected: channelsRef.current.size > 0
  }
}

// Hook específico para chat (sempre ativo)
export function useChatRealtime() {
  return useOptimizedRealtime({
    enableMessages: true,
    enableNotifications: true,
    enablePosts: false,
    enableReviews: false
  })
}

// Hook específico para timeline (posts + notificações)
export function useTimelineRealtime() {
  return useOptimizedRealtime({
    enableMessages: false,
    enableNotifications: true,
    enablePosts: true,
    enableReviews: false
  })
}

// Hook específico para perfil (avaliações + notificações)
export function useProfileRealtime() {
  return useOptimizedRealtime({
    enableMessages: false,
    enableNotifications: true,
    enablePosts: false,
    enableReviews: true
  })
}
