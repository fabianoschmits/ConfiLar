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
  const [mounted, setMounted] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const loadStats = useCallback(async () => {
    if (!currentUser?.id) return

    try {
      const reviewStats = await fetchUserReviewStats(currentUser.id)
      setStats(reviewStats)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }, [currentUser?.id, fetchUserReviewStats])

  // Carregar dados iniciais - removendo dependências que causam loop
  useEffect(() => {
    if (currentUser?.id && mounted) {
      loadReviews()
      loadStats()
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
    loadStats()
  }

  if (loading || isLoadingData) {
    return (
      <MainLayout requireAuth={true}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
              <RefreshCw className="h-6 w-6 animate-spin text-black" />
              <span className="font-black text-black">CARREGANDO AVALIAÇÕES...</span>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!mounted) {
    return (
      <MainLayout requireAuth={true}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 inline-block">
              <h1 className="text-2xl font-black text-black mb-4">
                CARREGANDO...
              </h1>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho Brutalista */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
              <h1 className="text-3xl font-black text-black mb-2">⭐ AVALIAÇÕES</h1>
              <p className="text-black font-bold">GERENCIE SUAS AVALIAÇÕES E FEEDBACK</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black px-6 py-3"
            >
              <Plus className="h-4 w-4 mr-2" />
              NOVA AVALIAÇÃO
            </Button>
          </div>
        </div>

        {/* Como Funciona o Sistema - Brutalista */}
        <div className="mb-8 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-yellow-400 border-b-4 border-black p-4">
            <div className="flex items-center gap-3">
              <Info className="h-6 w-6 text-black" />
              <h2 className="text-xl font-black text-black uppercase">
                COMO FUNCIONA O SISTEMA DE AVALIAÇÕES
              </h2>
            </div>
            <p className="text-black font-bold mt-2">
              ENTENDA COMO VOCÊ PODE AVALIAR OUTROS USUÁRIOS E RECEBER AVALIAÇÕES.
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Passo 1 */}
              <div className="bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-sm font-black">
                    1
                  </div>
                  <h3 className="font-black text-black uppercase">INICIE UMA CONVERSA</h3>
                </div>
                <p className="text-sm text-black font-bold mb-3">
                  ENTRE EM CONTATO COM OUTRO USUÁRIO ATRAVÉS DO CHAT PARA DISCUTIR SERVIÇOS.
                </p>
                <div className="flex items-center gap-2 text-xs text-black font-black">
                  <Handshake className="w-4 h-4" />
                  <span>CONVERSE SOBRE O SERVIÇO</span>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-sm font-black">
                    2
                  </div>
                  <h3 className="font-black text-black uppercase">FAÇA UM ACORDO</h3>
                </div>
                <p className="text-sm text-black font-bold mb-3">
                  UM DOS USUÁRIOS PROPÕE UM ACORDO DE CONTATO. O OUTRO PODE ACEITAR OU REJEITAR.
                </p>
                <div className="flex items-center gap-2 text-xs text-black font-black">
                  <Clock className="w-4 h-4" />
                  <span>AGUARDE A RESPOSTA</span>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-sm font-black">
                    3
                  </div>
                  <h3 className="font-black text-black uppercase">AVALIE APÓS O SERVIÇO</h3>
                </div>
                <p className="text-sm text-black font-bold mb-3">
                  APÓS 1 DIA DO ACORDO ACEITO, AMBOS PODEM AVALIAR A EXPERIÊNCIA.
                </p>
                <div className="flex items-center gap-2 text-xs text-black font-black">
                  <CheckCircle className="w-4 h-4" />
                  <span>DEIXE SUA AVALIAÇÃO</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-red-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-white mt-0.5" />
                <div>
                  <h4 className="font-black text-white mb-1 uppercase">
                    REGRAS IMPORTANTES:
                  </h4>
                  <ul className="text-sm text-white font-bold space-y-1">
                    <li>• VOCÊ SÓ PODE AVALIAR USUÁRIOS COM QUEM TEVE UM ACORDO ACEITO</li>
                    <li>• É NECESSÁRIO AGUARDAR 1 DIA APÓS O ACORDO PARA PODER AVALIAR</li>
                    <li>• CADA USUÁRIO PODE AVALIAR O OUTRO APENAS UMA VEZ POR ACORDO</li>
                    <li>• AS AVALIAÇÕES AJUDAM A CONSTRUIR CONFIANÇA NA PLATAFORMA</li>
                    <li>• OS DADOS DE CONTATO SÃO SEMPRE VISÍVEIS</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="mb-8">
            <ReviewStats stats={stats} />
          </div>
        )}

        {/* Filtros e Busca - Brutalista */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={`font-black border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all ${
                filter === 'all' 
                  ? 'bg-black text-yellow-400' 
                  : 'bg-white text-black hover:bg-yellow-400'
              }`}
            >
              TODAS
            </Button>
            <Button
              variant={filter === 'received' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('received')}
              className={`font-black border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all ${
                filter === 'received' 
                  ? 'bg-black text-yellow-400' 
                  : 'bg-white text-black hover:bg-yellow-400'
              }`}
            >
              RECEBIDAS ({reviews.filter(review => review.reviewed_id === currentUser?.id).length})
            </Button>
            <Button
              variant={filter === 'given' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('given')}
              className={`font-black border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all ${
                filter === 'given' 
                  ? 'bg-black text-yellow-400' 
                  : 'bg-white text-black hover:bg-yellow-400'
              }`}
            >
              ENVIADAS ({reviews.filter(review => review.reviewer_id === currentUser?.id).length})
            </Button>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
            <Input
              placeholder="BUSCAR AVALIAÇÕES..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-black placeholder:text-gray-500 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
            />
          </div>
        </div>

        {/* Lista de Avaliações */}
        <div className="space-y-4">
          {getFilteredReviews().length === 0 ? (
            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
              <Star className="h-12 w-12 text-black mx-auto mb-4" />
              <h3 className="text-lg font-black text-black mb-2 uppercase">
                NENHUMA AVALIAÇÃO ENCONTRADA
              </h3>
              <p className="text-black font-bold mb-4">
                {filter === 'all' 
                  ? 'VOCÊ AINDA NÃO TEM AVALIAÇÕES.'
                  : filter === 'received'
                  ? 'VOCÊ AINDA NÃO RECEBEU AVALIAÇÕES.'
                  : 'VOCÊ AINDA NÃO ENVIOU AVALIAÇÕES.'
                }
              </p>
              {filter === 'given' && (
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  CRIAR PRIMEIRA AVALIAÇÃO
                </Button>
              )}
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

        {/* Modal de Criação de Avaliação - Brutalista */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

        {/* Modal de Edição de Avaliação - Brutalista */}
        {editingReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-black text-black mb-4 uppercase">EDITAR AVALIAÇÃO</h2>
                <p className="text-black font-bold mb-4">
                  EDIÇÃO DE AVALIAÇÕES SERÁ IMPLEMENTADA EM BREVE.
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setEditingReview(null)}
                    className="bg-white text-black border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                  >
                    FECHAR
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
