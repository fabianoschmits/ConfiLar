'use client'

import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StarRating } from '@/components/ui/StarRating'
import { 
  Star, 
  ThumbsUp, 
  Users, 
  CheckCircle,
  Award,
  TrendingUp,
  Eye,
  MessageCircle,
  Calendar,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  BarChart3,
  Target,
  Zap
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { DashboardSkeleton } from '@/components/ui/skeleton'
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { ClientOnly } from '@/components/ClientOnly'

interface UserReview {
  id: string
  reviewer_id: string
  reviewed_id: string
  rating_person: number
  comment_person?: string
  review_type: 'client_to_professional' | 'professional_to_client'
  created_at: string
  reviewer: {
    id: string
    full_name: string
    avatar_url?: string
    user_type: 'client' | 'professional'
  }
  reviewed?: {
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
  recommended?: {
    id: string
    full_name: string
    avatar_url?: string
    user_type: 'client' | 'professional'
  }
}


export default function ReputacaoPage() {
  const [mounted, setMounted] = useState(false)
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([])
  const [givenReviews, setGivenReviews] = useState<UserReview[]>([])
  const [givenRecommendations, setGivenRecommendations] = useState<UserRecommendation[]>([])
  const [viewStats, setViewStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'recommendations' | 'analytics'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'professional' | 'client'>('all')
  const [showAddReviewDialog, setShowAddReviewDialog] = useState(false)
  const [showAddRecommendationDialog, setShowAddRecommendationDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewsSubTab, setReviewsSubTab] = useState<'received' | 'given'>('received')
  const [recommendationsSubTab, setRecommendationsSubTab] = useState<'received' | 'given'>('received')
  
  // Estados para formulários
  const [reviewForm, setReviewForm] = useState({
    reviewed_id: '',
    rating: 5,
    comment: '',
    review_type: 'client_to_professional' as 'client_to_professional' | 'professional_to_client'
  })
  
  const [recommendationForm, setRecommendationForm] = useState({
    recommended_id: '',
    recommendation_type: 'client_to_professional' as 'client_to_professional' | 'professional_to_client'
  })
  
  const { user, profile: currentUser } = useAuthContext()
  const { openChat } = useFloatingChat()

  const loadUserReputation = useCallback(async () => {
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

      // Carregar recomendações
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

      if (recommendationsError) {
        console.error('Erro ao carregar recomendações:', recommendationsError)
      }

      // Mapear recomendações
      const mappedRecommendations = recommendationsData?.map(rec => ({
        id: rec.id,
        recommender_id: rec.recommender_id,
        recommended_id: rec.recommended_id,
        recommendation_type: rec.recommendation_type as 'client_to_professional' | 'professional_to_client',
        created_at: rec.created_at || new Date().toISOString(),
        recommender: {
          id: rec.recommender?.id || '',
          full_name: rec.recommender?.full_name || '',
          avatar_url: rec.recommender?.avatar_url || '',
          user_type: rec.recommender?.user_type || 'client'
        }
      })) || []

      // Carregar estatísticas de visualização
      const { data: viewStatsData, error: viewStatsError } = await supabase
        .from('profile_views')
        .select('id')
        .eq('viewed_profile_id', currentUser.id)

      if (viewStatsError) {
        console.error('Erro ao carregar visualizações:', viewStatsError)
      }

      // Carregar avaliações que o usuário fez
      const { data: givenReviewsData, error: givenReviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewed:profiles!reviews_reviewed_id_fkey(
            id, full_name, avatar_url, user_type
          )
        `)
        .eq('reviewer_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (givenReviewsError) {
        console.error('Erro ao carregar avaliações feitas:', givenReviewsError)
      }

      // Carregar recomendações que o usuário fez
      const { data: givenRecommendationsData, error: givenRecommendationsError } = await supabase
        .from('user_recommendations')
        .select(`
          *,
          recommended:profiles!user_recommendations_recommended_id_fkey(
            id, full_name, avatar_url, user_type
          )
        `)
        .eq('recommender_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (givenRecommendationsError) {
        console.error('Erro ao carregar recomendações feitas:', givenRecommendationsError)
      }

      // Mapear recomendações feitas
      const mappedGivenRecommendations = givenRecommendationsData?.map(rec => ({
        id: rec.id,
        recommender_id: rec.recommender_id,
        recommended_id: rec.recommended_id,
        recommendation_type: rec.recommendation_type as 'client_to_professional' | 'professional_to_client',
        created_at: rec.created_at || new Date().toISOString(),
        recommender: {
          id: rec.recommender?.id || '',
          full_name: rec.recommender?.full_name || '',
          avatar_url: rec.recommender?.avatar_url || '',
          user_type: rec.recommender?.user_type || 'client'
        },
        recommended: {
          id: rec.recommended?.id || '',
          full_name: rec.recommended?.full_name || '',
          avatar_url: rec.recommended?.avatar_url || '',
          user_type: rec.recommended?.user_type || 'client'
        }
      })) || []

      setReviews(reviewsData || [])
      setRecommendations(mappedRecommendations)
      setGivenReviews(givenReviewsData || [])
      setGivenRecommendations(mappedGivenRecommendations)
      setViewStats({ total_views: viewStatsData?.length || 0 })
    } catch (error) {
      console.error('Erro ao carregar reputação:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser?.id])

  // Adicionar avaliação
  const handleAddReview = async () => {
    if (!user || !reviewForm.reviewed_id) {
      toast.error('Selecione um usuário para avaliar')
      return
    }

    try {
      setIsSubmitting(true)

      const { error } = await supabase
        .from('reviews')
        .insert([{
          reviewer_id: user.id,
          reviewed_id: reviewForm.reviewed_id,
          rating_person: reviewForm.rating,
          comment_person: reviewForm.comment || null,
          review_type: reviewForm.review_type
        }])

      if (error) throw error

      toast.success('Avaliação adicionada com sucesso!')
      setShowAddReviewDialog(false)
      setReviewForm({
        reviewed_id: '',
        rating: 5,
        comment: '',
        review_type: 'client_to_professional'
      })
      loadUserReputation()
    } catch (error) {
      console.error('Erro ao adicionar avaliação:', error)
      toast.error('Erro ao adicionar avaliação')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Adicionar recomendação
  const handleAddRecommendation = async () => {
    if (!user || !recommendationForm.recommended_id) {
      toast.error('Selecione um usuário para recomendar')
      return
    }

    try {
      setIsSubmitting(true)

      const { error } = await supabase
        .from('user_recommendations')
        .insert([{
          recommender_id: user.id,
          recommended_id: recommendationForm.recommended_id,
          recommendation_type: recommendationForm.recommendation_type
        }])

      if (error) throw error

      toast.success('Recomendação adicionada com sucesso!')
      setShowAddRecommendationDialog(false)
      setRecommendationForm({
        recommended_id: '',
        recommendation_type: 'client_to_professional'
      })
      loadUserReputation()
    } catch (error) {
      console.error('Erro ao adicionar recomendação:', error)
      toast.error('Erro ao adicionar recomendação')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Buscar usuários para avaliar/recomendar
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, user_type')
        .ilike('full_name', `%${query}%`)
        .neq('id', user?.id) // Excluir o próprio usuário
        .limit(10)

      if (error) throw error
      setSearchResults(data || [])
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Abrir chat com usuário
  const handleContactUser = (userId: string, userName?: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para entrar em contato')
      return
    }
    
    if (userId === user.id) {
      toast.error('Você não pode entrar em contato consigo mesmo')
      return
    }
    
    openChat(userId, userName || 'Usuário')
    toast.success('Iniciando conversa...')
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Carregar dados da reputação do usuário
  useEffect(() => {
    if (currentUser?.id && mounted) {
      loadUserReputation()
    }
  }, [currentUser, mounted, loadUserReputation])

  if (!mounted) {
    return null
  }

  // Calcular estatísticas
  const stats = {
    averageRating: reviews.length > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + (r.rating_person || 0), 0) / reviews.length).toFixed(1))
      : 0,
    totalReviews: reviews.length,
    totalRecommendations: recommendations.length,
    totalViews: viewStats?.total_views || 0,
    givenReviews: givenReviews.length,
    givenRecommendations: givenRecommendations.length
  }

  const isProfessional = currentUser?.user_type === 'professional'

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Filtrar dados baseado na busca e filtro
  const getFilteredReviews = () => {
    const reviewsToFilter = reviewsSubTab === 'received' ? reviews : givenReviews
    return reviewsToFilter.filter(review => {
      const user = reviewsSubTab === 'received' ? review.reviewer : review.reviewed
      const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterType === 'all' || user.user_type === filterType
      return matchesSearch && matchesFilter
    })
  }

  const getFilteredRecommendations = () => {
    const recommendationsToFilter = recommendationsSubTab === 'received' ? recommendations : givenRecommendations
    return recommendationsToFilter.filter(rec => {
      const user = recommendationsSubTab === 'received' ? rec.recommender : rec.recommended
      const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterType === 'all' || user.user_type === filterType
      return matchesSearch && matchesFilter
    })
  }

  const filteredReviews = getFilteredReviews()
  const filteredRecommendations = getFilteredRecommendations()

  if (!mounted || loading) {
    return (
      <ClientOnly>
        <MainLayout requireAuth={true}>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-600 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Carregando sua reputação...
                </h1>
              </div>
            </div>
          </div>
        </MainLayout>
      </ClientOnly>
    )
  }

  return (
    <ClientOnly>
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Award className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Minha Reputação
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Gerencie sua reputação na plataforma. Sistema transparente onde você vê exatamente quem te avaliou.
              </p>
            </div>

            {/* Sistema de Abas */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex flex-wrap gap-2 sm:gap-4 lg:gap-8">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                      activeTab === 'overview'
                        ? 'border-gray-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Visão Geral</span>
                      <span className="sm:hidden">Geral</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                      activeTab === 'reviews'
                        ? 'border-gray-700 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Avaliações ({stats.totalReviews})</span>
                      <span className="sm:hidden">Aval. ({stats.totalReviews})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('recommendations')}
                    className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                      activeTab === 'recommendations'
                        ? 'border-gray-500 text-gray-700'
                        : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Recomendações ({stats.totalRecommendations})</span>
                      <span className="sm:hidden">Rec. ({stats.totalRecommendations})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                      activeTab === 'analytics'
                        ? 'border-gray-500 text-gray-700'
                        : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Análises</span>
                      <span className="sm:hidden">Análise</span>
                    </div>
                  </button>
                </nav>
              </div>
            </div>

            {/* Conteúdo das Abas */}
            {activeTab === 'overview' && (
              <>
                {/* Estatísticas Compactas */}
                <Card className="mb-6 sm:mb-8 hover:shadow-xl transition-all duration-300">
                  <CardContent className="py-2 px-3 sm:py-3 sm:px-4">
                    <div className="flex flex-row items-center justify-around gap-1 sm:gap-2">
                      {/* Visualizações */}
                      <div className="flex flex-col items-center min-w-0 flex-1">
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 mb-0.5" />
                        <p className="text-xs text-gray-500 text-center">Visualizações</p>
                        <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{stats.totalViews}</p>
                      </div>
                      
                      {/* Recomendações */}
                      <div className="flex flex-col items-center min-w-0 flex-1">
                        <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 mb-0.5" />
                        <p className="text-xs text-gray-500 text-center">Recomendações</p>
                        <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{stats.totalRecommendations}</p>
                      </div>
                      
                      {/* Avaliações */}
                      <div className="flex flex-col items-center min-w-0 flex-1">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 mb-0.5" />
                        <p className="text-xs text-gray-500 text-center">Avaliações</p>
                        <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{stats.totalReviews}</p>
                      </div>
                      
                      {/* Nota Média */}
                      {isProfessional && stats.averageRating > 0 && (
                        <div className="flex flex-col items-center min-w-0 flex-1">
                          <Target className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 mb-0.5" />
                          <p className="text-xs text-gray-500 text-center">Nota Média</p>
                          <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{stats.averageRating.toFixed(1)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

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
              </>
            )}

            {activeTab === 'reviews' && (
              <Card className="mb-8">
                <CardHeader>
                  <div>
                    <CardTitle className="flex items-center">
                      <Star className="h-5 w-5 mr-2" />
                      Avaliações
                    </CardTitle>
                    <CardDescription>
                      {reviewsSubTab === 'received' 
                        ? `Avaliações que você recebeu (${stats.totalReviews})`
                        : `Avaliações que você fez (${stats.givenReviews})`
                      }
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Abas de Avaliações */}
                  <div className="mb-6">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex flex-wrap gap-2 sm:gap-4 lg:gap-8">
                        <button
                          onClick={() => setReviewsSubTab('received')}
                          className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                            reviewsSubTab === 'received'
                              ? 'border-gray-500 text-gray-900 dark:text-white'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Recebidas ({stats.totalReviews})</span>
                            <span className="sm:hidden">Rec. ({stats.totalReviews})</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setReviewsSubTab('given')}
                          className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                            reviewsSubTab === 'given'
                              ? 'border-gray-700 text-gray-900 dark:text-white'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Feitas ({stats.givenReviews})</span>
                            <span className="sm:hidden">Feitas ({stats.givenReviews})</span>
                          </div>
                        </button>
                      </nav>
                    </div>
                  </div>

                  {/* Filtros */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar por nome..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={filterType} onValueChange={(value: 'all' | 'professional' | 'client') => setFilterType(value)}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="professional">Profissionais</SelectItem>
                        <SelectItem value="client">Clientes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {filteredReviews.length > 0 ? (
                    <div className="space-y-4">
                      {filteredReviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start space-x-3 sm:space-x-4">
                            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                              <AvatarImage src={reviewsSubTab === 'received' ? review.reviewer.avatar_url || '' : review.reviewed.avatar_url || ''} alt={`Avatar de ${reviewsSubTab === 'received' ? review.reviewer.full_name : review.reviewed.full_name}`} />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {(reviewsSubTab === 'received' ? review.reviewer.full_name : review.reviewed.full_name).charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                    {reviewsSubTab === 'received' ? review.reviewer.full_name : review.reviewed.full_name}
                                  </h4>
                                  <div className="flex items-center space-x-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                      {(reviewsSubTab === 'received' ? review.reviewer.user_type : review.reviewed.user_type) === 'professional' ? 'Profissional' : 'Cliente'}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(review.created_at)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-wrap">
                                  <StarRating
                                    rating={review.rating_person || 0}        
                                    size="sm"
                                    variant="compact"
                                    showValue={true}
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleContactUser(reviewsSubTab === 'received' ? review.reviewer.id : review.reviewed.id, reviewsSubTab === 'received' ? review.reviewer.full_name : review.reviewed.full_name)}
                                    className="text-xs sm:text-sm"
                                  >
                                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    <span className="hidden sm:inline">Contatar</span>
                                    <span className="sm:hidden">Chat</span>
                                  </Button>
                                </div>
                              </div>
                              
                              {review.comment_person && (
                                <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-3 rounded-md break-words">
                                  "{review.comment_person}"
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {searchTerm || filterType !== 'all' ? 'Nenhuma avaliação encontrada' : 'Nenhuma avaliação ainda'}
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm || filterType !== 'all' 
                          ? 'Tente ajustar os filtros de busca.'
                          : 'Você ainda não recebeu avaliações. Continue usando a plataforma!'
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'recommendations' && (
              <Card className="mb-8">
                <CardHeader>
                  <div>
                    <CardTitle className="flex items-center">
                      <ThumbsUp className="h-5 w-5 mr-2" />
                      Recomendações
                    </CardTitle>
                    <CardDescription>
                      {recommendationsSubTab === 'received' 
                        ? `Recomendações que você recebeu (${stats.totalRecommendations})`
                        : `Recomendações que você fez (${stats.givenRecommendations})`
                      }
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Abas de Recomendações */}
                  <div className="mb-6">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex flex-wrap gap-2 sm:gap-4 lg:gap-8">
                        <button
                          onClick={() => setRecommendationsSubTab('received')}
                          className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                            recommendationsSubTab === 'received'
                              ? 'border-gray-500 text-gray-900 dark:text-white'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-1 sm:gap-2">
                            <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Recebidas ({stats.totalRecommendations})</span>
                            <span className="sm:hidden">Rec. ({stats.totalRecommendations})</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setRecommendationsSubTab('given')}
                          className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                            recommendationsSubTab === 'given'
                              ? 'border-gray-700 text-gray-900 dark:text-white'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Feitas ({stats.givenRecommendations})</span>
                            <span className="sm:hidden">Feitas ({stats.givenRecommendations})</span>
                          </div>
                        </button>
                      </nav>
                    </div>
                  </div>

                  {/* Filtros */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar por nome..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={filterType} onValueChange={(value: 'all' | 'professional' | 'client') => setFilterType(value)}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="professional">Profissionais</SelectItem>
                        <SelectItem value="client">Clientes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {filteredRecommendations.length > 0 ? (
                    <div className="space-y-4">
                      {filteredRecommendations.map((rec) => (
                        <div key={rec.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start space-x-3 sm:space-x-4">
                            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                              <AvatarImage src={recommendationsSubTab === 'received' ? rec.recommender.avatar_url || '' : rec.recommended.avatar_url || ''} alt={`Avatar de ${recommendationsSubTab === 'received' ? rec.recommender.full_name : rec.recommended.full_name}`} />
                              <AvatarFallback className="bg-green-100 text-green-600">
                                {(recommendationsSubTab === 'received' ? rec.recommender.full_name : rec.recommended.full_name).charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                    {recommendationsSubTab === 'received' ? rec.recommender.full_name : rec.recommended.full_name}
                                  </h4>
                                  <div className="flex items-center space-x-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                      {(recommendationsSubTab === 'received' ? rec.recommender.user_type : rec.recommended.user_type) === 'professional' ? 'Profissional' : 'Cliente'}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(rec.created_at)}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 flex-wrap">
                                  <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                                  <span className="text-xs sm:text-sm text-green-600 font-medium">
                                    {recommendationsSubTab === 'received' ? 'Recomendou' : 'Recomendado'}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleContactUser(recommendationsSubTab === 'received' ? rec.recommender.id : rec.recommended.id, recommendationsSubTab === 'received' ? rec.recommender.full_name : rec.recommended.full_name)}
                                    className="text-xs sm:text-sm"
                                  >
                                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    <span className="hidden sm:inline">Contatar</span>
                                    <span className="sm:hidden">Chat</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ThumbsUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {searchTerm || filterType !== 'all' ? 'Nenhuma recomendação encontrada' : 'Nenhuma recomendação ainda'}
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm || filterType !== 'all' 
                          ? 'Tente ajustar os filtros de busca.'
                          : 'Continue se destacando para receber recomendações!'
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Crescimento da Reputação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Avaliações este mês</span>
                        <span className="font-semibold">{stats.totalReviews}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Recomendações este mês</span>
                        <span className="font-semibold">{stats.totalRecommendations}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Visualizações este mês</span>
                        <span className="font-semibold">{stats.totalViews}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2" />
                      Dicas para Melhorar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Seja ativo na plataforma</p>
                          <p className="text-xs text-gray-600">Interaja com outros usuários</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Complete seu perfil</p>
                          <p className="text-xs text-gray-600">Adicione informações detalhadas</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Seja responsivo</p>
                          <p className="text-xs text-gray-600">Responda mensagens rapidamente</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </ClientOnly>
  )
}
