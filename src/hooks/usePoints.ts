'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { 
  PointTransaction, 
  UserPointsBalance, 
  UserPointsStats, 
  PointsDashboard,
  AddPointsRequest,
  PointsHistoryFilters,
  PointSource,
  UserLevel,
  getLevelFromPoints,
  getNextLevel,
  getPointsToNextLevel,
  getLevelProgress
} from '@/types/points'

// ============================================
// HOOK PRINCIPAL PARA SISTEMA DE PONTOS
// ============================================

export function usePoints(userId?: string) {
  const queryClient = useQueryClient()
  
  // Estado local
  const [balance, setBalance] = useState<UserPointsBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar saldo de pontos usando API route
  const { data: pointsData, isLoading: balanceLoading } = useQuery({
    queryKey: ['user-points-balance', userId],
    queryFn: async () => {
      if (!userId) return null
      
      // Usar API route pública restaurada
      const response = await fetch(`/api/points/balance?userId=${userId}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao buscar saldo')
      }
      
      // Mapear dados do banco para formato esperado pelo frontend
      const dbData = result.data
      const levelMap: Record<number, UserLevel> = {
        1: 'bronze',
        2: 'silver', 
        3: 'gold',
        4: 'platinum',
        5: 'diamond'
      }
      
      const mappedData: UserPointsBalance = {
        balance: dbData.balance || 0,
        level: levelMap[Number(dbData.level)] || 'bronze',
        daily_earned: 0, // Campo não existe no banco, usar 0
        total_earned: dbData.total_earned || 0,
        total_spent: dbData.total_spent || 0,
        last_daily_reset: dbData.updated_at || new Date().toISOString()
      }
      
      return mappedData
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  // Buscar estatísticas completas
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['user-points-stats', userId],
    queryFn: async () => {
      if (!userId) return null
      
      const { data, error } = await supabase
        .from('user_points_stats')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  // Atualizar estado quando dados mudam
  useEffect(() => {
    if (pointsData) {
      setBalance(pointsData)
      setLoading(false)
    }
  }, [pointsData])

  useEffect(() => {
    if (balanceLoading || statsLoading) {
      setLoading(true)
    } else {
      setLoading(false)
    }
  }, [balanceLoading, statsLoading])

  // Função para adicionar pontos
  const addPointsMutation = useMutation({
    mutationFn: async (request: AddPointsRequest) => {
      // Buscar valor de pontos da configuração
      const { data: config } = await supabase
        .from('points_config')
        .select('points_value')
        .eq('action_key', request.action_type)
        .eq('is_active', true)
        .single()
      
      const points = config?.points_value || 0
      
      // Montar metadata com informações extras
      const metadata = {
        ...request.metadata,
        referral_id: request.referral_id,
        post_id: request.post_id,
        related_user_id: request.related_user_id
      }
      
      const { data, error } = await supabase
        .rpc('add_points', {
          p_user_id: userId,
          p_points: points,
          p_source: request.action_type,
          p_description: request.description,
          p_metadata: metadata
        })
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidar cache de pontos
      queryClient.invalidateQueries({ queryKey: ['user-points-balance', userId] })
      queryClient.invalidateQueries({ queryKey: ['user-points-stats', userId] })
      queryClient.invalidateQueries({ queryKey: ['user-points-history', userId] })
    }
  })

  // Função para adicionar pontos
  const addPoints = useCallback(async (request: AddPointsRequest) => {
    if (!userId) {
      throw new Error('Usuário não autenticado')
    }
    
    return addPointsMutation.mutateAsync(request)
  }, [userId, addPointsMutation])

  // Função para verificar limite diário
  const checkDailyLimit = useCallback(async (actionType: PointSource) => {
    if (!userId) return { canEarn: false, remaining: 0 }
    
    const { data, error } = await supabase
      .from('point_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('source', actionType)
      .gte('created_at', new Date().toISOString().split('T')[0])
    
    if (error) throw error
    
    const earnedToday = data?.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0) || 0
    
    // Buscar limite da configuração
    const { data: config } = await supabase
      .from('points_config')
      .select('daily_limit')
      .eq('action_key', actionType)
      .single()
    
    const dailyLimit = config?.daily_limit
    const remaining = dailyLimit ? Math.max(0, dailyLimit - earnedToday) : Infinity
    
    return {
      canEarn: remaining > 0,
      remaining,
      earnedToday,
      dailyLimit
    }
  }, [userId])

  return {
    // Estado
    balance,
    stats: statsData,
    loading,
    error,
    
    // Ações
    addPoints,
    checkDailyLimit,
    
    // Status das mutações
    isAddingPoints: addPointsMutation.isPending,
    addPointsError: addPointsMutation.error,
  }
}

// ============================================
// HOOK PARA HISTÓRICO DE PONTOS
// ============================================

export function usePointsHistory(userId?: string, filters?: PointsHistoryFilters) {
  const queryClient = useQueryClient()

  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['user-points-history', userId, filters],
    queryFn: async () => {
      if (!userId) return []
      
      // Usar API route pública restaurada para histórico
      const searchParams = new URLSearchParams()
      searchParams.set('userId', userId)
      
      if (filters?.type) searchParams.set('type', filters.type)
      if (filters?.source) searchParams.set('source', filters.source)
      if (filters?.start_date) searchParams.set('start_date', filters.start_date)
      if (filters?.end_date) searchParams.set('end_date', filters.end_date)
      if (filters?.limit) searchParams.set('limit', filters.limit.toString())
      if (filters?.offset) searchParams.set('offset', filters.offset.toString())
      
      const response = await fetch(`/api/points/history?${searchParams.toString()}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao buscar histórico')
      }
      
      return result.transactions || []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutos
  })

  return {
    transactions: transactions || [],
    loading: isLoading,
    error,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['user-points-history', userId, filters] })
  }
}

