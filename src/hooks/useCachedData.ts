'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Hook para cache de categorias de serviços
export function useCachedServiceCategories() {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

// Hook para cache de localizações
export function useCachedLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

// Hook para cache de estatísticas gerais
export function useCachedStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const [usersResult, servicesResult, postsResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('posts').select('*', { count: 'exact', head: true })
      ])

      return {
        totalUsers: usersResult.count || 0,
        totalServices: servicesResult.count || 0,
        totalPosts: postsResult.count || 0,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

// Hook para cache de avaliações
export function useCachedReviews(userId?: string) {
  return useQuery({
    queryKey: ['reviews', userId],
    queryFn: async () => {
      if (!userId) return []
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:reviewer_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

// Hook para cache de conversas
export function useCachedConversations(userId?: string) {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) return []
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          profiles:participant1_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          profiles2:participant2_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    refetchOnWindowFocus: true,
  })
}

// Hook para invalidar todos os caches
export function useInvalidateAllCaches() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries()
  }
}

// Hook para limpar todos os caches
export function useClearAllCaches() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.clear()
  }
}
