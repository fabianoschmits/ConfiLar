'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface ClassifiedAd {
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

interface ClassifiedFilters {
  searchTerm: string
  state: string
  city: string
  category: string
  adType: 'all' | 'offers' | 'requests'
}

interface ClassifiedStats {
  total: number
  offers: number
  requests: number
  categories: number
}

export function useClassifiedSearch() {
  const [classifiedAds, setClassifiedAds] = useState<ClassifiedAd[]>([])
  const [filteredAds, setFilteredAds] = useState<ClassifiedAd[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<ClassifiedStats>({
    total: 0,
    offers: 0,
    requests: 0,
    categories: 0
  })

  // Carregar todos os anúncios
  const loadClassifiedAds = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('classified_ads')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      const adsWithUserInfo = data?.map(ad => ({
        id: ad.id,
        user_id: ad.user_id,
        user_name: ad.user_name || 'Usuário',
        user_type: ad.user_type || 'client',
        title: ad.title,
        description: ad.description,
        category: ad.category,
        location_state: ad.location_state,
        location_city: ad.location_city,
        created_at: ad.created_at,
        is_active: ad.is_active,
        views: ad.views || ad.views_count || 0,
        user_avatar_url: ad.user_avatar_url
      })) || []

      setClassifiedAds(adsWithUserInfo)
      setFilteredAds(adsWithUserInfo)

      // Calcular estatísticas
      const total = adsWithUserInfo.length
      const offers = adsWithUserInfo.filter(ad => ad.user_type === 'professional').length
      const requests = adsWithUserInfo.filter(ad => ad.user_type === 'client').length
      const categories = Array.from(new Set(adsWithUserInfo.map(ad => ad.category))).length

      setStats({ total, offers, requests, categories })

    } catch (error) {
      console.error('Erro ao carregar anúncios:', error)
      toast.error('Erro ao carregar anúncios')
    } finally {
      setLoading(false)
    }
  }, [])

  // Aplicar filtros
  const applyFilters = useCallback((filters: ClassifiedFilters) => {
    let filtered = [...classifiedAds]

    // Filtrar por tipo de anúncio
    if (filters.adType !== 'all') {
      filtered = filtered.filter(ad => {
        if (filters.adType === 'offers') {
          return ad.user_type === 'professional'
        } else if (filters.adType === 'requests') {
          return ad.user_type === 'client'
        }
        return true
      })
    }

    // Filtrar por termo de busca
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(ad => 
        ad.title.toLowerCase().includes(searchLower) ||
        ad.description.toLowerCase().includes(searchLower) ||
        ad.category.toLowerCase().includes(searchLower) ||
        ad.user_name.toLowerCase().includes(searchLower)
      )
    }

    // Filtrar por estado
    if (filters.state) {
      filtered = filtered.filter(ad => ad.location_state === filters.state)
    }

    // Filtrar por cidade
    if (filters.city) {
      filtered = filtered.filter(ad => ad.location_city === filters.city)
    }

    // Filtrar por categoria
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(ad => ad.category === filters.category)
    }

    setFilteredAds(filtered)
  }, [classifiedAds])

  // Executar busca com filtros
  const executeSearch = useCallback((filters: ClassifiedFilters) => {
    applyFilters(filters)
  }, [applyFilters])

  // Carregar dados iniciais
  useEffect(() => {
    loadClassifiedAds()
  }, [loadClassifiedAds])

  // Aplicar filtros quando os dados mudarem
  useEffect(() => {
    if (classifiedAds.length > 0) {
      // Aplicar filtros padrão (todos os anúncios)
      applyFilters({
        searchTerm: '',
        state: '',
        city: '',
        category: 'all',
        adType: 'all'
      })
    }
  }, [classifiedAds, applyFilters])

  return {
    classifiedAds,
    filteredAds,
    loading,
    stats,
    executeSearch,
    loadClassifiedAds
  }
}
