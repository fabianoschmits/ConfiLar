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
  user_avatar_url: string | null
  ad_type: string
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
      
      console.log('📋 Tentando carregar dados reais da tabela classified_ads')
      
      // Tentar buscar dados reais primeiro (usando apenas colunas que existem)
      const { data, error } = await supabase
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
          ad_type
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50)

      console.log('🔍 Resultado da query:', { data: data?.length || 0, error: error?.message || 'Nenhum erro' })

      if (error) {
        console.warn('⚠️ Erro ao buscar dados reais da tabela classified_ads:', error)
        console.log('📋 Nenhum anúncio encontrado no banco de dados')
        
        // Usar array vazio se não houver dados
        setClassifiedAds([])
        setFilteredAds([])
        
        // Estatísticas zeradas
        setStats({ total: 0, offers: 0, requests: 0, categories: 0 })
        setLoading(false)
        return
      }

      // Se chegou aqui, os dados reais foram carregados com sucesso
      console.log('✅ Dados reais carregados com sucesso:', data?.length || 0, 'anúncios')
      
      // Buscar fotos dos usuários separadamente (otimizado)
      const userIds = Array.from(new Set(data?.map(ad => ad.user_id) || []))    
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, profile_photo_url')
        .in('id', userIds)
        .limit(20)

      const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]) || [])

      const adsWithUserInfo = data?.map(ad => {
        const profile = profilesMap.get(ad.user_id)
        return {
          id: ad.id,
          user_id: ad.user_id,
          user_name: profile?.full_name || ad.user_name || 'Usuário',
          user_type: ad.user_type || 'client',
          title: ad.title,
          description: ad.description,
          category: ad.category,
          location_state: ad.location_state,
          location_city: ad.location_city,
          created_at: ad.created_at,
          is_active: ad.is_active,
          views: ad.views || 0,
          user_avatar_url: profile?.avatar_url || profile?.profile_photo_url || null,
          ad_type: ad.ad_type
        }
      }) || []

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
          return ad.user_type === 'professional' || ad.ad_type === 'oferecer'
        } else if (filters.adType === 'requests') {
          return ad.user_type === 'client' || ad.ad_type === 'procurar'
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

    // Filtrar por estado (aceita tanto sigla quanto nome completo)
    if (filters.state) {
      filtered = filtered.filter(ad => {
        const adState = ad.location_state
        const filterState = filters.state
        
        // Verificar se é uma sigla (2 caracteres) ou nome completo
        if (filterState.length === 2) {
          // É uma sigla, comparar diretamente
          return adState === filterState
        } else {
          // É um nome completo, verificar se corresponde à sigla do anúncio
          // Mapear nomes para siglas
          const stateMapping: { [key: string]: string } = {
            'Rio Grande do Sul': 'RS',
            'São Paulo': 'SP',
            'Rio de Janeiro': 'RJ',
            'Minas Gerais': 'MG',
            'Bahia': 'BA',
            'Paraná': 'PR',
            'Santa Catarina': 'SC',
            'Goiás': 'GO',
            'Pernambuco': 'PE',
            'Ceará': 'CE',
            'Pará': 'PA',
            'Maranhão': 'MA',
            'Paraíba': 'PB',
            'Amazonas': 'AM',
            'Espírito Santo': 'ES',
            'Piauí': 'PI',
            'Alagoas': 'AL',
            'Tocantins': 'TO',
            'Rio Grande do Norte': 'RN',
            'Acre': 'AC',
            'Amapá': 'AP',
            'Rondônia': 'RO',
            'Roraima': 'RR',
            'Sergipe': 'SE',
            'Mato Grosso': 'MT',
            'Mato Grosso do Sul': 'MS',
            'Distrito Federal': 'DF'
          }
          
          const expectedSigla = stateMapping[filterState]
          return expectedSigla ? adState === expectedSigla : adState === filterState
        }
      })
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
