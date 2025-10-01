'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useUnifiedAuth'
import { useNotifications } from './NotificationProviderSimple'
import { NotificationSettingsModal } from './NotificationSettingsModal'

interface ResponsiveHeaderBellProps {
  className?: string
}

export function ResponsiveHeaderBell({ className = '' }: ResponsiveHeaderBellProps) {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar se é mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  if (!user) return null

  return (
    <div className={`relative ${className}`}>
      {/* Botão do Sino - Responsivo */}
      <Button
        variant="ghost"
        size={isMobile ? "sm" : "sm"}
        className={`relative ${isMobile ? 'p-2' : 'p-2'} hover:bg-gray-100 transition-colors`}
        onClick={() => setIsOpen(true)}
      >
        {/* Sino sempre visível */}
        <div className="relative">
          <Bell className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-600`} />
          
          {/* Badge de contador - responsivo */}
          {unreadCount > 0 && (
            <Badge 
              className={`absolute ${isMobile ? '-top-1 -right-1' : '-top-2 -right-2'} bg-red-500 text-white text-xs min-w-4 h-4 flex items-center justify-center px-1 z-10 ${
                isMobile ? 'text-xs' : 'text-xs'
              }`}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </Button>

      {/* Modal de Configurações - Responsivo */}
      <NotificationSettingsModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </div>
  )
}
