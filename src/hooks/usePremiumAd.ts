'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { PREMIUM_PRICES } from '@/constants/premiumPrices'

interface CreatePremiumAdData {
  title: string
  description: string
  service_type: string
  location_city: string
  location_state: string
  price_range: string
  contact_phone?: string
  contact_email?: string
  images?: string[]
}

interface UsePremiumAdProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function usePremiumAd({ onSuccess, onError }: UsePremiumAdProps) {
  const { user } = useAuthContext()
  const [isProcessing, setIsProcessing] = useState(false)
  const queryClient = useQueryClient()

  const premiumAdMutation = useMutation({
    mutationFn: async (adData: CreatePremiumAdData) => {
      if (!user) throw new Error('Usuário não autenticado')

      // Verificar saldo do usuário
      const { data: balance, error: balanceError } = await supabase
        .from('user_points_balance')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      if (balanceError) throw new Error('Erro ao verificar saldo')
      if (!balance || balance.balance < PREMIUM_PRICES.AD.POINTS) {
        throw new Error(`Saldo insuficiente. Necessário: ${PREMIUM_PRICES.AD.POINTS} pontos para anúncio premium`)
      }

      // Criar anúncio premium
      const { data, error } = await supabase
        .from('classifieds')
        .insert({
          user_id: user.id,
          title: adData.title,
          description: adData.description,
          service_type: adData.service_type,
          location_city: adData.location_city,
          location_state: adData.location_state,
          price_range: adData.price_range,
          contact_phone: adData.contact_phone,
          contact_email: adData.contact_email,
          images: adData.images || [],
          is_featured: true,
          premium_points_spent: PREMIUM_PRICES.AD.POINTS,
          premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
          premium_highlight_color: '#FFD700'
        })
        .select()
        .single()

      if (error) throw error

      // Deduzir pontos
      const { error: pointsError } = await supabase
        .rpc('add_points', {
          p_user_id: user.id,
          p_points: -PREMIUM_PRICES.AD.POINTS,
          p_source: 'premium_ad',
          p_description: `Criou anúncio premium (${PREMIUM_PRICES.AD.DURATION})`
        })

      if (pointsError) throw new Error('Erro ao processar pontos')

      return data
    },
    onSuccess: () => {
      toast.success(`Anúncio premium criado com sucesso! (-${PREMIUM_PRICES.AD.POINTS} pontos)`)
      queryClient.invalidateQueries({ queryKey: ['user-classifieds', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['classifieds'] })
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

  const createPremiumAd = async (adData: CreatePremiumAdData) => {
    if (isProcessing) return
    
    setIsProcessing(true)
    premiumAdMutation.mutate(adData)
  }

  return {
    createPremiumAd,
    isProcessing: isProcessing || premiumAdMutation.isPending,
    error: premiumAdMutation.error?.message
  }
}

