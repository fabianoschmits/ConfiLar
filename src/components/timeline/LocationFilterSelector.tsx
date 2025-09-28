'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { useLocationFilters, LocationFilter } from '@/hooks/useLocationFilters'

interface LocationFilterSelectorProps {
  className?: string
  onFilterChange?: (filter: LocationFilter) => void
}

export function LocationFilterSelector({ 
  className = '', 
  onFilterChange 
}: LocationFilterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const {
    currentFilter,
    getFilterLabel,
    getFilterIcon,
    getFilterDescription,
    getAvailableFilters,
    setFilter
  } = useLocationFilters()

  const availableFilters = getAvailableFilters()

  const handleFilterSelect = (filter: LocationFilter) => {
    setFilter(filter)
    onFilterChange?.(filter)
    setIsOpen(false)
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
    </div>
  )
}
