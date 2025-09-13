'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ThumbsUp, User, MapPin, Star, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/database'
import Link from 'next/link'

interface RecommendationSectionProps {
  userId: string
  className?: string
}

interface RecommendationWithProfile {
  id: string
  recommender_id: string
  recommended_id: string
  recommendation_type: string
  created_at: string
  recommender: Profile
}

export function RecommendationSection({ userId, className = '' }: RecommendationSectionProps) {
  const [recommendations, setRecommendations] = useState<RecommendationWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    loadRecommendations()
  }, [userId])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_recommendations')
        .select(`
          id,
          recommender_id,
          recommended_id,
          recommendation_type,
          created_at,
          recommender:profiles!user_recommendations_recommender_id_fkey (
            id,
            full_name,
            avatar_url,
            user_type,
            location_city,
            location_state,
            rating,
            is_verified
          )
        `)
        .eq('recommended_id', userId)
        .order('created_at', { ascending: false })
        .limit(showAll ? 50 : 3)

      if (error) throw error

      // Transformar os dados para o formato correto
      const transformedData = data.map((item: Record<string, unknown>) => ({
        id: item.id,
        recommender_id: item.recommender_id,
        recommended_id: item.recommended_id,
        recommendation_type: item.recommendation_type,
        created_at: item.created_at,
        recommender: Array.isArray(item.recommender) ? item.recommender[0] : item.recommender
      }))

      setRecommendations(transformedData as RecommendationWithProfile[])
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationTypeText = (type: string) => {
    switch (type) {
      case 'professional_to_client':
        return 'Profissional'
      case 'client_to_professional':
        return 'Cliente'
      default:
        return 'Usuário'
    }
  }

  const getRecommendationTypeColor = (type: string) => {
    switch (type) {
      case 'professional_to_client':
        return 'bg-blue-100 text-blue-800'
      case 'client_to_professional':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${className}`}>
        <div className="p-4 border-b-4 border-black bg-black text-yellow-400">
          <h3 className="text-lg font-black flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-500" />
            RECOMENDAÇÕES
          </h3>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-black"></div>
          </div>
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className={`bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${className}`}>
        <div className="p-4 border-b-4 border-black bg-black text-yellow-400">
          <h3 className="text-lg font-black flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-500" />
            RECOMENDAÇÕES
          </h3>
        </div>
        <div className="p-4">
          <div className="text-center py-8 text-black">
            <div className="w-16 h-16 bg-black border-4 border-black flex items-center justify-center mx-auto mb-4">
              <ThumbsUp className="h-8 w-8 text-yellow-400" />
            </div>
            <h3 className="text-lg font-black mb-2">NENHUMA RECOMENDAÇÃO AINDA</h3>
            <p className="text-sm font-bold">SEJA O PRIMEIRO A RECOMENDAR ESTE USUÁRIO!</p>
          </div>
        </div>
      </div>
    )
  }

  const displayedRecommendations = showAll ? recommendations : recommendations.slice(0, 3)

  return (
    <div className={`bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${className}`}>
      <div className="p-4 border-b-4 border-black bg-black text-yellow-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-black">RECOMENDAÇÕES</h3>
            <div className="px-2 py-1 bg-yellow-400 text-black border-2 border-black font-black text-sm">
              {recommendations.length}
            </div>
          </div>
          {recommendations.length > 3 && (
            <Button
              onClick={() => setShowAll(!showAll)}
              className="bg-blue-500 text-white border-2 border-black hover:bg-blue-600 font-black"
            >
              {showAll ? 'VER MENOS' : `VER TODAS (${recommendations.length})`}
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedRecommendations.map((rec) => (
            <div key={rec.id} className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="flex flex-col items-center">
                <div className="p-2 bg-black border-2 border-black mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={rec.recommender.avatar_url || ''} />
                    <AvatarFallback className="bg-yellow-400 text-black font-black">
                      {rec.recommender.full_name?.charAt(0) || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="text-center w-full">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Link 
                      href={`/perfil/${rec.recommender.id}`}
                      className="font-black text-sm hover:text-blue-600 transition-colors truncate text-black"
                    >
                      {rec.recommender.full_name?.toUpperCase() || 'USUÁRIO'}
                    </Link>
                    {rec.recommender.is_verified && (
                      <div className="px-1 py-0.5 bg-green-500 text-white border border-black">
                        <Star className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className={`px-2 py-1 border-2 border-black font-black text-xs mb-2 ${
                      rec.recommendation_type === 'professional_to_client' 
                        ? 'bg-blue-500 text-white' 
                        : rec.recommendation_type === 'client_to_professional'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {getRecommendationTypeText(rec.recommendation_type).toUpperCase()}
                  </div>
                  
                  <div className="text-xs text-black font-bold mb-2">
                    {new Date(rec.created_at).toLocaleDateString('pt-BR').toUpperCase()}
                  </div>
                  
                  {rec.recommender.rating && (
                    <div className="flex items-center justify-center gap-1 text-xs text-black font-bold mb-3">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{rec.recommender.rating.toFixed(1)}</span>
                    </div>
                  )}
                  
                  <Link href={`/perfil/${rec.recommender.id}`}>
                    <Button className="bg-black text-yellow-400 border-2 border-black hover:bg-gray-800 font-black h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {recommendations.length > 3 && !showAll && (
          <div className="text-center pt-4">
            <Button
              onClick={() => setShowAll(true)}
              className="bg-green-500 text-white border-2 border-black hover:bg-green-600 font-black"
            >
              VER MAIS {recommendations.length - 3} RECOMENDAÇÕES
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
