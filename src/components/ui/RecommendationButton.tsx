'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ThumbsUp } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RecommendationButtonProps {
  userId: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  showCount?: boolean
  className?: string
}

export function RecommendationButton({ 
  userId, 
  size = 'default', 
  variant = 'outline',
  showCount = true,
  className = ''
}: RecommendationButtonProps) {
  const { user } = useAuthContext()
  const [isRecommended, setIsRecommended] = useState(false)
  const [recommendationCount, setRecommendationCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState<string | null>(null)

  // Verificar se o usuário atual já recomendou
  useEffect(() => {
    if (user?.id && userId) {
      checkCurrentRecommendation()
      loadRecommendationCount()
      loadUserType()
    }
  }, [user?.id, userId])

  const loadUserType = async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setUserType(data.user_type)
      }
    } catch (error) {
      console.error('Erro ao carregar tipo do usuário:', error)
    }
  }

  const checkCurrentRecommendation = async () => {
    try {
      const { data, error } = await supabase
        .from('user_recommendations')
        .select('id')
        .eq('recommender_id', user?.id)
        .eq('recommended_id', userId)
        .single()

      if (!error && data) {
        setIsRecommended(true)
      }
    } catch (error) {
      // Usuário não recomendou ainda
      setIsRecommended(false)
    }
  }

  const loadRecommendationCount = async () => {
    try {
      const { count, error } = await supabase
        .from('user_recommendations')
        .select('*', { count: 'exact', head: true })
        .eq('recommended_id', userId)

      if (!error && count !== null) {
        setRecommendationCount(count)
      }
    } catch (error) {
      console.error('Erro ao carregar contagem de recomendações:', error)
    }
  }

  const handleRecommendation = async () => {
    if (!user) {
      toast.error('Faça login para recomendar usuários')
      return
    }

    if (user.id === userId) {
      toast.error('Você não pode se recomendar')
      return
    }

    setIsLoading(true)

    try {
      const recommendationType = userType === 'professional' 
        ? 'professional_to_client' 
        : 'client_to_professional'

      if (isRecommended) {
        // Remover recomendação
        const { error } = await supabase
          .from('user_recommendations')
          .delete()
          .eq('recommender_id', user.id)
          .eq('recommended_id', userId)

        if (error) throw error

        setIsRecommended(false)
        setRecommendationCount(prev => Math.max(0, prev - 1))
        toast.success('Recomendação removida')
      } else {
        // Adicionar recomendação
        const { error } = await supabase
          .from('user_recommendations')
          .upsert({
            recommender_id: user.id,
            recommended_id: userId,
            recommendation_type: recommendationType
          })

        if (error) throw error

        setIsRecommended(true)
        setRecommendationCount(prev => prev + 1)
        toast.success('Usuário recomendado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao processar recomendação:', error)
      toast.error('Erro ao processar recomendação. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-3 text-sm'
      case 'lg':
        return 'h-12 px-6 text-base'
      default:
        return 'h-10 px-4 text-sm'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4'
      case 'lg':
        return 'h-5 w-5'
      default:
        return 'h-4 w-4'
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRecommendation}
      disabled={isLoading}
      className={`${getSizeClasses()} ${className} ${
        isRecommended 
          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
          : ''
      }`}
    >
      <ThumbsUp 
        className={`${getIconSize()} mr-2 ${
          isRecommended ? 'text-green-600 fill-current' : ''
        }`}
      />
      {isRecommended ? 'Recomendado' : 'Recomendar'}
      {showCount && recommendationCount > 0 && (
        <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
          {recommendationCount}
        </span>
      )}
    </Button>
  )
}
