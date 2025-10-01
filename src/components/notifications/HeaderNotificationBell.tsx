'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useUnifiedAuth'
import { useNotifications } from './NotificationProviderSimple'
import { NotificationSettingsModal } from './NotificationSettingsModal'

interface HeaderNotificationBellProps {
  className?: string
}

export function HeaderNotificationBell({ className = '' }: HeaderNotificationBellProps) {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  console.log('🔔 HeaderNotificationBell: Renderizando com unreadCount:', unreadCount)

  if (!user) {
    console.log('🔔 HeaderNotificationBell: Usuário não autenticado, não renderizando')
    return null
  }

  const handleClick = () => {
    try {
      setIsOpen(true)
    } catch (error) {
      console.error('Erro ao abrir modal de notificações:', error)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Botão do Sino */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2 hover:bg-gray-100 transition-colors"
        onClick={handleClick}
      >
        {/* Sino */}
        <Bell className="w-5 h-5 text-gray-600" />
        
        {/* Badge de contador */}
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-5 h-5 flex items-center justify-center px-1 z-10"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Modal de Configurações */}
      {isOpen && (
        <NotificationSettingsModal 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </div>
  )
}