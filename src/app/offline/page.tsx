'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WifiOff, RefreshCw, Home, MessageCircle, Search } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Verificar status inicial
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-gray-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            ConfiLar Offline
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isOnline 
              ? 'Conexão restaurada! Recarregando...' 
              : 'Você está offline. Algumas funcionalidades podem não estar disponíveis.'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isOnline && (
            <>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Verifique sua conexão com a internet e tente novamente.
                </p>
                
                <Button 
                  onClick={handleRetry}
                  className="w-full"
                  disabled={retryCount > 3}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                  {retryCount > 0 && ` (${retryCount})`}
                </Button>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-3">
                  Funcionalidades disponíveis offline:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Home className="w-4 h-4 mr-2" />
                    Página inicial
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Mensagens (limitado)
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Search className="w-4 h-4 mr-2" />
                    Busca (cache)
                  </div>
                </div>
              </div>
            </>
          )}

          {isOnline && (
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-sm text-green-600 font-medium">
                Conexão restaurada!
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Redirecionando automaticamente...
              </p>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex space-x-2">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Início
                </Button>
              </Link>
              <Link href="/buscar" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



