'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { useLocationFilters, LocationFilter } from '@/hooks/useLocationFilters'
import { EstadoCombobox } from '@/components/search/EstadoCombobox'
import { CidadeCombobox } from '@/components/search/CidadeCombobox'
import { useIBGE } from '@/hooks/useIBGE'

interface LocationFilterSelectorProps {
  className?: string
  onFilterChange?: (filter: LocationFilter) => void
}

export function LocationFilterSelector({ 
  className = '', 
  onFilterChange 
}: LocationFilterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customState, setCustomState] = useState('')
  const [customCity, setCustomCity] = useState('')
  const [showCustomSelector, setShowCustomSelector] = useState(false)
  
  const {
    currentFilter,
    getFilterLabel,
    getFilterIcon,
    getFilterDescription,
    getAvailableFilters,
    setFilter,
    isCustomFilter
  } = useLocationFilters()

  const availableFilters = getAvailableFilters()

  const handleFilterSelect = (filter: LocationFilter) => {
    console.log('🎯 Filtro selecionado:', JSON.stringify(filter, null, 2))
    
    if (filter.type === 'custom') {
      // Resetar estados quando abrir o seletor custom
      setCustomState('')
      setCustomCity('')
      setShowCustomSelector(true)
      setIsOpen(false)
    } else {
      console.log('📤 Aplicando filtro padrão:', filter)
      setFilter(filter)
      onFilterChange?.(filter)
      setIsOpen(false)
    }
  }

  const handleCustomLocationSelect = () => {
    console.log('🎯 Selecionando localização custom:', {
      customState: `"${customState}"`,
      customCity: `"${customCity}"`,
      'customState length': customState?.length,
      'customCity length': customCity?.length,
      'customState type': typeof customState,
      'customCity type': typeof customCity
    })
    
    if (customState && customCity) {
      const customFilter: LocationFilter = {
        type: 'custom',
        state: customState,
        city: customCity,
        country: 'Brasil'
      }
      console.log('✅ Filtro custom criado:', JSON.stringify(customFilter, null, 2))
      console.log('📤 Enviando filtro custom para hook')
      setFilter(customFilter)
      onFilterChange?.(customFilter)
      setShowCustomSelector(false)
    } else if (customState && !customCity) {
      const customFilter: LocationFilter = {
        type: 'custom',
        state: customState,
        country: 'Brasil'
      }
      console.log('✅ Filtro custom criado (apenas estado):', JSON.stringify(customFilter, null, 2))
      console.log('📤 Enviando filtro custom para hook')
      setFilter(customFilter)
      onFilterChange?.(customFilter)
      setShowCustomSelector(false)
    } else {
      console.log('⚠️ Dados incompletos:', {
        customState,
        customCity,
        'tem estado': !!customState,
        'tem cidade': !!customCity
      })
    }
  }

  const handleCancelCustom = () => {
    setCustomState('')
    setCustomCity('')
    setShowCustomSelector(false)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Botão Principal */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between bg-white/80 backdrop-blur-md border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">
            {getFilterIcon(currentFilter)} {getFilterLabel(currentFilter)}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {/* Dropdown de Filtros */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 backdrop-blur-md border-gray-200 shadow-lg">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600 mb-2">
                Filtrar por localização:
              </div>
              
              {availableFilters.map((filter, index) => (
                <button
                  key={index}
                  onClick={() => handleFilterSelect(filter)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    currentFilter.type === filter.type && 
                    currentFilter.city === filter.city &&
                    currentFilter.state === filter.state
                      ? 'bg-blue-50 border border-blue-200 text-blue-700'
                      : 'hover:bg-gray-50 border border-transparent text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getFilterIcon(filter)}</span>
                      <div>
                        <div className="font-medium text-sm">
                          {getFilterLabel(filter)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getFilterDescription(filter)}
                        </div>
                      </div>
                    </div>
                    {currentFilter.type === filter.type && 
                     currentFilter.city === filter.city &&
                     currentFilter.state === filter.state && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                        Ativo
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                💡 <strong>Dica:</strong> Filtros locais mostram posts mais relevantes para você
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seletor Custom de Localização */}
      {showCustomSelector && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 backdrop-blur-md border-gray-200 shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700 mb-3">
                🎯 Escolher localização específica
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Estado
                  </label>
                  <EstadoCombobox
                    value={customState}
                    onValueChange={(value) => {
                      console.log('🏙️ Estado selecionado:', value)
                      setCustomState(value)
                      // Limpar cidade quando estado mudar
                      setCustomCity('')
                    }}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Cidade
                  </label>
                  <CidadeCombobox
                    value={customCity}
                    onValueChange={(value) => {
                      console.log('🏘️ Cidade selecionada:', value)
                      setCustomCity(value)
                    }}
                    estadoSelecionado={customState}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleCustomLocationSelect}
                  disabled={!customState || !customCity}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  Aplicar Filtro
                </Button>
                <Button
                  onClick={handleCancelCustom}
                  variant="outline"
                  className="flex-1 text-sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
