'use client'

import { useState, useEffect } from 'react'
import { Bell, Settings, Trash2, X } from 'lucide-react'
import { useNotifications } from './NotificationProviderSimple'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ModernNotificationCenter } from './ModernNotificationCenter'
import { MobileNotificationCenter } from './MobileNotificationCenter'
import { DesktopNotificationItem } from './DesktopNotificationItem'
import { NotificationPreferences } from './NotificationPreferences'
import { toast } from 'sonner'

interface AdaptiveNotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function AdaptiveNotificationCenter({ isOpen, onClose }: AdaptiveNotificationCenterProps) {
  
  return <FloatingNotificationContent isOpen={isOpen} onClose={onClose} />
}

// Componente simplificado para o popover flutuante
function FloatingNotificationContent({ isOpen, onClose }: AdaptiveNotificationCenterProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [showSettings, setShowSettings] = useState(false)

  // Marcar todas como lidas ao fechar o menu
  useEffect(() => {
    if (!isOpen && unreadCount > 0) {
      markAllAsRead()
    }
  }, [isOpen, unreadCount, markAllAsRead])

  // Função para deletar notificação individual
  const handleDeleteNotification = async (notificationId: string, notificationTitle: string) => {
    try {
      await removeNotification(notificationId)
      toast.success('Notificação removida', {
        description: `"${notificationTitle}" foi removida`
      })
    } catch (error) {
      console.error('Erro ao remover notificação:', error)
      toast.error('Erro ao remover notificação')
    }
  }

  const handleDeleteAll = async () => {
    if (notifications.length === 0) return
    
    const confirmed = window.confirm(
      `Tem certeza que deseja deletar todas as ${notifications.length} notificações? Esta ação não pode ser desfeita.`
    )
    
    if (confirmed) {
      await clearAll()
      toast.success('Todas as notificações foram deletadas')
    }
  }
  
  const filteredNotifications = notifications.filter(notification => {
    return filter === 'all' || (filter === 'unread' && !notification.is_read)
  })

  // Se está mostrando configurações, renderizar painel de configurações
  if (showSettings) {
    return (
      <div className="flex flex-col">
        {/* Header de Configurações */}
        <div className="p-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-200 rounded-md transition-colors"
              >
                <Bell className="w-4 h-4 text-gray-600" />
              </button>
              <h3 className="text-sm font-semibold text-gray-900">Configurações</h3>
            </div>
          </div>
        </div>

        {/* Conteúdo de Configurações */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <NotificationPreferences onBack={() => setShowSettings(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">Notificações</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(true)}
              className="p-1 hover:bg-gray-200 rounded-md transition-colors"
              title="Configurações"
            >
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-md transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === 'all' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === 'unread' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Não lidas
          </button>
        </div>
      </div>

      {/* Lista de Notificações */}
      <div className="divide-y divide-gray-100 overflow-y-auto max-h-[400px] md:max-h-[500px]">
        {filteredNotifications.map((notification) => (
          <DesktopNotificationItem
            key={notification.id}
            notification={notification}
            onDelete={handleDeleteNotification}
            onMarkAsRead={markAsRead}
            onClick={() => {}}
          />
        ))}
      </div>

      {/* Footer com ações */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Limpar todas
            </button>
            <span className="text-xs text-gray-500">
              {filteredNotifications.length} notificação{filteredNotifications.length !== 1 ? 'ões' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {filteredNotifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Bell className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Nenhuma notificação</p>
          <p className="text-sm text-gray-400">Você receberá notificações aqui</p>
        </div>
      )}
    </div>
  )
}