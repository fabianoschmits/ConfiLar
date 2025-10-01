'use client'

import { useState, useEffect } from 'react'
import { ActivityStatusIndicator } from '@/components/notifications/ActivityStatusIndicator'
import { ActivityStatus } from '@/hooks/useUserActivity'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  UserX,
  Activity,
  Eye,
  Calendar
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface UserConnectivityStatusProps {
  userId: string
  showDetails?: boolean
  className?: string
}

export function UserConnectivityStatus({ 
  userId, 
  showDetails = false,
  className = '' 
}: UserConnectivityStatusProps) {
  const [lastSeen, setLastSeen] = useState<string>('')
  const [status, setStatus] = useState<ActivityStatus | null>(null)

  useEffect(() => {
    // Simular carregamento de dados do usuário
    const now = new Date().toISOString()
    setLastSeen(now)
    
    // Simular status baseado no tempo
    const getStatus = (lastActivity: string): ActivityStatus => {
      const now = new Date()
      const lastSeen = new Date(lastActivity)
      const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60))
      const diffInHours = Math.floor(diffInMinutes / 60)
      const diffInDays = Math.floor(diffInHours / 24)

      if (diffInMinutes <= 5) {
        return {
          status: 'online',
          label: 'Online agora',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: '🟢',
          description: 'Usuário ativo agora'
        }
      } else if (diffInMinutes <= 30) {
        return {
          status: 'online',
          label: 'Online há pouco',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: '🟢',
          description: `Online há ${diffInMinutes} minutos`
        }
      } else if (diffInHours <= 2) {
        return {
          status: 'away',
          label: 'Ausente',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: '🟡',
          description: `Online há ${diffInHours} horas`
        }
      } else if (diffInDays <= 1) {
        return {
          status: 'offline',
          label: 'Offline',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: '🔴',
          description: `Offline há ${diffInHours} horas`
        }
      } else if (diffInDays <= 7) {
        return {
          status: 'offline',
          label: 'Offline',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: '🔴',
          description: `Offline há ${diffInDays} dias`
        }
      } else {
        return {
          status: 'inactive',
          label: 'Inativo',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: '⚫',
          description: `Inativo há ${diffInDays} dias`
        }
      }
    }

    setStatus(getStatus(now))
  }, [userId])

  if (!status) return null

  const getIcon = () => {
    switch (status.status) {
      case 'online':
        return <Wifi className="w-4 h-4 text-green-600" />
      case 'away':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'offline':
        return <WifiOff className="w-4 h-4 text-red-600" />
      case 'inactive':
        return <UserX className="w-4 h-4 text-gray-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getIcon()}
        <span className={`text-sm font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getIcon()}
          Status de Conectividade
        </CardTitle>
        <CardDescription>
          Informações sobre a atividade do usuário
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status atual */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${status.bgColor}`}>
              {getIcon()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{status.label}</p>
              <p className="text-sm text-gray-500">{status.description}</p>
            </div>
          </div>
          <Badge className={`${status.bgColor} ${status.color} border-0`}>
            {status.status}
          </Badge>
        </div>

        {/* Detalhes adicionais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Eye className="w-4 h-4" />
            <span>Última visualização:</span>
          </div>
          <div className="text-sm text-gray-900">
            {lastSeen ? formatDistanceToNow(new Date(lastSeen), { 
              addSuffix: true, 
              locale: ptBR 
            }) : 'Não disponível'}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Membro desde:</span>
          </div>
          <div className="text-sm text-gray-900">
            {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>

        {/* Indicador visual */}
        <div className="flex items-center gap-2 pt-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Online</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Ausente</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Offline</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Inativo</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
