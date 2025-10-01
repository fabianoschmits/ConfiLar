'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Trash2, 
  Search,
  X,
  Clock,
  MessageCircle,
  Star,
  Calendar,
  Shield,
  Trophy,
  Settings,
  AlertCircle
} from 'lucide-react'
import { useNotifications } from './NotificationProviderSimple'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { NotificationSettingsOnlyModal } from './NotificationSettingsOnlyModal'

interface MobileNotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

// Ícones e cores otimizados para mobile
const NOTIFICATION_CONFIG = {
  message: { icon: MessageCircle, color: 'bg-blue-500', bg: 'bg-blue-50' },
  review: { icon: Star, color: 'bg-yellow-500', bg: 'bg-yellow-50' },
  booking: { icon: Calendar, color: 'bg-green-500', bg: 'bg-green-50' },
  system: { icon: Settings, color: 'bg-gray-500', bg: 'bg-gray-50' },
  achievement: { icon: Trophy, color: 'bg-purple-500', bg: 'bg-purple-50' },
  verification: { icon: Shield, color: 'bg-indigo-500', bg: 'bg-indigo-50' },
  success: { icon: Check, color: 'bg-emerald-500', bg: 'bg-emerald-50' },
  warning: { icon: AlertCircle, color: 'bg-orange-500', bg: 'bg-orange-50' },
  error: { icon: AlertCircle, color: 'bg-red-500', bg: 'bg-red-50' },
  header: { icon: Bell, color: 'bg-cyan-500', bg: 'bg-cyan-50' }
}

export function MobileNotificationCenter({ isOpen, onClose }: MobileNotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  } = useNotifications()

  const [searchTerm, setSearchTerm] = useState('')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Filtrar notificações
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = !showUnreadOnly || !notification.is_read
    
    return matchesSearch && matchesFilter
  })

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-sm">
        {/* Header Mobile */}
        <SheetHeader className="p-4 pb-3 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <SheetTitle className="text-lg font-semibold">
                  Notificações
                </SheetTitle>
                <p className="text-sm text-gray-500">
                  {unreadCount} não lidas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="h-8 w-8 p-0 rounded-full"
                title="Configurações"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Busca e Filtros Mobile */}
          <div className="p-4 bg-gray-50/50 border-b">
            <div className="space-y-3">
              {/* Barra de busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 h-10 text-base" // text-base para mobile
                />
              </div>

              {/* Filtros mobile */}
              <div className="flex gap-2">
                <Button
                  variant={!showUnreadOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowUnreadOnly(false)}
                  className="flex-1 h-9"
                >
                  Todas
                </Button>
                <Button
                  variant={showUnreadOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowUnreadOnly(true)}
                  className="flex-1 h-9"
                >
                  Não lidas
                </Button>
              </div>

              {/* Ações rápidas */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="flex-1 h-9 text-sm"
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Marcar todas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  disabled={notifications.length === 0}
                  className="flex-1 h-9 text-sm text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de Notificações Mobile */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <BellOff className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || showUnreadOnly ? 'Nenhuma notificação encontrada' : 'Nenhuma notificação'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchTerm || showUnreadOnly 
                    ? 'Tente ajustar a busca' 
                    : 'Você será notificado quando houver novidades'
                  }
                </p>
                {(searchTerm || showUnreadOnly) && (
                  <Button variant="outline" size="sm" onClick={() => {
                    setSearchTerm('')
                    setShowUnreadOnly(false)
                  }}>
                    Limpar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {filteredNotifications.map((notification) => {
                  const config = NOTIFICATION_CONFIG[notification.type as keyof typeof NOTIFICATION_CONFIG] || NOTIFICATION_CONFIG.system
                  const IconComponent = config.icon
                  
                  return (
                    <Card 
                      key={notification.id} 
                      className={`transition-all duration-200 ${
                        !notification.is_read ? `${config.bg} border-l-4 border-l-blue-500` : 'bg-white'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Ícone mobile-friendly */}
                          <div className={`p-2.5 rounded-full ${config.color} text-white flex-shrink-0`}>
                            <IconComponent className="w-5 h-5" />
                          </div>

                          {/* Conteúdo */}
                          <div className="flex-1 min-w-0">
                            {/* Título */}
                            <h4 className="font-semibold text-base text-gray-900 mb-1 leading-tight">
                              {notification.title}
                            </h4>
                            
                            {/* Mensagem */}
                            {notification.message && (
                              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                {notification.message}
                              </p>
                            )}

                            {/* Metadados mobile */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                    notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                    notification.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {notification.priority}
                                </Badge>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(notification.created_at), { 
                                    addSuffix: true, 
                                    locale: ptBR 
                                  })}
                                </span>
                              </div>

                              {/* Ações mobile */}
                              <div className="flex items-center gap-1">
                                {!notification.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-8 w-8 p-0 rounded-full bg-blue-100 hover:bg-blue-200"
                                  >
                                    <Check className="w-4 h-4 text-blue-600" />
                                  </Button>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeNotification(notification.id)}
                                  className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Ação da notificação */}
                            {notification.action_url && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    window.open(notification.action_url, '_blank')
                                    markAsRead(notification.id)
                                  }}
                                  className="w-full h-10 text-sm font-medium"
                                >
                                  Ver detalhes
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer mobile com estatísticas */}
          {notifications.length > 0 && (
            <div className="p-4 border-t bg-gray-50/50">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {unreadCount} não lidas de {notifications.length} total
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
      
      {/* Modal de Configurações */}
      <NotificationSettingsOnlyModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </Sheet>
  )
}
