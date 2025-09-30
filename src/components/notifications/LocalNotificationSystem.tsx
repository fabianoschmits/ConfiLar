'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
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

  // Chave para localStorage
  const getStorageKey = () => `confilar_notifications_${user?.id || 'anonymous'}`

  // Carregar notificações do localStorage
  const loadNotifications = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const stored = localStorage.getItem(getStorageKey())
      if (stored) {
        const data = JSON.parse(stored)
        setNotifications(data)
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }

  // Salvar notificações no localStorage
  const saveNotifications = (newNotifications: Notification[]) => {
    if (!user) return
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(newNotifications))
    } catch (error) {
      console.error('Erro ao salvar notificações:', error)
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

      const updatedNotifications = [newNotification, ...notifications]
      setNotifications(updatedNotifications)
      saveNotifications(updatedNotifications)
      
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
      const updatedNotifications = notifications.map(notification => 
        notification.id === id 
          ? { ...notification, is_read: true, updated_at: new Date().toISOString() }
          : notification
      )
      
      setNotifications(updatedNotifications)
      saveNotifications(updatedNotifications)
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      const updatedNotifications = notifications.map(notification => ({ 
        ...notification, 
        is_read: true, 
        updated_at: new Date().toISOString() 
      }))
      
      setNotifications(updatedNotifications)
      saveNotifications(updatedNotifications)
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  // Remover notificação
  const removeNotification = async (id: string) => {
    try {
      const updatedNotifications = notifications.filter(notification => notification.id !== id)
      setNotifications(updatedNotifications)
      saveNotifications(updatedNotifications)
    } catch (error) {
      console.error('Erro ao remover notificação:', error)
    }
  }

  // Limpar todas
  const clearAll = async () => {
    try {
      setNotifications([])
      saveNotifications([])
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

  // Limpar notificações expiradas
  useEffect(() => {
    const now = new Date()
    const validNotifications = notifications.filter(notification => {
      if (!notification.expires_at) return true
      return new Date(notification.expires_at) > now
    })

    if (validNotifications.length !== notifications.length) {
      setNotifications(validNotifications)
      saveNotifications(validNotifications)
    }
  }, [notifications])

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

