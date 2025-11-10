'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Profile } from '@/types/database'
import { supabase } from '@/lib/supabase'
export interface SearchFilters {
  searchTerm: string
  category: string
  state: string
  city: string
  userType: string
  minRating: number
  maxRating: number
  verifiedOnly: boolean
  availableOnly: boolean
  sortBy: string
  sortOrder: string
  priceRange: [number, number]
  experienceYears: number
  hasPortfolio: boolean
  hasReviews: boolean
}

const DEFAULT_FILTERS: SearchFilters = {
  searchTerm: '',
  category: 'all',
  state: '',
  city: '',
  userType: 'all',
  minRating: 0,
  maxRating: 5,
  verifiedOnly: false,
  availableOnly: false,
  sortBy: 'rating',
  sortOrder: 'desc',
  priceRange: [0, 1000],
  experienceYears: 0,
  hasPortfolio: false,
  hasReviews: false
}

export const useAdvancedSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS)
  const [allUsers, setAllUsers] = useState<Profile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar todos os usuários do Supabase
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('❌ Erro ao carregar usuários:', fetchError)
        setError('Erro ao carregar usuários')
        setAllUsers([])
        setFilteredUsers([])
        return
      }

      if (data) {
        console.log('📊 Usuários carregados:', data.length)
        setAllUsers(data as unknown as Profile[])
      } else {
        setAllUsers([])
        setFilteredUsers([])
      }
    } catch (err) {
      console.error('❌ Erro ao carregar usuários:', err)
      setError('Erro inesperado ao carregar usuários')
      setAllUsers([])
      setFilteredUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Aplicar filtros aos usuários
  const applyFilters = useCallback((users: Profile[], currentFilters: SearchFilters) => {
    let filtered = [...users]

    // Filtro por termo de busca
    if (currentFilters.searchTerm.trim()) {
      const term = currentFilters.searchTerm.toLowerCase()
      filtered = filtered.filter(user => {
        // Busca por nome
        const nameMatch = user.full_name?.toLowerCase().includes(term)
        
        // Busca por bio
        const bioMatch = user.bio?.toLowerCase().includes(term)
        
        // Busca por serviços profissionais
        const servicesMatch = user.user_type === 'professional' && 
          user.professional_services?.some(service => 
            service.toLowerCase().includes(term)
          ) || false
        
        // Busca por especialidades/certificações
        const certificationsMatch = user.user_type === 'professional' && 
          user.professional_certifications?.some(cert => 
            cert.toLowerCase().includes(term)
          ) || false

        return nameMatch || bioMatch || servicesMatch || certificationsMatch
      })
    }

    // Filtro por tipo de usuário
    if (currentFilters.userType !== 'all') {
      filtered = filtered.filter(user => user.user_type === currentFilters.userType)
    }

    // Filtro por categoria (apenas para profissionais)
    if (currentFilters.category && currentFilters.category !== 'all') {
      filtered = filtered.filter(user => 
        user.user_type === 'professional' && 
        user.professional_services?.some(service => 
          service.toLowerCase().includes(currentFilters.category.toLowerCase())
        ) || false
      )
    }

    // Filtro por estado (aceita tanto sigla quanto nome completo)
    if (currentFilters.state) {
      filtered = filtered.filter(user => {
        const userState = user.location_state
        const filterState = currentFilters.state
        
        // Verificar se é uma sigla (2 caracteres) ou nome completo
        if (filterState.length === 2) {
          // É uma sigla, comparar diretamente
          return userState === filterState
        } else {
          // É um nome completo, verificar se corresponde à sigla do usuário
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
          return expectedSigla ? userState === expectedSigla : userState === filterState
        }
      })
    }

    // Filtro por cidade
    if (currentFilters.city) {
      filtered = filtered.filter(user => 
        user.location_city === currentFilters.city
      )
    }

    // Filtro por avaliação mínima
    if (currentFilters.minRating > 0) {
      filtered = filtered.filter(user => 
        (user.rating || 0) >= currentFilters.minRating
      )
    }

    // Filtro por avaliação máxima
    if (currentFilters.maxRating < 5) {
      filtered = filtered.filter(user => 
        (user.rating || 0) <= currentFilters.maxRating
      )
    }

    // Filtro por usuários verificados
    if (currentFilters.verifiedOnly) {
      filtered = filtered.filter(user => user.is_verified)
    }

    // Filtro por usuários disponíveis
    if (currentFilters.availableOnly) {
      filtered = filtered.filter(user => user.is_available !== false)
    }

    // Filtro por anos de experiência
    if (currentFilters.experienceYears > 0) {
      filtered = filtered.filter(user => {
        const years = user.professional_experience_years || 0
        return years >= currentFilters.experienceYears
      })
    }

    // Filtro por usuários com portfólio
    if (currentFilters.hasPortfolio) {
      filtered = filtered.filter(user => {
        return user.professional_portfolio_url !== null && user.professional_portfolio_url !== undefined
      })
    }

    // Filtro por usuários com avaliações
    if (currentFilters.hasReviews) {
      filtered = filtered.filter(user => (user.total_reviews || 0) > 0)
    }

    return filtered
  }, [])

  // Ordenar usuários
  const sortUsers = useCallback((users: Profile[], currentFilters: SearchFilters) => {
    const sorted = [...users]

    switch (currentFilters.sortBy) {
      case 'rating':
        sorted.sort((a, b) => {
          const ratingA = a.rating || 0
          const ratingB = b.rating || 0
          return currentFilters.sortOrder === 'desc' 
            ? ratingB - ratingA 
            : ratingA - ratingB
        })
        break
      
      case 'reviews':
        sorted.sort((a, b) => {
          const reviewsA = a.total_reviews || 0
          const reviewsB = b.total_reviews || 0
          return currentFilters.sortOrder === 'desc' 
            ? reviewsB - reviewsA 
            : reviewsA - reviewsB
        })
        break
      
      case 'name':
        sorted.sort((a, b) => {
          const nameA = a.full_name || ''
          const nameB = b.full_name || ''
          return currentFilters.sortOrder === 'desc' 
            ? nameB.localeCompare(nameA)
            : nameA.localeCompare(nameB)
        })
        break
      
      case 'verified':
        sorted.sort((a, b) => {
          const verifiedA = a.is_verified ? 1 : 0
          const verifiedB = b.is_verified ? 1 : 0
          return currentFilters.sortOrder === 'desc' 
            ? verifiedB - verifiedA 
            : verifiedA - verifiedB
        })
        break
      
      case 'distance':
        // TODO: Implementar ordenação por distância
        // Por enquanto, mantém a ordenação atual
        break
    }

    return sorted
  }, [])

  // Aplicar filtros e ordenação quando os filtros mudarem
  useEffect(() => {
    if (allUsers.length === 0) return

    const filtered = applyFilters(allUsers, filters)
    const sorted = sortUsers(filtered, filters)
    setFilteredUsers(sorted)
  }, [allUsers, filters, applyFilters, sortUsers])

  // Carregar usuários na inicialização
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Limpar todos os filtros
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  // Executar busca
  const executeSearch = useCallback(() => {
    // Os filtros já são aplicados automaticamente via useEffect
    console.log('🔍 Executando busca com filtros:', filters)
  }, [filters])

  // Estatísticas dos resultados
  const stats = useMemo(() => {
    const totalUsers = allUsers.length
    const filteredCount = filteredUsers.length
    const professionalsCount = allUsers.filter(u => u.user_type === 'professional').length
    const clientsCount = allUsers.filter(u => u.user_type === 'client').length
    const verifiedCount = allUsers.filter(u => u.is_verified).length

    return {
      totalUsers,
      filteredCount,
      professionalsCount,
      clientsCount,
      verifiedCount,
      hasResults: filteredCount > 0,
      hasFilters: JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS)
    }
  }, [allUsers, filteredUsers, filters])

  return {
    // Estado
    filters,
    allUsers,
    filteredUsers,
    loading,
    error,
    stats,

    // Ações
    updateFilters,
    clearFilters,
    executeSearch,
    loadUsers,

    // Utilitários
    DEFAULT_FILTERS
  }
}
