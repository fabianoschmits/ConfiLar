'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useOptimizedSearch } from '@/hooks/queries/useOptimizedQueries'
import { Logger } from '@/lib/logger'

// ===================================
// HOOK DE BUSCA OTIMIZADO COM DEBOUNCE
// ===================================

interface OptimizedSearchFilters {
  searchTerm: string
  user_type: 'all' | 'client' | 'professional'
  location_state: string
  location_city: string
  minRating: number
  verifiedOnly: boolean
  availableOnly: boolean
  sortBy: 'rating' | 'reviews' | 'name' | 'verified' | 'distance'
  sortOrder: 'asc' | 'desc'
}

const DEFAULT_FILTERS: OptimizedSearchFilters = {
  searchTerm: '',
  user_type: 'all',
  location_state: '',
  location_city: '',
  minRating: 0,
  verifiedOnly: false,
  availableOnly: false,
  sortBy: 'rating',
  sortOrder: 'desc'
}

export function useOptimizedAdvancedSearch() {
  const [filters, setFilters] = useState<OptimizedSearchFilters>(DEFAULT_FILTERS)
  const [debouncedFilters, setDebouncedFilters] = useState<OptimizedSearchFilters>(DEFAULT_FILTERS)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Debounce dos filtros para evitar muitas requisições
  useEffect(() => {
    clearTimeout(debounceTimeoutRef.current)
    
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedFilters(filters)
      Logger.debug('search', 'Filters debounced', { filters })
    }, 300)

    return () => clearTimeout(debounceTimeoutRef.current)
  }, [filters])

  // Query otimizada com cache
  const {
    data: searchData,
    isLoading,
    error,
    refetch
  } = useOptimizedSearch(debouncedFilters)

  // Memoizar resultados processados
  const processedResults = useMemo(() => {
    if (!searchData) {
      return {
        profiles: [],
        stats: {
          totalUsers: 0,
          professionalsCount: 0,
          clientsCount: 0,
          verifiedCount: 0,
          filteredCount: 0,
          hasResults: false,
          hasFilters: false
        }
      }
    }

    Logger.performance.renderTime('SearchResults Processing', 0)
    return searchData
  }, [searchData])

  // Callbacks memoizados para evitar re-renders
  const updateFilters = useCallback((newFilters: Partial<OptimizedSearchFilters>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters }
      Logger.ui.userAction('filter_update', 'search', { 
        updatedFields: Object.keys(newFilters) 
      })
      return updated
    })
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    Logger.ui.userAction('filter_reset', 'search')
  }, [])

  const updateSearchTerm = useCallback((term: string) => {
    updateFilters({ searchTerm: term })
  }, [updateFilters])

  const updateLocation = useCallback((state: string, city: string = '') => {
    updateFilters({ 
      location_state: state, 
      location_city: city 
    })
  }, [updateFilters])

  const toggleFilter = useCallback((filterKey: keyof OptimizedSearchFilters) => {
    if (typeof filters[filterKey] === 'boolean') {
      updateFilters({ [filterKey]: !filters[filterKey] })
    }
  }, [filters, updateFilters])

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      clearTimeout(debounceTimeoutRef.current)
    }
  }, [])

  return {
    // Estado
    filters,
    debouncedFilters,
    isLoading,
    error,
    
    // Dados processados
    profiles: processedResults.profiles,
    stats: processedResults.stats,
    
    // Ações
    updateFilters,
    resetFilters,
    updateSearchTerm,
    updateLocation,
    toggleFilter,
    refetch
  }
}

// ===================================
// HOOK PARA PAGINAÇÃO OTIMIZADA
// ===================================

interface PaginationOptions {
  pageSize?: number
  initialPage?: number
}

export function useOptimizedPagination<T>(
  items: T[],
  options: PaginationOptions = {}
) {
  const { pageSize = 10, initialPage = 1 } = options
  const [currentPage, setCurrentPage] = useState(initialPage)

  // Calcular paginação apenas quando necessário
  const paginationData = useMemo(() => {
    const totalItems = items.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const currentItems = items.slice(startIndex, endIndex)

    const hasNext = currentPage < totalPages
    const hasPrev = currentPage > 1

    Logger.performance.renderTime('Pagination Calculation', 0)

    return {
      currentItems,
      currentPage,
      totalPages,
      totalItems,
      hasNext,
      hasPrev,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalItems)
    }
  }, [items, currentPage, pageSize])

  // Callbacks memoizados
  const goToPage = useCallback((page: number) => {
    const maxPage = Math.ceil(items.length / pageSize)
    const validPage = Math.max(1, Math.min(page, maxPage))
    
    setCurrentPage(validPage)
    Logger.ui.userAction('pagination_change', 'pagination', { 
      page: validPage,
      totalPages: maxPage 
    })
  }, [items.length, pageSize])

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  const goToFirst = useCallback(() => {
    goToPage(1)
  }, [goToPage])

  const goToLast = useCallback(() => {
    const maxPage = Math.ceil(items.length / pageSize)
    goToPage(maxPage)
  }, [items.length, pageSize, goToPage])

  // Reset da página quando items mudam
  useEffect(() => {
    setCurrentPage(1)
  }, [items.length])

  return {
    ...paginationData,
    goToPage,
    nextPage,
    prevPage,
    goToFirst,
    goToLast
  }
}

