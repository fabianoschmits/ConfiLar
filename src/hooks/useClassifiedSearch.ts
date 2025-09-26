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
      
      // Buscar anúncios (sem join para evitar erro 400)
      const { data, error } = await supabase
        .from('classified_ads')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Buscar fotos dos usuários separadamente
      const userIds = Array.from(new Set(data?.map(ad => ad.user_id) || []))    
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, profile_photo_url')
        .in('id', userIds)

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
          views: ad.views || ad.views_count || 0,
          user_avatar_url: profile?.avatar_url || profile?.profile_photo_url || ad.user_avatar_url || null,
          ad_type: ad.ad_type
        }
      }) || []

      // Se não há dados reais, adicionar dados de exemplo
      let finalAds = adsWithUserInfo
      if (adsWithUserInfo.length === 0) {
        const mockAds: ClassifiedAd[] = [
          {
            id: 'mock-1',
            user_id: 'mock-user-1',
            user_name: 'João Silva',
            user_type: 'professional',
            title: 'Pedreiro Experiente - Construção e Reforma',
            description: 'Ofereço serviços de pedreiro com mais de 10 anos de experiência. Trabalho com construção, reforma, alvenaria e acabamentos. Orçamento gratuito.',
            category: 'Construção e Reforma',
            location_state: 'SP',
            location_city: 'São Paulo',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
            views: 45,
            user_avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            ad_type: 'oferecer'
          },
          {
            id: 'mock-2',
            user_id: 'mock-user-2',
            user_name: 'Maria Santos',
            user_type: 'client',
            title: 'Preciso de Eletricista Urgente',
            description: 'Preciso de um eletricista para resolver um problema na fiação da minha casa. O problema é urgente e preciso de alguém confiável.',
            category: 'Elétrica',
            location_state: 'RJ',
            location_city: 'Rio de Janeiro',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
            views: 23,
            user_avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            ad_type: 'procurar'
          },
          {
            id: 'mock-3',
            user_id: 'mock-user-3',
            user_name: 'Carlos Oliveira',
            user_type: 'professional',
            title: 'Encanador - Serviços Residenciais',
            description: 'Encanador especializado em serviços residenciais. Desentupimento, reparos, instalações. Atendo emergências 24h.',
            category: 'Hidráulica',
            location_state: 'MG',
            location_city: 'Belo Horizonte',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
            views: 67,
            user_avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            ad_type: 'oferecer'
          },
          {
            id: 'mock-4',
            user_id: 'mock-user-4',
            user_name: 'Ana Costa',
            user_type: 'client',
            title: 'Busco Pintor para Casa Nova',
            description: 'Acabei de comprar uma casa e preciso de um pintor experiente para pintar todos os cômodos. Orçamento flexível.',
            category: 'Pintura',
            location_state: 'RS',
            location_city: 'Porto Alegre',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
            views: 34,
            user_avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            ad_type: 'procurar'
          },
          {
            id: 'mock-5',
            user_id: 'mock-user-5',
            user_name: 'Roberto Lima',
            user_type: 'professional',
            title: 'Jardineiro e Paisagista',
            description: 'Serviços de jardinagem, poda, plantio e paisagismo. Crio jardins lindos e mantenho áreas verdes. Orçamento personalizado.',
            category: 'Jardinagem',
            location_state: 'PR',
            location_city: 'Curitiba',
            created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
            views: 28,
            user_avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            ad_type: 'oferecer'
          },
          {
            id: 'mock-6',
            user_id: 'mock-user-6',
            user_name: 'Fernanda Alves',
            user_type: 'client',
            title: 'Preciso de Limpeza Pós-Obra',
            description: 'Terminei uma reforma e preciso de uma equipe de limpeza para deixar a casa impecável. Preferência por empresa com referências.',
            category: 'Limpeza',
            location_state: 'BA',
            location_city: 'Salvador',
            created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
            views: 19,
            user_avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
            ad_type: 'procurar'
          }
        ]
        finalAds = mockAds
      }

      setClassifiedAds(finalAds)
      setFilteredAds(finalAds)

      // Calcular estatísticas
      const total = finalAds.length
      const offers = finalAds.filter(ad => ad.user_type === 'professional').length
      const requests = finalAds.filter(ad => ad.user_type === 'client').length
      const categories = Array.from(new Set(finalAds.map(ad => ad.category))).length

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
