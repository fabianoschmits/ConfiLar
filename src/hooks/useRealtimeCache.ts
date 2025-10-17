'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeCacheOptions {
  table: string
  enabled?: boolean
  onUpdate?: (payload: any) => void
  onInsert?: (payload: any) => void
  onDelete?: (payload: any) => void
}

export function useRealtimeCache(options: UseRealtimeCacheOptions) {
  const { table, enabled = true, onUpdate, onInsert, onDelete } = options
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    let channel: RealtimeChannel | null = null

    const setupRealtime = async () => {
      try {
        channel = supabase
          .channel(`${table}-changes`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: table,
            },
            (payload) => {
              console.log(`🔄 Realtime UPDATE em ${table}:`, payload)
              
              // Invalidar queries relacionadas
              queryClient.invalidateQueries({ queryKey: [table] })
              queryClient.invalidateQueries({ queryKey: [table, payload.new.id] })
              
              // Callback customizado
              onUpdate?.(payload)
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: table,
            },
            (payload) => {
              console.log(`➕ Realtime INSERT em ${table}:`, payload)
              
              // Invalidar queries relacionadas
              queryClient.invalidateQueries({ queryKey: [table] })
              
              // Callback customizado
              onInsert?.(payload)
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: table,
            },
            (payload) => {
              console.log(`🗑️ Realtime DELETE em ${table}:`, payload)
              
              // Remover do cache específico
              queryClient.removeQueries({ queryKey: [table, payload.old.id] })
              queryClient.invalidateQueries({ queryKey: [table] })
              
              // Callback customizado
              onDelete?.(payload)
            }
          )
          .subscribe()

        console.log(`✅ Realtime ativo para ${table}`)
      } catch (error) {
        console.error(`❌ Erro ao configurar realtime para ${table}:`, error)
      }
    }

    setupRealtime()

    return () => {
      if (channel) {
        console.log(`🔌 Desconectando realtime de ${table}`)
        supabase.removeChannel(channel)
      }
    }
  }, [table, enabled, queryClient, onUpdate, onInsert, onDelete])
}

// Hook específico para posts
export function useRealtimePosts() {
  const queryClient = useQueryClient()

  useRealtimeCache({
    table: 'posts',
    onUpdate: (payload) => {
      // Atualizar cache específico do post
      queryClient.setQueryData(['post', payload.new.id], payload.new)
    },
    onInsert: (payload) => {
      // Adicionar novo post ao cache de lista
      queryClient.setQueryData(['posts'], (old: any) => {
        if (!old) return [payload.new]
        return [payload.new, ...old]
      })
    }
  })
}

// Hook específico para serviços
export function useRealtimeServices() {
  const queryClient = useQueryClient()

  useRealtimeCache({
    table: 'services',
    onUpdate: (payload) => {
      // Atualizar cache específico do serviço
      queryClient.setQueryData(['service', payload.new.id], payload.new)
    },
    onInsert: (payload) => {
      // Adicionar novo serviço ao cache de lista
      queryClient.setQueryData(['services'], (old: any) => {
        if (!old) return [payload.new]
        return [payload.new, ...old]
      })
    }
  })
}

// Hook específico para perfis
export function useRealtimeProfiles() {
  const queryClient = useQueryClient()

  useRealtimeCache({
    table: 'profiles',
    onUpdate: (payload) => {
      // Atualizar cache específico do perfil
      queryClient.setQueryData(['profile', payload.new.id], payload.new)
    }
  })
}

// Hook específico para notificações
export function useRealtimeNotifications(userId?: string) {
  const queryClient = useQueryClient()

  useRealtimeCache({
    table: 'notifications',
    enabled: !!userId,
    onInsert: (payload) => {
      // Só processar notificações para o usuário atual
      if (payload.new.recipient_id === userId) {
        // Adicionar nova notificação ao cache
        queryClient.setQueryData(['notifications', userId], (old: any) => {
          if (!old) return [payload.new]
          return [payload.new, ...old]
        })
        
        // Atualizar contador
        queryClient.setQueryData(['notifications-count', userId], (old: number) => {
          return (old || 0) + 1
        })
      }
    },
    onUpdate: (payload) => {
      // Só processar notificações para o usuário atual
      if (payload.new.recipient_id === userId) {
        // Atualizar notificação no cache
        queryClient.setQueryData(['notifications', userId], (old: any) => {
          if (!old) return old
          return old.map((notification: any) => 
            notification.id === payload.new.id ? payload.new : notification
          )
        })
        
        // Atualizar contador se foi marcada como lida
        if (payload.new.is_read && !payload.old.is_read) {
          queryClient.setQueryData(['notifications-count', userId], (old: number) => {
            return Math.max(0, (old || 0) - 1)
          })
        }
      }
    }
  })
}

// Hook específico para conversas
export function useRealtimeConversations(userId?: string) {
  const queryClient = useQueryClient()

  useRealtimeCache({
    table: 'conversations',
    enabled: !!userId,
    onUpdate: (payload) => {
      // Verificar se o usuário é participante da conversa
      if (payload.new.participant1_id === userId || payload.new.participant2_id === userId) {
        // Atualizar conversa no cache
        queryClient.setQueryData(['conversations', userId], (old: any) => {
          if (!old) return old
          return old.map((conversation: any) => 
            conversation.id === payload.new.id ? payload.new : conversation
          )
        })
      }
    },
    onInsert: (payload) => {
      // Verificar se o usuário é participante da conversa
      if (payload.new.participant1_id === userId || payload.new.participant2_id === userId) {
        // Adicionar nova conversa ao cache
        queryClient.setQueryData(['conversations', userId], (old: any) => {
          if (!old) return [payload.new]
          return [payload.new, ...old]
        })
      }
    }
  })
}
