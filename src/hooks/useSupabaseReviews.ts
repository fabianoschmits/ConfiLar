import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

export type Review = Database['public']['Tables']['reviews']['Row']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update']

export interface ReviewWithProfiles extends Review {
  reviewer: {
    id: string
    full_name: string
    avatar_url?: string
    user_type: 'client' | 'professional'
  }
  reviewed: {
    id: string
    full_name: string
    avatar_url?: string
    user_type: 'client' | 'professional'
  }
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  recentReviews: ReviewWithProfiles[]
}

export function useSupabaseReviews() {
  const [reviews, setReviews] = useState<ReviewWithProfiles[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar avaliações de um usuário específico
  const fetchUserReviews = useCallback(async (userId: string, type: 'received' | 'given' = 'received') => {
    setLoading(true)
    setError(null)
    
    try {
      const column = type === 'received' ? 'reviewed_id' : 'reviewer_id'
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          reviewer_id,
          reviewed_id,
          rating_person,
          comment,
          created_at,
          reviewer:profiles!reviews_reviewer_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          ),
          reviewed:profiles!reviews_reviewed_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          )
        `)
        .eq(column, userId)
        .order('created_at', { ascending: false })
        .limit(20) // Limitar a 20 avaliações por vez

      console.log('📊 Hook useSupabaseReviews - Query executada:', { column, userId })
      console.log('📊 Hook useSupabaseReviews - Dados retornados:', data?.length || 0)
      console.log('📊 Hook useSupabaseReviews - Erro:', error)

      if (error) throw error
      setReviews(data as any || [])
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar estatísticas de avaliações de um usuário
  const fetchUserReviewStats = useCallback(async (userId: string): Promise<ReviewStats | null> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating_person, created_at')
        .eq('reviewed_id', userId)

      if (error) throw error

      if (!data || data.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          recentReviews: []
        }
      }

      // Calcular estatísticas
      const totalReviews = data.length
      const averageRating = data.reduce((sum, review) => sum + review.rating_person, 0) / totalReviews
      
      const ratingDistribution = data.reduce((acc, review) => {
        acc[review.rating_person as keyof typeof acc]++
        return acc
      }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })

      // Buscar avaliações recentes
      const recentReviewsData = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          ),
          reviewed:profiles!reviews_reviewed_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          ),
          ad:classified_ads(
            id,
            title,
            category
          )
        `)
        .eq('reviewed_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (recentReviewsData.error) throw recentReviewsData.error

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution,
        recentReviews: recentReviewsData.data || []
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas de avaliações:', err)
      return null
    }
  }, [])

  // Criar nova avaliação
  const createReview = async (reviewData: ReviewInsert) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          ),
          reviewed:profiles!reviews_reviewed_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          ),
          ad:classified_ads(
            id,
            title,
            category
          )
        `)
        .single()

      if (error) throw error

      // Criar notificação para o usuário avaliado
      if (data && data.reviewed_id !== data.reviewer_id) {
        await createReviewNotification(data)
      }

      return { data, error: null }
    } catch (err) {
      console.error('Erro ao criar avaliação:', err)
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Erro desconhecido' 
      }
    }
  }

  // Criar notificação para nova avaliação
  const createReviewNotification = async (review: ReviewWithProfiles) => {
    try {
      const notificationData = {
        user_id: review.reviewed_id,
        title: 'Nova Avaliação Recebida',
        message: `${review.reviewer.full_name} avaliou você com ${review.rating_person} estrelas`,
        type: 'review',
        is_read: false,
        action_url: `/perfil/${review.reviewed_id}`,
        priority: 'normal' as const
      }

      const { error } = await supabase
        .from('notifications')
        .insert(notificationData)

      if (error) {
        console.error('Erro ao criar notificação de avaliação:', error)
      }
    } catch (err) {
      console.error('Erro ao criar notificação de avaliação:', err)
    }
  }

  // Atualizar avaliação
  const updateReview = async (reviewId: string, updates: ReviewUpdate) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', reviewId)
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          ),
          reviewed:profiles!reviews_reviewed_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          ),
          ad:classified_ads(
            id,
            title,
            category
          )
        `)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      console.error('Erro ao atualizar avaliação:', err)
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Erro desconhecido' 
      }
    }
  }

  // Deletar avaliação
  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error
      return { error: null }
    } catch (err) {
      console.error('Erro ao deletar avaliação:', err)
      return { 
        error: err instanceof Error ? err.message : 'Erro desconhecido' 
      }
    }
  }

  // Responder a uma avaliação
  const respondToReview = async (reviewId: string, responseText: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ 
          response_text: responseText,
          response_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select()
        .single()

      if (error) throw error
      
      // Atualizar o estado local
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                response_text: responseText,
                response_date: new Date().toISOString()
              }
            : review
        )
      )
      
      return { data, error: null }
    } catch (err) {
      console.error('Erro ao responder avaliação:', err)
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Erro desconhecido' 
      }
    }
  }


  // Verificar se usuário pode avaliar outro usuário
  const canUserReview = async (reviewerId: string, reviewedId: string, adId?: string) => {
    try {
      // 1. Não pode avaliar a si mesmo
      if (reviewerId === reviewedId) {
        return false
      }

      // 2. Verificar se já existe uma avaliação
      const { data: existingReview, error: reviewError } = await supabase
        .from('reviews')
        .select('id')
        .eq('reviewer_id', reviewerId)
        .eq('reviewed_id', reviewedId)

      if (reviewError) throw reviewError
      
      if (existingReview && existingReview.length > 0) {
        return false // Já existe avaliação
      }

      // 3. Verificar se há acordo aceito entre os usuários
      const { data: agreementData, error: agreementError } = await supabase
        .from('contact_agreements')
        .select('id, contacts_revealed_at')
        .or(`client_id.eq.${reviewerId},professional_id.eq.${reviewerId}`)
        .or(`client_id.eq.${reviewedId},professional_id.eq.${reviewedId}`)
        .eq('status', 'accepted')

      if (agreementError) {
        console.error('Erro ao verificar acordos:', agreementError)
        return false
      }

      // Se não há acordos aceitos, não pode avaliar
      if (!agreementData || agreementData.length === 0) {
        return false
      }

      // 4. Verificar se o acordo foi aceito há pelo menos 20 horas
      const validAgreement = agreementData.find(agreement => {
        if (!agreement.contacts_revealed_at) return false
        
        const revealedDate = new Date(agreement.contacts_revealed_at)
        const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000)
        
        return revealedDate <= twentyHoursAgo
      })

      return !!validAgreement

    } catch (err) {
      console.error('Erro ao verificar se pode avaliar:', err)
      return false
    }
  }

  // Buscar usuários que podem ser avaliados pelo usuário atual
  const getEligibleUsersForReview = async (reviewerId: string) => {
    try {
      const { data, error } = await supabase
        .from('contact_agreements')
        .select(`
          id,
          client_id,
          professional_id,
          contacts_revealed_at,
          client:profiles!contact_agreements_client_id_fkey(
            id, full_name, avatar_url, user_type
          ),
          professional:profiles!contact_agreements_professional_id_fkey(
            id, full_name, avatar_url, user_type
          )
        `)
        .or(`client_id.eq.${reviewerId},professional_id.eq.${reviewerId}`)
        .eq('status', 'accepted')
        .not('contacts_revealed_at', 'is', null)

      if (error) throw error

      // Filtrar usuários elegíveis (acordo aceito há pelo menos 20 horas)
      const eligibleAgreements = data?.filter(agreement => {
        if (!agreement.contacts_revealed_at) return false
        
        const revealedDate = new Date(agreement.contacts_revealed_at)
        const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000)
        
        return revealedDate <= twentyHoursAgo
      }) || []

      // Verificar quais usuários já foram avaliados
      const reviewedUserIds = await Promise.all(
        eligibleAgreements.map(async (agreement) => {
          const otherUserId = agreement.client_id === reviewerId 
            ? agreement.professional_id 
            : agreement.client_id
          
          const { data: existingReview } = await supabase
            .from('reviews')
            .select('id')
            .eq('reviewer_id', reviewerId)
            .eq('reviewed_id', otherUserId)
            .limit(1)
          
          return existingReview && existingReview.length > 0 ? otherUserId : null
        })
      )

      // Retornar apenas usuários não avaliados
      const eligibleUsers = eligibleAgreements
        .map(agreement => {
          const otherUser = agreement.client_id === reviewerId 
            ? agreement.professional 
            : agreement.client
          
          // Type assertion para resolver problema de tipagem
          const user = otherUser as any
          
          return {
            id: user?.id || '',
            name: user?.full_name || 'Nome não disponível',
            avatar: user?.avatar_url,
            userType: user?.user_type || 'user',
            agreementId: agreement.id,
            contactsRevealedAt: agreement.contacts_revealed_at
          }
        })
        .filter(user => user.id && !reviewedUserIds.includes(user.id))

      return eligibleUsers
    } catch (err) {
      console.error('Erro ao buscar usuários elegíveis:', err)
      return []
    }
  }

  return {
    reviews,
    loading,
    error,
    fetchUserReviews,
    fetchUserReviewStats,
    createReview,
    updateReview,
    deleteReview,
    respondToReview,
    canUserReview,
    getEligibleUsersForReview
  }
}
