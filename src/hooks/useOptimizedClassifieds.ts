import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { QueryKeys, CacheUtils } from '@/lib/queryClient'

interface ClassifiedAd {
  id: string
  user_id: string
  user_name: string
  user_type: string
  title: string
  description: string
  category: string
  location_state: string
  location_city: string
  created_at: string
  is_active: boolean
  views: number
  user_avatar_url?: string
  ad_type: 'offer' | 'request'
}

interface ClassifiedFilters {
  category?: string
  location_state?: string
  location_city?: string
  ad_type?: 'offer' | 'request'
  user_type?: 'client' | 'professional'
  search?: string
}

// Hook para buscar anúncios com filtros e paginação
export function useClassifieds(filters: ClassifiedFilters = {}, page = 0, limit = 20) {
  return useQuery({
    queryKey: QueryKeys.classifiedsByCategory(JSON.stringify({ ...filters, page, limit })),
    queryFn: async () => {
      let query = supabase
        .from('classified_ads')
        .select(`
          id,
          user_id,
          user_name,
          user_type,
          title,
          description,
          category,
          location_state,
          location_city,
          created_at,
          is_active,
          views,
          user_avatar_url,
          ad_type
        `, { count: 'exact' })
        .eq('is_active', true)

      // Aplicar filtros
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.location_state) {
        query = query.eq('location_state', filters.location_state)
      }
      if (filters.location_city) {
        query = query.eq('location_city', filters.location_city)
      }
      if (filters.ad_type) {
        query = query.eq('ad_type', filters.ad_type)
      }
      if (filters.user_type) {
        query = query.eq('user_type', filters.user_type)
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      // Paginação
      query = query
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      return {
        ads: data as ClassifiedAd[],
        total: count || 0,
        hasMore: (count || 0) > (page + 1) * limit
      }
    },
    staleTime: CacheUtils.CACHE_TIMES.SEMI_STATIC,
    gcTime: CacheUtils.CACHE_TIMES.SEMI_STATIC * 2,
    retry: CacheUtils.RETRY_CONFIG.IMPORTANT.retry,
    retryDelay: CacheUtils.RETRY_CONFIG.IMPORTANT.retryDelay,
  })
}

// Hook para buscar anúncios de um usuário específico
export function useUserClassifieds(userId: string, page = 0, limit = 20) {
  return useQuery({
    queryKey: QueryKeys.classifiedsByUser(userId),
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('classified_ads')
        .select(`
          id,
          user_id,
          user_name,
          user_type,
          title,
          description,
          category,
          location_state,
          location_city,
          created_at,
          is_active,
          views,
          user_avatar_url,
          ad_type
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

      if (error) throw error

      return {
        ads: data as ClassifiedAd[],
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

// Hook para criar anúncio
export function useCreateClassified() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (adData: Omit<ClassifiedAd, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('classified_ads')
        .insert(adData)
        .select()
        .single()

      if (error) throw error
      return data as ClassifiedAd
    },
    onSuccess: () => {
      // Invalidar cache de anúncios
      queryClient.invalidateQueries({ queryKey: QueryKeys.classifieds })
    }
  })
}

// Hook para atualizar anúncio
export function useUpdateClassified() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ adId, updates }: { adId: string; updates: Partial<ClassifiedAd> }) => {
      const { data, error } = await supabase
        .from('classified_ads')
        .update(updates)
        .eq('id', adId)
        .select()
        .single()

      if (error) throw error
      return data as ClassifiedAd
    },
    onSuccess: () => {
      // Invalidar cache de anúncios
      queryClient.invalidateQueries({ queryKey: QueryKeys.classifieds })
    }
  })
}

// Hook para deletar anúncio
export function useDeleteClassified() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (adId: string) => {
      const { error } = await supabase
        .from('classified_ads')
        .delete()
        .eq('id', adId)

      if (error) throw error
    },
    onSuccess: () => {
      // Invalidar cache de anúncios
      queryClient.invalidateQueries({ queryKey: QueryKeys.classifieds })
    }
  })
}

// Hook para estatísticas de anúncios
export function useClassifiedStats() {
  return useQuery({
    queryKey: ['classified-stats'],
    queryFn: async () => {
      const [totalResult, offersResult, requestsResult, categoriesResult] = await Promise.all([
        // Total de anúncios
        supabase
          .from('classified_ads')
          .select('id', { count: 'exact' })
          .eq('is_active', true),
        
        // Anúncios de oferta
        supabase
          .from('classified_ads')
          .select('id', { count: 'exact' })
          .eq('is_active', true)
          .eq('ad_type', 'offer'),
        
        // Anúncios de solicitação
        supabase
          .from('classified_ads')
          .select('id', { count: 'exact' })
          .eq('is_active', true)
          .eq('ad_type', 'request'),
        
        // Categorias únicas
        supabase
          .from('classified_ads')
          .select('category')
          .eq('is_active', true)
      ])

      const total = totalResult.count || 0
      const offers = offersResult.count || 0
      const requests = requestsResult.count || 0
      const categories = new Set(categoriesResult.data?.map(ad => ad.category) || []).size

      return {
        total,
        offers,
        requests,
        categories
      }
    },
    staleTime: CacheUtils.CACHE_TIMES.DYNAMIC,
    gcTime: CacheUtils.CACHE_TIMES.DYNAMIC * 2,
    retry: CacheUtils.RETRY_CONFIG.OPTIONAL.retry,
    retryDelay: CacheUtils.RETRY_CONFIG.OPTIONAL.retryDelay,
  })
}
