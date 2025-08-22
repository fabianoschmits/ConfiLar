'use client'

import { useState, useEffect } from 'react'
import { useSearchHistory } from '@/hooks/useSearchHistory'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  MapPin, 
  Tag, 
  Search, 
  Trash2, 
  X,
  History,
  TrendingUp
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { SearchHistory as SearchHistoryType } from '@/types/database'

interface SearchFilters {
  location_state?: string | null
  location_city?: string | null
  category_id?: string | null
  price_range?: string
  rating?: number
  availability?: string
  [key: string]: unknown
}

interface SearchHistoryProps {
  onSearchSelect?: (query: string, filters?: SearchFilters) => void
  showSuggestions?: boolean
  maxItems?: number
}

export function SearchHistory({ 
  onSearchSelect, 
  showSuggestions = false, 
  maxItems = 10 
}: SearchHistoryProps) {
  const { 
    searchHistory, 
    isLoading, 
    clearSearchHistory, 
    removeSearchFromHistory,
    getPopularSearches 
  } = useSearchHistory()
  
  const [showAll, setShowAll] = useState(false)
  const popularSearches = getPopularSearches()

  const displayHistory = showAll ? searchHistory : searchHistory.slice(0, maxItems)

  const handleSearchSelect = (search: SearchHistoryType) => {
    if (onSearchSelect) {
      const filters = {
        location_state: search.location_state,
        location_city: search.location_city,
        category_id: search.category_id,
        ...(search.filters && typeof search.filters === 'object' ? search.filters : {})
      }
      onSearchSelect(search.search_query, filters)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      })
    } catch {
      return 'Data desconhecida'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" style={{ animationDuration: '0.6s' }}></div>
            <span className="ml-2 text-gray-600">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (searchHistory.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <History className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Nenhuma busca realizada ainda</p>
          <p className="text-sm text-gray-500 mt-1">
            Suas buscas aparecerão aqui para facilitar futuras consultas
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Buscas Populares */}
      {popularSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Buscas Populares</span>
            </CardTitle>
            <CardDescription>
              Suas buscas mais frequentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularSearches.slice(0, 8).map((query, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-blue-100"
                  onClick={() => onSearchSelect?.(query)}
                >
                  <Search className="h-3 w-3 mr-1" />
                  {query}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Buscas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Histórico de Buscas</span>
              </CardTitle>
              <CardDescription>
                Suas buscas recentes ({searchHistory.length} total)
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSearchHistory}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {displayHistory.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => handleSearchSelect(search)}
                >
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      {search.search_query}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(search.created_at)}</span>
                    </div>
                    
                    {search.location_state && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{search.location_state}</span>
                        {search.location_city && (
                          <span>, {search.location_city}</span>
                        )}
                      </div>
                    )}
                    
                    {search.category_id && (
                      <div className="flex items-center space-x-1">
                        <Tag className="h-3 w-3" />
                        <span>Categoria</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSearchFromHistory(search.id)}
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          {searchHistory.length > maxItems && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="w-full"
              >
                {showAll ? 'Mostrar Menos' : `Mostrar Todas (${searchHistory.length})`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sugestões baseadas no histórico */}
      {showSuggestions && searchHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">
              Sugestões baseadas no seu histórico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {searchHistory
                .slice(0, 6)
                .map((search) => (
                  <Badge
                    key={search.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => handleSearchSelect(search)}
                  >
                    {search.search_query}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
