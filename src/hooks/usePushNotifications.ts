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
      return true
    }

    if (Notification.permission === 'denied') {
      setIsDenied(true)
      setError('Permissão para notificações foi negada')
      return false
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const permission = await Notification.requestPermission()
      const granted = permission === 'granted'
      
      setIsGranted(granted)
      setIsDenied(!granted)
      
      if (!granted) {
        setError('Permissão para notificações foi negada')
      }
      
      return granted
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error)
      setError('Erro ao solicitar permissão para notificações')
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

      // Registrar service worker se necessário
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Obter subscription do push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

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
      return true
    } catch (error) {
      console.error('Erro ao inscrever em notificações:', error)
      setError('Erro ao configurar notificações push')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported, isGranted, user])

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