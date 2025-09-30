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

  // Notificações de exemplo
  const demoNotifications: Notification[] = [
    {
      id: 'demo-1',
      user_id: user?.id || 'demo',
      title: 'Bem-vindo ao ConfiLar!',
      message: 'Sua conta foi criada com sucesso. Explore os recursos da plataforma.',
      type: 'success',
      is_read: false,
      priority: 'normal',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
      action_url: '/dashboard'
    },
    {
      id: 'demo-2',
      user_id: user?.id || 'demo',
      title: 'Nova mensagem recebida',
      message: 'João Silva enviou uma mensagem sobre seu serviço de consultoria.',
      type: 'message',
      is_read: false,
      priority: 'high',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutos atrás
      action_url: '/mensagens'
    },
    {
      id: 'demo-3',
      user_id: user?.id || 'demo',
      title: 'Avaliação recebida',
      message: 'Maria Santos avaliou seu trabalho com 5 estrelas!',
      type: 'review',
      is_read: true,
      priority: 'normal',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
      action_url: '/reputacao'
    },
    {
      id: 'demo-4',
      user_id: user?.id || 'demo',
      title: 'Solicitação de serviço',
      message: 'Pedro Costa solicitou seus serviços de design gráfico.',
      type: 'booking',
      is_read: false,
      priority: 'urgent',
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutos atrás
      action_url: '/solicitacoes'
    },
    {
      id: 'demo-5',
      user_id: user?.id || 'demo',
      title: 'Sistema em manutenção',
      message: 'O sistema passará por manutenção programada hoje às 23h.',
      type: 'system',
      is_read: true,
      priority: 'low',
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 horas atrás
      action_url: '/sobre'
    }
  ]

  // Carregar notificações
  const loadNotifications = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      
      // Usar notificações de exemplo
      setNotifications(demoNotifications)
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
      setNotifications([])
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
    try {
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          is_read: true, 
          updated_at: new Date().toISOString() 
        }))
      )
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  // Remover notificação
  const removeNotification = async (id: string) => {
    try {
      setNotifications(prev => prev.filter(notification => notification.id !== id))
    } catch (error) {
      console.error('Erro ao remover notificação:', error)
    }
  }

  // Limpar todas
  const clearAll = async () => {
    try {
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

