'use client'

import { useEffect } from 'react'

export function PWAInitializer() {
  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          })
          
          console.log('✅ Service Worker registrado:', registration.scope)

          // Verificar atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              console.log('🔄 Nova versão do Service Worker encontrada')
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('✨ Atualização disponível')
                  // Aqui você pode mostrar uma notificação para o usuário
                }
              })
            }
          })

          // Verificar atualizações periodicamente (a cada 5 minutos)
          setInterval(() => {
            registration.update()
          }, 5 * 60 * 1000)

        } catch (error) {
          console.error('❌ Erro ao registrar Service Worker:', error)
        }
      })
    }

    // Listener para mensagens do Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          console.log('📢 Atualização disponível do Service Worker')
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




