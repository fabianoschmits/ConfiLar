'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNotifications } from './NotificationProviderSimple'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { AdaptiveNotificationCenter } from './AdaptiveNotificationCenter'

interface SimpleHeaderBellProps {
  className?: string
}

export function SimpleHeaderBell({ className = '' }: SimpleHeaderBellProps) {
  const { user } = useAuthContext()
  const { unreadCount } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  console.log('🔔 SimpleHeaderBell: Renderizando com user:', user?.id || 'null', 'unreadCount:', unreadCount)

  if (!user) {
    console.log('🔔 SimpleHeaderBell: Usuário não autenticado, não renderizando')
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 hover:bg-gray-100 transition-colors"
          >
            {/* Sino sempre visível */}
            <Bell className="w-5 h-5 text-gray-600" />
            
            {/* Badge de contador - sempre sobreposto */}
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-5 h-5 flex items-center justify-center px-1 z-10"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent 
          className="w-80 max-w-[calc(100vw-2rem)] p-0 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl"
          align="end"
          sideOffset={8}
        >
          {/* Header */}
          <div className="p-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notificações
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white font-medium px-2 py-1 rounded-full ml-2 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  Gerencie suas notificações e alertos
                </p>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="max-h-[300px] md:max-h-[400px] overflow-hidden">
            <AdaptiveNotificationCenter 
              isOpen={isOpen} 
              onClose={() => setIsOpen(false)} 
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
