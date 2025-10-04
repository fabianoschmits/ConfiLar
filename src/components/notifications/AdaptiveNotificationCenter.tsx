'use client'

import { useState, useEffect } from 'react'
import { Bell, Settings, Trash2, X, ArrowLeft, Smartphone } from 'lucide-react'
import { useNotifications } from './NotificationProviderSimple'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ModernNotificationCenter } from './ModernNotificationCenter'
import { MobileNotificationCenter } from './MobileNotificationCenter'
import { DesktopNotificationItem } from './DesktopNotificationItem'
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
  const { isSupported, isGranted, isSubscribed, requestPermission, subscribe, unsubscribe, isLoading, error } = usePushNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [showSettings, setShowSettings] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: true,
    sound: true,
    vibration: true,
    messages: true,
    reviews: true,
    favorites: true,
    recommendations: true,
    system: true
  })

  // Carregar configurações salvas ao montar o componente
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setNotificationSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      }
    }
  }, [])

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

  const updateSetting = (key: string, value: boolean) => {
    const updatedSettings = { ...notificationSettings, [key]: value }
    
    // Atualizar estado
    setNotificationSettings(updatedSettings)
    
    // Salvar automaticamente no localStorage
    localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings))
    
    console.log(`🔔 Configuração salva automaticamente: ${key} = ${value}`)
  }

  const handlePushNotificationToggle = async () => {
    try {
      if (!isGranted) {
        // Solicitar permissão primeiro
        const granted = await requestPermission()
        if (!granted) {
          console.log('❌ Permissão negada para notificações')
          return
        }
      }

      if (isSubscribed) {
        // Desinscrever
        await unsubscribe()
        console.log('🔕 Desinscrito de notificações push')
      } else {
        // Inscrever
        await subscribe()
        console.log('🔔 Inscrito em notificações push')
      }
    } catch (error) {
      console.error('❌ Erro ao alternar notificações push:', error)
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
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
              <h3 className="text-sm font-semibold text-gray-900">Configurações</h3>
            </div>
          </div>
        </div>

        {/* Conteúdo de Configurações */}
        <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
          {/* Notificações Push */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notificações Push</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Ativar notificações push</p>
                <p className="text-xs text-gray-500">Receba notificações no navegador</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notificationSettings.pushEnabled}
                  onChange={(e) => updateSetting('pushEnabled', e.target.checked)}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Som</p>
                <p className="text-xs text-gray-500">Reproduzir som ao receber</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notificationSettings.sound}
                  onChange={(e) => updateSetting('sound', e.target.checked)}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Vibração</p>
                <p className="text-xs text-gray-500">Vibrar no celular</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notificationSettings.vibration}
                  onChange={(e) => updateSetting('vibration', e.target.checked)}
                />
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
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notificationSettings.messages}
                  onChange={(e) => updateSetting('messages', e.target.checked)}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Avaliações</p>
                <p className="text-xs text-gray-500">Novas avaliações recebidas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notificationSettings.reviews}
                  onChange={(e) => updateSetting('reviews', e.target.checked)}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Favoritos</p>
                <p className="text-xs text-gray-500">Quando alguém favorita você</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notificationSettings.favorites}
                  onChange={(e) => updateSetting('favorites', e.target.checked)}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Recomendações</p>
                <p className="text-xs text-gray-500">Quando alguém recomenda você</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notificationSettings.recommendations}
                  onChange={(e) => updateSetting('recommendations', e.target.checked)}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Sistema</p>
                <p className="text-xs text-gray-500">Notificações importantes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notificationSettings.system}
                  onChange={(e) => updateSetting('system', e.target.checked)}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Seção de Notificações Push */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notificações Push</h4>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-blue-900 mb-1">
                      Receber notificações no dispositivo
                    </h5>
                    <p className="text-xs text-blue-700 mb-3">
                      Ative para receber notificações push no celular (PWA) e no computador, mesmo quando o site estiver fechado.
                    </p>
                    
                    {error && (
                      <div className="text-xs text-red-600 mb-3 p-3 bg-red-50 border border-red-200 rounded">
                        <div className="font-medium mb-1">⚠️ Problema com Notificações</div>
                        <div>{error}</div>
                        {error.includes('negada') && (
                          <div className="mt-2 text-xs text-gray-600">
                            <strong>Como resolver no Windows:</strong>
                            <ol className="list-decimal list-inside mt-1 space-y-1">
                              <li>Clique no ícone de notificações na barra de endereços (🔔)</li>
                              <li>Selecione "Permitir" ou "Allow"</li>
                              <li>Recarregue a página (F5)</li>
                              <li>Tente ativar novamente</li>
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <button
                      onClick={handlePushNotificationToggle}
                      disabled={!isSupported || isLoading}
                      className={`
                        w-full px-4 py-2 text-sm font-medium rounded-md transition-colors
                        ${isSubscribed 
                          ? 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }
                        ${!isSupported || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          Processando...
                        </div>
                      ) : isSubscribed ? (
                        <div className="flex items-center justify-center gap-2">
                          <X className="w-4 h-4" />
                          Desativar Notificações Push
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Bell className="w-4 h-4" />
                          Ativar Notificações Push
                        </div>
                      )}
                    </button>
                    
                    {!isSupported && (
                      <p className="text-xs text-gray-500 mt-2">
                        Seu navegador não suporta notificações push
                      </p>
                    )}
                    
                    {isSupported && !isGranted && (
                      <div className="text-xs text-amber-600 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="font-medium mb-2 flex items-center gap-1">
                          <Bell className="w-3 h-3" />
                          Permissão Necessária
                        </div>
                        <div className="text-gray-700">
                          <p className="mb-2 font-medium">Para ativar notificações no Windows:</p>
                          <ol className="list-decimal list-inside space-y-1 text-gray-600 ml-2">
                            <li>Clique no botão "Ativar Notificações Push"</li>
                            <li>Quando aparecer o popup, clique em "Permitir"</li>
                            <li>Se não aparecer popup, clique no ícone 🔔 na barra de endereços</li>
                            <li>Selecione "Permitir" nas configurações do site</li>
                            <li>Recarregue a página (F5) e tente novamente</li>
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
            notification={{
              ...notification,
              created_at: notification.created_at instanceof Date 
                ? notification.created_at.toISOString() 
                : notification.created_at
            }}
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
          <p className="text-sm text-gray-500">Você receberá notificações aqui</p>
      </div>
      )}
    </div>
  )
}