// ============================================
// HOOK PARA DASHBOARD DE PONTOS
// ============================================

export function usePointsDashboard(userId?: string) {
  const { balance, stats, loading: balanceLoading } = usePoints(userId)
  const { transactions, loading: historyLoading } = usePointsHistory(userId, { limit: 10 })
  
  const loading = balanceLoading || historyLoading
  
  // Calcular estatísticas do mês
  const monthlyStats = stats ? {
    earned: stats.monthly_earned || 0,
    spent: stats.monthly_spent || 0,
    net: (stats.monthly_earned || 0) - (stats.monthly_spent || 0)
  } : { earned: 0, spent: 0, net: 0 }
  
  // Calcular progresso do nível
  const levelProgressData = balance ? {
    current_level: balance.level,
    next_level: getNextLevel(balance.level),
    points_to_next: getPointsToNextLevel(balance.total_earned, balance.level),
    progress_percentage: getLevelProgress(balance.total_earned, balance.level)
  } : {
    current_level: 'bronze' as UserLevel,
    next_level: 'silver' as UserLevel,
    points_to_next: 500,
    progress_percentage: 0
  }
  
  const dashboard: PointsDashboard | null = balance ? {
    balance,
    recent_transactions: transactions,
    monthly_stats: monthlyStats,
    level_progress: levelProgressData,
    leaderboard_position: stats?.global_rank || 0,
    daily_limits: {} // Será implementado em versão futura
  } : null
  
  return {
    dashboard,
    loading,
    error: null
  }
}

// ============================================
// HOOK PARA LEADERBOARD DE PONTOS
// ============================================

export function usePointsLeaderboard(limit: number = 10) {
  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['points-leaderboard', limit],
    queryFn: async () => {
      // Usar API route pública restaurada para leaderboard
      const response = await fetch(`/api/points/leaderboard?limit=${limit}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao buscar leaderboard')
      }
      
      return result.leaderboard || []
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  })

  return {
    leaderboard: leaderboard || [],
    loading: isLoading,
    error
  }
}

// ============================================
// HOOK PARA CONFIGURAÇÕES DE PONTOS
// ============================================

export function usePointsConfig() {
  const { data: config, isLoading, error } = useQuery({
    queryKey: ['points-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points_config')
        .select('*')
        .eq('is_active', true)
        .order('action_key')
      
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  })

  return {
    config: config || [],
    loading: isLoading,
    error
  }
}
