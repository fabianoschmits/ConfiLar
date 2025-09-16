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
  TrendingUp
} from 'lucide-react'
import { SearchFilters } from './AdvancedSearchFilters'
import { useIBGE } from '@/hooks/useIBGE'
import { Estado, Cidade } from '@/lib/ibge'

interface SearchBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  onSearch: () => void
  filters: SearchFilters
  onToggleFilters: () => void
  showFilters: boolean
  suggestions?: string[]
  onSuggestionClick?: (suggestion: string) => void
  placeholder?: string
  className?: string
  onLocationChange?: (estado?: string, cidade?: string) => void
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onSearch,
  filters,
  onToggleFilters,
  showFilters,
  suggestions = [],
  onSuggestionClick,
  placeholder = "Digite o nome, profissão ou o que você precisa...",
  className = "",
  onLocationChange
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  
  // Estados para filtro de localização
  const { estados = [], cidades = [], loading = false, loadCidades, loadEstados } = useIBGE()
  const [selectedEstado, setSelectedEstado] = useState<Estado | null>(null)
  const [selectedCidade, setSelectedCidade] = useState<Cidade | null>(null)
  const [estadoSearchTerm, setEstadoSearchTerm] = useState('')
  const [cidadeSearchTerm, setCidadeSearchTerm] = useState('')
  const [showEstadoDropdown, setShowEstadoDropdown] = useState(false)
  const [showCidadeDropdown, setShowCidadeDropdown] = useState(false)
  const [filteredEstados, setFilteredEstados] = useState<Estado[]>([])
  const [filteredCidades, setFilteredCidades] = useState<Cidade[]>([])

  const estadoInputRef = useRef<HTMLInputElement>(null)
  const cidadeInputRef = useRef<HTMLInputElement>(null)
  const estadoDropdownRef = useRef<HTMLDivElement>(null)
  const cidadeDropdownRef = useRef<HTMLDivElement>(null)

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
      if (estadoDropdownRef.current && !estadoDropdownRef.current.contains(event.target as Node)) {
        setShowEstadoDropdown(false)
      }
      if (cidadeDropdownRef.current && !cidadeDropdownRef.current.contains(event.target as Node)) {
        setShowCidadeDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtrar estados baseado no termo de busca
  useEffect(() => {
    if (estadoSearchTerm && Array.isArray(estados)) {
      const filtered = estados.filter(estado =>
        estado?.nome?.toLowerCase().includes(estadoSearchTerm.toLowerCase()) ||
        estado?.sigla?.toLowerCase().includes(estadoSearchTerm.toLowerCase())
      )
      setFilteredEstados(filtered)
    } else {
      setFilteredEstados(Array.isArray(estados) ? estados : [])
    }
  }, [estadoSearchTerm, estados])

  // Filtrar cidades baseado no termo de busca
  useEffect(() => {
    if (cidadeSearchTerm && selectedEstado && Array.isArray(cidades)) {
      const filtered = cidades.filter(cidade =>
        cidade?.nome?.toLowerCase().includes(cidadeSearchTerm.toLowerCase())
      )
      setFilteredCidades(filtered)
    } else {
      setFilteredCidades(Array.isArray(cidades) ? cidades : [])
    }
  }, [cidadeSearchTerm, cidades, selectedEstado])

  // Carregar cidades quando um estado for selecionado
  useEffect(() => {
    if (selectedEstado && loadCidades && typeof loadCidades === 'function') {
      loadCidades(selectedEstado.sigla)
      setSelectedCidade(null)
      setCidadeSearchTerm('')
    }
  }, [selectedEstado, loadCidades])

  // Carregar estados automaticamente apenas uma vez
  useEffect(() => {
    if (loadEstados && typeof loadEstados === 'function' && estados.length === 0) {
      loadEstados()
    }
  }, []) // Removido loadEstados e estados.length das dependências

  // Notificar mudanças de localização
  useEffect(() => {
    if (onLocationChange) {
      onLocationChange(selectedEstado?.sigla, selectedCidade?.nome)
    }
  }, [selectedEstado, selectedCidade])

  // Mostrar sugestões quando há texto
  useEffect(() => {
    if (searchTerm.length > 0) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [searchTerm])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch()
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onSearchChange(suggestion)
    onSuggestionClick?.(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const clearSearch = () => {
    onSearchChange('')
    inputRef.current?.focus()
  }

  const handleEstadoSelect = (estado: Estado) => {
    try {
      if (estado && estado.nome) {
        setSelectedEstado(estado)
        setEstadoSearchTerm(estado.nome)
        setShowEstadoDropdown(false)
      }
    } catch (error) {
      console.error('Erro ao selecionar estado:', error)
    }
  }

  const handleCidadeSelect = (cidade: Cidade) => {
    try {
      if (cidade && cidade.nome) {
        setSelectedCidade(cidade)
        setCidadeSearchTerm(cidade.nome)
        setShowCidadeDropdown(false)
      }
    } catch (error) {
      console.error('Erro ao selecionar cidade:', error)
    }
  }

  const clearEstado = () => {
    try {
      setSelectedEstado(null)
      setEstadoSearchTerm('')
      setSelectedCidade(null)
      setCidadeSearchTerm('')
      setShowEstadoDropdown(false)
    } catch (error) {
      console.error('Erro ao limpar estado:', error)
    }
  }

  const clearCidade = () => {
    try {
      setSelectedCidade(null)
      setCidadeSearchTerm('')
      setShowCidadeDropdown(false)
    } catch (error) {
      console.error('Erro ao limpar cidade:', error)
    }
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
      {/* Barra de Busca Principal Brutalista */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black h-6 w-6" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="DIGITE O NOME, PROFISSÃO OU O QUE VOCÊ PRECISA..."
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => {
            if (searchTerm.length > 0) {
              setShowSuggestions(true)
            }
          }}
          className="pl-14 pr-24 py-4 text-lg font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 bg-white text-black placeholder:text-gray-500"
        />
        
        {/* Botão Limpar Brutalista */}
        {searchTerm && (
          <Button
            onClick={clearSearch}
            className="absolute right-20 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-black"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Botão Buscar Brutalista */}
        <Button
          onClick={onSearch}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-black"
        >
          BUSCAR
        </Button>
      </div>

      {/* Filtros Rápidos Brutalistas */}
      <div className="flex items-center gap-3 mt-4">
        <Button
          onClick={onToggleFilters}
          className={`flex items-center gap-2 px-4 py-2 font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all ${
            showFilters 
              ? 'bg-yellow-400 text-black' 
              : 'bg-white text-black hover:bg-yellow-400'
          }`}
        >
          <Filter className="h-4 w-4" />
          FILTROS
          {activeFiltersCount > 0 && (
            <div className="ml-2 bg-red-500 text-white px-2 py-1 text-xs font-black border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              {activeFiltersCount}
            </div>
          )}
        </Button>

        {/* Filtros Ativos Rápidos Brutalistas */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {filters.category !== 'all' && (
              <div className="bg-green-500 text-white px-3 py-1 text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {filters.category.toUpperCase()}
              </div>
            )}
            {filters.state && (
              <div className="bg-blue-500 text-white px-3 py-1 text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {filters.state.toUpperCase()}
              </div>
            )}
            {filters.city && (
              <div className="bg-purple-500 text-white px-3 py-1 text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {filters.city.toUpperCase()}
              </div>
            )}
            {filters.minRating > 0 && (
              <div className="bg-orange-500 text-white px-3 py-1 text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {filters.minRating}+ ESTRELAS
              </div>
            )}
            {filters.verifiedOnly && (
              <div className="bg-emerald-500 text-white px-3 py-1 text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                VERIFICADOS
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filtros de Localização Sequenciais */}
      {showFilters && onLocationChange && (
        <div className="mt-4 space-y-3">
          {/* Campo Estado */}
          <div className="space-y-2">
            <label className="text-sm font-black text-black uppercase flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              ESTADO
            </label>
            <div className="relative" ref={estadoDropdownRef}>
              <Input
                ref={estadoInputRef}
                type="text"
                placeholder="DIGITE O ESTADO..."
                value={estadoSearchTerm}
                onChange={(e) => {
                  setEstadoSearchTerm(e.target.value)
                  setShowEstadoDropdown(true)
                }}
                onFocus={() => setShowEstadoDropdown(true)}
                className="border-4 border-black font-black text-black placeholder:text-gray-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
              {selectedEstado && (
                <Button
                  onClick={clearEstado}
                  size="sm"
                  className="absolute right-2 top-2 bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              
              {showEstadoDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-h-64 overflow-y-auto z-10">
                  {loading ? (
                    <div className="p-4 text-center text-sm font-black bg-yellow-400 text-black border-b-2 border-black">
                      CARREGANDO ESTADOS...
                    </div>
                  ) : Array.isArray(filteredEstados) && filteredEstados.length > 0 ? (
                    filteredEstados.map((estado) => {
                      if (!estado) return null
                      return (
                        <button
                          key={estado.id || `estado-${estado.nome}`}
                          onClick={() => handleEstadoSelect(estado)}
                          className="w-full p-3 text-left hover:bg-yellow-400 border-b-2 border-black last:border-b-0 font-black text-sm transition-colors"
                        >
                          <div className="font-black text-black">{estado.nome || 'Nome não disponível'}</div>
                          <div className="text-xs font-bold text-gray-700">{estado.sigla || ''} - {estado.regiao || ''}</div>
                        </button>
                      )
                    }).filter(Boolean)
                  ) : (
                    <div className="p-4 text-center text-sm font-black text-gray-500 bg-gray-100 border-b-2 border-black">
                      NENHUM ESTADO ENCONTRADO
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Campo Cidade - aparece apenas quando estado for selecionado */}
          {selectedEstado && (
            <div className="space-y-2">
              <label className="text-sm font-black text-black uppercase flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                CIDADE
              </label>
              <div className="relative" ref={cidadeDropdownRef}>
                <Input
                  ref={cidadeInputRef}
                  type="text"
                  placeholder="DIGITE A CIDADE..."
                  value={cidadeSearchTerm}
                  onChange={(e) => {
                    setCidadeSearchTerm(e.target.value)
                    setShowCidadeDropdown(true)
                  }}
                  onFocus={() => setShowCidadeDropdown(true)}
                  className="border-4 border-black font-black text-black placeholder:text-gray-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
                {selectedCidade && (
                  <Button
                    onClick={clearCidade}
                    size="sm"
                    className="absolute right-2 top-2 bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                
                {showCidadeDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-h-64 overflow-y-auto z-10">
                    {loading ? (
                      <div className="p-4 text-center text-sm font-black bg-yellow-400 text-black border-b-2 border-black">
                        CARREGANDO CIDADES...
                      </div>
                    ) : Array.isArray(filteredCidades) && filteredCidades.length > 0 ? (
                      filteredCidades.map((cidade) => {
                        if (!cidade) return null
                        return (
                          <button
                            key={cidade.id || `cidade-${cidade.nome}`}
                            onClick={() => handleCidadeSelect(cidade)}
                            className="w-full p-3 text-left hover:bg-yellow-400 border-b-2 border-black last:border-b-0 font-black text-sm transition-colors"
                          >
                            <div className="font-black text-black">{cidade.nome || 'Nome não disponível'}</div>
                            <div className="text-xs font-bold text-gray-700">{cidade.estadoSigla || ''}</div>
                          </button>
                        )
                      }).filter(Boolean)
                    ) : (
                      <div className="p-4 text-center text-sm font-black text-gray-500 bg-gray-100 border-b-2 border-black">
                        NENHUMA CIDADE ENCONTRADA
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status do Filtro */}
          {(selectedEstado || selectedCidade) && (
            <div className="bg-gray-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3">
              <div className="text-sm font-black text-black uppercase">
                {selectedEstado && selectedCidade ? (
                  `FILTRANDO POR: ${selectedCidade.nome}, ${selectedEstado.sigla}`
                ) : selectedEstado ? (
                  `FILTRANDO POR: ${selectedEstado.nome}`
                ) : (
                  'MOSTRANDO TODOS OS USUÁRIOS'
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dropdown de Sugestões Brutalista */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-50 max-h-80 overflow-y-auto"
        >
          {showSuggestions && suggestions.length > 0 && (
            <div className="p-4">
              <div className="text-sm font-black text-black mb-3 px-2 uppercase">
                SUGESTÕES
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-3 hover:bg-yellow-400 border-b-2 border-black last:border-b-0 text-sm font-black flex items-center gap-3 transition-colors"
                >
                  <Search className="h-4 w-4 text-black" />
                  {suggestion.toUpperCase()}
                </button>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
