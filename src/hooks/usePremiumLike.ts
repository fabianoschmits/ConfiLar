'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { PREMIUM_PRICES } from '@/constants/premiumPrices'

interface UsePremiumLikeProps {
  postId: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function usePremiumLike({ postId, onSuccess, onError }: UsePremiumLikeProps) {
  const { user } = useAuthContext()
  const [isProcessing, setIsProcessing] = useState(false)
  const queryClient = useQueryClient()

  const premiumLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Usuário não autenticado')

      // Verificar saldo do usuário
      const { data: balance, error: balanceError } = await supabase
        .from('user_points_balance')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      if (balanceError) throw new Error('Erro ao verificar saldo')
      if (!balance || balance.balance < PREMIUM_PRICES.LIKE.POINTS) {
        throw new Error(`Saldo insuficiente. Necessário: ${PREMIUM_PRICES.LIKE.POINTS} pontos para curtir`)
      }

      // Verificar se já curtiu
      const { data: existingLike, error: likeError } = await supabase
        .from('feed_posts_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single()

      if (likeError && likeError.code !== 'PGRST116') {
        throw new Error('Erro ao verificar curtida existente')
      }

      if (existingLike) {
        throw new Error('Você já curtiu este post')
      }

      // Criar curtida premium
      const { data, error } = await supabase
        .from('feed_posts_likes')
        .insert({
          user_id: user.id,
          post_id: postId,
          is_featured: true,
          premium_points_spent: PREMIUM_PRICES.LIKE.POINTS
        })
        .select()
        .single()

      if (error) throw error

      // Deduzir pontos
      const { error: pointsError } = await supabase
        .rpc('add_points', {
          p_user_id: user.id,
          p_points: -PREMIUM_PRICES.LIKE.POINTS,
          p_source: 'premium_like',
          p_description: 'Curtida premium em post'
        })

      if (pointsError) throw new Error('Erro ao processar pontos')

      return data
    },
    onSuccess: () => {
      toast.success(`Post curtido com sucesso! (-${PREMIUM_PRICES.LIKE.POINTS} pontos)`)
      queryClient.invalidateQueries({ queryKey: ['post-likes', postId] })
      queryClient.invalidateQueries({ queryKey: ['user-points', user?.id] })
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message)
      onError?.(error.message)
    },
    onSettled: () => {
      setIsProcessing(false)
    }
  })

  const handlePremiumLike = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    premiumLikeMutation.mutate()
  }

  return {
    handlePremiumLike,
    isProcessing: isProcessing || premiumLikeMutation.isPending,
    error: premiumLikeMutation.error?.message
  }
}

