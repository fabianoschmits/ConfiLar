'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { X, ThumbsUp, User, MapPin, Star, Heart, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/database'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { useAutoNotifications } from '@/hooks/useAutoNotifications'

interface RecommendationModalProps {
  userId: string
  userName: string
  isOpen: boolean
  onClose: () => void
}

interface RecommendationWithProfile {
  id: string
  recommender_id: string
  recommended_id: string
  recommendation_type: string
  created_at: string
  recommender: Profile
}

export function RecommendationModal({ 
  userId, 
  userName,
  isOpen, 
  onClose
}: RecommendationModalProps) {
  const { user, profile } = useAuthContext()
  const [recommendations, setRecommendations] = useState<RecommendationWithProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [recommending, setRecommending] = useState(false)
  
  // Hook para notificações automáticas
  const { createRecommendationPost } = useAutoNotifications()

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

  const handleRecommendUser = async () => {
    if (!user) {
      toast.error('Faça login para recomendar usuários')
      return
    }

    if (user.id === userId) {
      toast.error('Você não pode se recomendar')
      return
    }

    try {
      setRecommending(true)
      
      // Verificar se já existe uma recomendação
      const { data: existingRecommendation } = await supabase
        .from('user_recommendations')
        .select('id')
        .eq('recommender_id', user.id)
        .eq('recommended_id', userId)
        .single()

      if (existingRecommendation) {
        toast.info('Você já recomendou este usuário!')
        return
      }
      
      // Determinar o tipo de recomendação baseado no tipo do usuário atual
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .maybeSingle()

      const recommendationType = currentUserProfile?.user_type === 'professional' 
        ? 'professional_to_client' 
        : 'client_to_professional'

      const { error } = await supabase
        .from('user_recommendations')
        .insert({
          recommender_id: user.id,
          recommended_id: userId,
          recommendation_type: recommendationType
        })

      if (error) {
        if (error.code === '23505') { // Violação de constraint única
          toast.info('Você já recomendou este usuário!')
        } else {
          throw error
        }
        return
      }

      toast.success(`Você recomendou ${userName}!`)
      
      // Criar post automático no feed social
      try {
        if (profile?.full_name) {
          console.log('💡 Criando post automático de recomendação...')
          await createRecommendationPost(
            user.id,
            profile.full_name,
            userId,
            userName
          )
          console.log('✅ Post de recomendação criado com sucesso!')
        }
      } catch (postError) {
        console.error('⚠️ Erro ao criar post de recomendação:', postError)
        // Não falhar a operação se o post não for criado
      }
      
      loadRecommendations() // Recarregar a lista
    } catch (error) {
      console.error('Erro ao recomendar usuário:', error)
      toast.error('Erro ao recomendar usuário')
    } finally {
      setRecommending(false)
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
        return 'bg-blue-500 text-white'
      case 'client_to_professional':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-xl shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <ThumbsUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Recomendações</h3>
              <p className="text-sm text-gray-600">Recomendar e ver quem recomendou {userName}</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Conteúdo em uma única página */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Seção: Recomendar Usuário */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Recomendar {userName}</h4>
                <p className="text-sm text-gray-600">Mostre seu apoio recomendando este usuário</p>
              </div>
            </div>
            
            <Button
              onClick={handleRecommendUser}
              disabled={recommending || user?.id === userId}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {recommending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Recomendando...
                </>
              ) : (
                <>
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Recomendar Usuário
                </>
              )}
            </Button>
            
            {user?.id === userId && (
              <p className="text-sm text-gray-500 mt-3 text-center">
                Você não pode se recomendar
              </p>
            )}
          </div>

          {/* Seção: Quem Recomendou */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Eye className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">
                Quem recomendou {userName} ({recommendations.length})
              </h4>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ThumbsUp className="h-8 w-8 text-gray-400" />
                </div>
                <h5 className="text-lg font-medium text-gray-900 mb-2">Nenhuma recomendação ainda</h5>
                <p className="text-sm text-gray-600">Seja o primeiro a recomendar este usuário!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 border-2 border-gray-200">
                        <AvatarImage src={rec.recommender.avatar_url || ''} alt={`Avatar de ${rec.recommender.full_name}`} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                          {rec.recommender.full_name?.charAt(0) || <User className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium text-gray-900 truncate">
                            {rec.recommender.full_name || 'Usuário'}
                          </h5>
                          {rec.recommender.is_verified && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              <Star className="h-3 w-3" />
                              Verificado
                            </div>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            rec.recommendation_type === 'professional_to_client' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {getRecommendationTypeText(rec.recommendation_type)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
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
                          <span>{new Date(rec.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
