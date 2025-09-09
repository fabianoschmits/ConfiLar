'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  X, 
  Filter, 
  MapPin, 
  Clock,
  TrendingUp,
  History
} from 'lucide-react'
import { SearchFilters } from './AdvancedSearchFilters'

interface SearchBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  onSearch: () => void
  filters: SearchFilters
  onToggleFilters: () => void
  showFilters: boolean
  recentSearches?: string[]
  onRecentSearchClick?: (term: string) => void
  suggestions?: string[]
  onSuggestionClick?: (suggestion: string) => void
  placeholder?: string
  className?: string
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onSearch,
  filters,
  onToggleFilters,
  showFilters,
  recentSearches = [],
  onRecentSearchClick,
  suggestions = [],
  onSuggestionClick,
  placeholder = "Digite o nome, profissão ou o que você precisa...",
  className = ""
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showRecentSearches, setShowRecentSearches] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setShowRecentSearches(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Mostrar sugestões quando há texto
  useEffect(() => {
    if (searchTerm.length > 0) {
      setShowSuggestions(true)
      setShowRecentSearches(false)
    } else if (recentSearches.length > 0) {
      setShowSuggestions(false)
      setShowRecentSearches(true)
    } else {
      setShowSuggestions(false)
      setShowRecentSearches(false)
    }
  }, [searchTerm, recentSearches.length])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch()
      setShowSuggestions(false)
      setShowRecentSearches(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onSearchChange(suggestion)
    onSuggestionClick?.(suggestion)
    setShowSuggestions(false)
    setShowRecentSearches(false)
    inputRef.current?.focus()
  }

  const handleRecentSearchClick = (term: string) => {
    onSearchChange(term)
    onRecentSearchClick?.(term)
    setShowSuggestions(false)
    setShowRecentSearches(false)
    inputRef.current?.focus()
  }

  const clearSearch = () => {
    onSearchChange('')
    inputRef.current?.focus()
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.category !== 'all') count++
    if (filters.state) count++
    if (filters.city) count++
    if (filters.userType !== 'all') count++
    if (filters.minRating > 0) count++
    if (filters.verifiedOnly) count++
    if (filters.availableOnly) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className={`relative ${className}`}>
      {/* Barra de Busca Principal */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => {
            if (searchTerm.length > 0) {
              setShowSuggestions(true)
            } else if (recentSearches.length > 0) {
              setShowRecentSearches(true)
            }
          }}
          className="pl-12 pr-20 py-4 text-lg rounded-2xl border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        />
        
        {/* Botão Limpar */}
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-16 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Botão Buscar */}
        <Button
          onClick={onSearch}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 rounded-xl"
        >
          Buscar
        </Button>
      </div>

      {/* Filtros Rápidos */}
      <div className="flex items-center gap-2 mt-3">
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={onToggleFilters}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {/* Filtros Ativos Rápidos */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {filters.category !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {filters.category}
              </Badge>
            )}
            {filters.state && (
              <Badge variant="secondary" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {filters.state}
              </Badge>
            )}
            {filters.city && (
              <Badge variant="secondary" className="text-xs">
                {filters.city}
              </Badge>
            )}
            {filters.minRating > 0 && (
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                {filters.minRating}+ estrelas
              </Badge>
            )}
            {filters.verifiedOnly && (
              <Badge variant="secondary" className="text-xs">
                Verificados
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Dropdown de Sugestões */}
      {(showSuggestions || showRecentSearches) && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {showSuggestions && suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                Sugestões
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-2 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2"
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {showRecentSearches && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-1">
                <History className="h-3 w-3" />
                Buscas Recentes
              </div>
              {recentSearches.slice(0, 5).map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(term)}
                  className="w-full text-left px-2 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
