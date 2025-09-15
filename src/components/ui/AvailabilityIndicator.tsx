'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  IconCircleCheck, 
  IconCircleX, 
  IconClock,
  IconLoader2
} from '@tabler/icons-react'

interface AvailabilityIndicatorProps {
  isAvailable: boolean
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function AvailabilityIndicator({ 
  isAvailable, 
  loading = false,
  size = 'md',
  showText = true,
  className = ''
}: AvailabilityIndicatorProps) {
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          icon: 'h-3 w-3',
          text: 'text-xs',
          badge: 'px-1.5 py-0.5'
        }
      case 'lg':
        return {
          icon: 'h-5 w-5',
          text: 'text-sm',
          badge: 'px-3 py-1'
        }
      default: // md
        return {
          icon: 'h-4 w-4',
          text: 'text-xs',
          badge: 'px-2 py-1'
        }
    }
  }

  const sizeClasses = getSizeClasses()

  if (loading) {
    return (
      <Badge 
        variant="secondary" 
        className={`${sizeClasses.badge} bg-gray-100 text-gray-600 border border-gray-300 ${className}`}
      >
        <IconLoader2 className={`${sizeClasses.icon} animate-spin mr-1`} />
        {showText && <span className={sizeClasses.text}>Carregando...</span>}
      </Badge>
    )
  }

  if (isAvailable) {
    return (
      <Badge 
        className={`${sizeClasses.badge} bg-green-500 text-white border-2 border-green-600 font-black ${className}`}
      >
        <IconCircleCheck className={`${sizeClasses.icon} mr-1`} />
        {showText && <span className={sizeClasses.text}>DISPONÍVEL</span>}
      </Badge>
    )
  }

  return (
    <Badge 
      className={`${sizeClasses.badge} bg-red-500 text-white border-2 border-red-600 font-black ${className}`}
    >
      <IconCircleX className={`${sizeClasses.icon} mr-1`} />
      {showText && <span className={sizeClasses.text}>INDISPONÍVEL</span>}
    </Badge>
  )
}

// Componente compacto para cards pequenos
export function AvailabilityIndicatorCompact({ 
  isAvailable, 
  loading = false,
  className = ''
}: { 
  isAvailable: boolean
  loading?: boolean
  className?: string
}) {
  if (loading) {
    return (
      <div className={`w-3 h-3 rounded-full bg-gray-300 animate-pulse ${className}`} />
    )
  }

  return (
    <div 
      className={`
        w-3 h-3 rounded-full border-2 border-white shadow-sm
        ${isAvailable ? 'bg-green-500' : 'bg-red-500'}
        ${className}
      `}
      title={isAvailable ? 'Disponível para receber propostas' : 'Indisponível'}
    />
  )
}

