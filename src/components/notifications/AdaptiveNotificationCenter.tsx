'use client'

import { useState, useEffect } from 'react'
import { Bell, Settings, Trash2 } from 'lucide-react'
import { useNotifications } from './NotificationProviderSimple'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ModernNotificationCenter } from './ModernNotificationCenter'
import { MobileNotificationCenter } from './MobileNotificationCenter'
import { toast } from 'sonner'

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
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [showSettings, setShowSettings] = useState(false)

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
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Notificações Push */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notificações Push</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Ativar notificações push</p>
                <p className="text-xs text-gray-500">Receba notificações no navegador</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Som</p>
                <p className="text-xs text-gray-500">Reproduzir som ao receber</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Vibração</p>
                <p className="text-xs text-gray-500">Vibrar no celular</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4"></div>

          {/* Tipos de Notificação */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipos de Notificação</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Mensagens</p>
                <p className="text-xs text-gray-500">Chat e mensagens diretas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Avaliações</p>
                <p className="text-xs text-gray-500">Novas avaliações recebidas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Favoritos</p>
                <p className="text-xs text-gray-500">Quando alguém favorita você</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Recomendações</p>
                <p className="text-xs text-gray-500">Quando alguém recomenda você</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Agendamentos</p>
                <p className="text-xs text-gray-500">Novos agendamentos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Sistema</p>
                <p className="text-xs text-gray-500">Atualizações e avisos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Conquistas</p>
                <p className="text-xs text-gray-500">Novas conquistas desbloqueadas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Verificação</p>
                <p className="text-xs text-gray-500">Status de verificação</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4"></div>

          {/* E-mail */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Notificações por e-mail</p>
                <p className="text-xs text-gray-500">Receber cópias por e-mail</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Resumo diário</p>
                <p className="text-xs text-gray-500">Resumo das notificações do dia</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4"></div>

          {/* Privacidade */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Privacidade</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Mostrar conteúdo</p>
                <p className="text-xs text-gray-500">Exibir prévia das mensagens</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Agrupar notificações</p>
                <p className="text-xs text-gray-500">Agrupar notificações similares</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Marcar como lida automaticamente</p>
                <p className="text-xs text-gray-500">Ao visualizar a notificação</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (filteredNotifications.length === 0) {
    return (
      <div className="flex flex-col">
        {/* Header com botão de configurações */}
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
                Todas (0)
              </button>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
              title="Configurações"
            >
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Conteúdo vazio */}
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
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Filtros rápidos e ações */}
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
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1"
              >
                Marcar todas
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="p-1.5 hover:bg-red-100 rounded-md transition-colors"
                title="Deletar todas as notificações"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
              title="Configurações"
            >
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Lista de notificações com scroll */}
      <div className="divide-y divide-gray-100 overflow-y-auto max-h-[400px] md:max-h-[500px]">
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
    </div>
  )
}
