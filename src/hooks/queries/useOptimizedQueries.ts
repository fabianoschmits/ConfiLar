'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/database'
import { Logger } from '@/lib/logger'
import { QueryKeys, CacheUtils } from '@/lib/queryClient'

// ===================================
// HOOKS PARA PERFIS
// ===================================

export function useProfiles(filters?: Record<string, any>) {
  return useQuery({
    queryKey: filters ? QueryKeys.profileSearch(filters) : QueryKeys.profiles,
    queryFn: async () => {
      const startTime = Date.now()
      Logger.debug('query', 'Fetching profiles', { filters })
      
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Aplicar filtros se fornecidos
      if (filters) {
        if (filters.user_type && filters.user_type !== 'all') {
          query = query.eq('user_type', filters.user_type)
        }
        if (filters.location_state) {
          query = query.eq('location_state', filters.location_state)
        }
        if (filters.location_city) {
          query = query.eq('location_city', filters.location_city)
        }
        if (filters.is_available) {
          query = query.eq('is_available', true)
        }
        if (filters.is_verified) {
          query = query.eq('is_verified', true)
        }
      }
      
      const { data, error } = await query
      
      const duration = Date.now() - startTime
      Logger.api.request('profiles', 'GET', duration)
      
      if (error) {
        Logger.api.error('profiles', 'GET', error)
        throw error
      }
      
      Logger.info('query', `Loaded ${data?.length || 0} profiles`, { 
        filters, 
        duration 
      })
      
      return data as Profile[] || []
    },
    staleTime: CacheUtils.CACHE_TIMES.SEMI_STATIC,
    gcTime: CacheUtils.CACHE_TIMES.SEMI_STATIC * 2,
    ...CacheUtils.RETRY_CONFIG.IMPORTANT
  })
}

export function useProfile(id: string) {
  return useQuery({
    queryKey: QueryKeys.profile(id),
    queryFn: async () => {
      const startTime = Date.now()
      Logger.debug('query', `Fetching profile ${id}`)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      
      const duration = Date.now() - startTime
      Logger.api.request(`profiles/${id}`, 'GET', duration)
      
      if (error) {
        Logger.api.error(`profiles/${id}`, 'GET', error)
        throw error
      }
      
      Logger.info('query', `Loaded profile for user ${id}`, { duration })
      return data as Profile
    },
    staleTime: CacheUtils.CACHE_TIMES.SEMI_STATIC,
    gcTime: CacheUtils.CACHE_TIMES.SEMI_STATIC * 2,
    enabled: !!id,
    ...CacheUtils.RETRY_CONFIG.IMPORTANT
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Profile> }) => {
      const startTime = Date.now()
      Logger.debug('mutation', `Updating profile ${id}`, { updates: Object.keys(updates) })
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      const duration = Date.now() - startTime
      Logger.api.request(`profiles/${id}`, 'PUT', duration)
      
      if (error) {
        Logger.api.error(`profiles/${id}`, 'PUT', error)
        throw error
      }
      
      Logger.info('mutation', `Updated profile ${id}`, { duration })
      return data as Profile
    },
    onSuccess: (data, variables) => {
      // Atualizar cache do perfil específico
      queryClient.setQueryData(QueryKeys.profile(variables.id), data)
      
      // Invalidar lista de perfis
      queryClient.invalidateQueries({ queryKey: QueryKeys.profiles })
      
      Logger.api.cacheHit(`profile-${variables.id}-updated`)
    },
    ...CacheUtils.RETRY_CONFIG.CRITICAL
  })
}

// ===================================
// HOOKS PARA ANÚNCIOS CLASSIFICADOS
// ===================================

