'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TestTube, 
  Bell, 
  Settings, 
  Code, 
  Database,
  Zap,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/components/notifications/NotificationProviderSimple'

export function DevTestButton() {
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()
  const { unreadCount } = useNotifications()

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const devTools = [
    {
      name: 'Teste Notificações',
      icon: Bell,
      path: '/teste-notificacoes',
      description: 'Testar sistema de notificações',
      color: 'bg-blue-500'
    },
    {
      name: 'PWA Status',
      icon: Settings,
      path: '/pwa-status',
      description: 'Status do PWA',
      color: 'bg-green-500'
    },
    {
      name: 'API Routes',
      icon: Code,
      path: '/api',
      description: 'Documentação da API',
      color: 'bg-purple-500'
    },
    {
      name: 'Database',
      icon: Database,
      path: '/admin/dashboard',
      description: 'Painel administrativo',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded ? (
        <Button
          onClick={() => setIsExpanded(true)}
          className="relative bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
          size="lg"
        >
          <TestTube className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl border p-4 min-w-64">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-600" />
              Dev Tools
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {devTools.map((tool, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start p-3 h-auto"
                onClick={() => {
                  router.push(tool.path)
                  setIsExpanded(false)
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-1 rounded ${tool.color} text-white`}>
                    <tool.icon className="w-3 h-3" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{tool.name}</p>
                    <p className="text-xs text-gray-500">{tool.description}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Badge variant="outline" className="text-xs">
                DEV MODE
              </Badge>
              <span>Notificações: {unreadCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
