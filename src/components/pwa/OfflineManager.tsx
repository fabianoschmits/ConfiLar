'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  WifiOff, 
  Wifi, 
  Database, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface CacheInfo {
  name: string
  size: number
  entries: number
}

export function OfflineManager() {
  const [isOnline, setIsOnline] = useState(true)
  const [cacheInfo, setCacheInfo] = useState<CacheInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalSize, setTotalSize] = useState(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Verificar status inicial
    setIsOnline(navigator.onLine)

    // Carregar informações do cache
    loadCacheInfo()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadCacheInfo = async () => {
    if (!('caches' in window)) return

    try {
      const cacheNames = await caches.keys()
      const cacheData: CacheInfo[] = []

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()
        
        let totalSize = 0
        for (const request of keys) {
          const response = await cache.match(request)
          if (response) {
            const blob = await response.blob()
            totalSize += blob.size
          }
        }

        cacheData.push({
          name: cacheName,
          size: totalSize,
          entries: keys.length
        })
      }

      setCacheInfo(cacheData)
      setTotalSize(cacheData.reduce((sum, cache) => sum + cache.size, 0))
    } catch (error) {
      console.error('Erro ao carregar informações do cache:', error)
    }
  }

  const clearCache = async (cacheName?: string) => {
    if (!('caches' in window)) return

    setIsLoading(true)
    try {
      if (cacheName) {
        await caches.delete(cacheName)
        console.log(`🗑️ Cache ${cacheName} limpo`)
      } else {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
        console.log('🗑️ Todos os caches limpos')
      }
      
      await loadCacheInfo()
    } catch (error) {
      console.error('Erro ao limpar cache:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshCache = async () => {
    if (!('serviceWorker' in navigator)) return

    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
        console.log('🔄 Cache atualizado')
      }
    } catch (error) {
      console.error('Erro ao atualizar cache:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-600" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-600" />
          )}
          Gerenciamento Offline
        </CardTitle>
        <CardDescription>
          Gerencie o cache e funcionalidades offline do ConfiLar.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status de conexão */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            {isOnline ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>
        </div>

        {/* Informações do cache */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Cache Armazenado</h3>
            <div className="text-sm text-gray-500">
              {formatBytes(totalSize)} total
            </div>
          </div>

          {cacheInfo.length > 0 ? (
            <div className="space-y-2">
              {cacheInfo.map((cache) => (
                <div key={cache.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">{cache.name}</div>
                      <div className="text-xs text-gray-500">
                        {cache.entries} entradas • {formatBytes(cache.size)}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => clearCache(cache.name)}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Database className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Nenhum cache encontrado</p>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="space-y-2">
          <Button
            onClick={refreshCache}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar Cache
          </Button>

          <Button
            onClick={() => clearCache()}
            disabled={isLoading}
            className="w-full"
            variant="destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Todo Cache
          </Button>
        </div>

        {/* Informações adicionais */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Cache permite uso offline do ConfiLar</p>
          <p>• Dados são sincronizados quando online</p>
          <p>• Limpar cache pode afetar performance offline</p>
        </div>
      </CardContent>
    </Card>
  )
}