export function useClassifieds(filters?: Record<string, any>) {
  return useQuery({
    queryKey: QueryKeys.classifieds,
    queryFn: async () => {
      const startTime = Date.now()
      Logger.debug('query', 'Fetching classified ads', { filters })
      
      let query = supabase
        .from('classified_ads')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      // Aplicar filtros
      if (filters) {
        if (filters.category && filters.category !== 'all') {
          query = query.eq('category', filters.category)
        }
        if (filters.location_state) {
          query = query.eq('location_state', filters.location_state)
        }
        if (filters.location_city) {
          query = query.eq('location_city', filters.location_city)
        }
      }
      
      const { data, error } = await query
      
      const duration = Date.now() - startTime
      Logger.api.request('classified_ads', 'GET', duration)
      
      if (error) {
        Logger.api.error('classified_ads', 'GET', error)
        throw error
      }
      
      Logger.info('query', `Loaded ${data?.length || 0} classified ads`, { 
        filters, 
        duration 
      })
      
      return data || []
    },
    staleTime: CacheUtils.CACHE_TIMES.SEMI_STATIC,
    gcTime: CacheUtils.CACHE_TIMES.SEMI_STATIC * 2,
    ...CacheUtils.RETRY_CONFIG.IMPORTANT
  })
}

export function useClassifiedsByUser(userId: string) {
  return useQuery({
    queryKey: QueryKeys.classifiedsByUser(userId),
    queryFn: async () => {
      const startTime = Date.now()
      Logger.debug('query', `Fetching classified ads for user ${userId}`)
      
      const { data, error } = await supabase
        .from('classified_ads')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      const duration = Date.now() - startTime
      Logger.api.request(`classified_ads/user/${userId}`, 'GET', duration)
      
      if (error) {
        Logger.api.error(`classified_ads/user/${userId}`, 'GET', error)
        throw error
      }
      
      Logger.info('query', `Loaded ${data?.length || 0} ads for user ${userId}`, { duration })
      return data || []
    },
    staleTime: CacheUtils.CACHE_TIMES.SEMI_STATIC,
    enabled: !!userId,
    ...CacheUtils.RETRY_CONFIG.IMPORTANT
  })
}

// ===================================
// HOOKS PARA LOCALIZAÇÃO (IBGE)
// ===================================

export function useEstados() {
  return useQuery({
    queryKey: QueryKeys.estados,
    queryFn: async () => {
      const startTime = Date.now()
      Logger.debug('query', 'Fetching estados from IBGE API')
      
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar estados')
      }
      
      const data = await response.json()
      
      const duration = Date.now() - startTime
      Logger.api.request('ibge/estados', 'GET', duration)
      
      Logger.info('query', `Loaded ${data.length} estados`, { duration })
      
      return data.map((estado: any) => ({
        id: estado.id,
        sigla: estado.sigla,
        nome: estado.nome
      }))
    },
    staleTime: CacheUtils.CACHE_TIMES.STATIC, // Estados não mudam
    gcTime: CacheUtils.CACHE_TIMES.STATIC * 2,
    ...CacheUtils.RETRY_CONFIG.OPTIONAL
  })
}

