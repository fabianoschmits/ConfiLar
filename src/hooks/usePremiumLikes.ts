import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export interface PremiumLike {
  id: string
  post_id: string
  user_id: string
  is_featured: boolean
  points_spent: number
  points_transferred: number
  created_at: string
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
      like.user_id === user.id && like.is_featured === true
    ).length
  }, [likes, user?.id])

  // Verificar se usuário curtiu premium (para compatibilidade)
  const userPremiumLiked = userPremiumLikesCount > 0

  // Curtir post premium
  const premiumLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado')

      // Não verificar se já curtiu - permitir múltiplas curtidas premium

      // Verificar saldo
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_points_balance')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      if (balanceError && balanceError.code !== 'PGRST116') {
        throw new Error('Erro ao verificar saldo de pontos')
      }

      const balance = balanceData?.balance || 0
      if (balance < 5) {
        throw new Error('Saldo insuficiente para curtida premium')
      }

      // Buscar criador do post
      const { data: post, error: postError } = await supabase
        .from('feed_posts')
        .select('user_id')
        .eq('id', postId)
        .single()

      if (postError) {
        throw new Error('Post não encontrado')
      }

      const postCreatorId = post.user_id

      // Usar função RPC ultimate fix que bypassa triggers completamente
      const { data, error } = await supabase
        .rpc('handle_premium_like_transaction_ultimate_fix', {
          p_post_id: postId,
          p_user_id: user.id,
          p_post_creator_id: postCreatorId,
          p_points_to_spend: 5
        })

      if (error) {
        console.error('Erro na transação:', error)
        throw error
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      return data
    },
    onSuccess: (data) => {
      const totalLikes = data?.total_premium_likes || 1
      const totalPoints = data?.total_points_sent || 5
      toast.success(`Curtida premium enviada! ${totalPoints} pontos transferidos para o criador (${totalLikes} curtidas premium)`)
      queryClient.invalidateQueries({ queryKey: ['post-likes', postId] })
      queryClient.invalidateQueries({ queryKey: ['post-premium-stats', postId] })
      queryClient.invalidateQueries({ queryKey: ['user-points-balance', user?.id] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao curtir post premium')
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
          is_featured: false,
          premium_points_spent: 0,
          created_at: new Date().toISOString()
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
        .eq('is_featured', true)

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
