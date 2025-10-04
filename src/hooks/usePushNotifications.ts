import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useUnifiedAuth'

interface PushSubscriptionData {
  endpoint: string
  p256dh: string
  auth: string
}

export function usePushNotifications() {
  const { user } = useAuth()
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isGranted, setIsGranted] = useState(false)
  const [isDenied, setIsDenied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verificar suporte do navegador
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
      setIsSupported(supported)
      
      if (supported) {
        checkPermission()
        checkSubscription()
      }
    }

    checkSupport()
  }, [])

  // Verificar permissão
  const checkPermission = useCallback(() => {
    if (!('Notification' in window)) return

    const permission = Notification.permission
    setIsGranted(permission === 'granted')
    setIsDenied(permission === 'denied')
  }, [])

  // Verificar subscription
  const checkSubscription = useCallback(async () => {
    if (!isSupported || !user) return

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) return

      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Erro ao verificar subscription:', error)
    }
  }, [isSupported, user])

  // Solicitar permissão
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Notificações não são suportadas neste navegador')
      return false
    }

    if (Notification.permission === 'granted') {
      setIsGranted(true)
      setIsDenied(false)
      setError(null)
      return true
    }

    if (Notification.permission === 'denied') {
      setIsDenied(true)
      setIsGranted(false)
      setError('Permissão para notificações foi negada. Para ativar, acesse as configurações do navegador.')
      return false
    }

    try {
      setIsLoading(true)
      setError(null)
      
      // Verificar se estamos em um contexto seguro (HTTPS ou localhost)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        setError('Notificações push requerem HTTPS ou localhost')
        return false
      }
      
      // Solicitar permissão com contexto adicional
      const permission = await Notification.requestPermission()
      const granted = permission === 'granted'
      
      setIsGranted(granted)
      setIsDenied(!granted)
      
      if (!granted) {
        if (permission === 'denied') {
          setError('Permissão negada. Para ativar notificações: 1) Clique no ícone de notificações na barra de endereços 2) Selecione "Permitir" 3) Recarregue a página')
        } else {
          setError('Permissão não concedida. Tente novamente.')
        }
      } else {
        // Testar notificação imediatamente após permissão
        try {
          const testNotification = new Notification('ConfiLar - Notificações Ativadas!', {
            body: 'Agora você receberá notificações do ConfiLar',
            icon: '/icon-192x192.png',
            badge: '/icon-96x96.png',
            tag: 'permission-granted'
          })
          
          // Fechar notificação de teste após 3 segundos
          setTimeout(() => {
            testNotification.close()
          }, 3000)
        } catch (testError) {
          console.log('Notificação de teste não pôde ser exibida:', testError)
        }
      }
      
      return granted
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error)
      setError('Erro ao solicitar permissão para notificações. Verifique se o navegador suporta notificações.')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  // Inscrever em notificações push
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !isGranted || !user) {
      setError('Não é possível inscrever: suporte, permissão ou usuário não disponível')
      return false
    }

    try {
      setIsLoading(true)
      setError(null)

      // Verificar se já existe uma subscription
      const existingRegistration = await navigator.serviceWorker.getRegistration()
      if (existingRegistration) {
        const existingSubscription = await existingRegistration.pushManager.getSubscription()
        if (existingSubscription) {
          console.log('Subscription já existe, verificando no servidor...')
          setIsSubscribed(true)
          return true
        }
      }

      // Registrar service worker se necessário
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      
      // Aguardar o service worker estar pronto
      await navigator.serviceWorker.ready

      // Verificar se VAPID key está configurada
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        setError('Chave VAPID não configurada. Contate o administrador.')
        return false
      }

      // Converter VAPID key para Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

      // Obter subscription do push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource
      })

      console.log('Subscription criada:', subscription.endpoint)

      // Converter subscription para formato que podemos enviar
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
      }

      // Enviar para o servidor
      const { error: serverError } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscriptionData.endpoint,
          p256dh: subscriptionData.p256dh,
          auth: subscriptionData.auth
        })

      if (serverError) {
        console.error('Erro ao salvar subscription:', serverError)
        setError('Erro ao salvar configuração de notificações')
        return false
      }

      setIsSubscribed(true)
      
      // Enviar notificação de confirmação
      try {
        const confirmationNotification = new Notification('ConfiLar - Push Ativado!', {
          body: 'Notificações push foram ativadas com sucesso',
          icon: '/icon-192x192.png',
          badge: '/icon-96x96.png',
          tag: 'push-enabled'
        })
        
        setTimeout(() => {
          confirmationNotification.close()
        }, 3000)
      } catch (notifError) {
        console.log('Notificação de confirmação não pôde ser exibida:', notifError)
      }
      
      return true
    } catch (error) {
      console.error('Erro ao inscrever em notificações:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('VAPID')) {
          setError('Erro de configuração VAPID. Contate o administrador.')
        } else if (error.message.includes('permission')) {
          setError('Permissão negada. Verifique as configurações do navegador.')
        } else {
          setError(`Erro ao configurar notificações: ${error.message}`)
        }
      } else {
        setError('Erro ao configurar notificações push')
      }
      
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported, isGranted, user])

  // Função auxiliar para converter VAPID key
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Desinscrever de notificações push
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user) {
      setError('Não é possível desinscrever: suporte ou usuário não disponível')
      return false
    }

    try {
      setIsLoading(true)
      setError(null)

      // Obter subscription atual
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) return false

      const subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        setIsSubscribed(false)
        return true
      }

      // Desinscrever do push manager
      await subscription.unsubscribe()

      // Remover do servidor
      const { error: serverError } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)

      if (serverError) {
        console.error('Erro ao remover subscription:', serverError)
        setError('Erro ao remover configuração de notificações')
        return false
      }

      setIsSubscribed(false)
      return true
    } catch (error) {
      console.error('Erro ao desinscrever de notificações:', error)
      setError('Erro ao remover notificações push')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported, user])

  // Enviar notificação de teste
  const sendTestNotification = useCallback((title: string, body: string) => {
    if (!isGranted) {
      setError('Permissão para notificações não concedida')
      return false
    }

    try {
      new Notification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        tag: 'test-notification'
      })
      return true
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error)
      setError('Erro ao enviar notificação de teste')
      return false
    }
  }, [isGranted])

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Estados
    isSupported,
    isSubscribed,
    isGranted,
    isDenied,
    isLoading,
    error,
    
    // Ações
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    clearError,
    
    // Utilitários
    checkPermission,
    checkSubscription
  }
}