export function useCidades(estadoSigla: string) {
  return useQuery({
    queryKey: QueryKeys.cidades(estadoSigla),
    queryFn: async () => {
      const startTime = Date.now()
      Logger.debug('query', `Fetching cidades for estado ${estadoSigla}`)
      
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSigla}/municipios`
      )
      
      if (!response.ok) {
        throw new Error('Erro ao carregar cidades')
      }
      
      const data = await response.json()
      
      const duration = Date.now() - startTime
      Logger.api.request(`ibge/cidades/${estadoSigla}`, 'GET', duration)
      
      Logger.info('query', `Loaded ${data.length} cidades for ${estadoSigla}`, { duration })
      
      return data.map((cidade: any) => ({
        id: cidade.id,
        nome: cidade.nome
      }))
    },
    staleTime: CacheUtils.CACHE_TIMES.STATIC, // Cidades não mudam
    gcTime: CacheUtils.CACHE_TIMES.STATIC * 2,
    enabled: !!estadoSigla && estadoSigla.length === 2,
    ...CacheUtils.RETRY_CONFIG.OPTIONAL
  })
}

// ===================================
// HOOKS PARA ESTATÍSTICAS
// ===================================

export function useHomeStats() {
  return useQuery({
    queryKey: QueryKeys.homeStats,
    queryFn: async () => {
      const startTime = Date.now()
      Logger.debug('query', 'Fetching home statistics')
      
      // Buscar stats em paralelo
      const [profilesCount, reviewsCount, classifiedsCount] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
        supabase.from('classified_ads').select('id', { count: 'exact', head: true })
      ])
      
      const duration = Date.now() - startTime
      Logger.api.request('stats/home', 'GET', duration)
      
      const stats = {
        professionalsCount: profilesCount.count || 0,
        reviewsCount: reviewsCount.count || 0,
        classifiedsCount: classifiedsCount.count || 0,
        citiesCount: 5570, // Número fixo de cidades do Brasil
        servicesCount: 50 // Número aproximado de categorias de serviços
      }
      
      Logger.info('query', 'Loaded home statistics', { stats, duration })
      return stats
    },
    staleTime: CacheUtils.CACHE_TIMES.SEMI_STATIC,
    gcTime: CacheUtils.CACHE_TIMES.SEMI_STATIC * 2,
    ...CacheUtils.RETRY_CONFIG.OPTIONAL
  })
}

// ===================================
// HOOKS PARA SEARCH OTIMIZADO
// ===================================

export function useOptimizedSearch(filters: Record<string, any>) {
  return useQuery({
    queryKey: QueryKeys.profileSearch(filters),
    queryFn: async () => {
      const startTime = Date.now()
      Logger.debug('query', 'Performing optimized search', { filters })
      
      let query = supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          user_type,
          location_state,
          location_city,
          bio,
          rating,
          total_reviews,
          is_verified,
          is_available,
          avatar_url,
          professional_services,
          created_at
        `)
        .order('rating', { ascending: false })
        .limit(50) // Limitar para performance
      
      // Aplicar filtros de forma otimizada
      if (filters.searchTerm) {
        query = query.or(`full_name.ilike.%${filters.searchTerm}%,bio.ilike.%${filters.searchTerm}%`)
      }
      
      if (filters.user_type && filters.user_type !== 'all') {
        query = query.eq('user_type', filters.user_type)
      }
      
      if (filters.location_state) {
        query = query.eq('location_state', filters.location_state)
      }
      
      if (filters.location_city) {
        query = query.eq('location_city', filters.location_city)
      }
      
      if (filters.minRating > 0) {
        query = query.gte('rating', filters.minRating)
      }
      
      if (filters.verifiedOnly) {
        query = query.eq('is_verified', true)
      }
      
      if (filters.availableOnly) {
        query = query.eq('is_available', true)
      }
      
      const { data, error } = await query
      
      const duration = Date.now() - startTime
      Logger.api.request('search/profiles', 'GET', duration)
      
      if (error) {
        Logger.api.error('search/profiles', 'GET', error)
        throw error
      }
      
      // Calcular estatísticas
      const stats = {
        totalUsers: data?.length || 0,
        professionalsCount: data?.filter(p => p.user_type === 'professional').length || 0,
        clientsCount: data?.filter(p => p.user_type === 'client').length || 0,
        verifiedCount: data?.filter(p => p.is_verified).length || 0,
        filteredCount: data?.length || 0,
        hasResults: (data?.length || 0) > 0,
        hasFilters: Object.keys(filters).some(key => 
          filters[key] && filters[key] !== '' && filters[key] !== 'all' && filters[key] !== 0
        )
      }
      
      Logger.info('query', `Search completed: ${stats.totalUsers} results`, { 
        filters, 
        stats, 
        duration 
      })
      
      return {
        profiles: data as Profile[] || [],
        stats
      }
    },
    staleTime: CacheUtils.CACHE_TIMES.DYNAMIC, // Resultados de busca são mais dinâmicos
    gcTime: CacheUtils.CACHE_TIMES.DYNAMIC * 2,
    enabled: Object.keys(filters).length > 0,
    ...CacheUtils.RETRY_CONFIG.IMPORTANT
  })
}

