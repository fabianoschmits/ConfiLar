'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// ScrollArea substituído por div com scroll CSS
import { Separator } from '@/components/ui/separator'
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Trash2, 
  Clock,
  AlertCircle,
  MessageCircle,
  Star,
  Calendar,
  Shield,
  Trophy,
  Info
} from 'lucide-react'
import { useNotifications } from './NotificationSystem'
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface SimpleNotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function SimpleNotificationCenter({ isOpen, onClose }: SimpleNotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    isLoading
  } = useNotifications()
  
  const { openChat } = useFloatingChat()

  // Obter ícone por tipo
  const getIconByType = (type: string) => {
    switch (type) {
      case 'message':
      case 'chat':
        return <MessageCircle className="w-4 h-4" />
      case 'review':
        return <Star className="w-4 h-4" />
      case 'booking':
        return <Calendar className="w-4 h-4" />
      case 'verification':
        return <Shield className="w-4 h-4" />
      case 'achievement':
        return <Trophy className="w-4 h-4" />
      case 'system':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  // Obter cor por tipo
  const getColorByType = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'message':
      case 'chat':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'review':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'booking':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'system':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  // Obter cor por prioridade
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificações
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {notifications.length} notificações no total
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <div className="space-y-4 h-full flex flex-col">
            {/* Ações em lote */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Marcar todas como lidas
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearAll}
                  disabled={notifications.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Limpar todas
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                {unreadCount} não lidas
              </div>
            </div>

            <Separator />

            {/* Lista de notificações */}
            <div className="flex-1 overflow-y-auto max-h-96">
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BellOff className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhuma notificação</p>
                    <p className="text-sm">Você está em dia!</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        !notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                      }`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${getColorByType(notification.type)}`}>
                            {getIconByType(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className={`font-medium ${!notification.is_read ? 'font-semibold' : ''}`}>
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2 ml-4">
                                {notification.priority !== 'normal' && (
                                  <Badge 
                                    variant="outline" 
                                    className={getPriorityColor(notification.priority)}
                                  >
                                    {notification.priority}
                                  </Badge>
                                )}
                                
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                                
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeNotification(notification.id)
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(notification.created_at), { 
                                    addSuffix: true, 
                                    locale: ptBR 
                                  })}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {notification.type}
                                </Badge>
                              </div>
                              
                              {(notification.action_url || notification.type === 'message') && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Se for notificação de mensagem, abrir chat
                                    if (notification.type === 'message' && notification.metadata?.conversation_id) {
                                      // Para conversation_id, não passar userName para que seja tratado como conversationId
                                      openChat(notification.metadata.conversation_id)
                                    } else if (notification.type === 'message' && notification.metadata?.sender_id) {
                                      const senderId = notification.metadata.sender_id as string
                                      const senderName = (notification.metadata.sender_name as string) || 'Usuário'
                                      openChat(senderId, senderName)
                                    } else {
                                      // Para outros tipos de notificação, usar action_url
                                      window.open(notification.action_url, '_blank')
                                    }
                                  }}
                                >
                                  {notification.type === 'message' ? 'Abrir conversa' : 'Ver detalhes'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

