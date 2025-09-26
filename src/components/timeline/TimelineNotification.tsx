import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, ExternalLink } from 'lucide-react'
import { TimelineNotification as TimelineNotificationType } from '@/types/timeline'

interface TimelineNotificationProps {
  notification: TimelineNotificationType
  onAction?: (url: string) => void
}

export function TimelineNotification({ notification, onAction }: TimelineNotificationProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora mesmo'
    if (diffInHours === 1) return '1 hora atrás'
    if (diffInHours < 24) return `${diffInHours} horas atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return '1 dia atrás'
    return `${diffInDays} dias atrás`
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'info':
        return 'ℹ️'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className={`overflow-hidden ${!notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getNotificationIcon(notification.notification_type)}</span>
              <h3 className="font-semibold text-gray-900">{notification.title}</h3>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{notification.user_name || 'Sistema'}</span>
              <span>•</span>
              <span>{formatTimeAgo(notification.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getNotificationColor(notification.notification_type)}>
              {notification.category}
            </Badge>
            {!notification.is_read && (
              <Badge className="bg-blue-500 text-white">
                Nova
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-700 mb-3">{notification.message}</p>
        
        {notification.action_url && notification.action_label && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction?.(notification.action_url!)}
              className="flex items-center space-x-2"
            >
              <span>{notification.action_label}</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
