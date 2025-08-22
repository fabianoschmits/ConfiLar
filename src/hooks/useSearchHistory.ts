'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { Json } from '@/types/database'

interface SearchFilters {
  location_state?: string
  location_city?: string
  category_id?: string
  price_range?: string
  rating?: number
  availability?: string
  [key: string]: unknown
}

interface SearchHistoryItem {
  id: string
  user_id: string
  search_query: string
  location_state: string | null
  location_city: string | null
  category_id: string | null
  filters: Json | null
  created_at: string
}

export function useSearchHistory() {
  const { profile } = useAuthContext()
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Buscar histórico de busca do usuário do localStorage
  const fetchSearchHistory = async () => {
    if (!profile?.id) return

    setIsLoading(true)
    try {
      const stored = localStorage.getItem(`search_history_${profile.id}`)
      if (stored) {
        const history = JSON.parse(stored) as SearchHistoryItem[]
        setSearchHistory(history)
      } else {
        setSearchHistory([])
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
      setSearchHistory([])
    } finally {
      setIsLoading(false)
    }
  }

  // Salvar nova busca no histórico (localStorage)
  const saveSearch = async (
    searchQuery: string,
    filters?: SearchFilters
  ) => {
    if (!profile?.id) return

    try {
      const newSearch: SearchHistoryItem = {
        id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: profile.id,
        search_query: searchQuery,
        location_state: filters?.location_state || null,
        location_city: filters?.location_city || null,
        category_id: filters?.category_id || null,
        filters: filters ? (filters as Json) : null,
        created_at: new Date().toISOString()
      }

      // Buscar histórico atual
      const stored = localStorage.getItem(`search_history_${profile.id}`)
      let currentHistory: SearchHistoryItem[] = []
      
      if (stored) {
        currentHistory = JSON.parse(stored)
      }

      // Adicionar nova busca no início
      const updatedHistory = [newSearch, ...currentHistory].slice(0, 20) // Manter apenas as últimas 20

      // Salvar no localStorage
      localStorage.setItem(`search_history_${profile.id}`, JSON.stringify(updatedHistory))
      
      // Atualizar estado local
      setSearchHistory(updatedHistory)
    } catch (error) {
      console.error('Erro ao salvar busca:', error)
    }
  }

  // Limpar histórico de busca
  const clearSearchHistory = async () => {
    if (!profile?.id) return

    try {
      localStorage.removeItem(`search_history_${profile.id}`)
      setSearchHistory([])
    } catch (error) {
      console.error('Erro ao limpar histórico:', error)
    }
  }

  // Remover busca específica do histórico
  const removeSearchFromHistory = async (searchId: string) => {
    if (!profile?.id) return

    try {
      const updatedHistory = searchHistory.filter(item => item.id !== searchId)
      localStorage.setItem(`search_history_${profile.id}`, JSON.stringify(updatedHistory))
      setSearchHistory(updatedHistory)
    } catch (error) {
      console.error('Erro ao remover busca:', error)
    }
  }

  // Obter buscas populares (mais frequentes)
  const getPopularSearches = () => {
    if (!searchHistory.length) return []
    
    // Contar frequência de cada busca
    const searchCounts: Record<string, number> = {}
    searchHistory.forEach(item => {
      const key = item.search_query.toLowerCase().trim()
      searchCounts[key] = (searchCounts[key] || 0) + 1
    })
    
    // Ordenar por frequência e retornar as mais populares
    return Object.entries(searchCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query]) => query)
  }

  // Carregar histórico quando o perfil mudar
  useEffect(() => {
    if (profile?.id) {
      fetchSearchHistory()
    }
  }, [profile?.id])

  return {
    searchHistory,
    isLoading,
    fetchSearchHistory,
    saveSearch,
    clearSearchHistory,
    removeSearchFromHistory,
    getPopularSearches
  }
}
