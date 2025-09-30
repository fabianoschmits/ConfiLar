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
      
      // Tentar buscar da tabela notifications primeiro
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (notificationsError) {
        console.log('Tabela notifications não encontrada, usando sistema local')
        // Se a tabela não existir, usar localStorage
        const stored = localStorage.getItem(`confilar_notifications_${user.id}`)
        if (stored) {
          const data = JSON.parse(stored)
          setNotifications(data)
        } else {
          setNotifications([])
        }
        return
      }

      setNotifications(notificationsData || [])
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
      // Fallback para localStorage
      try {
        const stored = localStorage.getItem(`confilar_notifications_${user.id}`)
        if (stored) {
          const data = JSON.parse(stored)
          setNotifications(data)
        }
      } catch (localError) {
        console.error('Erro ao carregar do localStorage:', localError)
        setNotifications([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Adicionar notificação
  const addNotification = async (notification: Omit<Notification, 'id' | 'user_id' | 'is_read' | 'created_at'>) => {
    if (!user) return

    try {
      const newNotification: Notification = {
        id: crypto.randomUUID(),
        user_id: user.id,
        ...notification,
        is_read: false,
        created_at: new Date().toISOString()
      }

      // Tentar salvar no banco primeiro
      const { error: dbError } = await supabase
        .from('notifications')
        .insert(newNotification)

      if (dbError) {
        console.log('Erro ao salvar no banco, usando localStorage:', dbError.message)
        // Fallback para localStorage
        const stored = localStorage.getItem(`confilar_notifications_${user.id}`)
        const existingNotifications = stored ? JSON.parse(stored) : []
        const updatedNotifications = [newNotification, ...existingNotifications]
        localStorage.setItem(`confilar_notifications_${user.id}`, JSON.stringify(updatedNotifications))
      }

      // Atualizar estado local
      setNotifications(prev => [newNotification, ...prev])
      
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
      // Tentar atualizar no banco
      const { error: dbError } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (dbError) {
        console.log('Erro ao atualizar no banco, usando localStorage:', dbError.message)
        // Fallback para localStorage
        const stored = localStorage.getItem(`confilar_notifications_${user?.id}`)
        if (stored) {
          const notifications = JSON.parse(stored)
          const updatedNotifications = notifications.map((n: Notification) => 
            n.id === id ? { ...n, is_read: true, updated_at: new Date().toISOString() } : n
          )
          localStorage.setItem(`confilar_notifications_${user?.id}`, JSON.stringify(updatedNotifications))
        }
      }

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true, updated_at: new Date().toISOString() }
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
      // Tentar atualizar no banco
      const { error: dbError } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (dbError) {
        console.log('Erro ao atualizar no banco, usando localStorage:', dbError.message)
        // Fallback para localStorage
        const stored = localStorage.getItem(`confilar_notifications_${user.id}`)
        if (stored) {
          const notifications = JSON.parse(stored)
          const updatedNotifications = notifications.map((n: Notification) => ({ 
            ...n, 
            is_read: true, 
            updated_at: new Date().toISOString() 
          }))
          localStorage.setItem(`confilar_notifications_${user.id}`, JSON.stringify(updatedNotifications))
        }
      }

      // Atualizar estado local
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
      // Tentar remover do banco
      const { error: dbError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (dbError) {
        console.log('Erro ao remover do banco, usando localStorage:', dbError.message)
        // Fallback para localStorage
        const stored = localStorage.getItem(`confilar_notifications_${user?.id}`)
        if (stored) {
          const notifications = JSON.parse(stored)
          const updatedNotifications = notifications.filter((n: Notification) => n.id !== id)
          localStorage.setItem(`confilar_notifications_${user?.id}`, JSON.stringify(updatedNotifications))
        }
      }

      // Atualizar estado local
      setNotifications(prev => prev.filter(notification => notification.id !== id))
    } catch (error) {
      console.error('Erro ao remover notificação:', error)
    }
  }

  // Limpar todas
  const clearAll = async () => {
    if (!user) return

    try {
      // Tentar limpar do banco
      const { error: dbError } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)

      if (dbError) {
        console.log('Erro ao limpar do banco, usando localStorage:', dbError.message)
        // Fallback para localStorage
        localStorage.removeItem(`confilar_notifications_${user.id}`)
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

