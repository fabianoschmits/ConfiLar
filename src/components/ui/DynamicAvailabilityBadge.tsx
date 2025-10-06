'use client'

import { Badge } from '@/components/ui/badge'
import { useUserAvailability } from '@/hooks/useUserAvailability'

interface DynamicAvailabilityBadgeProps {
  userId: string
  className?: string
}

export function DynamicAvailabilityBadge({ userId, className = '' }: DynamicAvailabilityBadgeProps) {
  const { isAvailable, loading, error } = useUserAvailability(userId)

  if (loading) {
    return (
      <Badge 
        variant="secondary"
        className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 ${className}`}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse"></div>
        <span>Carregando...</span>
      </Badge>
    )
  }

  if (error) {
    return (
      <Badge 
        variant="secondary"
        className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 ${className}`}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
        <span>Status</span>
      </Badge>
    )
  }

  return (
    <Badge 
      variant="secondary"
      className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
        isAvailable 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      } ${className}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${
        isAvailable ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      <span>{isAvailable ? 'Disponível' : 'Indisponível'}</span>
    </Badge>
  )
}
