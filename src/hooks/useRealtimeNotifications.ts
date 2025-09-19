'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { useMessages } from '@/hooks/useMessages'
import { toast } from 'sonner'

export interface RealtimeNotification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  action_url: string | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
  metadata?: any
}

export interface RealtimeNotificationState {
  notifications: RealtimeNotification[]
  unreadCount: number
  isLoading: boolean
  isConnected: boolean
  lastUpdate: Date | null
  error: string | null
}

export function useRealtimeNotifications() {
  const { profile } = useAuthContext()
  const { conversations, getTotalUnreadCount } = useMessages()
  
  const [state, setState] = useState<RealtimeNotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: true,
    isConnected: false,
    lastUpdate: null,
    error: null
  })

  // Buscar notificações iniciais
  const fetchNotifications = useCallback(async () => {
    if (!profile?.id) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setState(prev => ({
        ...prev,
        notifications: data || [],
        unreadCount: data?.filter(n => !n.is_read).length || 0,
        isLoading: false,
        lastUpdate: new Date()
      }))

      console.log('🔔 Notificações carregadas:', data?.length || 0)
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar notificações'
      }))
    }
  }, [profile?.id])

  // Marcar notificação como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!profile?.id) return

    try {
      // Se for notificação de mensagem (começa com 'msg-'), apenas atualizar localmente
      if (notificationId.startsWith('msg-')) {
        console.log('📨 Marcando notificação de mensagem como lida localmente:', notificationId)
        
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.map(n => 
            n.id === notificationId ? { ...n, is_read: true } : n
          ),
          unreadCount: Math.max(0, prev.unreadCount - 1)
        }))
        
        console.log('✅ Notificação de mensagem marcada como lida localmente')
        return
      }

      // Para notificações reais do banco, atualizar no Supabase
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', profile.id)

      if (error) throw error

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }))

      console.log('✅ Notificação marcada como lida:', notificationId)
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error)
      toast.error('Erro ao marcar notificação como lida')
    }
  }, [profile?.id])

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    if (!profile?.id) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false)

      if (error) throw error

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0
      }))

      console.log('✅ Todas as notificações marcadas como lidas')
      toast.success('Todas as notificações foram marcadas como lidas')
    } catch (error) {
      console.error('❌ Erro ao marcar todas como lidas:', error)
      toast.error('Erro ao marcar notificações como lidas')
    }
  }, [profile?.id])

  // Remover notificação
  const removeNotification = useCallback(async (notificationId: string) => {
    if (!profile?.id) return

    try {
      const notification = state.notifications.find(n => n.id === notificationId)
      
      // Se for notificação de mensagem (começa com 'msg-'), apenas remover localmente
      if (notificationId.startsWith('msg-')) {
        console.log('📨 Removendo notificação de mensagem localmente:', notificationId)
        
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== notificationId),
          unreadCount: notification && !notification.is_read 
            ? Math.max(0, prev.unreadCount - 1) 
            : prev.unreadCount
        }))
        
        console.log('✅ Notificação de mensagem removida localmente')
        toast.success('Notificação removida')
        return
      }

      // Para notificações reais do banco, remover do Supabase
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', profile.id)

      if (error) throw error

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notificationId),
        unreadCount: notification && !notification.is_read 
          ? Math.max(0, prev.unreadCount - 1) 
          : prev.unreadCount
      }))

      console.log('🗑️ Notificação removida:', notificationId)
      toast.success('Notificação removida')
    } catch (error) {
      console.error('❌ Erro ao remover notificação:', error)
      toast.error('Erro ao remover notificação')
    }
  }, [profile?.id, state.notifications])

  // Limpar todas as notificações
  const clearAll = useCallback(async () => {
    if (!profile?.id) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', profile.id)

      if (error) throw error

      setState(prev => ({
        ...prev,
        notifications: [],
        unreadCount: 0
      }))

      console.log('🗑️ Todas as notificações removidas')
      toast.success('Todas as notificações foram removidas')
    } catch (error) {
      console.error('❌ Erro ao limpar notificações:', error)
      toast.error('Erro ao limpar notificações')
    }
  }, [profile?.id])

  // Adicionar notificação de teste
  const addTestNotification = useCallback(async (title: string, message: string, type: string = 'info') => {
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

      console.log('🧪 Notificação de teste adicionada')
      toast.success('Notificação de teste criada')
    } catch (error) {
      console.error('❌ Erro ao adicionar notificação de teste:', error)
      toast.error('Erro ao criar notificação de teste')
    }
  }, [profile?.id])

  // Sistema de tempo real
  useEffect(() => {
    if (!profile?.id) {
      setState(prev => ({ ...prev, isLoading: false }))
      return
    }

    console.log('🔔 Iniciando sistema de tempo real para notificações:', profile.id)

    const channel = supabase
      .channel(`realtime-notifications-${profile.id}`)
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
            const newNotification = payload.new as RealtimeNotification
            console.log('🔔 Nova notificação recebida:', newNotification)
            
            setState(prev => {
              // Evitar duplicatas
              const exists = prev.notifications.some(n => n.id === newNotification.id)
              if (exists) {
                console.log('🔔 Notificação já existe, ignorando duplicata')
                return prev
              }
              
              return {
                ...prev,
                notifications: [newNotification, ...prev.notifications],
                unreadCount: newNotification.is_read ? prev.unreadCount : prev.unreadCount + 1,
                lastUpdate: new Date()
              }
            })

            // Mostrar toast para nova notificação
            if (!newNotification.is_read) {
              toast.success(newNotification.title, {
                description: newNotification.message,
                duration: 4000
              })
            }
            
          } else if (payload.eventType === 'UPDATE') {
            // Notificação atualizada
            const updatedNotification = payload.new as RealtimeNotification
            console.log('🔔 Notificação atualizada:', updatedNotification)
            
            setState(prev => {
              const oldNotification = prev.notifications.find(n => n.id === updatedNotification.id)
              
              return {
                ...prev,
                notifications: prev.notifications.map(n => 
                  n.id === updatedNotification.id ? updatedNotification : n
                ),
                unreadCount: oldNotification && !oldNotification.is_read && updatedNotification.is_read
                  ? Math.max(0, prev.unreadCount - 1)
                  : prev.unreadCount,
                lastUpdate: new Date()
              }
            })
            
          } else if (payload.eventType === 'DELETE') {
            // Notificação removida
            const deletedNotification = payload.old as RealtimeNotification
            console.log('🔔 Notificação removida:', deletedNotification)
            
            setState(prev => ({
              ...prev,
              notifications: prev.notifications.filter(n => n.id !== deletedNotification.id),
              unreadCount: deletedNotification.is_read 
                ? prev.unreadCount 
                : Math.max(0, prev.unreadCount - 1),
              lastUpdate: new Date()
            }))
          }
        }
      )
      .subscribe((status) => {
        console.log('🔔 Status da conexão de notificações:', status)
        setState(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED',
          error: status === 'CHANNEL_ERROR' ? 'Erro na conexão' : null
        }))
      })

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
  }, [profile?.id]) // Removido fetchNotifications das dependências para evitar loop

  // Calcular total de mensagens não lidas
  const totalUnreadMessages = getTotalUnreadCount()
  
  // Criar notificações de mensagem baseadas nas conversas
  const messageNotifications = conversations
    .filter(conv => conv.unread_count && conv.unread_count > 0)
    .map(conv => ({
      id: `msg-${conv.id}`,
      user_id: profile?.id || '',
      title: `Nova mensagem de ${conv.client_id === profile?.id ? conv.professional?.full_name : conv.client?.full_name}`,
      message: conv.last_message_preview || 'Nova mensagem',
      type: 'message',
      is_read: false,
      created_at: conv.last_message_at || conv.created_at,
      action_url: null,
      priority: 'normal' as const,
      metadata: {
        sender_id: conv.client_id === profile?.id ? conv.professional_id : conv.client_id,
        sender_name: conv.client_id === profile?.id ? conv.professional?.full_name : conv.client?.full_name,
        conversation_id: conv.id
      }
    }))

  // Combinar notificações do banco com notificações de mensagem
  const allNotifications = [...state.notifications, ...messageNotifications]
  const totalUnreadCount = state.unreadCount + totalUnreadMessages

  return {
    notifications: allNotifications,
    unreadCount: totalUnreadCount,
    isLoading: state.isLoading,
    isConnected: state.isConnected,
    lastUpdate: state.lastUpdate,
    error: state.error,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    addTestNotification,
    fetchNotifications
  }
}
