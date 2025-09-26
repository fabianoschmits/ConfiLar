import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { QueryKeys, CacheUtils } from '@/lib/queryClient'

interface Review {
  id: string
  reviewer_id: string
  reviewed_id: string
  rating_person: number
  comment?: string
  created_at: string
  reviewer?: {
    id: string
    full_name: string
    avatar_url: string
    user_type: string
  }
  reviewed?: {
    id: string
    full_name: string
    avatar_url: string
    user_type: string
  }
}

interface ReviewStats {
  total: number
  average: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

// Hook para buscar avaliações de um usuário
export function useUserReviews(userId: string, type: 'received' | 'given' = 'received', page = 0, limit = 20) {
  return useQuery({
    queryKey: QueryKeys.reviewsByUser(userId),
    queryFn: async () => {
      const column = type === 'received' ? 'reviewed_id' : 'reviewer_id'
      
      const { data, error, count } = await supabase
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
        `, { count: 'exact' })
        .eq(column, userId)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

      if (error) throw error

      return {
        reviews: data as any[],
        total: count || 0,
        hasMore: (count || 0) > (page + 1) * limit
      }
    },
    enabled: !!userId,
    staleTime: CacheUtils.CACHE_TIMES.SEMI_STATIC,
    gcTime: CacheUtils.CACHE_TIMES.SEMI_STATIC * 2,
    retry: CacheUtils.RETRY_CONFIG.IMPORTANT.retry,
    retryDelay: CacheUtils.RETRY_CONFIG.IMPORTANT.retryDelay,
  })
}

// Hook para estatísticas de avaliações de um usuário
export function useUserReviewStats(userId: string) {
  return useQuery({
    queryKey: ['review-stats', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating_person')
        .eq('reviewed_id', userId)

      if (error) throw error

      const total = data?.length || 0
      const average = total > 0 
        ? data.reduce((sum, review) => sum + review.rating_person, 0) / total 
        : 0

      // Distribuição de avaliações
      const distribution = {
        5: data?.filter(r => r.rating_person === 5).length || 0,
        4: data?.filter(r => r.rating_person === 4).length || 0,
        3: data?.filter(r => r.rating_person === 3).length || 0,
        2: data?.filter(r => r.rating_person === 2).length || 0,
        1: data?.filter(r => r.rating_person === 1).length || 0,
      }

      return {
        total,
        average,
        distribution
      } as ReviewStats
    },
    enabled: !!userId,
    staleTime: CacheUtils.CACHE_TIMES.SEMI_STATIC,
    gcTime: CacheUtils.CACHE_TIMES.SEMI_STATIC * 2,
    retry: CacheUtils.RETRY_CONFIG.IMPORTANT.retry,
    retryDelay: CacheUtils.RETRY_CONFIG.IMPORTANT.retryDelay,
  })
}

// Hook para criar avaliação
export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reviewData: {
      reviewer_id: string
      reviewed_id: string
      rating_person: number
      comment?: string
    }) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
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
        .single()

      if (error) throw error
      return data as any
    },
    onSuccess: (data) => {
      // Invalidar cache de avaliações do usuário avaliado
      queryClient.invalidateQueries({ 
        queryKey: QueryKeys.reviewsByUser(data.reviewed_id) 
      })
      
      // Invalidar cache de estatísticas
      queryClient.invalidateQueries({ 
        queryKey: ['review-stats', data.reviewed_id] 
      })
      
      // Invalidar cache de perfil para atualizar rating
      queryClient.invalidateQueries({ 
        queryKey: QueryKeys.profile(data.reviewed_id) 
      })
    }
  })
}

// Hook para atualizar avaliação
export function useUpdateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      reviewId, 
      updates 
    }: { 
      reviewId: string
      updates: { rating_person?: number; comment?: string }
    }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', reviewId)
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
        .single()

      if (error) throw error
      return data as any
    },
    onSuccess: (data) => {
      // Invalidar cache de avaliações do usuário avaliado
      queryClient.invalidateQueries({ 
        queryKey: QueryKeys.reviewsByUser(data.reviewed_id) 
      })
      
      // Invalidar cache de estatísticas
      queryClient.invalidateQueries({ 
        queryKey: ['review-stats', data.reviewed_id] 
      })
      
      // Invalidar cache de perfil para atualizar rating
      queryClient.invalidateQueries({ 
        queryKey: QueryKeys.profile(data.reviewed_id) 
      })
    }
  })
}

// Hook para deletar avaliação
export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error
    },
    onSuccess: () => {
      // Invalidar cache de avaliações
      queryClient.invalidateQueries({ queryKey: QueryKeys.reviews })
    }
  })
}

// Hook para verificar se usuário pode avaliar outro usuário
export function useCanReview(reviewerId: string, reviewedId: string) {
  return useQuery({
    queryKey: ['can-review', reviewerId, reviewedId],
    queryFn: async () => {
      // Verificar se já existe avaliação
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('reviewer_id', reviewerId)
        .eq('reviewed_id', reviewedId)
        .maybeSingle()

      if (existingReview) {
        return { canReview: false, reason: 'already_reviewed' }
      }

      // Verificar se existe acordo entre os usuários
      const { data: agreement } = await supabase
        .from('contact_agreements')
        .select('id, status')
        .or(`client_id.eq.${reviewerId},professional_id.eq.${reviewerId}`)
        .or(`client_id.eq.${reviewedId},professional_id.eq.${reviewedId}`)
        .eq('status', 'accepted')
        .maybeSingle()

      if (!agreement) {
        return { canReview: false, reason: 'no_agreement' }
      }

      return { canReview: true, reason: null }
    },
    enabled: !!reviewerId && !!reviewedId && reviewerId !== reviewedId,
    staleTime: CacheUtils.CACHE_TIMES.SEMI_STATIC,
    gcTime: CacheUtils.CACHE_TIMES.SEMI_STATIC * 2,
    retry: CacheUtils.RETRY_CONFIG.IMPORTANT.retry,
    retryDelay: CacheUtils.RETRY_CONFIG.IMPORTANT.retryDelay,
  })
}
