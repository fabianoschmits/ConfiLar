'use client'

import { useEffect } from 'react'

interface CacheCleanerProps {
  onCleanupComplete?: () => void
  showLogs?: boolean
}

export function CacheCleaner({ onCleanupComplete, showLogs = false }: CacheCleanerProps) {
  useEffect(() => {
    const performCleanup = async () => {
      if (showLogs) console.log('🧹 Iniciando limpeza de cache...')
      
      try {
        // Limpar localStorage (dados específicos do app)
        if (typeof window !== 'undefined') {
          const keysToRemove = [
            'mockUser',
            'mockProfile',
            'supabase.auth.token',
            'auth-token',
            'user-session',
            'user-profile',
            'user-preferences',
            'chat-history',
            'notification-preferences',
            'search-history',
            'recent-searches',
            'temp-data',
            'cached-responses'
          ]
          
          keysToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
              localStorage.removeItem(key)
              if (showLogs) console.log(`🗑️ Removido do localStorage: ${key}`)
            }
          })
          
          // Limpar sessionStorage
          sessionStorage.clear()
          if (showLogs) console.log('🗑️ SessionStorage limpo')
          
          // Limpar cache do Service Worker
          if ('caches' in window) {
            const cacheNames = await caches.keys()
            await Promise.all(
              cacheNames.map(cacheName => {
                if (showLogs) console.log(`🗑️ Removendo cache: ${cacheName}`)
                return caches.delete(cacheName)
              })
            )
          }
          
          // Desregistrar Service Workers
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations()
            await Promise.all(
              registrations.map(registration => {
                if (showLogs) console.log(`🗑️ Desregistrando Service Worker: ${registration.scope}`)
                return registration.unregister()
              })
            )
          }
          
          // Limpar IndexedDB
          if ('indexedDB' in window) {
            try {
              const databases = await indexedDB.databases()
              await Promise.all(
                databases.map(db => {
                  if (showLogs) console.log(`🗑️ Removendo database: ${db.name}`)
                  return new Promise((resolve, reject) => {
                    const deleteReq = indexedDB.deleteDatabase(db.name)
                    deleteReq.onsuccess = () => resolve(true)
                    deleteReq.onerror = () => reject(deleteReq.error)
                  })
                })
              )
            } catch (error) {
              if (showLogs) console.warn('⚠️ Erro ao limpar IndexedDB:', error)
            }
          }
          
          if (showLogs) console.log('✅ Limpeza de cache concluída')
        }
        
        // Chamar callback se fornecido
        if (onCleanupComplete) {
          onCleanupComplete()
        }
        
      } catch (error) {
        console.error('❌ Erro durante limpeza de cache:', error)
      }
    }

    performCleanup()
  }, [onCleanupComplete, showLogs])

  return null
}

// Hook para usar a limpeza de cache programaticamente
export function useCacheCleanup() {
  const clearCache = async () => {
    if (typeof window === 'undefined') return
    
    try {
      // Limpar localStorage
      const keysToRemove = [
        'mockUser',
        'mockProfile', 
        'supabase.auth.token',
        'auth-token',
        'user-session',
        'user-profile',
        'user-preferences',
        'chat-history',
        'notification-preferences',
        'search-history',
        'recent-searches',
        'temp-data',
        'cached-responses'
      ]
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      // Limpar sessionStorage
      sessionStorage.clear()
      
      // Limpar cache do Service Worker
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }
      
      // Desregistrar Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map(reg => reg.unregister()))
      }
      
      console.log('✅ Cache limpo com sucesso')
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error)
    }
  }

  return { clearCache }
}
