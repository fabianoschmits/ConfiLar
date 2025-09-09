'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-600" />
            Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-600" />
            Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <ThumbsUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Nenhuma recomendação ainda</p>
            <p className="text-sm">Seja o primeiro a recomendar este usuário!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayedRecommendations = showAll ? recommendations : recommendations.slice(0, 3)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-600" />
            Recomendações
            <Badge variant="secondary" className="ml-2">
              {recommendations.length}
            </Badge>
          </div>
          {recommendations.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-blue-600 hover:text-blue-700"
            >
              {showAll ? 'Ver menos' : `Ver todas (${recommendations.length})`}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {displayedRecommendations.map((rec) => (
            <div key={rec.id} className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Avatar className="h-10 w-10 mb-2">
                <AvatarImage src={rec.recommender.avatar_url || ''} />
                <AvatarFallback>
                  {rec.recommender.full_name?.charAt(0) || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center w-full">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Link 
                    href={`/perfil/${rec.recommender.id}`}
                    className="font-medium text-sm hover:text-blue-600 transition-colors truncate"
                  >
                    {rec.recommender.full_name || 'Usuário'}
                  </Link>
                  {rec.recommender.is_verified && (
                    <Star className="h-3 w-3 text-blue-500" />
                  )}
                </div>
                
                <Badge 
                  variant="outline" 
                  className={`text-xs mb-1 ${getRecommendationTypeColor(rec.recommendation_type)}`}
                >
                  {getRecommendationTypeText(rec.recommendation_type)}
                </Badge>
                
                <div className="text-xs text-gray-500 mb-2">
                  {new Date(rec.created_at).toLocaleDateString('pt-BR')}
                </div>
                
                {rec.recommender.rating && (
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-2">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{rec.recommender.rating.toFixed(1)}</span>
                  </div>
                )}
                
                <Link href={`/perfil/${rec.recommender.id}`}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {recommendations.length > 3 && !showAll && (
          <div className="text-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(true)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Ver mais {recommendations.length - 3} recomendações
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
