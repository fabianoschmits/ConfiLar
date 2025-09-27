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
    if (!profile?.id) {
      console.log('🔔 useSupabaseNotifications: Profile não disponível:', { profile })
      return
    }

    console.log('🔔 useSupabaseNotifications: Buscando notificações para profile:', profile.id)
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      console.log('🔔 useSupabaseNotifications: Notificações encontradas:', data?.length || 0)
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
      console.log('🔔 Marcando notificação como lida:', notificationId)
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('❌ Erro ao marcar notificação como lida:', error)
        throw error
      }

      // Atualizar estado local imediatamente
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      
      // Decrementar contador apenas se a notificação não estava lida
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId)
        if (notification && !notification.is_read) {
          return Math.max(0, prev - 1)
        }
        return prev
      })
      
      console.log('✅ Notificação marcada como lida com sucesso')
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error)
      toast.error('Erro ao marcar notificação como lida')
    }
  }

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    if (!profile?.id) return

    try {
      console.log('🔔 Marcando todas as notificações como lidas para profile:', profile.id)
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false)

      if (error) {
        console.error('❌ Erro ao marcar todas as notificações como lidas:', error)
        throw error
      }

      // Atualizar estado local imediatamente
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      )
      setUnreadCount(0)
      
      console.log('✅ Todas as notificações marcadas como lidas')
    } catch (error) {
      console.error('❌ Erro ao marcar todas as notificações como lidas:', error)
      toast.error('Erro ao marcar notificações como lidas')
    }
  }

  // Marcar notificações de mensagens como lidas
  const markMessageNotificationsAsRead = async () => {
    if (!profile?.id) return

    try {
      console.log('🔔 Marcando notificações de mensagens como lidas')
      
      // Buscar notificações não lidas relacionadas a mensagens
      const { data: messageNotifications, error: fetchError } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', profile.id)
        .eq('is_read', false)
        .or('title.ilike.%mensagem%,message.ilike.%mensagem%')

      if (fetchError) {
        console.error('❌ Erro ao buscar notificações de mensagens:', fetchError)
        return
      }

      if (messageNotifications && messageNotifications.length > 0) {
        // Marcar notificações de mensagens como lidas
        const { error: updateError } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', profile.id)
          .eq('is_read', false)
          .in('id', messageNotifications.map(n => n.id))

        if (updateError) {
          console.error('❌ Erro ao marcar notificações de mensagens como lidas:', updateError)
        } else {
          console.log('✅ Notificações de mensagens marcadas como lidas:', messageNotifications.length)
          
          // Atualizar estado local
          setNotifications(prev =>
            prev.map(n => 
              messageNotifications.some(mn => mn.id === n.id) 
                ? { ...n, is_read: true } 
                : n
            )
          )
          
          // Atualizar contador
          setUnreadCount(prev => Math.max(0, prev - messageNotifications.length))
        }
      }
    } catch (error) {
      console.error('❌ Erro geral ao marcar notificações de mensagens:', error)
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

  // Sincronização em tempo real DESABILITADA temporariamente
  useEffect(() => {
    if (!profile?.id) {
      console.log('🔔 useSupabaseNotifications: Profile não disponível para canal de tempo real')
      return
    }

    console.log('🔔 Canal de notificações desabilitado temporariamente para evitar erros')
    return
  }, [profile?.id]) // Removido notifications e unreadCount das dependências para evitar loop

  // Carregar notificações iniciais
  useEffect(() => {
    console.log('🔔 useSupabaseNotifications: useEffect inicial - profile:', profile?.id)
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
    markMessageNotificationsAsRead,
    removeNotification,
    clearAll,
    addTestNotification
  }
}
