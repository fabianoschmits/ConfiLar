'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Service } from '@/data/services'

interface UseCachedServicesOptions {
  category?: string
  location?: string
  limit?: number
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
}

export function useCachedServices(options: UseCachedServicesOptions = {}) {
  const { 
    category, 
    location, 
    limit = 20, 
    enabled = true, 
    staleTime = 3 * 60 * 1000, 
    cacheTime = 8 * 60 * 1000 
  } = options

  return useQuery({
    queryKey: ['services', { category, location, limit }],
    queryFn: async () => {
      let query = supabase
        .from('services')
        .select(`
          *,
          profiles:provider_id (
            id,
            username,
            full_name,
            avatar_url,
            reputation_score
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (category) {
        query = query.eq('category', category)
      }

      if (location) {
        query = query.ilike('location', `%${location}%`)
      }

      const { data, error } = await query.limit(limit)

      if (error) throw error
      return data as Service[]
    },
    enabled,
    staleTime,
    gcTime: cacheTime,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export function useCachedService(serviceId: string) {
  return useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles:provider_id (
            id,
            username,
            full_name,
            avatar_url,
            reputation_score,
            phone,
            email
          )
        `)
        .eq('id', serviceId)
        .single()

      if (error) throw error
      return data as Service
    },
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export function useCachedUserServices(userId: string) {
  return useQuery({
    queryKey: ['user-services', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Service[]
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

// Hook para invalidar cache de serviços
export function useInvalidateServices() {
  const queryClient = useQueryClient()

  return (userId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['services'] })
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ['user-services', userId] })
    }
  }
}
