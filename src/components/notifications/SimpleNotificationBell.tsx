'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useUnifiedAuth'
import { useNotifications } from './NotificationProviderSimple'
import { NotificationSettingsModal } from './NotificationSettingsModal'

interface SimpleNotificationBellProps {
  className?: string
}

export function SimpleNotificationBell({ className = '' }: SimpleNotificationBellProps) {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  return (
    <div className={`relative ${className}`}>
      {/* Botão do Sino */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2 hover:bg-gray-100 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        {/* Sino sempre visível */}
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
      <NotificationSettingsModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </div>
  )
}