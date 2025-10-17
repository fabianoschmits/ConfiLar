'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Notification } from '@/components/notifications/NotificationProviderSimple'

interface UseCachedNotificationsOptions {
  userId?: string
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
}

export function useCachedNotifications(options: UseCachedNotificationsOptions = {}) {
  const { userId, enabled = true, staleTime = 30 * 1000, cacheTime = 2 * 60 * 1000 } = options
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return []
      
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles:sender_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data as Notification[]
    },
    enabled: enabled && !!userId,
    staleTime,
    gcTime: cacheTime,
    retry: 2,
    refetchOnWindowFocus: true, // Notificações devem ser atualizadas quando o usuário volta
    refetchInterval: 30 * 1000, // Atualiza a cada 30 segundos
  })
}

export function useCachedUnreadCount(userId?: string) {
  return useQuery({
    queryKey: ['notifications-count', userId],
    queryFn: async () => {
      if (!userId) return 0
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false)

      if (error) throw error
      return count || 0
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000,
  })
}

// Hook para invalidar cache de notificações
export function useInvalidateNotifications() {
  const queryClient = useQueryClient()

  return (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
    queryClient.invalidateQueries({ queryKey: ['notifications-count', userId] })
  }
}

// Hook para marcar notificação como lida
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return async (notificationId: string, userId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (!error) {
      // Atualiza o cache local
      queryClient.setQueryData(['notifications', userId], (old: Notification[] | undefined) => {
        if (!old) return old
        return old.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      })
      
      // Invalida o contador
      queryClient.invalidateQueries({ queryKey: ['notifications-count', userId] })
    }

    return { error }
  }
}
