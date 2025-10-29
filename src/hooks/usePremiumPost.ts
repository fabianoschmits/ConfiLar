'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface CreatePremiumPostData {
  title: string
  description: string
  images?: string[]
  location_city?: string
  location_state?: string
}

interface UsePremiumPostProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function usePremiumPost({ onSuccess, onError }: UsePremiumPostProps) {
  const { user } = useAuthContext()
  const [isProcessing, setIsProcessing] = useState(false)
  const queryClient = useQueryClient()

  const premiumPostMutation = useMutation({
    mutationFn: async (postData: CreatePremiumPostData) => {
      if (!user) throw new Error('Usuário não autenticado')

      // Verificar saldo do usuário
      const { data: balance, error: balanceError } = await supabase
        .from('user_points_balance')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      if (balanceError) throw new Error('Erro ao verificar saldo')
      if (!balance || balance.balance < 50) {
        throw new Error('Saldo insuficiente. Necessário: 50 pontos para post premium')
      }

      // Criar post premium
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          professional_id: user.id,
          user_id: user.id,
          title: postData.title,
          description: postData.description,
          content: postData.description, // Usar description como content também
          images: postData.images || [],
          service_category_id: null,
          location_city: postData.location_city,
          location_state: postData.location_state,
          likes_count: 0,
          comments_count: 0,
          is_active: true,
          is_public: true,
          is_featured: true, // Posts premium são destacados
          tags: ['premium'],
          metadata: {
            type: 'premium',
            points_spent: 50,
            created_at: new Date().toISOString()
          }
        })
        .select()
        .single()

      if (error) throw error

      // Deduzir pontos
      const { error: pointsError } = await supabase
        .rpc('add_points', {
          p_user_id: user.id,
          p_points: -50,
          p_source: 'premium_post',
          p_description: 'Criou post premium'
        })

      if (pointsError) throw new Error('Erro ao processar pontos')

      return data
    },
    onSuccess: () => {
      toast.success('Post premium criado com sucesso! (-50 pontos)')
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] })
      queryClient.invalidateQueries({ queryKey: ['user-posts', user?.id] })
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

  const createPremiumPost = async (postData: CreatePremiumPostData) => {
    if (isProcessing) return
    
    setIsProcessing(true)
    premiumPostMutation.mutate(postData)
  }

  return {
    createPremiumPost,
    isProcessing: isProcessing || premiumPostMutation.isPending,
    error: premiumPostMutation.error?.message
  }
}

