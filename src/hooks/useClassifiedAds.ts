import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// Tipos para os anúncios
export interface ClassifiedAd {
  id: string
  user_id: string
  user_name: string
  user_type: 'client' | 'professional'
  title: string
  description: string
  category: string
  location_state: string
  location_city: string
  created_at: string
  is_active: boolean
  views: number
  user_avatar_url?: string
}

export interface CreateAdData {
  title: string
  description: string
  category: string
  location_state: string
  location_city?: string
  ad_type?: 'procurar' | 'oferecer'
}

export function useClassifiedAds() {
  const [ads, setAds] = useState<ClassifiedAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar todos os anúncios
  const loadAds = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: supabaseError } = await supabase
        .from('classified_ads')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (supabaseError) {
        console.error('❌ Erro ao carregar anúncios:', supabaseError)
        setError('Erro ao carregar anúncios')
        return
      }

      setAds(data || [])
    } catch (err) {
      console.error('💥 Erro crítico ao carregar anúncios:', err)
      setError('Erro inesperado ao carregar anúncios')
    } finally {
      setLoading(false)
    }
  }, [])

  // Criar novo anúncio
  const createAd = useCallback(async (adData: CreateAdData, userId: string, userName: string, userType: 'client' | 'professional') => {
    try {
      setError(null)
      
      const { data, error: supabaseError } = await supabase
        .from('classified_ads')
        .insert({
          user_id: userId,
          user_name: userName,
          user_type: userType,
          title: adData.title.trim(),
          description: adData.description.trim(),
          category: adData.category,
          location_state: adData.location_state,
          location_city: adData.location_city?.trim() || null,
          is_active: true,
          views: 0
        })
        .select()
        .single()

      if (supabaseError) {
        console.error('❌ Erro ao criar anúncio:', supabaseError)
        throw new Error(supabaseError.message)
      }

      // Adicionar o novo anúncio à lista local
      setAds(prev => [data, ...prev])
      
      toast.success('Anúncio criado com sucesso!')
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar anúncio'
      console.error('❌ Erro ao criar anúncio:', err)
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }, [])

  // Atualizar anúncio
  const updateAd = useCallback(async (adId: string, updates: Partial<CreateAdData>) => {
    try {
      setError(null)
      
      const { data, error: supabaseError } = await supabase
        .from('classified_ads')
        .update({
          ...updates
        })
        .eq('id', adId)
        .select()
        .single()

      if (supabaseError) {
        console.error('❌ Erro ao atualizar anúncio:', supabaseError)
        throw new Error(supabaseError.message)
      }

      // Atualizar o anúncio na lista local
      setAds(prev => prev.map(ad => ad.id === adId ? data : ad))
      
      toast.success('Anúncio atualizado com sucesso!')
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar anúncio'
      console.error('❌ Erro ao atualizar anúncio:', err)
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }, [])

  // Deletar anúncio
  const deleteAd = useCallback(async (adId: string) => {
    try {
      setError(null)
      
      const { error: supabaseError } = await supabase
        .from('classified_ads')
        .delete()
        .eq('id', adId)

      if (supabaseError) {
        console.error('❌ Erro ao deletar anúncio:', supabaseError)
        throw new Error(supabaseError.message)
      }

      // Remover o anúncio da lista local
      setAds(prev => prev.filter(ad => ad.id !== adId))
      
      toast.success('Anúncio removido com sucesso!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover anúncio'
      console.error('❌ Erro ao remover anúncio:', err)
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }, [])

  // Buscar anúncios com filtros
  const searchAds = useCallback(async (filters: {
    searchTerm?: string
    category?: string
    location_state?: string
    location_city?: string
    user_type?: 'client' | 'professional'
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('classified_ads')
        .select('*')
        .eq('is_active', true)

      // Aplicar filtros
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }

      if (filters.location_state) {
        query = query.eq('location_state', filters.location_state)
      }

      if (filters.location_city) {
        query = query.eq('location_city', filters.location_city)
      }

      if (filters.user_type) {
        query = query.eq('user_type', filters.user_type)
      }

      // Busca por texto (título e descrição)
      if (filters.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`)
      }

      const { data, error: supabaseError } = await query.order('created_at', { ascending: false })

      if (supabaseError) {
        console.error('❌ Erro na busca:', supabaseError)
        setError('Erro na busca')
        return
      }

      setAds(data || [])
    } catch (err) {
      console.error('💥 Erro crítico na busca:', err)
      setError('Erro inesperado na busca')
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar anúncios na inicialização
  useEffect(() => {
    loadAds()
  }, []) // Remover dependência de loadAds para evitar loop infinito

  // Função para buscar foto do usuário
  const getUserAvatar = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, profile_photo_url')
        .eq('id', userId)
        .single()
      
      if (error) return null
      return data?.avatar_url || data?.profile_photo_url || null
    } catch (err) {
      return null
    }
  }, [])

  return {
    ads,
    loading,
    error,
    loadAds,
    createAd,
    updateAd,
    deleteAd,
    searchAds,
    getUserAvatar
  }
}
