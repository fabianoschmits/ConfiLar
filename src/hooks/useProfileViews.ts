'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'

export interface ProfileViewStats {
  total_views: number
  unique_viewers: number
  views_today: number
  views_this_week: number
  views_this_month: number
  last_viewed_at: string | null
}

export interface RecentProfileView {
  viewer_name: string
  viewer_avatar_url: string | null
  viewed_at: string
  is_authenticated: boolean
}

export interface ProfileView {
  id: string
  viewer_id: string
  viewed_profile_id: string
  viewed_at: string
  ip_address: string | null
  user_agent: string | null
  referrer: string | null
}

export function useProfileViews() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthContext()

  // Registrar visualização de um perfil
  const recordView = useCallback(async (profileId: string): Promise<boolean> => {
    if (!profileId) return false

    try {
      setLoading(true)
      setError(null)

      // Obter informações do navegador
      const userAgent = navigator.userAgent
      const referrer = document.referrer || null

      // Chamar função do banco para registrar visualização
      const { data, error: recordError } = await supabase.rpc('record_profile_view', {
        target_profile_id: profileId,
        viewer_ip: null, // Não coletamos IP por questões de privacidade
        viewer_user_agent: userAgent,
        viewer_referrer: referrer
      })

      if (recordError) {
        console.error('Erro ao registrar visualização:', recordError)
        return false
      }

      return data === true
    } catch (err) {
      console.error('Erro ao registrar visualização:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Obter estatísticas de visualizações de um perfil
  const getViewStats = useCallback(async (profileId: string): Promise<ProfileViewStats | null> => {
    if (!profileId) return null

    try {
      setLoading(true)
      setError(null)

      const { data, error: statsError } = await supabase.rpc('get_profile_view_stats', {
        target_profile_id: profileId
      })

      if (statsError) {
        console.error('Erro ao buscar estatísticas de visualizações:', statsError)
        return null
      }

      if (data && data.length > 0) {
        return data[0] as ProfileViewStats
      }

      return {
        total_views: 0,
        unique_viewers: 0,
        views_today: 0,
        views_this_week: 0,
        views_this_month: 0,
        last_viewed_at: null
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Obter visualizações recentes de um perfil
  const getRecentViews = useCallback(async (
    profileId: string, 
    limit: number = 10
  ): Promise<RecentProfileView[]> => {
    if (!profileId) return []

    try {
      setLoading(true)
      setError(null)

      const { data, error: viewsError } = await supabase.rpc('get_recent_profile_views', {
        target_profile_id: profileId,
        limit_count: limit
      })

      if (viewsError) {
        console.error('Erro ao buscar visualizações recentes:', viewsError)
        return []
      }

      return data || []
    } catch (err) {
      console.error('Erro ao buscar visualizações recentes:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Obter todas as visualizações de um perfil (com paginação)
  const getProfileViews = useCallback(async (
    profileId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ProfileView[]> => {
    if (!profileId) return []

    try {
      setLoading(true)
      setError(null)

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error: viewsError } = await supabase
        .from('profile_views')
        .select('*')
        .eq('viewed_profile_id', profileId)
        .order('viewed_at', { ascending: false })
        .range(from, to)

      if (viewsError) {
        console.error('Erro ao buscar visualizações:', viewsError)
        return []
      }

      return data || []
    } catch (err) {
      console.error('Erro ao buscar visualizações:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Obter estatísticas de visualizações de todos os perfis (para dashboard)
  const getAllViewStats = useCallback(async (): Promise<ProfileViewStats[]> => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: statsError } = await supabase
        .from('profile_view_statistics')
        .select('*')
        .order('total_views', { ascending: false })

      if (statsError) {
        console.error('Erro ao buscar estatísticas gerais:', statsError)
        return []
      }

      return data || []
    } catch (err) {
      console.error('Erro ao buscar estatísticas gerais:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Hook para registrar visualização automaticamente quando um perfil é visualizado
  const useAutoRecordView = useCallback((profileId: string) => {
    useEffect(() => {
      if (!profileId || !user?.id) return

      // Não registrar visualização do próprio perfil
      if (profileId === user.id) return

      // Registrar visualização com delay para evitar spam
      const timer = setTimeout(() => {
        recordView(profileId)
      }, 2000) // 2 segundos de delay

      return () => clearTimeout(timer)
    }, [profileId, user?.id, recordView])
  }, [recordView])

  return {
    loading,
    error,
    recordView,
    getViewStats,
    getRecentViews,
    getProfileViews,
    getAllViewStats,
    useAutoRecordView
  }
}
