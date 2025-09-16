'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useAvailability } from '@/hooks/useAvailability'
import { 
  IconToggleRight, 
  IconToggleLeft, 
  IconLoader2,
  IconCheck,
  IconX
} from '@tabler/icons-react'

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
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={handleToggle}
        disabled={loading}
        className={`
          ${sizeClasses.button}
          border-2 border-black font-black transition-all
          ${isAvailable 
            ? 'bg-green-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' 
            : 'bg-red-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
          }
        `}
        title={isAvailable 
          ? 'Clique para ficar indisponível - Você não receberá mais orçamentos e ofertas' 
          : 'Clique para ficar disponível - Você receberá orçamentos e ofertas de clientes'
        }
      >
        {loading ? (
          <IconLoader2 className={`${sizeClasses.icon} animate-spin`} />
        ) : isAvailable ? (
          <IconToggleRight className={sizeClasses.icon} />
        ) : (
          <IconToggleLeft className={sizeClasses.icon} />
        )}
      </Button>

      {showLabel && (
        <div className="flex flex-col">
          <span className={`${sizeClasses.text} font-black text-black`}>
            {isAvailable ? 'DISPONÍVEL' : 'INDISPONÍVEL'}
          </span>
          {error && (
            <span className="text-xs text-red-500 font-bold">
              Erro: {error}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Componente compacto para header
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
        p-2 h-12 w-12 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
        hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all relative
        ${isAvailable 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
        }
        ${className}
      `}
      title={isAvailable 
        ? 'Clique para ficar indisponível - Você não receberá mais orçamentos e ofertas' 
        : 'Clique para ficar disponível - Você receberá orçamentos e ofertas de clientes'
      }
    >
      {loading ? (
        <IconLoader2 className="h-6 w-6 animate-spin" />
      ) : isAvailable ? (
        <IconCheck className="h-6 w-6" />
      ) : (
        <IconX className="h-6 w-6" />
      )}
    </button>
  )
}

