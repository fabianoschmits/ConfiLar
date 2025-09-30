'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useUnifiedAuth'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'message' | 'review' | 'booking' | 'verification' | 'achievement' | 'system' | 'chat' | 'evaluation' | 'recommendation'
  is_read: boolean
  action_url?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  metadata?: any
  created_at: string
  updated_at?: string
  expires_at?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  addNotification: (notification: Omit<Notification, 'id' | 'user_id' | 'is_read' | 'created_at'>) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  removeNotification: (id: string) => Promise<void>
  clearAll: () => Promise<void>
  loadNotifications: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Carregar notificações do banco de dados
  const loadNotifications = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Erro ao carregar notificações:', error)
        return
      }

      setNotifications(data || [])
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Adicionar notificação
  const addNotification = async (notification: Omit<Notification, 'id' | 'user_id' | 'is_read' | 'created_at'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          ...notification,
          is_read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar notificação:', error)
        return
      }

      // Adicionar à lista local
      setNotifications(prev => [data, ...prev])
      
      // Mostrar toast
      toast(notification.title, {
        description: notification.message,
        action: notification.action_url ? {
          label: 'Ver',
          onClick: () => window.open(notification.action_url, '_blank')
        } : undefined
      })
    } catch (error) {
      console.error('Erro ao criar notificação:', error)
    }
  }

  // Marcar como lida
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('Erro ao marcar notificação como lida:', error)
        return
      }

      // Atualizar lista local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        console.error('Erro ao marcar todas como lidas:', error)
        return
      }

      // Atualizar lista local
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      )
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  // Remover notificação
  const removeNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao remover notificação:', error)
        return
      }

      // Remover da lista local
      setNotifications(prev => prev.filter(notification => notification.id !== id))
    } catch (error) {
      console.error('Erro ao remover notificação:', error)
    }
  }

  // Limpar todas
  const clearAll = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('Erro ao limpar notificações:', error)
        return
      }

      setNotifications([])
    } catch (error) {
      console.error('Erro ao limpar notificações:', error)
    }
  }

  // Atualizar notificações
  const refreshNotifications = async () => {
    await loadNotifications()
  }

  // Calcular contagem de não lidas
  const unreadCount = notifications.filter(n => !n.is_read).length

  // Carregar notificações na inicialização
  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [user])

  // Configurar realtime para notificações
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications(prev => [newNotification, ...prev])
          
          // Mostrar toast para nova notificação
          toast(newNotification.title, {
            description: newNotification.message,
            action: newNotification.action_url ? {
              label: 'Ver',
              onClick: () => window.open(newNotification.action_url, '_blank')
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
          const updatedNotification = payload.new as Notification
          setNotifications(prev => 
            prev.map(notification => 
              notification.id === updatedNotification.id 
                ? updatedNotification 
                : notification
            )
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
          const deletedNotification = payload.old as Notification
          setNotifications(prev => 
            prev.filter(notification => notification.id !== deletedNotification.id)
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    loadNotifications,
    refreshNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

