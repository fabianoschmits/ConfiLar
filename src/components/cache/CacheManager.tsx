'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trash2, Download, Wifi, WifiOff, RefreshCw, HardDrive } from 'lucide-react'

interface CacheInfo {
  name: string
  size: number
  entries: number
  lastUpdated: string
}

interface CacheManagerProps {
  className?: string
}

export function CacheManager({ className }: CacheManagerProps) {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [totalCacheSize, setTotalCacheSize] = useState(0)

  // Detectar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Obter informações dos caches
  const getCacheInfo = async () => {
    if (!('caches' in window)) return

    setIsLoading(true)
    try {
      const cacheNames = await caches.keys()
      const cacheInfoList: CacheInfo[] = []

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

        cacheInfoList.push({
          name: cacheName,
          size: totalSize,
          entries: keys.length,
          lastUpdated: new Date().toISOString(),
        })
      }

      setCacheInfo(cacheInfoList)
      setTotalCacheSize(cacheInfoList.reduce((sum, cache) => sum + cache.size, 0))
    } catch (error) {
      console.error('Erro ao obter informações do cache:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Limpar cache específico
  const clearCache = async (cacheName: string) => {
    try {
      await caches.delete(cacheName)
      await getCacheInfo()
      console.log(`Cache ${cacheName} limpo com sucesso`)
    } catch (error) {
      console.error('Erro ao limpar cache:', error)
    }
  }

  // Limpar todos os caches
  const clearAllCaches = async () => {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      await getCacheInfo()
      console.log('Todos os caches foram limpos')
    } catch (error) {
      console.error('Erro ao limpar todos os caches:', error)
    }
  }

  // Pré-cachear assets importantes
  const precacheAssets = async () => {
    if (!isOnline) return

    setIsLoading(true)
    try {
      const cache = await caches.open('confilar-static-v1.2.0')
      const assetsToCache = [
        '/',
        '/manifest.json',
        '/favicon.ico',
        '/favicon.svg',
        '/icon-192x192.png',
        '/icon-512x512.png',
        '/icon-192x192-maskable.png',
        '/icon-512x512-maskable.png',
        '/imagens/logo/Logo azul - sem fundo - horizontal.png',
        '/imagens/logo/Logo branco - sem fundo - horizontal.png',
      ]

      await cache.addAll(assetsToCache)
      await getCacheInfo()
      console.log('Assets pré-cacheados com sucesso')
    } catch (error) {
      console.error('Erro ao pré-cachear assets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Formatar tamanho em bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Carregar informações do cache na montagem
  useEffect(() => {
    getCacheInfo()
  }, [])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status de Conexão */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isOnline ? 'Conectado' : 'Offline'}
            </span>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Resumo do Cache */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <HardDrive className="h-5 w-5" />
            Resumo do Cache
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tamanho Total</p>
              <p className="text-2xl font-bold">{formatBytes(totalCacheSize)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Caches Ativos</p>
              <p className="text-2xl font-bold">{cacheInfo.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações do Cache */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Ações do Cache</CardTitle>
          <CardDescription>
            Gerencie o cache local para melhorar a performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={getCacheInfo}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
            <Button
              onClick={precacheAssets}
              variant="outline"
              size="sm"
              disabled={!isOnline || isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Pré-cachear
            </Button>
            
            <Button
              onClick={clearAllCaches}
              variant="destructive"
              size="sm"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Tudo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Caches */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Caches Detalhados</CardTitle>
          <CardDescription>
            Informações detalhadas sobre cada cache
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cacheInfo.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Nenhum cache encontrado
            </p>
          ) : (
            <div className="space-y-3">
              {cacheInfo.map((cache) => (
                <div
                  key={cache.name}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{cache.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {cache.entries} entradas • {formatBytes(cache.size)}
                    </p>
                  </div>
                  <Button
                    onClick={() => clearCache(cache.name)}
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações de Performance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Uso do Cache</span>
                <span>{formatBytes(totalCacheSize)}</span>
              </div>
              <Progress 
                value={Math.min((totalCacheSize / (10 * 1024 * 1024)) * 100, 100)} 
                className="h-2"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Limite recomendado: 10MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