// ===================================
// HOOK PARA FAVORITOS OTIMIZADO
// ===================================

export function useOptimizedFavorites(userId: string) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  // Carregar favoritos apenas uma vez
  useEffect(() => {
    if (!userId) return

    const loadFavorites = async () => {
      setIsLoading(true)
      try {
        // Simulação - substituir pela sua API
        const favoriteIds = ['id1', 'id2', 'id3'] // Mock data
        setFavorites(new Set(favoriteIds))
        Logger.info('favorites', `Loaded ${favoriteIds.length} favorites for user ${userId}`)
      } catch (error) {
        Logger.error('favorites', error as Error, { userId })
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [userId])

  // Callbacks memoizados
  const toggleFavorite = useCallback(async (itemId: string) => {
    const isFavorite = favorites.has(itemId)
    
    try {
      setFavorites(prev => {
        const newFavorites = new Set(prev)
        if (isFavorite) {
          newFavorites.delete(itemId)
        } else {
          newFavorites.add(itemId)
        }
        return newFavorites
      })

      Logger.ui.userAction(
        isFavorite ? 'unfavorite' : 'favorite', 
        'favorites', 
        { itemId, userId }
      )

      // Aqui você faria a requisição para a API
      // await api.toggleFavorite(userId, itemId)
      
    } catch (error) {
      // Reverter em caso de erro
      setFavorites(prev => {
        const newFavorites = new Set(prev)
        if (isFavorite) {
          newFavorites.add(itemId)
        } else {
          newFavorites.delete(itemId)
        }
        return newFavorites
      })
      
      Logger.error('favorites', error as Error, { itemId, userId })
    }
  }, [favorites, userId])

  const isFavorite = useCallback((itemId: string) => {
    return favorites.has(itemId)
  }, [favorites])

  const favoriteCount = useMemo(() => favorites.size, [favorites])

  const favoritesList = useMemo(() => Array.from(favorites), [favorites])

  return {
    favorites: favoritesList,
    favoriteCount,
    isLoading,
    toggleFavorite,
    isFavorite
  }
}

// ===================================
// HOOK PARA DEBOUNCE GENÉRICO
// ===================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// ===================================
// HOOK PARA THROTTLE GENÉRICO
// ===================================

export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastExecuted = useRef<number>(Date.now())

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + interval) {
      lastExecuted.current = Date.now()
      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now()
        setThrottledValue(value)
      }, interval)

      return () => clearTimeout(timer)
    }
  }, [value, interval])

  return throttledValue
}

// ===================================
// HOOK PARA CACHE LOCAL
// ===================================

interface CacheOptions {
  ttl?: number // Time to live em ms
  storage?: 'memory' | 'localStorage' | 'sessionStorage'
}

export function useLocalCache<T>(
  key: string, 
  options: CacheOptions = {}
) {
  const { ttl = 5 * 60 * 1000, storage = 'memory' } = options
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map())

  const setCache = useCallback((data: T) => {
    const cacheEntry = {
      data,
      timestamp: Date.now()
    }

    if (storage === 'memory') {
      cacheRef.current.set(key, cacheEntry)
    } else {
      try {
        const storageObj = storage === 'localStorage' ? localStorage : sessionStorage
        storageObj.setItem(key, JSON.stringify(cacheEntry))
      } catch (error) {
        Logger.error('cache', error as Error, { key, storage })
      }
    }

    Logger.api.cacheHit(`cache-set-${key}`)
  }, [key, storage])

  const getCache = useCallback((): T | null => {
    let cacheEntry: { data: T; timestamp: number } | null = null

    if (storage === 'memory') {
      cacheEntry = cacheRef.current.get(key) || null
    } else {
      try {
        const storageObj = storage === 'localStorage' ? localStorage : sessionStorage
        const stored = storageObj.getItem(key)
        cacheEntry = stored ? JSON.parse(stored) : null
      } catch (error) {
        Logger.error('cache', error as Error, { key, storage })
        return null
      }
    }

    if (!cacheEntry) {
      Logger.api.cacheMiss(`cache-miss-${key}`)
      return null
    }

    const isExpired = Date.now() - cacheEntry.timestamp > ttl
    if (isExpired) {
      clearCache()
      Logger.api.cacheMiss(`cache-expired-${key}`)
      return null
    }

    Logger.api.cacheHit(`cache-hit-${key}`)
    return cacheEntry.data
  }, [key, storage, ttl])

  const clearCache = useCallback(() => {
    if (storage === 'memory') {
      cacheRef.current.delete(key)
    } else {
      try {
        const storageObj = storage === 'localStorage' ? localStorage : sessionStorage
        storageObj.removeItem(key)
      } catch (error) {
        Logger.error('cache', error as Error, { key, storage })
      }
    }

    Logger.debug('cache', `Cache cleared for key: ${key}`)
  }, [key, storage])

  return {
    setCache,
    getCache,
    clearCache
  }
}
