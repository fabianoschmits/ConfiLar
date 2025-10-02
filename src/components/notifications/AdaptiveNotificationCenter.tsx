'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from './NotificationProviderSimple'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ModernNotificationCenter } from './ModernNotificationCenter'
import { MobileNotificationCenter } from './MobileNotificationCenter'

interface AdaptiveNotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function AdaptiveNotificationCenter({ isOpen, onClose }: AdaptiveNotificationCenterProps) {
  // Para o popover flutuante, vamos usar uma versão simplificada
  return <FloatingNotificationContent isOpen={isOpen} onClose={onClose} />
}

// Componente simplificado para o popover flutuante
function FloatingNotificationContent({ isOpen, onClose }: AdaptiveNotificationCenterProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  
  const filteredNotifications = notifications.filter(notification => {
    return filter === 'all' || (filter === 'unread' && !notification.is_read)
  })

  // Calcular altura dinâmica baseada no número de notificações
  // Usar CSS classes responsivas em vez de window.innerWidth
  // Mobile: máximo 3 notificações, Desktop: máximo 5 notificações
  const maxNotificationsMobile = 3
  const maxNotificationsDesktop = 5
  
  // Para o scroll, vamos usar uma lógica mais simples
  const hasMoreThanMobile = filteredNotifications.length > maxNotificationsMobile
  const hasMoreThanDesktop = filteredNotifications.length > maxNotificationsDesktop

  if (filteredNotifications.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Bell className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">
          Nenhuma notificação
        </h3>
        <p className="text-xs text-gray-500">
          Você será notificado quando houver novidades
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Filtros rápidos */}
      <div className="p-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                filter === 'unread' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Não lidas ({unreadCount})
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Marcar todas
            </button>
          )}
        </div>
      </div>

      {/* Lista de notificações */}
      <div className={`divide-y divide-gray-100 ${
        hasMoreThanMobile ? 'overflow-y-auto max-h-48 md:max-h-64' : ''
      }`}>
        {filteredNotifications.map((notification) => (
          <div 
            key={notification.id}
            className={`p-3 hover:bg-gray-50 transition-colors ${
              !notification.is_read ? 'bg-blue-50/30' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                  {notification.title}
                </p>
                {notification.message && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                  <div className="flex items-center gap-1">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Marcar como lida
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer com contador quando há scroll */}
      {hasMoreThanMobile && (
        <div className="p-2 border-t border-gray-100 bg-gray-50/50 text-center">
          <span className="text-xs text-gray-500">
            {filteredNotifications.length} notificação{filteredNotifications.length !== 1 ? 'ões' : ''} total
          </span>
        </div>
      )}
    </div>
  )
}
