'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { X, ThumbsUp, User, MapPin, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/database'

interface RecommendationListProps {
  userId: string
  isOpen: boolean
  onClose: () => void
  position?: { top: number; left: number }
}

interface RecommendationWithProfile {
  id: string
  recommender_id: string
  recommended_id: string
  recommendation_type: string
  created_at: string
  recommender: Profile
}

export function RecommendationList({ 
  userId, 
  isOpen, 
  onClose, 
  position = { top: 0, left: 0 } 
}: RecommendationListProps) {
  const [recommendations, setRecommendations] = useState<RecommendationWithProfile[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && userId) {
      loadRecommendations()
    }
  }, [isOpen, userId])

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
        return 'Profissional recomendou'
      case 'client_to_professional':
        return 'Cliente recomendou'
      default:
        return 'Recomendou'
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div 
        className="w-full max-w-md max-h-[80vh] overflow-hidden bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{
          position: 'fixed',
          top: position.top > 0 ? `${position.top}px` : '50%',
          left: position.left > 0 ? `${position.left}px` : '50%',
          transform: position.top > 0 ? 'none' : 'translate(-50%, -50%)',
          maxWidth: '400px',
          maxHeight: '600px'
        }}
      >
        <div className="flex flex-row items-center justify-between p-4 border-b-4 border-black bg-black text-yellow-400">
          <h3 className="text-lg font-black flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-500" />
            QUEM RECOMENDOU
          </h3>
          <Button
            onClick={onClose}
            className="h-8 w-8 p-0 bg-red-500 text-white border-2 border-black hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4 overflow-y-auto max-h-[500px] p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-black"></div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-8 text-black">
              <div className="w-16 h-16 bg-black border-4 border-black flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-lg font-black mb-2">NENHUMA RECOMENDAÇÃO AINDA</h3>
              <p className="text-sm font-bold">SEJA O PRIMEIRO A RECOMENDAR!</p>
            </div>
          ) : (
            recommendations.map((rec) => (
              <div key={rec.id} className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-black border-2 border-black">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={rec.recommender.avatar_url || ''} />
                      <AvatarFallback className="bg-yellow-400 text-black font-black">
                        {rec.recommender.full_name?.charAt(0) || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-black text-sm truncate text-black">
                        {rec.recommender.full_name?.toUpperCase() || 'USUÁRIO'}
                      </h4>
                      {rec.recommender.is_verified && (
                        <div className="px-2 py-1 bg-green-500 text-white border-2 border-black font-black text-xs">
                          <Star className="h-3 w-3 mr-1 inline" />
                          VERIFICADO
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <div 
                        className={`px-2 py-1 border-2 border-black font-black text-xs ${
                          rec.recommendation_type === 'professional_to_client' 
                            ? 'bg-blue-500 text-white' 
                            : rec.recommendation_type === 'client_to_professional'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}
                      >
                        {getRecommendationTypeText(rec.recommendation_type).toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-black font-bold mb-2">
                      {rec.recommender.location_city && rec.recommender.location_state && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{rec.recommender.location_city.toUpperCase()}, {rec.recommender.location_state.toUpperCase()}</span>
                        </div>
                      )}
                      {rec.recommender.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{rec.recommender.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-black font-bold">
                      {new Date(rec.created_at).toLocaleDateString('pt-BR').toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
