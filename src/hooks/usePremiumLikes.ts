import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export interface PremiumLike {
  id: string
  post_id: string
  user_id: string
  is_premium: boolean
  points_spent: number
  points_transferred: number
  premium_points_spent: number
  created_at: string
  updated_at: string
}

export interface PremiumLikeStats {
  post_id: string
  post_creator_id: string
  content: string
  post_created_at: string
  total_likes: number
  premium_likes: number
  total_points_received: number
  avg_points_per_premium_like: number
}

export function usePremiumLikes(postId: string) {
  const { user } = useAuthContext()
  const queryClient = useQueryClient()

  // Buscar curtidas do post
  const { data: likes, isLoading: loadingLikes } = useQuery<PremiumLike[]>({
    queryKey: ['post-likes', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feed_posts_likes')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as PremiumLike[]
    },
    enabled: !!postId
  })

  // Buscar estatísticas do post
  const { data: stats } = useQuery<PremiumLikeStats>({
    queryKey: ['post-premium-stats', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('premium_likes_stats')
        .select('*')
        .eq('post_id', postId)
        .single()

      if (error) throw error
      return data as PremiumLikeStats
    },
    enabled: !!postId
  })

  // Verificar quantas curtidas premium o usuário deu neste post
  const userPremiumLikesCount = React.useMemo(() => {
    if (!user?.id || !likes) return 0
    return likes.filter(like => 
      like.user_id === user.id && like.is_premium === true
    ).length
  }, [likes, user?.id])

  // Verificar se usuário curtiu premium (para compatibilidade)
  const userPremiumLiked = userPremiumLikesCount > 0

  // Curtir post premium - permite múltiplos cliques sem esperar
  const premiumLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado')

      // Usar API route para operações de pontos
      // Nota: Backend usa sempre o usuário autenticado dos cookies, não o userId do body
      const response = await fetch('/api/points/premium-like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ IMPORTANTE: Enviar cookies de autenticação
        body: JSON.stringify({
          postId: postId
          // userId removido - backend sempre usa o usuário autenticado dos cookies
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar curtida premium')
      }

      return data
    },
    onMutate: async () => {
      const requiredPoints = 5

      // Verificar saldo atual (após possíveis updates otimistas anteriores)
      const currentBalance = queryClient.getQueryData(['user-points-balance', user?.id]) as any
      const currentBalanceValue = currentBalance?.balance || 0

      // Se não tiver pontos suficientes, não fazer update otimista
      if (currentBalanceValue < requiredPoints) {
        throw new Error(`Saldo insuficiente. Você tem ${currentBalanceValue} pontos, precisa de ${requiredPoints}.`)
      }

      // Cancelar queries em andamento apenas para snapshot (não bloqueia outros cliques)
      await queryClient.cancelQueries({ queryKey: ['user-points-balance', user?.id] })

      // Snapshot dos valores anteriores para possível rollback
      const previousLikes = queryClient.getQueryData(['post-likes', postId])
      const previousStats = queryClient.getQueryData(['post-premium-stats', postId])
      const previousBalance = queryClient.getQueryData(['user-points-balance', user?.id])

      // Atualizar otimisticamente: adicionar like premium
      const optimisticLike: PremiumLike = {
        id: `temp-${Date.now()}-${Math.random()}`, // ID único para cada like
        post_id: postId,
        user_id: user!.id,
        is_premium: true,
        points_spent: 5,
        points_transferred: 5,
        premium_points_spent: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Atualizar likes otimisticamente (adicionar ao início da lista)
      queryClient.setQueryData(['post-likes', postId], (oldLikes: PremiumLike[] = []) => {
        // Evitar duplicatas otimistas removendo temporários anteriores do mesmo usuário
        const filteredLikes = oldLikes.filter(like => 
          !(like.id.startsWith('temp-') && like.user_id === user!.id && like.post_id === postId)
        )
        return [optimisticLike, ...filteredLikes]
      })

      // Atualizar stats otimisticamente
      queryClient.setQueryData(['post-premium-stats', postId], (oldStats: PremiumLikeStats | null) => {
        if (!oldStats) {
          return {
            post_id: postId,
            post_creator_id: '',
            content: '',
            post_created_at: '',
            total_likes: (previousLikes as PremiumLike[] || []).length + 1,
            premium_likes: 1,
            total_points_received: 5,
            avg_points_per_premium_like: 5
          }
        }
        return {
          ...oldStats,
          total_likes: (oldStats.total_likes || 0) + 1,
          premium_likes: (oldStats.premium_likes || 0) + 1,
          total_points_received: (oldStats.total_points_received || 0) + 5,
          avg_points_per_premium_like: ((oldStats.total_points_received || 0) + 5) / ((oldStats.premium_likes || 0) + 1)
        }
      })

      // Atualizar saldo otimisticamente (reduzir 5 pontos) - baseado no saldo atual, não no anterior
      queryClient.setQueryData(['user-points-balance', user?.id], (oldBalance: any) => {
        if (!oldBalance) return { balance: 0 }
        const newBalance = Math.max(0, (oldBalance.balance || 0) - requiredPoints)
        return {
          ...oldBalance,
          balance: newBalance
        }
      })

      return { previousLikes, previousStats, previousBalance, optimisticLike }
    },
    onError: (error: any, variables, context) => {
      // Reverter em caso de erro
      if (context?.previousLikes) {
        queryClient.setQueryData(['post-likes', postId], context.previousLikes)
      }
      if (context?.previousStats) {
        queryClient.setQueryData(['post-premium-stats', postId], context.previousStats)
      }
      if (context?.previousBalance) {
        queryClient.setQueryData(['user-points-balance', user?.id], context.previousBalance)
      }

      // Remover o like otimista que falhou
      if (context?.optimisticLike) {
        queryClient.setQueryData(['post-likes', postId], (oldLikes: PremiumLike[] = []) => {
          return oldLikes.filter(like => like.id !== context.optimisticLike.id)
        })
      }

      if (error.message?.includes('Saldo insuficiente')) {
        toast.error(error.message)
      } else {
        toast.error(error.message || '❌ Erro ao enviar curtida premium')
      }
    },
    onSuccess: (data) => {
      // Invalidar cache para sincronizar com o servidor periodicamente
      // Usar um debounce para evitar muitas invalidações quando há múltiplos cliques
      queryClient.invalidateQueries({ queryKey: ['post-likes', postId] })
      queryClient.invalidateQueries({ queryKey: ['post-premium-stats', postId] })
      queryClient.invalidateQueries({ queryKey: ['user-points-balance', user?.id] })
    }
  })

  // Curtir post normal (gratuito)
  const normalLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('feed_posts_likes')
        .insert({
          post_id: postId,
          user_id: user.id,
          is_premium: false,
          points_spent: 0,
          points_transferred: 0,
          premium_points_spent: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Post curtido!')
      queryClient.invalidateQueries({ queryKey: ['post-likes', postId] })
      queryClient.invalidateQueries({ queryKey: ['post-premium-stats', postId] })
      queryClient.invalidateQueries({ queryKey: ['user-premium-liked', postId, user?.id] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao curtir post')
    }
  })

  // Remover curtida
  const unlikeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('feed_posts_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Curtida removida!')
      queryClient.invalidateQueries({ queryKey: ['post-likes', postId] })
      queryClient.invalidateQueries({ queryKey: ['post-premium-stats', postId] })
      queryClient.invalidateQueries({ queryKey: ['user-premium-liked', postId, user?.id] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao remover curtida')
    }
  })

  return {
    likes: likes || [],
    stats: stats || null,
    userPremiumLiked: userPremiumLiked || false,
    userPremiumLikesCount: userPremiumLikesCount || 0,
    loadingLikes,
    premiumLike: premiumLikeMutation.mutate,
    normalLike: normalLikeMutation.mutate,
    unlike: unlikeMutation.mutate,
    isPremiumLiking: premiumLikeMutation.isPending,
    isNormalLiking: normalLikeMutation.isPending,
    isUnliking: unlikeMutation.isPending
  }
}

// Hook para buscar estatísticas gerais de curtidas premium
export function usePremiumLikesStats() {
  const { data: stats, isLoading } = useQuery<PremiumLikeStats[]>({
    queryKey: ['premium-likes-stats'],
    queryFn: async () => {
      // Buscar dados agregados das curtidas premium (versão simplificada)
      const { data, error } = await supabase
        .from('feed_posts_likes')
        .select('user_id, premium_points_spent')
        .eq('is_premium', true)

      if (error) throw error

      // Agregar dados por usuário
      const aggregatedData = data?.reduce((acc: any, like: any) => {
        const userId = like.user_id
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            user_name: 'Usuário',
            user_avatar: null,
            premium_likes: 0,
            total_points_received: 0
          }
        }
        acc[userId].premium_likes += 1
        acc[userId].total_points_received += like.premium_points_spent || 0
        return acc
      }, {})

      // Converter para array e ordenar
      const statsArray = Object.values(aggregatedData || {})
        .sort((a: any, b: any) => b.premium_likes - a.premium_likes)
        .slice(0, 20)

      return statsArray as PremiumLikeStats[]
    }
  })

  return {
    stats: stats || [],
    loading: isLoading
  }
}
