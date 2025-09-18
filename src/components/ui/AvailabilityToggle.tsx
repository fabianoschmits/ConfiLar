'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useAvailability } from '@/hooks/useAvailability'
import { 
  ToggleRight, 
  ToggleLeft, 
  Loader2,
  Check,
  X,
  Power
} from 'lucide-react'

interface AvailabilityToggleProps {
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function AvailabilityToggle({ 
  className = '', 
  showLabel = true,
  size = 'md'
}: AvailabilityToggleProps) {
  const { isAvailable, loading, error, toggleAvailability } = useAvailability()

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'h-8 w-16 px-2',
          icon: 'h-4 w-4',
          text: 'text-xs'
        }
      case 'lg':
        return {
          button: 'h-12 w-24 px-4',
          icon: 'h-6 w-6',
          text: 'text-base'
        }
      default: // md
        return {
          button: 'h-10 w-20 px-3',
          icon: 'h-5 w-5',
          text: 'text-sm'
        }
    }
  }

  const sizeClasses = getSizeClasses()

  const handleToggle = async () => {
    await toggleAvailability()
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Button
        onClick={handleToggle}
        disabled={loading}
        className={`
          ${sizeClasses.button}
          relative overflow-hidden transition-all duration-200
          border border-gray-200 shadow-sm hover:shadow-md
          ${isAvailable 
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' 
            : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title={isAvailable 
          ? 'Clique para ficar indisponível - Você não receberá mais orçamentos e ofertas' 
          : 'Clique para ficar disponível - Você receberá orçamentos e ofertas de clientes'
        }
      >
        {loading ? (
          <Loader2 className={`${sizeClasses.icon} animate-spin`} />
        ) : isAvailable ? (
          <ToggleRight className={sizeClasses.icon} />
        ) : (
          <ToggleLeft className={sizeClasses.icon} />
        )}
        
        {/* Indicador de status */}
        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          isAvailable ? 'bg-green-200' : 'bg-red-200'
        }`} />
      </Button>

      {showLabel && (
        <div className="flex flex-col">
          <span className={`${sizeClasses.text} font-semibold ${
            isAvailable ? 'text-green-700' : 'text-red-700'
          }`}>
            {isAvailable ? 'Disponível' : 'Indisponível'}
          </span>
          {error && (
            <span className="text-xs text-red-500 font-medium">
              Erro: {error}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Componente compacto para header - Tema Moderno
export function AvailabilityToggleCompact({ className = '' }: { className?: string }) {
  const { isAvailable, loading, toggleAvailability } = useAvailability()

  const handleToggle = async () => {
    await toggleAvailability()
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        relative p-2 h-10 w-10 rounded-lg border border-gray-200 
        shadow-sm hover:shadow-md transition-all duration-200
        ${isAvailable 
          ? 'bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' 
          : 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={isAvailable 
        ? 'Clique para ficar indisponível - Você não receberá mais orçamentos e ofertas' 
        : 'Clique para ficar disponível - Você receberá orçamentos e ofertas de clientes'
      }
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isAvailable ? (
        <Check className="h-5 w-5" />
      ) : (
        <X className="h-5 w-5" />
      )}
      
      {/* Indicador de status pulsante */}
      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
        isAvailable ? 'bg-green-400 animate-pulse' : 'bg-red-400 animate-pulse'
      }`} />
    </button>
  )
}

