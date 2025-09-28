'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, MapPin, Filter, Star, Users, Briefcase } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useIBGE } from '@/hooks/useIBGE'
import { EstadoCombobox } from './EstadoCombobox'
import { CidadeCombobox } from './CidadeCombobox'
import { services } from '@/data/services'

interface SearchSuggestion {
  id: string
  text: string
  type: 'service' | 'location' | 'professional' | 'recent'
  icon?: string
}

interface AdvancedSearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void
  onFiltersChange: (filters: SearchFilters) => void
  initialFilters?: SearchFilters
  placeholder?: string
  className?: string
}

interface SearchFilters {
  searchTerm: string
  state: string
  city: string
  service: string
  rating: string
  availability: string
  userType: string
}

export function AdvancedSearchBar({
  onSearch,
  onFiltersChange,
  initialFilters = {
    searchTerm: '',
    state: '',
    city: '',
    service: 'all',
    rating: 'all',
    availability: 'all',
    userType: 'all'
  },
  placeholder = "Buscar profissionais, serviços...",
  className = ''
}: AdvancedSearchBarProps) {
  const [query, setQuery] = useState(initialFilters.searchTerm)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const { estados, cidades, loadCidades } = useIBGE()

  // Debounce para sugestões
  const [debouncedQuery, setDebouncedQuery] = useState('')
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Gerar sugestões baseadas na query
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([])
      return
    }

    const generateSuggestions = (): SearchSuggestion[] => {
      const queryLower = debouncedQuery.toLowerCase()
      const suggestions: SearchSuggestion[] = []

      // Sugestões de serviços
      services.forEach(service => {
        if (service.name.toLowerCase().includes(queryLower)) {
          suggestions.push({
            id: `service-${service.name}`,
            text: service.name,
            type: 'service',
            icon: service.icon
          })
        }
      })

      // Sugestões de estados
      estados.forEach(estado => {
        if (estado.nome.toLowerCase().includes(queryLower)) {
          suggestions.push({
            id: `state-${estado.sigla}`,
            text: estado.nome,
            type: 'location',
            icon: '📍'
          })
        }
      })

      // Sugestões de cidades (se estado selecionado)
      if (filters.state && cidades.length > 0) {
        cidades.forEach(cidade => {
          if (cidade.nome.toLowerCase().includes(queryLower)) {
            suggestions.push({
              id: `city-${cidade.nome}`,
              text: cidade.nome,
              type: 'location',
              icon: '🏙️'
            })
          }
        })
      }

      // Sugestões de profissionais comuns
      const commonProfessionals = [
        'Pedreiro', 'Eletricista', 'Encanador', 'Pintor', 'Marceneiro',
        'Diarista', 'Faxineira', 'Babá', 'Cuidador', 'Jardineiro',
        'Cabeleireiro', 'Manicure', 'Personal Trainer', 'Nutricionista'
      ]

      commonProfessionals.forEach(prof => {
        if (prof.toLowerCase().includes(queryLower)) {
          suggestions.push({
            id: `professional-${prof}`,
            text: prof,
            type: 'professional',
            icon: '👨‍💼'
          })
        }
      })

      return suggestions.slice(0, 8) // Limitar a 8 sugestões
    }

    setSuggestions(generateSuggestions())
  }, [debouncedQuery, estados, cidades, filters.state])

  // Busca semântica inteligente
  const getSemanticQuery = (query: string): string => {
    const semanticMap: Record<string, string[]> = {
      'pedreiro': ['construção', 'obra', 'alvenaria', 'tijolo', 'cimento'],
      'eletricista': ['elétrica', 'luz', 'energia', 'fiação', 'tomada'],
      'encanador': ['água', 'cano', 'vazamento', 'hidráulica', 'torneira'],
      'pintor': ['pintura', 'tinta', 'parede', 'cor', 'verniz'],
      'diarista': ['limpeza', 'faxina', 'doméstica', 'casa', 'limpar'],
      'babá': ['criança', 'bebê', 'cuidador infantil', 'creche'],
      'jardineiro': ['jardim', 'planta', 'paisagismo', 'poda', 'verde']
    }

    const queryLower = query.toLowerCase()
    for (const [key, synonyms] of Object.entries(semanticMap)) {
      if (synonyms.some(synonym => queryLower.includes(synonym))) {
        return key
      }
    }
    return query
  }

  const handleInputChange = (value: string) => {
    setQuery(value)
    setShowSuggestions(true)
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    setShowSuggestions(false)
    
    // Aplicar filtro baseado no tipo de sugestão
    if (suggestion.type === 'service') {
      setFilters(prev => ({ ...prev, service: suggestion.text }))
    } else if (suggestion.type === 'location') {
      // Detectar se é estado ou cidade
      const estado = estados.find(estado => estado.nome === suggestion.text)
      if (estado) {
        setFilters(prev => ({ ...prev, state: suggestion.text, city: '' }))
        loadCidades(estado.sigla) // Passar a SIGLA do estado, não o nome
      } else {
        setFilters(prev => ({ ...prev, city: suggestion.text }))
      }
    }
  }

  const handleSearch = () => {
    const semanticQuery = getSemanticQuery(query)
    const searchFilters = { ...filters, searchTerm: semanticQuery }
    setFilters(searchFilters)
    onSearch(semanticQuery, searchFilters)
    onFiltersChange(searchFilters)
    setShowSuggestions(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const clearFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      state: '',
      city: '',
      service: 'all',
      rating: 'all',
      availability: 'all',
      userType: 'all'
    }
    setFilters(clearedFilters)
    setQuery('')
    onFiltersChange(clearedFilters)
  }

  const removeFilter = (filterKey: keyof SearchFilters) => {
    const newFilters = { ...filters, [filterKey]: filterKey === 'service' ? 'all' : '' }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const getFilterChips = () => {
    const chips = []
    
    if (filters.state) {
      chips.push({ key: 'state', label: `Estado: ${filters.state}`, value: filters.state })
    }
    if (filters.city) {
      chips.push({ key: 'city', label: `Cidade: ${filters.city}`, value: filters.city })
    }
    if (filters.service !== 'all') {
      chips.push({ key: 'service', label: `Serviço: ${filters.service}`, value: filters.service })
    }
    if (filters.rating !== 'all') {
      chips.push({ key: 'rating', label: `Avaliação: ${filters.rating}+`, value: filters.rating })
    }
    if (filters.availability !== 'all') {
      chips.push({ key: 'availability', label: `Disponível`, value: filters.availability })
    }
    if (filters.userType !== 'all') {
      chips.push({ key: 'userType', label: `Tipo: ${filters.userType}`, value: filters.userType })
    }
    
    return chips
  }

  return (
    <div className={`relative ${className}`}>
      {/* Barra de busca principal */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="pl-10 pr-20 h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="h-8 px-2"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSearch}
              className="h-8 px-4 bg-blue-600 hover:bg-blue-700"
            >
              Buscar
            </Button>
          </div>
        </div>

        {/* Sugestões */}
        {showSuggestions && suggestions.length > 0 && (
          <Card ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border-0 bg-white">
            <CardContent className="p-0">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-lg">{suggestion.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{suggestion.text}</div>
                    <div className="text-sm text-gray-500 capitalize">{suggestion.type}</div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filtros visuais com chips */}
      {getFilterChips().length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {getFilterChips().map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
            >
              {chip.label}
              <button
                onClick={() => removeFilter(chip.key as keyof SearchFilters)}
                className="ml-2 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Limpar todos
          </Button>
        </div>
      )}

      {/* Filtros avançados - Escondidos por padrão */}
      {showAdvancedFilters && (
        <Card className="mt-4 p-4 bg-gray-50 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros Avançados
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Estado */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Estado</label>
              <EstadoCombobox
                value={filters.state}
                onValueChange={(newState) => {
                  setFilters(prev => ({ ...prev, state: newState, city: '' }))
                }}
                placeholder="Digite ou selecione o estado"
                className="w-full"
              />
            </div>

            {/* Cidade */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Cidade</label>
              <CidadeCombobox
                value={filters.city}
                onValueChange={(newCity) => setFilters(prev => ({ ...prev, city: newCity }))}
                estadoSelecionado={filters.state}
                placeholder="Digite ou selecione a cidade"
                className="w-full"
              />
            </div>

            {/* Serviço */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Serviço</label>
              <select
                value={filters.service}
                onChange={(e) => setFilters(prev => ({ ...prev, service: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos os serviços</option>
                {services.map(service => (
                  <option key={service.name} value={service.name}>
                    {service.icon} {service.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Avaliação */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Avaliação mínima</label>
              <select
                value={filters.rating}
                onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Qualquer avaliação</option>
                <option value="4">4+ estrelas</option>
                <option value="3">3+ estrelas</option>
                <option value="2">2+ estrelas</option>
              </select>
            </div>

            {/* Disponibilidade */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Disponibilidade</label>
              <select
                value={filters.availability}
                onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="available">Disponível agora</option>
                <option value="this_week">Esta semana</option>
                <option value="this_month">Este mês</option>
              </select>
            </div>

            {/* Tipo de usuário */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Tipo</label>
              <select
                value={filters.userType}
                onChange={(e) => setFilters(prev => ({ ...prev, userType: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="professional">Profissionais</option>
                <option value="client">Clientes</option>
              </select>
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-gray-600"
            >
              Limpar Filtros
            </Button>
            <Button
              size="sm"
              onClick={() => {
                handleSearch()
                setShowAdvancedFilters(false)
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Aplicar Filtros
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
