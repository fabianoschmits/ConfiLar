'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { VipBadge, VipBadgeType } from '@/types/vip'

export function useVipBadges(userId?: string) {
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const targetUserId = userId || user?.id

  const { data: badges, isLoading, error } = useQuery({
    queryKey: ['vip-badges', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return []

      const { data, error } = await supabase
        .from('user_vip_badges')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('is_active', true)
        .order('purchased_at', { ascending: false })

      if (error) throw error
      return data as VipBadge[]
    },
    enabled: !!targetUserId
  })

  const activateBadgeMutation = useMutation({
    mutationFn: async (badgeId: string) => {
      const { data, error } = await supabase
        .from('user_vip_badges')
        .update({ is_active: true })
        .eq('id', badgeId)
        .eq('user_id', user?.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vip-badges', targetUserId] })
    }
  })

  const deactivateBadgeMutation = useMutation({
    mutationFn: async (badgeId: string) => {
      const { data, error } = await supabase
        .from('user_vip_badges')
        .update({ is_active: false })
        .eq('id', badgeId)
        .eq('user_id', user?.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vip-badges', targetUserId] })
    }
  })

  const activateBadge = (badgeId: string) => {
    activateBadgeMutation.mutate(badgeId)
  }

  const deactivateBadge = (badgeId: string) => {
    deactivateBadgeMutation.mutate(badgeId)
  }

  return {
    badges: badges || [],
    isLoading,
    error,
    activateBadge,
    deactivateBadge,
    isActivating: activateBadgeMutation.isPending,
    isDeactivating: deactivateBadgeMutation.isPending
  }
}

export function useVipBadgeStats(userId?: string) {
  const { user } = useAuthContext()
  const targetUserId = userId || user?.id

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['vip-badge-stats', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null

      const { data, error } = await supabase
        .from('user_vip_badges')
        .select('badge_type, is_active, purchased_at')
        .eq('user_id', targetUserId)

      if (error) throw error

      const activeBadges = data?.filter(badge => badge.is_active) || []
      const totalBadges = data?.length || 0
      const highestBadge = activeBadges.reduce((highest, current) => {
        const currentLevel = getBadgeLevel(current.badge_type)
        const highestLevel = getBadgeLevel(highest.badge_type)
        return currentLevel > highestLevel ? current : highest
      }, activeBadges[0])

      return {
        totalBadges,
        activeBadges: activeBadges.length,
        highestBadge,
        allBadges: data || []
      }
    },
    enabled: !!targetUserId
  })

  return {
    stats,
    isLoading,
    error
  }
}

function getBadgeLevel(badgeType: VipBadgeType): number {
  const levels = {
    vip_bronze: 1,
    vip_silver: 2,
    vip_gold: 3,
    vip_platinum: 4,
    vip_diamond: 5
  }
  return levels[badgeType] || 0
}

