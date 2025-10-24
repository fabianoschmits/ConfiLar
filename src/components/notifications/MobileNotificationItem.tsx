'use client'

import { Trash2, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { NotificationIcon } from './NotificationIcon'

interface MobileNotificationItemProps {
  notification: {
    id: string
    title: string
    message: string
    type: string
    is_read: boolean
    created_at: string
    action_url?: string
    metadata?: {
      post_title?: string
      shared_by?: string
      type?: string
      [key: string]: any
    }
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
  

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message': return 'text-blue-600'
      case 'favorite': return 'text-red-600'
      case 'recommendation': return 'text-yellow-600'
      case 'review': return 'text-yellow-600'
      case 'system': return 'text-gray-600'
      case 'info': return 'text-green-600'  // Compartilhamento em verde
      default: return 'text-gray-600'
    }
  }

  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] relative ${
        !notification.is_read 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
      onClick={() => onClick(notification)}
    >
      <div className="flex items-start gap-3">
        <NotificationIcon type={notification.type} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-medium text-sm ${getNotificationColor(notification.type)}`}>
              {notification.title}
            </h4>
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
            {notification.message}
          </p>
          
          {/* Informações extras para posts compartilhados */}
          {notification.metadata?.type === 'shared_post' && notification.metadata?.post_title && (
            <div className="mt-2 p-2 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded border border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 transition-colors">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">📄 Post:</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 line-clamp-1 mb-1">
                {notification.metadata.post_title}
              </p>
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                <ExternalLink className="h-3 w-3" />
                <span>Clique para ver o post</span>
              </div>
            </div>
          )}
          
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
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
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-100"
            title="Deletar notificação"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
