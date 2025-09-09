'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
      <Card 
        className="w-full max-w-md max-h-[80vh] overflow-hidden"
        style={{
          position: 'fixed',
          top: position.top > 0 ? `${position.top}px` : '50%',
          left: position.left > 0 ? `${position.left}px` : '50%',
          transform: position.top > 0 ? 'none' : 'translate(-50%, -50%)',
          maxWidth: '400px',
          maxHeight: '600px'
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-600" />
            Quem Recomendou
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4 overflow-y-auto max-h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ThumbsUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma recomendação ainda</p>
              <p className="text-sm">Seja o primeiro a recomendar!</p>
            </div>
          ) : (
            recommendations.map((rec) => (
              <div key={rec.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={rec.recommender.avatar_url || ''} />
                  <AvatarFallback>
                    {rec.recommender.full_name?.charAt(0) || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {rec.recommender.full_name || 'Usuário'}
                    </h4>
                    {rec.recommender.is_verified && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        <Star className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getRecommendationTypeColor(rec.recommendation_type)}`}
                    >
                      {getRecommendationTypeText(rec.recommendation_type)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {rec.recommender.location_city && rec.recommender.location_state && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{rec.recommender.location_city}, {rec.recommender.location_state}</span>
                      </div>
                    )}
                    {rec.recommender.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{rec.recommender.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(rec.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
