'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type UserFavorite = {
  id: string
  user_id: string
  favorite_user_id: string
  created_at: string
  favorite_user: {
    id: string
    full_name: string
    avatar_url: string | null
    user_type: 'client' | 'professional'
    bio: string | null
    location_city: string | null
    location_state: string | null
    rating: number
    total_reviews: number
    is_verified: boolean
    badge: string
    professional_services: string[] | null
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<UserFavorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar favoritos do usuário
  const fetchFavorites = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          id,
          user_id,
          favorite_user_id,
          created_at,
          favorite_user:profiles!user_favorites_favorite_user_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type,
            bio,
            location_city,
            location_state,
            rating,
            total_reviews,
            is_verified,
            badge,
            professional_services
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar favoritos:', error)
        setError('Erro ao carregar favoritos')
        return
      }

      // Transformar os dados para o formato correto
      const formattedData = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        favorite_user_id: item.favorite_user_id,
        created_at: item.created_at,
        favorite_user: Array.isArray(item.favorite_user) ? item.favorite_user[0] : item.favorite_user
      }))

      setFavorites(formattedData)
    } catch (err) {
      console.error('Erro crítico ao buscar favoritos:', err)
      setError('Erro crítico ao carregar favoritos')
    } finally {
      setLoading(false)
    }
  }

  // Verificar se um usuário está nos favoritos
  const isFavorite = async (userId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('favorite_user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro ao verificar favorito:', error)
        return false
      }

      return !!data
    } catch (err) {
      console.error('Erro ao verificar favorito:', err)
      return false
    }
  }

  // Adicionar aos favoritos
  const addToFavorites = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      if (user.id === userId) {
        throw new Error('Você não pode se favoritar')
      }

      const { data, error } = await supabase
        .from('user_favorites')
        .insert([{
          user_id: user.id,
          favorite_user_id: userId
        }])
        .select(`
          id,
          user_id,
          favorite_user_id,
          created_at,
          favorite_user:profiles!user_favorites_favorite_user_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type,
            bio,
            location_city,
            location_state,
            rating,
            total_reviews,
            is_verified,
            badge,
            professional_services
          )
        `)
        .single()

      if (error) {
        console.error('Erro ao adicionar favorito:', error)
        throw new Error('Erro ao adicionar aos favoritos')
      }

      setFavorites(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Erro ao adicionar favorito:', err)
      throw err
    }
  }

  // Remover dos favoritos
  const removeFromFavorites = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('favorite_user_id', userId)

      if (error) {
        console.error('Erro ao remover favorito:', error)
        throw new Error('Erro ao remover dos favoritos')
      }

      setFavorites(prev => prev.filter(fav => fav.favorite_user_id !== userId))
    } catch (err) {
      console.error('Erro ao remover favorito:', err)
      throw err
    }
  }

  // Toggle favorito (adicionar ou remover)
  const toggleFavorite = async (userId: string) => {
    try {
      const isCurrentlyFavorite = await isFavorite(userId)
      
      if (isCurrentlyFavorite) {
        await removeFromFavorites(userId)
        return false
      } else {
        await addToFavorites(userId)
        return true
      }
    } catch (err) {
      console.error('Erro ao alternar favorito:', err)
      throw err
    }
  }

  // Buscar favoritos por tipo de usuário
  const getFavoritesByType = (userType: 'client' | 'professional' | 'all') => {
    if (userType === 'all') return favorites
    
    return favorites.filter(fav => fav.favorite_user.user_type === userType)
  }

  // Estatísticas dos favoritos
  const getFavoritesStats = () => {
    const totalFavorites = favorites.length
    const professionalFavorites = favorites.filter(fav => fav.favorite_user.user_type === 'professional').length
    const clientFavorites = favorites.filter(fav => fav.favorite_user.user_type === 'client').length

    return {
      totalFavorites,
      professionalFavorites,
      clientFavorites
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  return {
    favorites,
    loading,
    error,
    fetchFavorites,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    getFavoritesByType,
    getFavoritesStats
  }
}
