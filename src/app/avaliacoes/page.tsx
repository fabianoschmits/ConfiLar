'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Star, Search, Plus, RefreshCw, Info, Handshake, Clock, CheckCircle } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSupabaseReviews, ReviewWithProfiles, ReviewStats as ReviewStatsType } from '@/hooks/useSupabaseReviews'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { ReviewStats } from '@/components/reviews/ReviewStats'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { toast } from 'sonner'

export default function AvaliacoesPage() {
  const { profile: currentUser } = useAuthContext()
  const [filter, setFilter] = useState<'all' | 'received' | 'given'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; avatar?: string } | null>(null)
  const [editingReview, setEditingReview] = useState<ReviewWithProfiles | null>(null)

  const {
    reviews,
    loading,
    fetchUserReviews,
    fetchUserReviewStats,
    deleteReview,
    respondToReview
  } = useSupabaseReviews()

  const [stats, setStats] = useState<ReviewStatsType | null>(null)

  const loadReviews = useCallback(async () => {
    if (!currentUser?.id) return

    try {
      // Carregar avaliações recebidas
      await fetchUserReviews(currentUser.id, 'received')
      
      // Carregar avaliações dadas
      await fetchUserReviews(currentUser.id, 'given')
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
      toast.error('Erro ao carregar avaliações')
    }
  }, [currentUser?.id, fetchUserReviews])

  const loadStats = useCallback(async () => {
    if (!currentUser?.id) return

    try {
      const reviewStats = await fetchUserReviewStats(currentUser.id)
      setStats(reviewStats)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }, [currentUser?.id, fetchUserReviewStats])

  // Carregar dados iniciais
  useEffect(() => {
    if (currentUser?.id) {
      loadReviews()
      loadStats()
    }
  }, [currentUser?.id, loadReviews, loadStats])

  const handleEditReview = (review: ReviewWithProfiles) => {
    setEditingReview(review)
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return

    try {
      const { error } = await deleteReview(reviewId)
      if (error) {
        toast.error('Erro ao excluir avaliação: ' + error)
        return
      }
      toast.success('Avaliação excluída com sucesso!')
      loadReviews()
    } catch {
      toast.error('Erro ao excluir avaliação')
    }
  }

  const handleRespondToReview = async (reviewId: string, response: string) => {
    try {
      const { error } = await respondToReview(reviewId, response)
      if (error) {
        toast.error('Erro ao responder avaliação: ' + error)
        return
      }
      loadReviews()
    } catch {
      toast.error('Erro ao responder avaliação')
    }
  }


  const getFilteredReviews = () => {
    let filteredReviews: ReviewWithProfiles[] = []

    switch (filter) {
      case 'received':
        filteredReviews = reviews.filter(review => review.reviewed_id === currentUser?.id)
        break
      case 'given':
        filteredReviews = reviews.filter(review => review.reviewer_id === currentUser?.id)
        break
      default:
        filteredReviews = reviews
    }

    if (searchTerm) {
      filteredReviews = filteredReviews.filter(review =>
        review.reviewer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.reviewed.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filteredReviews.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  const handleCreateReviewSuccess = () => {
    setShowCreateForm(false)
    setSelectedUser(null)
    loadReviews()
    loadStats()
  }

  if (loading && !stats) {
    return (
      <MainLayout requireAuth={true}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span>Carregando avaliações...</span>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Avaliações</h1>
              <p className="text-gray-600">Gerencie suas avaliações e feedback</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Avaliação
            </Button>
          </div>
        </div>

        {/* Como Funciona o Sistema */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <Info className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-blue-900 mb-2">
                  Como Funciona o Sistema de Avaliações
                </h2>
                <p className="text-blue-800 mb-4">
                  Entenda como você pode avaliar outros usuários e receber avaliações.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Passo 1 */}
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <h3 className="font-semibold text-gray-900">Inicie uma Conversa</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Entre em contato com outro usuário através do chat para discutir serviços.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Handshake className="w-4 h-4" />
                  <span>Converse sobre o serviço</span>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <h3 className="font-semibold text-gray-900">Faça um Acordo</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Um dos usuários propõe um acordo de contato. O outro pode aceitar ou rejeitar.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Aguarde a resposta</span>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <h3 className="font-semibold text-gray-900">Avalie Após o Serviço</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Após 1 dia do acordo aceito, ambos podem avaliar a experiência.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle className="w-4 h-4" />
                  <span>Deixe sua avaliação</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">
                    Regras Importantes:
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Você só pode avaliar usuários com quem teve um acordo aceito</li>
                    <li>• É necessário aguardar 1 dia após o acordo para poder avaliar</li>
                    <li>• Cada usuário pode avaliar o outro apenas uma vez por acordo</li>
                    <li>• As avaliações ajudam a construir confiança na plataforma</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        {stats && (
          <div className="mb-8">
            <ReviewStats stats={stats} />
          </div>
        )}

        {/* Filtros e Busca */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas
            </Button>
            <Button
              variant={filter === 'received' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('received')}
            >
              Recebidas ({reviews.filter(review => review.reviewed_id === currentUser?.id).length})
            </Button>
            <Button
              variant={filter === 'given' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('given')}
            >
              Enviadas ({reviews.filter(review => review.reviewer_id === currentUser?.id).length})
            </Button>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar avaliações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Avaliações */}
        <div className="space-y-4">
          {getFilteredReviews().length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma avaliação encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'all' 
                    ? 'Você ainda não tem avaliações.'
                    : filter === 'received'
                    ? 'Você ainda não recebeu avaliações.'
                    : 'Você ainda não enviou avaliações.'
                  }
                </p>
                {filter === 'given' && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Avaliação
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            getFilteredReviews().map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={currentUser?.id}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
                onRespond={handleRespondToReview}
                showActions={true}
              />
            ))
          )}
        </div>

        {/* Modal de Criação de Avaliação */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <ReviewForm
                reviewerId={currentUser?.id || ''}
                reviewedId={selectedUser?.id || ''}
                reviewedName={selectedUser?.name || ''}
                reviewedAvatar={selectedUser?.avatar}
                onSuccess={handleCreateReviewSuccess}
                onCancel={() => {
                  setShowCreateForm(false)
                  setSelectedUser(null)
                }}
              />
            </div>
          </div>
        )}

        {/* Modal de Edição de Avaliação */}
        {editingReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Editar Avaliação</h2>
                <p className="text-gray-600 mb-4">
                  Edição de avaliações será implementada em breve.
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setEditingReview(null)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
