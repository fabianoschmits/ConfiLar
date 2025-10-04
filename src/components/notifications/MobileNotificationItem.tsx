'use client'

import { Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MobileNotificationItemProps {
  notification: {
    id: string
    title: string
    message: string
    type: string
    is_read: boolean
    created_at: string
  }
  onDelete: (id: string, title: string) => void
  onMarkAsRead: (id: string) => void
  onClick: (notification: any) => void
}

export function MobileNotificationItem({ 
  notification, 
  onDelete, 
  onMarkAsRead, 
  onClick 
}: MobileNotificationItemProps) {
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return '💬'
      case 'favorite': return '❤️'
      case 'recommendation': return '⭐'
      case 'review': return '⭐'
      case 'system': return '🔔'
      default: return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message': return 'text-blue-600'
      case 'favorite': return 'text-red-600'
      case 'recommendation': return 'text-yellow-600'
      case 'review': return 'text-yellow-600'
      case 'system': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 relative ${
        !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white'
      }`}
      onClick={() => onClick(notification)}
    >
      <div className="flex items-start gap-3">
        <div className="text-lg flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-medium text-sm ${getNotificationColor(notification.type)}`}>
              {notification.title}
            </h4>
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            )}
          </div>
          
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>
          
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </p>
        </div>
        
        {/* Botões de ação - sempre visíveis no mobile */}
        <div className="flex flex-col gap-1">
          {!notification.is_read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onMarkAsRead(notification.id)
              }}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Marcar como lida"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(notification.id, notification.title)
            }}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            title="Deletar notificação"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
