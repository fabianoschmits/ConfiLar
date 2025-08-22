'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export interface SupabaseNotification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  action_url: string | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

export function useSupabaseNotifications() {
  const { profile } = useAuthContext()
  const [notifications, setNotifications] = useState<SupabaseNotification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Buscar notificações do usuário
  const fetchNotifications = async () => {
    if (!profile?.id) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.is_read).length || 0)
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
      toast.error('Erro ao carregar notificações')
    } finally {
      setIsLoading(false)
    }
  }

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    if (!profile?.id) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false)

      if (error) throw error

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  // Remover notificação
  const removeNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      // Atualizar contador de não lidas
      const removed = notifications.find(n => n.id === notificationId)
      if (removed && !removed.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Erro ao remover notificação:', error)
    }
  }

  // Limpar todas as notificações
  const clearAll = async () => {
    if (!profile?.id) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', profile.id)

      if (error) throw error

      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error('Erro ao limpar notificações:', error)
    }
  }

  // Adicionar nova notificação (para testes)
  const addTestNotification = async (title: string, message: string, type: string = 'info') => {
    if (!profile?.id) return

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: profile.id,
          title,
          message,
          type,
          is_read: false,
          priority: 'normal'
        })

      if (error) throw error

      // Recarregar notificações
      await fetchNotifications()
    } catch (error) {
      console.error('Erro ao adicionar notificação:', error)
    }
  }

  // Sincronização em tempo real
  useEffect(() => {
    if (!profile?.id) return

    console.log('🔔 Iniciando sincronização de notificações em tempo real...')

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`
        },
        (payload) => {
          console.log('🔔 Mudança detectada nas notificações:', payload)
          
          if (payload.eventType === 'INSERT') {
            // Nova notificação
            const newNotification = payload.new as SupabaseNotification
            setNotifications(prev => [newNotification, ...prev])
            setUnreadCount(prev => prev + 1)
            
            // Mostrar toast para notificação em tempo real
            toast.info(newNotification.title, {
              description: newNotification.message,
              duration: 5000,
              action: {
                label: 'Ver',
                onClick: () => {
                  // Aqui você pode adicionar lógica para abrir a conversa
                  console.log('Abrindo conversa:', newNotification.action_url)
                }
              }
            })
          } else if (payload.eventType === 'UPDATE') {
            // Notificação atualizada (ex: marcada como lida)
            const updatedNotification = payload.new as SupabaseNotification
            setNotifications(prev =>
              prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
            )
            
            // Recalcular contagem de não lidas
            fetchNotifications()
          } else if (payload.eventType === 'DELETE') {
            // Notificação removida
            const deletedNotification = payload.old as SupabaseNotification
            setNotifications(prev => prev.filter(n => n.id !== deletedNotification.id))
            
            // Recalcular contagem de não lidas
            fetchNotifications()
          }
        }
      )
      .subscribe()

    return () => {
      console.log('🔔 Desconectando canal de notificações...')
      supabase.removeChannel(channel)
    }
  }, [profile?.id])

  // Carregar notificações iniciais
  useEffect(() => {
    if (profile?.id) {
      fetchNotifications()
    }
  }, [profile?.id])

  return {
    notifications,
    isLoading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    addTestNotification
  }
}
