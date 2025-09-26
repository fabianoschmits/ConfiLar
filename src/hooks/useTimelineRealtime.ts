import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

export function useTimelineRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Configurar Realtime para feed_posts
    const feedPostsChannel = supabase
      .channel('timeline-feed-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feed_posts'
        },
        (payload) => {
          console.log('🔄 Feed post atualizado:', payload)
          
          // Invalidar cache da timeline
          queryClient.invalidateQueries({
            queryKey: ['unified-timeline']
          })
        }
      )
      .subscribe()

    // Configurar Realtime para user_activity_log
    const activityChannel = supabase
      .channel('timeline-activities')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_activity_log'
        },
        (payload) => {
          console.log('🔄 Atividade atualizada:', payload)
          
          // Invalidar cache da timeline
          queryClient.invalidateQueries({
            queryKey: ['unified-timeline']
          })
        }
      )
      .subscribe()

    // Configurar Realtime para notifications
    const notificationsChannel = supabase
      .channel('timeline-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('🔄 Notificação atualizada:', payload)
          
          // Invalidar cache da timeline
          queryClient.invalidateQueries({
            queryKey: ['unified-timeline']
          })
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      feedPostsChannel.unsubscribe()
      activityChannel.unsubscribe()
      notificationsChannel.unsubscribe()
    }
  }, [queryClient])
}
