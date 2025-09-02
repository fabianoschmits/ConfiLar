'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star, 
  ThumbsUp, 
  Users, 
  MessageSquare,
  Calendar,
  User,
  CheckCircle,
  Award,
  TrendingUp
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

interface Profile {
  id: string
  full_name: string
  avatar_url?: string
  user_type: 'client' | 'professional'
  bio?: string
  location_city?: string
  location_state?: string
}

export default function ReputacaoPage() {
  const { profile: currentUser } = useAuthContext()
  const [activeTab, setActiveTab] = useState('overview')
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([])
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])

  // Carregar avaliações e recomendações do usuário atual
  useEffect(() => {
    if (currentUser?.id) {
      loadUserReputation()
    }
  }, [currentUser])

  const loadUserReputation = async () => {
    if (!currentUser?.id) return

    try {
      // Carregar avaliações recebidas
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('user_reviews')
        .select(`
          *,
          reviewer:profiles!user_reviews_reviewer_id_fkey(
            id, full_name, avatar_url, user_type
          )
        `)
        .eq('reviewed_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (reviewsError) throw reviewsError

      // Carregar recomendações recebidas
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from('user_recommendations')
        .select(`
          *,
          recommender:profiles!user_recommendations_recommender_id_fkey(
            id, full_name, avatar_url, user_type
          )
        `)
        .eq('recommended_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (recommendationsError) throw recommendationsError

      setReviews(reviewsData || [])
      setRecommendations(recommendationsData || [])
    } catch (error) {
      console.error('Erro ao carregar reputação:', error)
    }
  }

  // Buscar usuários para avaliar
  const searchUsers = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, user_type, bio, location_city, location_state')
        .or(`full_name.ilike.%${query}%,bio.ilike.%${query}%`)
        .neq('id', currentUser?.id)
        .limit(10)

      if (error) throw error
      setSearchResults(data || [])
    } catch (error) {
      console.error('Erro na busca:', error)
    }
  }

  // Submeter avaliação
  const submitReview = async () => {
    if (!currentUser?.id || !selectedUser || rating === 0) return

    setIsSubmitting(true)
    try {
      const reviewType = currentUser.user_type === 'professional' 
        ? 'professional_to_client' 
        : 'client_to_professional'

      const { error } = await supabase
        .from('user_reviews')
        .upsert({
          reviewer_id: currentUser.id,
          reviewed_id: selectedUser.id,
          rating,
          comment: comment.trim() || null,
          review_type: reviewType
        })

      if (error) throw error

      // Limpar formulário
      setRating(0)
      setComment('')
      setSelectedUser(null)
      
      // Recarregar reputação
      await loadUserReputation()
      
      alert('Avaliação enviada com sucesso!')
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error)
      alert('Erro ao enviar avaliação. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submeter recomendação
  const submitRecommendation = async (userId: string) => {
    if (!currentUser?.id) return

    try {
      const recommendationType = currentUser.user_type === 'professional' 
        ? 'professional_to_client' 
        : 'client_to_professional'

      const { error } = await supabase
        .from('user_recommendations')
        .upsert({
          recommender_id: currentUser.id,
          recommended_id: userId,
          recommendation_type: recommendationType
        })

      if (error) throw error

      await loadUserReputation()
      alert('Recomendação enviada com sucesso!')
    } catch (error) {
      console.error('Erro ao enviar recomendação:', error)
      alert('Erro ao enviar recomendação. Tente novamente.')
    }
  }

  // Calcular estatísticas
  const stats = {
    averageRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0',
    totalReviews: reviews.length,
    totalRecommendations: recommendations.length
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    }

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Award className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Reputação
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Avalie e recomende outros usuários. Sistema 100% transparente onde você vê exatamente quem te avaliou.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">📊 Visão Geral</TabsTrigger>
            <TabsTrigger value="reviews">⭐ Avaliações</TabsTrigger>
            <TabsTrigger value="recommendations">👍 Recomendações</TabsTrigger>
            <TabsTrigger value="give">📝 Avaliar</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="p-3 bg-yellow-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{stats.averageRating}</h3>
                  <p className="text-gray-600">Rating Médio</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{stats.totalReviews}</h3>
                  <p className="text-gray-600">Total de Avaliações</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <ThumbsUp className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{stats.totalRecommendations}</h3>
                  <p className="text-gray-600">Recomendações</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Como Funciona</CardTitle>
                <CardDescription>
                  Sistema simples e transparente de reputação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">✅ Transparência Total</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Nome completo de quem te avaliou</li>
                      <li>• Foto do perfil visível</li>
                      <li>• Data da avaliação clara</li>
                      <li>• Histórico completo acessível</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">🎯 Sistema Simples</h4>
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
          </TabsContent>

          {/* Avaliações Recebidas */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Avaliações que Você Recebeu</CardTitle>
                <CardDescription>
                  Veja exatamente quem te avaliou e quando
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={review.reviewer.avatar_url || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary">
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
                                {renderStars(review.rating, 'md')}
                              </div>
                            </div>
                            
                            {review.comment && (
                              <p className="text-gray-700 mt-2">{review.comment}</p>
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
          </TabsContent>

          {/* Recomendações Recebidas */}
          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Recomendações que Você Recebeu</CardTitle>
                <CardDescription>
                  Pessoas que te recomendaram
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.map((rec) => (
                      <div key={rec.id} className="border rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={rec.recommender.avatar_url || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary">
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
          </TabsContent>

          {/* Avaliar Outros Usuários */}
          <TabsContent value="give">
            <Card>
              <CardHeader>
                <CardTitle>Avaliar Outro Usuário</CardTitle>
                <CardDescription>
                  Avalie e recomende usuários que você conheceu na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Busca de Usuários */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Buscar Usuário para Avaliar
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Digite o nome do usuário..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        searchUsers(e.target.value)
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Resultados da Busca */}
                  {searchResults.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={user.avatar_url || ''} />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {user.full_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-gray-900">{user.full_name}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {user.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                                </Badge>
                                {user.location_city && (
                                  <span className="text-xs text-gray-500">
                                    {user.location_city}, {user.location_state}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              submitRecommendation(user.id)
                            }}
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Recomendar
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Formulário de Avaliação */}
                {selectedUser && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold mb-4">Avaliando: {selectedUser.full_name}</h4>
                    
                    {/* Rating */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Avaliação (1-5 estrelas)
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`h-8 w-8 ${
                                star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comentário */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Comentário (Opcional)
                      </label>
                      <Textarea
                        placeholder="Conte sua experiência com este usuário..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>

                    {/* Botões */}
                    <div className="flex space-x-3">
                      <Button
                        onClick={submitReview}
                        disabled={rating === 0 || isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(null)
                          setRating(0)
                          setComment('')
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
