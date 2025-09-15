'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ThumbsUp } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { RecommendationList } from './RecommendationList'

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
  showListOnClick?: boolean
}

export function RecommendationButton({ 
  userId, 
  size = 'default', 
  variant = 'outline',
  showCount = true,
  className = '',
  showListOnClick = true
}: RecommendationButtonProps) {
  const { user } = useAuthContext()
  const [isRecommended, setIsRecommended] = useState(false)
  const [recommendationCount, setRecommendationCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState<string | null>(null)
  const [showRecommendationList, setShowRecommendationList] = useState(false)
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

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
    // Evitar auto-recomendação
    if (user?.id === userId) {
      setIsRecommended(false)
      return
    }

    try {
      // Sistema de recomendações temporariamente desabilitado
      setIsRecommended(false) // Temporariamente sempre false
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
      // Sistema de recomendações temporariamente desabilitado
      setRecommendationCount(0) // Temporariamente sempre 0
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

    // Sistema de recomendações temporariamente desabilitado
    toast.info('Sistema de recomendações temporariamente indisponível')
  }

  const handleShowRecommendationList = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setButtonPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      })
    }
    
    setShowRecommendationList(true)
  }

  const handleHideRecommendationList = () => {
    setShowRecommendationList(false)
  }

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant={variant}
        size={size}
        onClick={showListOnClick ? handleShowRecommendationList : handleRecommendation}
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

      {showRecommendationList && (
        <RecommendationList
          userId={userId}
          isOpen={showRecommendationList}
          position={buttonPosition}
          onClose={handleHideRecommendationList}
        />
      )}
    </div>
  )
}