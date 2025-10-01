'use client'

import { useState, useEffect } from 'react'
import { useUserActivity } from '@/hooks/useUserActivity'
import { ActivityStatus } from '@/hooks/useUserActivity'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  UserX,
  Activity
} from 'lucide-react'

interface ActivityStatusIndicatorProps {
  userId: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ActivityStatusIndicator({ 
  userId, 
  showLabel = false, 
  size = 'sm',
  className = '' 
}: ActivityStatusIndicatorProps) {
  const { getActivityStatus } = useUserActivity()
  const [status, setStatus] = useState<ActivityStatus | null>(null)
  const [lastActivity, setLastActivity] = useState<string>('')

  // Simular carregamento de atividade do usuário
  useEffect(() => {
    // Em uma implementação real, você buscaria a atividade do usuário específico
    // Por enquanto, vamos simular com a atividade atual
    const now = new Date().toISOString()
    setLastActivity(now)
    setStatus(getActivityStatus(now))
  }, [userId, getActivityStatus])

  if (!status) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
      </div>
    )
  }

  const getIcon = () => {
    switch (status.status) {
      case 'online':
        return <Wifi className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} text-green-600`} />
      case 'away':
        return <Clock className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} text-yellow-600`} />
      case 'offline':
        return <WifiOff className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} text-red-600`} />
      case 'inactive':
        return <UserX className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} text-gray-600`} />
      default:
        return <Activity className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} text-gray-600`} />
    }
  }

  const getDotColor = () => {
    switch (status.status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-red-500'
      case 'inactive':
        return 'bg-gray-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getPulseClass = () => {
    return status.status === 'online' ? 'animate-pulse' : ''
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 ${className}`}>
            {/* Indicador visual */}
            <div className="relative">
              {getIcon()}
              <div className={`absolute -bottom-1 -right-1 w-2 h-2 ${getDotColor()} rounded-full ${getPulseClass()}`}></div>
            </div>
            
            {/* Label opcional */}
            {showLabel && (
              <span className={`text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">{status.label}</p>
            <p className="text-xs text-gray-500">{status.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Componente simplificado para o sino
export function ActivityDot({ 
  userId, 
  className = '' 
}: { 
  userId: string
  className?: string 
}) {
  const { getActivityStatus } = useUserActivity()
  const [status, setStatus] = useState<ActivityStatus | null>(null)

  useEffect(() => {
    const now = new Date().toISOString()
    setStatus(getActivityStatus(now))
  }, [userId, getActivityStatus])

  if (!status) return null

  const getDotColor = () => {
    switch (status.status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-red-500'
      case 'inactive':
        return 'bg-gray-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getPulseClass = () => {
    return status.status === 'online' ? 'animate-pulse' : ''
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`w-2 h-2 ${getDotColor()} rounded-full ${getPulseClass()} ${className}`}></div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">{status.label}</p>
            <p className="text-xs text-gray-500">{status.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
