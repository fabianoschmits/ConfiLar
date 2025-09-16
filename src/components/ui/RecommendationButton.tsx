'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ThumbsUp } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { RecommendationModal } from './RecommendationModal'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RecommendationButtonProps {
  userId: string
  userName?: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  showCount?: boolean
  className?: string
}

export function RecommendationButton({ 
  userId, 
  userName = 'Usuário',
  size = 'default', 
  variant = 'outline',
  showCount = true,
  className = ''
}: RecommendationButtonProps) {
  const { user } = useAuthContext()
  const [isRecommended, setIsRecommended] = useState(false)
  const [recommendationCount, setRecommendationCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showRecommendationModal, setShowRecommendationModal] = useState(false)

  // Verificar se o usuário atual já recomendou
  useEffect(() => {
    if (user?.id && userId) {
      checkCurrentRecommendation()
      loadRecommendationCount()
    }
  }, [user?.id, userId])

  const checkCurrentRecommendation = async () => {
    // Evitar auto-recomendação
    if (user?.id === userId) {
      setIsRecommended(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('user_recommendations')
        .select('id')
        .eq('recommender_id', user?.id)
        .eq('recommended_id', userId)
        .single()

      if (!error && data) {
        setIsRecommended(true)
      } else {
        setIsRecommended(false)
      }
    } catch (error) {
      // Usuário não recomendou ainda
      setIsRecommended(false)
    }
  }

  const loadRecommendationCount = async () => {
    // Evitar auto-recomendação
    if (user?.id === userId) {
      setRecommendationCount(0)
      return
    }

    try {
      const { count, error } = await supabase
        .from('user_recommendations')
        .select('*', { count: 'exact', head: true })
        .eq('recommended_id', userId)

      if (!error) {
        setRecommendationCount(count || 0)
      }
    } catch (error) {
      console.error('Erro ao carregar contagem de recomendações:', error)
    }
  }

  const handleShowRecommendationModal = () => {
    setShowRecommendationModal(true)
  }

  const handleCloseRecommendationModal = () => {
    setShowRecommendationModal(false)
    // Recarregar dados quando fechar o modal
    checkCurrentRecommendation()
    loadRecommendationCount()
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleShowRecommendationModal}
        disabled={isLoading || user?.id === userId}
        className={`${className} ${isRecommended ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
      >
        <ThumbsUp className={`h-4 w-4 ${isRecommended ? 'fill-current' : ''}`} />
        {showCount && recommendationCount > 0 && (
          <span className="ml-1 text-xs">
            {recommendationCount}
          </span>
        )}
      </Button>

      <RecommendationModal
        userId={userId}
        userName={userName}
        isOpen={showRecommendationModal}
        onClose={handleCloseRecommendationModal}
      />
    </>
  )
}