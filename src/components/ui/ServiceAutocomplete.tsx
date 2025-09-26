import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { services, searchServices, Service } from '@/data/services'
import { Button } from './button'

interface ServiceAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function ServiceAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Selecione um serviço...",
  className = "",
  disabled = false
}: ServiceAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Encontrar serviço selecionado
  useEffect(() => {
    if (value) {
      const service = services.find(s => s.id === value)
      setSelectedService(service || null)
    } else {
      setSelectedService(null)
    }
  }, [value])

  // Filtrar serviços baseado no termo de busca
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = searchServices(searchTerm)
      setFilteredServices(filtered)
    } else {
      setFilteredServices(services)
    }
  }, [searchTerm])

  // Abrir dropdown
  const handleOpen = () => {
    if (disabled) return
    setIsOpen(true)
    setSearchTerm('')
    setFilteredServices(services)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // Lidar com digitação no campo
  const handleInputChange = (value: string) => {
    setSearchTerm(value)
    setIsOpen(true)
    
    // Se o usuário digitou algo, tentar encontrar serviço correspondente
    if (value.trim()) {
      const matchingService = services.find(service => 
        service.name.toLowerCase().includes(value.toLowerCase())
      )
      if (matchingService) {
        setSelectedService(matchingService)
        onChange(matchingService.id)
      }
    } else {
      setSelectedService(null)
      onChange('')
    }
  }

  // Fechar dropdown
  const handleClose = () => {
    setIsOpen(false)
    setSearchTerm('')
  }

  // Selecionar serviço
  const handleSelect = (service: Service) => {
    onChange(service.id)
    setSelectedService(service)
    handleClose()
  }

  // Limpar seleção
  const handleClear = () => {
    onChange('')
    setSelectedService(null)
  }

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={selectedService ? selectedService.name : searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg
            bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-colors duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {selectedService && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              ×
            </button>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Lista de serviços */}
          <div className="max-h-60 overflow-y-auto">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleSelect(service)}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-3
                    transition-colors duration-150
                    ${selectedService?.id === service.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                  `}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{service.name}</div>
                    {service.description && (
                      <div className="text-xs text-gray-500 truncate">{service.description}</div>
                    )}
                  </div>
                  {selectedService?.id === service.id && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                Nenhum serviço encontrado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
