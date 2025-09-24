'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'

export interface Favorite {
  id: string
  user_id: string
  professional_id: string
  created_at: string
  professional?: {
    id: string
    full_name: string
    avatar_url?: string
    user_type?: string
    location_city?: string
    location_state?: string
    rating?: number
    total_reviews?: number
    is_verified?: boolean
    bio?: string
    badge?: string
    professional_services?: string[]
  }
}

export function useFavorites() {
  const { user } = useAuthContext()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar favoritos do usuário
  const loadFavorites = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          professional:profiles!favorites_professional_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type,
            location_city,
            location_state,
            rating,
            total_reviews,
            is_verified,
            bio,
            badge,
            professional_services
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setFavorites(data || [])
      setFavoriteIds(new Set(data?.map(fav => fav.professional_id) || []))
    } catch (err) {
      console.error('❌ Erro ao carregar favoritos:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Adicionar usuário aos favoritos
  const addFavorite = useCallback(async (professionalId: string) => {
    if (!user?.id) return false

    try {
      setLoading(true)
      setError(null)

      // Verificar se já é favorito
      const { data: existingFavorite, error: checkError } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('professional_id', professionalId)
        .maybeSingle()

      if (checkError) {
        throw checkError
      }

      if (existingFavorite) {
        // Já é favorito, não fazer nada
        return true
      }

      // Adicionar aos favoritos
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          professional_id: professionalId
        })
        .select(`
          *,
          professional:profiles!favorites_professional_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type,
            location_city,
            location_state,
            rating,
            total_reviews,
            is_verified,
            bio,
            badge,
            professional_services
          )
        `)
        .maybeSingle()

      if (error) throw error

      // Atualizar estado local
      setFavorites(prev => [data, ...prev])
      setFavoriteIds(prev => new Set(Array.from(prev).concat(professionalId)))

      return true
    } catch (err) {
      console.error('❌ Erro ao adicionar favorito:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Remover usuário dos favoritos
  const removeFavorite = useCallback(async (professionalId: string) => {
    if (!user?.id) return false

    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('professional_id', professionalId)

      if (error) throw error

      // Atualizar estado local
      setFavorites(prev => prev.filter(fav => fav.professional_id !== professionalId))
      setFavoriteIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(professionalId)
        return newSet
      })

      return true
    } catch (err) {
      console.error('❌ Erro ao remover favorito:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Alternar favorito (adicionar ou remover)
  const toggleFavorite = useCallback(async (professionalId: string) => {
    if (!user?.id) return false

    const isCurrentlyFavorite = favoriteIds.has(professionalId)
    
    if (isCurrentlyFavorite) {
      const success = await removeFavorite(professionalId)
      return success ? false : isCurrentlyFavorite // Retorna false se removeu com sucesso, ou mantém o status atual se falhou
    } else {
      const success = await addFavorite(professionalId)
      return success ? true : isCurrentlyFavorite // Retorna true se adicionou com sucesso, ou mantém o status atual se falhou
    }
  }, [user?.id, favoriteIds, addFavorite, removeFavorite])

  // Verificar se um usuário é favorito
  const isFavorite = useCallback((userId: string) => {
    return favoriteIds.has(userId)
  }, [favoriteIds])

  // Obter favoritos por tipo de usuário
  const getFavoritesByType = useCallback((userType: 'professional' | 'client') => {
    return favorites.filter(fav => fav.professional?.user_type === userType)
  }, [favorites])

  // Obter estatísticas dos favoritos
  const getFavoritesStats = useCallback(() => {
    const totalFavorites = favorites.length
    const professionalFavorites = favorites.filter(fav => fav.professional?.user_type === 'professional').length
    const clientFavorites = favorites.filter(fav => fav.professional?.user_type === 'client').length

    return {
      totalFavorites,
      professionalFavorites,
      clientFavorites
    }
  }, [favorites])

  // Carregar favoritos quando o usuário mudar
  useEffect(() => {
    if (user?.id) {
      loadFavorites()
    } else {
      setFavorites([])
      setFavoriteIds(new Set())
    }
  }, [user?.id, loadFavorites])

  return {
    favorites,
    favoriteIds,
    loading,
    error,
    loadFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoritesByType,
    getFavoritesStats
  }
}