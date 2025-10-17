'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRealtimePosts, useRealtimeServices, useRealtimeProfiles, useRealtimeNotifications, useRealtimeConversations } from './useRealtimeCache'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// Hook inteligente que combina cache + realtime para posts
export function useSmartPosts(options: { limit?: number; enabled?: boolean } = {}) {
  const { limit = 20, enabled = true } = options
  
  // Ativar realtime para posts
  useRealtimePosts()
  
  // Query normal com cache
  return useQuery({
    queryKey: ['posts', { limit }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (
            id,
            username,
            full_name,
            avatar_url,
            reputation_score
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

// Hook inteligente que combina cache + realtime para serviços
export function useSmartServices(options: { 
  category?: string; 
  location?: string; 
  limit?: number; 
  enabled?: boolean 
} = {}) {
  const { category, location, limit = 20, enabled = true } = options
  
  // Ativar realtime para serviços
  useRealtimeServices()
  
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
      return data
    },
    enabled,
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 8 * 60 * 1000, // 8 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

// Hook inteligente que combina cache + realtime para perfil
export function useSmartProfile(userId?: string) {
  // Ativar realtime para perfis
  useRealtimeProfiles()
  
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

// Hook inteligente que combina cache + realtime para notificações
export function useSmartNotifications() {
  const { user } = useAuthContext()
  
  // Ativar realtime para notificações
  useRealtimeNotifications(user?.id)
  
  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles:sender_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Atualiza a cada 30 segundos
  })
}

// Hook inteligente que combina cache + realtime para conversas
export function useSmartConversations() {
  const { user } = useAuthContext()
  
  // Ativar realtime para conversas
  useRealtimeConversations(user?.id)
  
  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
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
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    refetchOnWindowFocus: true,
  })
}

// Hook para cache inteligente de dados do usuário atual
export function useSmartUserData() {
  const { user } = useAuthContext()
  
  // Ativar realtime para perfis
  useRealtimeProfiles()
  
  return useQuery({
    queryKey: ['user-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      
      // Buscar dados completos do usuário
      const [profileResult, servicesResult, reviewsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
        supabase
          .from('services')
          .select('*')
          .eq('provider_id', user.id)
          .eq('is_active', true),
        supabase
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
          .eq('reviewee_id', user.id)
      ])

      if (profileResult.error) throw profileResult.error
      if (servicesResult.error) throw servicesResult.error
      if (reviewsResult.error) throw reviewsResult.error

      return {
        profile: profileResult.data,
        services: servicesResult.data,
        reviews: reviewsResult.data,
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

// Hook para cache inteligente de estatísticas
export function useSmartStats() {
  return useQuery({
    queryKey: ['smart-stats'],
    queryFn: async () => {
      const [usersResult, servicesResult, postsResult, reviewsResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true })
      ])

      return {
        totalUsers: usersResult.count || 0,
        totalServices: servicesResult.count || 0,
        totalPosts: postsResult.count || 0,
        totalReviews: reviewsResult.count || 0,
        lastUpdated: new Date().toISOString(),
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  })
}
