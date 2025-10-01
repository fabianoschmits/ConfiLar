'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNotifications } from './NotificationProviderSimple'
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { AdaptiveNotificationCenter } from './AdaptiveNotificationCenter'
import { ActivityDot } from './ActivityStatusIndicator'

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
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 hover:bg-gray-100 transition-colors"
          >
            {/* Sino sempre visível */}
            <Bell className="w-5 h-5 text-gray-600" />
            
            {/* Indicador de status de atividade */}
            <ActivityDot 
              userId={user.id} 
              className="absolute -top-1 -right-1 z-20" 
            />
            
            {/* Badge de contador - sempre sobreposto */}
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-5 h-5 flex items-center justify-center px-1 z-10"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription>
              Gerencie suas notificações
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <AdaptiveNotificationCenter 
              isOpen={isOpen} 
              onClose={() => setIsOpen(false)} 
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
