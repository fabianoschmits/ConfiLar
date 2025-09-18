'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StarRating } from '@/components/ui/StarRating'
import { 
  Star, 
  ThumbsUp, 
  Users, 
  CheckCircle,
  Award
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface UserReview {
  id: string
  reviewer_id: string
  reviewed_id: string
  rating: number
  comment?: string
  review_type: 'client_to_professional' | 'professional_to_client'
  created_at: string
  reviewer: {
    id: string
    full_name: string
    avatar_url?: string
    user_type: 'client' | 'professional'
  }
}

interface UserRecommendation {
  id: string
  recommender_id: string
  recommended_id: string
  recommendation_type: 'client_to_professional' | 'professional_to_client'
  created_at: string
  recommender: {
    id: string
    full_name: string
    avatar_url?: string
    user_type: 'client' | 'professional'
  }
}


export default function ReputacaoPage() {
  const { profile: currentUser } = useAuthContext()
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([])
  const [viewStats, setViewStats] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Carregar dados da reputação do usuário
  useEffect(() => {
    if (currentUser?.id && mounted) {
      loadUserReputation()
    }
  }, [currentUser, mounted])

  const loadUserReputation = async () => {
    if (!currentUser?.id) return

    setLoading(true)
    try {
      // Carregar avaliações recebidas
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(
            id, full_name, avatar_url, user_type
          )
        `)
        .eq('reviewed_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (reviewsError) throw reviewsError

      // Carregar recomendações (filtrar da tabela reviews onde is_recommended = true)
      const recommendationsData = reviewsData?.filter(review => (review as any).is_recommended) || []

      // Carregar estatísticas de visualização
      const { data: viewStatsData, error: viewStatsError } = await supabase
        .from('profile_views')
        .select('id')
        .eq('viewed_profile_id', currentUser.id)

      if (viewStatsError) {
        console.error('Erro ao carregar visualizações:', viewStatsError)
      }

      setReviews(reviewsData || [])
      setRecommendations(recommendationsData)
      setViewStats({ total_views: viewStatsData?.length || 0 })
    } catch (error) {
      console.error('Erro ao carregar reputação:', error)
    } finally {
      setLoading(false)
    }
  }


  // Calcular estatísticas
  const stats = {
    averageRating: reviews.length > 0 
      ? parseFloat((reviews.reduce((sum, r) => sum + ((r as any).rating_person || 0), 0) / reviews.length).toFixed(1))
      : 0,
    totalReviews: reviews.length,
    totalRecommendations: recommendations.length,
    totalViews: viewStats?.total_views || 0
  }

  const isProfessional = currentUser?.user_type === 'professional'

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (!mounted || loading) {
    return (
      <MainLayout requireAuth={true}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Carregando sua reputação...
            </h1>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Award className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Minha Reputação
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Acompanhe sua reputação na plataforma. Sistema transparente onde você vê exatamente quem te avaliou.
          </p>
        </div>

        {/* Cards de Estatísticas - Igual ao Perfil */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Card>
            <CardContent className="p-2 text-center">
              <Users className="h-4 w-4 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{stats.totalViews}</p>
              <p className="text-xs text-gray-600">Visualizações</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-2 text-center">
              <ThumbsUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{stats.totalRecommendations}</p>
              <p className="text-xs text-gray-600">Recomendações</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-2 text-center">
              <Star className="h-4 w-4 text-orange-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{stats.totalReviews}</p>
              <p className="text-xs text-gray-600">Avaliações</p>
            </CardContent>
          </Card>

          {isProfessional && stats.averageRating > 0 && (
            <Card>
              <CardContent className="p-2 text-center">
                <div className="flex justify-center mb-1">
                  <StarRating 
                    rating={stats.averageRating} 
                    size="sm" 
                    variant="compact"
                    showValue={false}
                  />
                </div>
                <p className="text-lg font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                <p className="text-xs text-gray-600">Nota Média</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Como Funciona */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Como Funciona Nosso Sistema de Reputação</CardTitle>
            <CardDescription>
              Sistema simples e transparente de reputação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Transparência Total
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Nome completo de quem te avaliou</li>
                  <li>• Foto do perfil visível</li>
                  <li>• Data da avaliação clara</li>
                  <li>• Histórico completo acessível</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Star className="h-5 w-5 text-yellow-600 mr-2" />
                  Sistema Simples
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Avaliação 1-5 estrelas</li>
                  <li>• Comentário opcional</li>
                  <li>• Sistema de recomendações</li>
                  <li>• Sem complexidades desnecessárias</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avaliações Recebidas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Avaliações que Você Recebeu ({stats.totalReviews})
            </CardTitle>
            <CardDescription>
              Veja exatamente quem te avaliou e quando
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={review.reviewer.avatar_url || ''} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {review.reviewer.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {review.reviewer.full_name}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {review.reviewer.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatDate(review.created_at)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <StarRating 
                              rating={(review as any).rating_person || 0} 
                              size="sm" 
                              variant="compact"
                              showValue={true}
                            />
                          </div>
                        </div>
                        
                        {(review as any).comment_text && (
                          <p className="text-gray-700 mt-2 bg-gray-50 p-3 rounded-md">
                            "{(review as any).comment_text}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma avaliação ainda
                </h3>
                <p className="text-gray-600">
                  Você ainda não recebeu avaliações. Continue usando a plataforma!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recomendações Recebidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ThumbsUp className="h-5 w-5 mr-2" />
              Recomendações que Você Recebeu ({stats.totalRecommendations})
            </CardTitle>
            <CardDescription>
              Pessoas que te recomendaram
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={rec.recommender.avatar_url || ''} />
                        <AvatarFallback className="bg-green-100 text-green-600">
                          {rec.recommender.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {rec.recommender.full_name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {rec.recommender.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(rec.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <ThumbsUp className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Recomendou</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ThumbsUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma recomendação ainda
                </h3>
                <p className="text-gray-600">
                  Continue se destacando para receber recomendações!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
