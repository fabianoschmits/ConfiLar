'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Star, Search, Plus, RefreshCw, Info, Handshake, Clock, CheckCircle, ChevronDown } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSupabaseReviews, ReviewWithProfiles } from '@/hooks/useSupabaseReviews'
import { useContactAgreements } from '@/hooks/useContactAgreements'
import { useReviewNotificationMonitor } from '@/hooks/useReviewNotificationMonitor'
import { supabase } from '@/lib/supabase'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { TimeCounter } from '@/components/ui/TimeCounter'
import { toast } from 'sonner'

export default function AvaliacoesPage() {
  const [mounted, setMounted] = useState(false)
  const { profile: currentUser } = useAuthContext()
  const [filter, setFilter] = useState<'all' | 'received' | 'given'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; avatar?: string; userType?: 'client' | 'professional' } | null>(null)
  const [editingReview, setEditingReview] = useState<ReviewWithProfiles | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isHowItWorksExpanded, setIsHowItWorksExpanded] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const {
    reviews,
    loading,
    fetchUserReviews,
    deleteReview,
    respondToReview
  } = useSupabaseReviews()

  const { canReviewUser } = useContactAgreements()

  // Monitorar notificações de avaliação disponível
  useReviewNotificationMonitor()

  const [reviewableUsers, setReviewableUsers] = useState<Array<{
    id: string
    name: string
    avatar?: string
    userType?: 'client' | 'professional'
    timeRemaining?: number
    reviewAvailableAt?: string
    agreement?: any
    canReview?: boolean
    hasReviewed?: boolean
  }>>([])

  const loadReviewableUsers = useCallback(async () => {
    if (!currentUser?.id) return

    try {
      // Buscar usuários com quem há acordos aceitos
      const { data: agreements, error } = await supabase
        .from('contact_agreements')
        .select(`
          *,
          client:profiles!client_id(id, full_name, avatar_url),
          professional:profiles!professional_id(id, full_name, avatar_url)
        `)
        .or(`client_id.eq.${currentUser.id},professional_id.eq.${currentUser.id}`)
        .eq('status', 'accepted')

      if (error) {
        console.error('Erro ao carregar acordos:', error)
        return
      }

      const users: Array<{
        id: string
        name: string
        avatar?: string
        userType?: 'client' | 'professional'
        timeRemaining?: number
        reviewAvailableAt?: string
        agreement?: any
        canReview?: boolean
        hasReviewed?: boolean
      }> = []

      for (const agreement of agreements || []) {
        const otherUserId = agreement.client_id === currentUser.id 
          ? agreement.professional_id 
          : agreement.client_id
        
        const otherUser = agreement.client_id === currentUser.id 
          ? agreement.professional 
          : agreement.client

        if (otherUser) {
          const reviewStatus = await canReviewUser(otherUserId)
          
          // Verificar se já existe avaliação para este usuário
          const { data: existingReview } = await supabase
            .from('reviews')
            .select('id')
            .eq('reviewer_id', currentUser.id)
            .eq('reviewed_id', otherUserId)
            .single()
          
          const hasReviewed = !!existingReview
          
          users.push({
            id: otherUserId,
            name: otherUser.full_name || 'Usuário',
            avatar: otherUser.avatar_url,
            userType: otherUser.user_type,
            timeRemaining: reviewStatus.timeRemaining,
            reviewAvailableAt: reviewStatus.agreement?.review_available_at,
            agreement: reviewStatus.agreement,
            canReview: reviewStatus.canReview && !hasReviewed,
            hasReviewed: hasReviewed
          })
        }
      }

      setReviewableUsers(users)
    } catch (error) {
      console.error('Erro ao carregar usuários avaliáveis:', error)
    }
  }, [currentUser?.id, canReviewUser])

  // Função para recarregar usuários quando o tempo expirar
  const handleTimeExpired = useCallback(() => {
    loadReviewableUsers()
  }, [loadReviewableUsers])

  const loadReviews = useCallback(async () => {
    if (!currentUser?.id) return

    try {
      setIsLoadingData(true)
      // Carregar avaliações recebidas
      await fetchUserReviews(currentUser.id, 'received')
      
      // Carregar avaliações dadas
      await fetchUserReviews(currentUser.id, 'given')
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
      toast.error('Erro ao carregar avaliações')
    } finally {
      setIsLoadingData(false)
    }
  }, [currentUser?.id, fetchUserReviews])


  // Carregar dados iniciais - removendo dependências que causam loop
  useEffect(() => {
    if (currentUser?.id && mounted) {
      loadReviews()
      loadReviewableUsers()
    }
  }, [currentUser?.id, mounted]) // Removendo loadReviews e loadStats das dependências

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
    loadReviewableUsers() // Recarregar usuários para atualizar status
  }

  if (loading || isLoadingData) {
    return (
      <MainLayout requireAuth={true}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="modern-card p-6 flex items-center space-x-3">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-gray-700 font-medium">Carregando avaliações...</span>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!mounted) {
    return (
      <MainLayout requireAuth={true}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="modern-card p-8 inline-block">
              <h1 className="modern-heading-2 text-gray-900 mb-4">
                Carregando...
              </h1>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho Moderno */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="modern-heading-1 text-gray-900 mb-2 flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-500" />
              Avaliações
            </h1>
            <p className="modern-body text-gray-600">
              Gerencie suas avaliações e feedback de serviços prestados
            </p>
          </div>
        </div>

        {/* Como Funciona o Sistema - Moderno */}
        <div className="mb-8 modern-card">
          <button
            onClick={() => setIsHowItWorksExpanded(!isHowItWorksExpanded)}
            className="w-full border-b border-gray-200 px-6 py-4 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-blue-600" />
                <h2 className="modern-heading-3 text-gray-900">
                  Como funciona o sistema de avaliações
                </h2>
              </div>
              <ChevronDown 
                className={`h-5 w-5 text-blue-600 transition-transform duration-200 ${
                  isHowItWorksExpanded ? 'transform rotate-180' : ''
                }`}
              />
            </div>
            <p className="modern-body text-gray-600 mt-2 text-left">
              Entenda como você pode avaliar outros usuários e receber avaliações.
            </p>
          </button>
          
          {isHowItWorksExpanded && (
            <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Passo 1 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <h3 className="font-semibold text-gray-900">Inicie uma conversa</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  Entre em contato com outro usuário através do chat para discutir serviços.
                </p>
                <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                  <Handshake className="w-4 h-4" />
                  <span>Converse sobre o serviço</span>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <h3 className="font-semibold text-gray-900">Faça um acordo</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  Um dos usuários propõe um acordo de contato. O outro pode aceitar ou rejeitar.
                </p>
                <div className="flex items-center gap-2 text-xs text-amber-600 font-medium">
                  <Clock className="w-4 h-4" />
                  <span>Aguarde a resposta</span>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <h3 className="font-semibold text-gray-900">Avalie após o serviço</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  Após 20 horas do acordo aceito, ambos podem avaliar a experiência.
                </p>
                <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Deixe sua avaliação</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-orange-900 mb-2">
                    Regras importantes:
                  </h4>
                  <ul className="text-sm text-orange-800 space-y-1 leading-relaxed">
                    <li>• Você só pode avaliar usuários com quem teve um acordo aceito</li>
                    <li>• É necessário aguardar 20 horas após o acordo para poder avaliar</li>
                    <li>• Cada usuário pode avaliar o outro apenas uma vez por acordo</li>
                    <li>• As avaliações ajudam a construir confiança na plataforma</li>
                    <li>• Os dados de contato são sempre visíveis</li>
                  </ul>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>

        {/* Seção de Usuários que Podem ser Avaliados */}
        {reviewableUsers.length > 0 && (
          <div className="mb-8 modern-card">
            <div className="border-b border-gray-200 px-6 py-4 bg-green-50">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-green-600" />
                <h2 className="modern-heading-3 text-gray-900">Usuários disponíveis para avaliação</h2>
              </div>
              <p className="modern-body text-gray-600 mt-2">
                Estes usuários têm acordos aceitos com você e podem ser avaliados:
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {reviewableUsers.map((user) => (
                  <div key={user.id} className="modern-card p-4">
                    <div className="flex items-center gap-4">
                      {/* Foto do usuário */}
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-blue-200">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-blue-600 font-semibold text-xl">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      {/* Informações do usuário */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
                        <p className="text-gray-600 text-sm">
                          Acordo aceito - {user.agreement?.service_description || 'Serviço'}
                        </p>
                      </div>
                      
                      {/* Contador de tempo ou botão de avaliar */}
                      <div className="flex-shrink-0">
                        {user.reviewAvailableAt ? (
                          <TimeCounter
                            targetDate={user.reviewAvailableAt}
                            onExpired={handleTimeExpired}
                            onReviewClick={() => {
                              if (user.canReview) {
                                setSelectedUser(user)
                                setShowCreateForm(true)
                              } else {
                                toast.error('Aguarde o tempo necessário para poder avaliar este usuário.')
                              }
                            }}
                            className="min-w-[160px]"
                          />
                        ) : user.hasReviewed ? (
                          <div className="space-y-2">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 min-w-[160px]">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-blue-800 text-sm">Avaliado</span>
                              </div>
                              <p className="text-blue-700 font-medium text-sm">
                                Você já avaliou!
                              </p>
                            </div>
                            <div className="text-center text-xs text-gray-500 pt-1">
                              Exclua a avaliação para avaliar novamente
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 min-w-[160px]">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-800 text-sm">Disponível</span>
                              </div>
                              <p className="text-green-700 font-medium text-sm">
                                Pode avaliar agora!
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                if (user.canReview) {
                                  setSelectedUser({
                                    id: user.id,
                                    name: user.name,
                                    avatar: user.avatar,
                                    userType: user.userType
                                  })
                                  setShowCreateForm(true)
                                } else {
                                  toast.error('Aguarde o tempo necessário para poder avaliar este usuário.')
                                }
                              }}
                              disabled={!user.canReview}
                              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                user.canReview 
                                  ? 'bg-green-600 text-white hover:bg-green-700' 
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              <Star className="h-4 w-4" />
                              Avaliar agora
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {/* Filtros e Busca - Moderno */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('received')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'received' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Recebidas ({reviews.filter(review => review.reviewed_id === currentUser?.id).length})
            </button>
            <button
              onClick={() => setFilter('given')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'given' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Enviadas ({reviews.filter(review => review.reviewer_id === currentUser?.id).length})
            </button>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Buscar avaliações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="modern-input pl-10 w-full"
            />
          </div>
        </div>

        {/* Lista de Avaliações */}
        <div className="space-y-4">
          {getFilteredReviews().length === 0 ? (
            <div className="modern-card p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="modern-heading-3 text-gray-900 mb-2">
                Nenhuma avaliação encontrada
              </h3>
              <p className="modern-body text-gray-600">
                {filter === 'all' 
                  ? 'Você ainda não tem avaliações.'
                  : filter === 'received'
                  ? 'Você ainda não recebeu avaliações.'
                  : 'Você ainda não enviou avaliações.'
                }
              </p>
            </div>
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

        {/* Modal de Criação de Avaliação - Moderno */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <ReviewForm
                reviewerId={currentUser?.id || ''}
                reviewedId={selectedUser?.id || ''}
                reviewedName={selectedUser?.name || ''}
                reviewedAvatar={selectedUser?.avatar}
                reviewedUserType={selectedUser?.userType}
                onSuccess={handleCreateReviewSuccess}
                onCancel={() => {
                  setShowCreateForm(false)
                  setSelectedUser(null)
                }}
              />
            </div>
          </div>
        )}

        {/* Modal de Edição de Avaliação - Moderno */}
        {editingReview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <ReviewForm
                reviewerId={currentUser?.id || ''}
                reviewedId={editingReview.reviewed.id}
                reviewedName={editingReview.reviewed.full_name}
                reviewedAvatar={editingReview.reviewed.avatar_url}
                reviewedUserType={editingReview.reviewed.user_type}
                editingReview={editingReview}
                isEditing={true}
                onSuccess={() => {
                  setEditingReview(null)
                  loadReviews() // Recarregar as avaliações
                }}
                onCancel={() => setEditingReview(null)}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
