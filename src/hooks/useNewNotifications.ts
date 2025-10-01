'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { NewNotificationService, NewNotification } from '@/services/NewNotificationService'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function useNewNotifications() {
  const { user } = useAuthContext()
  const [notifications, setNotifications] = useState<NewNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Carregar notificações
  const loadNotifications = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await NewNotificationService.getUserNotifications(user.id)
      setNotifications(data)
      
      // Calcular não lidas
      const unread = data.filter(n => !n.is_read).length
      setUnreadCount(unread)
      
      console.log(`🔔 ${data.length} notificações carregadas (${unread} não lidas)`)
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Marcar como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const success = await NewNotificationService.markAsRead(notificationId)
      if (success) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('❌ Erro ao marcar como lida:', error)
    }
  }, [])

  // Deletar notificação
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const success = await NewNotificationService.delete(notificationId)
      if (success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('❌ Erro ao deletar notificação:', error)
    }
  }, [])

  // Limpar todas
  const clearAll = useCallback(async () => {
    if (!user) return

    try {
      const success = await NewNotificationService.clearAll(user.id)
      if (success) {
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('❌ Erro ao limpar todas:', error)
    }
  }, [user])

  // Configurar realtime
  useEffect(() => {
    if (!user) return

    console.log('🔔 Configurando realtime para notificações do usuário:', user.id)

    const channel = supabase
      .channel('new-notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Nova notificação recebida via realtime:', payload.new)
          const newNotification = payload.new as NewNotification
          
          // Adicionar ao estado
          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)
          
          // Mostrar toast
          toast(newNotification.title, {
            description: newNotification.message,
            action: newNotification.action_url ? {
              label: 'Ver',
              onClick: () => {
                if (newNotification.action_url?.startsWith('/')) {
                  window.location.href = newNotification.action_url
                } else {
                  window.open(newNotification.action_url, '_blank')
                }
              }
            } : undefined
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Notificação atualizada via realtime:', payload.new)
          const updatedNotification = payload.new as NewNotification
          
          setNotifications(prev => 
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Notificação deletada via realtime:', payload.old)
          const deletedNotification = payload.old as NewNotification
          
          setNotifications(prev => 
            prev.filter(n => n.id !== deletedNotification.id)
          )
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      )
      .subscribe()

    // Carregar notificações iniciais
    loadNotifications()

    return () => {
      console.log('🔔 Desconectando realtime de notificações')
      channel.unsubscribe()
    }
  }, [user, loadNotifications])

  return {
    notifications,
    loading,
    unreadCount,
    loadNotifications,
    markAsRead,
    deleteNotification,
    clearAll
  }
}
