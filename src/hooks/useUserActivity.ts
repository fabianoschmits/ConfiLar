'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export interface UserActivity {
  id: string
  user_id: string
  last_seen: string
  is_online: boolean
  status: 'online' | 'away' | 'offline' | 'inactive'
  last_activity: string
}

export interface ActivityStatus {
  status: 'online' | 'away' | 'offline' | 'inactive'
  label: string
  color: string
  bgColor: string
  icon: string
  description: string
}

export function useUserActivity() {
  const { user } = useAuthContext()
  const [activity, setActivity] = useState<UserActivity | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Atualizar atividade do usuário
  const updateActivity = useCallback(async () => {
    if (!user?.id) return

    try {
      const now = new Date().toISOString()
      
      // Tentar salvar no banco primeiro
      try {
        const { data, error } = await supabase
          .from('user_activity')
          .upsert({
            user_id: user.id,
            last_seen: now,
            is_online: true,
            status: 'online',
            last_activity: now
          })
          .select()
          .single()

        if (!error && data) {
          setActivity(data)
          return
        }
      } catch (dbError) {
        console.log('Tabela user_activity não existe, usando dados simulados')
      }

      // Fallback: dados simulados
      const mockActivity = {
        id: `activity_${user.id}`,
        user_id: user.id,
        last_seen: now,
        is_online: true,
        status: 'online' as const,
        last_activity: now,
        created_at: now,
        updated_at: now
      }

      setActivity(mockActivity)
    } catch (err) {
      console.error('Erro ao atualizar atividade:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    }
  }, [user?.id])

  // Marcar usuário como offline
  const setOffline = useCallback(async () => {
    if (!user?.id) return

    try {
      const now = new Date().toISOString()
      
      // Atualizar estado local
      setActivity(prev => prev ? {
        ...prev,
        is_online: false,
        last_activity: now
      } : null)

      // Tentar salvar no banco
      try {
        const { error } = await supabase
          .from('user_activity')
          .update({
            is_online: false,
            status: 'offline',
            last_activity: now
          })
          .eq('user_id', user.id)

        if (error) throw error
      } catch (dbError) {
        console.log('Tabela user_activity não disponível para setOffline')
      }
    } catch (err) {
      console.error('Erro ao marcar como offline:', err)
    }
  }, [user?.id])

  // Carregar atividade do usuário
  const loadActivity = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      setError(null)

      // Tentar carregar do banco primeiro
      try {
        const { data, error } = await supabase
          .from('user_activity')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!error && data) {
          setActivity(data)
          return
        }
      } catch (dbError) {
        console.log('Tabela user_activity não existe, usando dados simulados')
      }

      // Fallback: dados simulados
      const now = new Date().toISOString()
      const mockActivity = {
        id: `activity_${user.id}`,
        user_id: user.id,
        last_seen: now,
        is_online: true,
        status: 'online' as const,
        last_activity: now,
        created_at: now,
        updated_at: now
      }

      setActivity(mockActivity)
    } catch (err) {
      console.error('Erro ao carregar atividade:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // Determinar status baseado na última atividade
  const getActivityStatus = useCallback((lastActivity: string): ActivityStatus => {
    const now = new Date()
    const lastSeen = new Date(lastActivity)
    const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes <= 5) {
      return {
        status: 'online',
        label: 'Online agora',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: '🟢',
        description: 'Usuário ativo agora'
      }
    } else if (diffInMinutes <= 30) {
      return {
        status: 'online',
        label: 'Online há pouco',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: '🟢',
        description: `Online há ${diffInMinutes} minutos`
      }
    } else if (diffInHours <= 2) {
      return {
        status: 'away',
        label: 'Ausente',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: '🟡',
        description: `Online há ${diffInHours} horas`
      }
    } else if (diffInDays <= 1) {
      return {
        status: 'offline',
        label: 'Offline',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: '🔴',
        description: `Offline há ${diffInHours} horas`
      }
    } else if (diffInDays <= 7) {
      return {
        status: 'offline',
        label: 'Offline',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: '🔴',
        description: `Offline há ${diffInDays} dias`
      }
    } else {
      return {
        status: 'inactive',
        label: 'Inativo',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: '⚫',
        description: `Inativo há ${diffInDays} dias`
      }
    }
  }, [])

  // Atualizar atividade periodicamente
  useEffect(() => {
    if (!user?.id) return

    // Atualizar imediatamente
    updateActivity()

    // Atualizar a cada 5 minutos
    const interval = setInterval(updateActivity, 5 * 60 * 1000)

    // Marcar como offline quando sair da página
    const handleBeforeUnload = () => {
      setOffline()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      setOffline()
    }
  }, [user?.id, updateActivity, setOffline])

  // Carregar atividade inicial
  useEffect(() => {
    loadActivity()
  }, [loadActivity])

  return {
    activity,
    isLoading,
    error,
    updateActivity,
    setOffline,
    loadActivity,
    getActivityStatus
  }
}
