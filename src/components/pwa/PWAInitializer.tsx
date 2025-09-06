'use client'

import { useEffect } from 'react'

export function PWAInitializer() {
  useEffect(() => {
    // Registrar Service Worker vazio para limpeza de cache
    console.log('🧹 Registrando Service Worker vazio para limpeza...')
    
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          // Registrar o Service Worker vazio
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          })
          
          console.log('✅ Service Worker vazio registrado:', registration.scope)

          // Aguardar um pouco e depois desregistrar
          setTimeout(async () => {
            console.log('🗑️ Desregistrando Service Worker vazio após limpeza...')
            await registration.unregister()
            console.log('✅ Service Worker vazio desregistrado')
          }, 5000) // Aguardar 5 segundos para limpeza

        } catch (error) {
          console.error('❌ Erro ao registrar Service Worker vazio:', error)
        }
      })
    }

    // Listener para mudanças de conectividade
    const handleOnline = () => {
      console.log('🌐 Voltou online')
    }

    const handleOffline = () => {
      console.log('📴 Ficou offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return null // Este componente não renderiza nada
}

export default PWAInitializer




