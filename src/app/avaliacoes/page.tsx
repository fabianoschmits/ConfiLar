'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Star, 
  Search, 
  Plus, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  MessageCircle,
  Calendar
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthContext } from '@/contexts/AuthContext'
import { useEvaluationRequests, EvaluationRequest } from '@/hooks/useEvaluationRequests'
import { useSupabaseReviews, ReviewWithProfiles } from '@/hooks/useSupabaseReviews'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'

export default function AvaliacoesPage() {
  const [mounted, setMounted] = useState(false)
  const { user, profile } = useAuthContext()
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; avatar?: string; userType?: 'client' | 'professional' } | null>(null)
  const [editingReview, setEditingReview] = useState<ReviewWithProfiles | null>(null)
  const [showEvaluationModal, setShowEvaluationModal] = useState(false)
  const [evaluationData, setEvaluationData] = useState({
    rating: 5,
    title: '',
    comment: '',
    isRecommended: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    requests,
    isLoading: requestsLoading,
    createRequest,
    acceptRequest,
    rejectRequest,
    completeRequest
  } = useEvaluationRequests()

  const {
    reviews,
    loading: reviewsLoading,
    fetchUserReviews,
    deleteReview,
    respondToReview
  } = useSupabaseReviews()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Carregar avaliações do usuário
  useEffect(() => {
    if (user?.id) {
      fetchUserReviews(user.id)
    }
  }, [user?.id, fetchUserReviews])

  if (!mounted) {
    return null
  }

  if (!user) {
    return (
      <MainLayout requireAuth={false}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Acesso Restrito
              </h2>
              <p className="text-gray-600 mb-4">
                Você precisa estar logado para acessar as avaliações.
              </p>
              <Button asChild>
                <a href="/auth">Fazer Login</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  // Filtrar solicitações
  const filteredRequests = requests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter
    const matchesSearch = searchTerm === '' || 
      request.requester_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.target_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  // Solicitações pendentes (recebidas)
  const pendingRequests = requests.filter(request => 
    request.target_id === user.id && request.status === 'pending'
  )

  // Solicitações aceitas (que podem ser avaliadas)
  const acceptedRequests = requests.filter(request => 
    request.status === 'accepted' && 
    (request.requester_id === user.id || request.target_id === user.id)
  )

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptRequest(requestId)
      toast.success('Solicitação aceita! Agora vocês podem se avaliar mutuamente.')
    } catch (error) {
      toast.error('Erro ao aceitar solicitação')
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectRequest(requestId)
      toast.success('Solicitação rejeitada')
    } catch (error) {
      toast.error('Erro ao rejeitar solicitação')
    }
  }

  const handleCompleteRequest = async (requestId: string) => {
    try {
      await completeRequest(requestId)
      toast.success('Avaliações concluídas!')
    } catch (error) {
      toast.error('Erro ao marcar como concluída')
    }
  }

  // Função para abrir modal de avaliação
  const handleOpenEvaluationModal = (request: EvaluationRequest) => {
    const otherUserId = request.requester_id === user.id ? request.target_id : request.requester_id
    const otherUserName = request.requester_id === user.id ? request.target_name : request.requester_name
    
    setSelectedUser({
      id: otherUserId,
      name: otherUserName || 'Usuário',
      avatar: request.requester_id === user.id ? request.target_avatar : request.requester_avatar
    })
    setShowEvaluationModal(true)
  }

  // Função para fechar modal
  const handleCloseEvaluationModal = () => {
    setShowEvaluationModal(false)
    setSelectedUser(null)
    setEvaluationData({
      rating: 5,
      title: '',
      comment: '',
      isRecommended: true
    })
  }

  // Função para submeter avaliação
  const handleSubmitEvaluation = async () => {
    if (!selectedUser || !user?.id) return

    try {
      setIsSubmitting(true)
      
      // Criar a avaliação no sistema de reviews
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: user.id,
          reviewed_id: selectedUser.id,
          rating_person: evaluationData.rating,
          title: evaluationData.title || null,
          comment: evaluationData.comment || null,
          is_recommended: evaluationData.isRecommended,
          review_type: 'professional',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Atualizar as estatísticas do usuário avaliado
      await updateUserRating(selectedUser.id)
      
      toast.success(`Avaliação enviada para ${selectedUser.name}!`)
      handleCloseEvaluationModal()
      
      // Recarregar dados
      fetchUserReviews(user.id)
      
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error)
      toast.error('Erro ao enviar avaliação')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para atualizar a avaliação do usuário
  const updateUserRating = async (userId: string) => {
    try {
      // Buscar todas as avaliações do usuário
      const { data: userReviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating_person')
        .eq('reviewed_id', userId)

      if (reviewsError) throw reviewsError

      if (userReviews && userReviews.length > 0) {
        // Calcular média das avaliações
        const totalRating = userReviews.reduce((sum, review) => sum + review.rating_person, 0)
        const averageRating = totalRating / userReviews.length

        // Atualizar o perfil do usuário com a nova avaliação
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            rating: Math.round(averageRating * 10) / 10, // Arredondar para 1 casa decimal
            total_reviews: userReviews.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (updateError) throw updateError
      }
    } catch (error) {
      console.error('Erro ao atualizar avaliação do usuário:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendente</Badge>
      case 'accepted':
        return <Badge variant="outline" className="text-green-600 border-green-600">Aceita</Badge>
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600">Rejeitada</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Concluída</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Avaliações</h1>
            <p className="text-gray-600">
              Gerencie suas solicitações de avaliação e visualize suas avaliações recebidas.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{acceptedRequests.length}</div>
                <div className="text-sm text-gray-600">Aceitas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{reviews.length}</div>
                <div className="text-sm text-gray-600">Avaliações Recebidas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{filteredRequests.length}</div>
                <div className="text-sm text-gray-600">Total de Solicitações</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todas
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pendentes
              </Button>
              <Button
                variant={filter === 'accepted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('accepted')}
              >
                Aceitas
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
              >
                Concluídas
              </Button>
            </div>
            
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Solicitações de Avaliação */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold text-gray-900">Solicitações de Avaliação</h2>
            
            {requestsLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma solicitação encontrada
                  </h3>
                  <p className="text-gray-600">
                    {filter === 'all' 
                      ? 'Você ainda não tem solicitações de avaliação.'
                      : `Nenhuma solicitação com status "${filter}" encontrada.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex -space-x-2">
                          <Avatar className="w-10 h-10 border-2 border-white">
                            <AvatarImage src={request.requester_avatar} />
                            <AvatarFallback>
                              {request.requester_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="w-10 h-10 border-2 border-white">
                            <AvatarImage src={request.target_avatar} />
                            <AvatarFallback>
                              {request.target_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {request.requester_id === user.id ? 'Você' : request.requester_name} 
                              {' '}↔️{' '}
                              {request.target_id === user.id ? 'Você' : request.target_name}
                            </h3>
                            {getStatusBadge(request.status)}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDistanceToNow(new Date(request.created_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {request.status === 'pending' && request.target_id === user.id && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAcceptRequest(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aceitar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectRequest(request.id)}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </>
                        )}
                        
                        {request.status === 'accepted' && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenEvaluationModal(request)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Avaliar
                          </Button>
                        )}
                        
                        {request.status === 'accepted' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCompleteRequest(request.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Concluir
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Avaliações Recebidas */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Avaliações Recebidas</h2>
            
            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : reviews.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma avaliação recebida
                  </h3>
                  <p className="text-gray-600">
                    Você ainda não recebeu avaliações de outros usuários.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onEdit={() => setEditingReview(review)}
                    onDelete={() => deleteReview(review.id)}
                    onRespond={(response) => respondToReview(review.id, response)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Avaliação Responsivo */}
      {showEvaluationModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            {/* Header do Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback>
                      {selectedUser.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Avaliar {selectedUser.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Deixe sua avaliação sobre o serviço
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseEvaluationModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-6">
              {/* Avaliação por Estrelas */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Avaliação (1-5 estrelas)
                </Label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEvaluationData(prev => ({ ...prev, rating: star }))}
                      className={`p-1 rounded-full transition-colors ${
                        star <= evaluationData.rating
                          ? 'text-yellow-400 hover:text-yellow-500'
                          : 'text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {evaluationData.rating} de 5 estrelas
                  </span>
                </div>
              </div>

              {/* Título da Avaliação */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Título da Avaliação (opcional)
                </Label>
                <Input
                  id="title"
                  value={evaluationData.title}
                  onChange={(e) => setEvaluationData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Excelente serviço!"
                  className="w-full"
                />
              </div>

              {/* Comentário */}
              <div className="space-y-2">
                <Label htmlFor="comment" className="text-sm font-medium text-gray-700">
                  Comentário
                </Label>
                <Textarea
                  id="comment"
                  value={evaluationData.comment}
                  onChange={(e) => setEvaluationData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Conte mais sobre sua experiência..."
                  rows={4}
                  className="w-full resize-none"
                />
              </div>

              {/* Recomendação */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Você recomendaria este profissional?
                </Label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setEvaluationData(prev => ({ ...prev, isRecommended: true }))}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      evaluationData.isRecommended
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Sim, recomendo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvaluationData(prev => ({ ...prev, isRecommended: false }))}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      !evaluationData.isRecommended
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Não recomendo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCloseEvaluationModal}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmitEvaluation}
                  disabled={isSubmitting || evaluationData.rating === 0}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Enviar Avaliação
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}