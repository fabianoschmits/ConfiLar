import { useCallback } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { NotificationService } from '@/services/NotificationService'

/**
 * Hook para testar o sistema de notificações
 */
export function useNotificationTester() {
  const { user } = useAuthContext()

  // Testar notificação de mensagem
  const testMessageNotification = useCallback(async () => {
    if (!user) return

    try {
      await NotificationService.notifyNewMessage(
        user.id,
        'João Silva',
        'Olá! Gostaria de contratar seus serviços.',
        'test-chat-123'
      )
      console.log('✅ Notificação de mensagem criada')
    } catch (error) {
      console.error('❌ Erro ao criar notificação de mensagem:', error)
    }
  }, [user])

  // Testar notificação de avaliação
  const testReviewNotification = useCallback(async () => {
    if (!user) return

    try {
      await NotificationService.notifyNewReview(
        user.id,
        'Maria Santos',
        5,
        'test-review-123'
      )
      console.log('✅ Notificação de avaliação criada')
    } catch (error) {
      console.error('❌ Erro ao criar notificação de avaliação:', error)
    }
  }, [user])

  // Testar notificação de favorito
  const testFavoriteNotification = useCallback(async () => {
    if (!user) return

    try {
      await NotificationService.notifyNewFavorite(
        user.id,
        'Pedro Costa',
        user.id
      )
      console.log('✅ Notificação de favorito criada')
    } catch (error) {
      console.error('❌ Erro ao criar notificação de favorito:', error)
    }
  }, [user])

  // Testar notificação de conquista
  const testAchievementNotification = useCallback(async () => {
    if (!user) return

    try {
      await NotificationService.notifyAchievement(
        user.id,
        'Primeiro Cliente',
        'Parabéns! Você recebeu seu primeiro cliente!',
        'https://example.com/badge.png'
      )
      console.log('✅ Notificação de conquista criada')
    } catch (error) {
      console.error('❌ Erro ao criar notificação de conquista:', error)
    }
  }, [user])

  // Testar notificação de sistema
  const testSystemNotification = useCallback(async () => {
    if (!user) return

    try {
      await NotificationService.notifySystem(
        user.id,
        'Sistema atualizado',
        'Nova versão do ConfiLar disponível com melhorias!',
        'normal'
      )
      console.log('✅ Notificação de sistema criada')
    } catch (error) {
      console.error('❌ Erro ao criar notificação de sistema:', error)
    }
  }, [user])

  // Testar notificação de segurança
  const testSecurityNotification = useCallback(async () => {
    if (!user) return

    try {
      await NotificationService.notifySecurity(
        user.id,
        'Login suspeito',
        'Detectamos um login de um novo dispositivo'
      )
      console.log('✅ Notificação de segurança criada')
    } catch (error) {
      console.error('❌ Erro ao criar notificação de segurança:', error)
    }
  }, [user])

  // Testar notificação de manutenção
  const testMaintenanceNotification = useCallback(async () => {
    if (!user) return

    try {
      await NotificationService.notifyMaintenance(
        user.id,
        '2024-01-15 02:00',
        '2 horas'
      )
      console.log('✅ Notificação de manutenção criada')
    } catch (error) {
      console.error('❌ Erro ao criar notificação de manutenção:', error)
    }
  }, [user])

  // Testar notificação de atualização
  const testUpdateNotification = useCallback(async () => {
    if (!user) return

    try {
      await NotificationService.notifyUpdate(
        user.id,
        '2.1.0',
        ['Chat melhorado', 'Novas notificações', 'Interface atualizada']
      )
      console.log('✅ Notificação de atualização criada')
    } catch (error) {
      console.error('❌ Erro ao criar notificação de atualização:', error)
    }
  }, [user])

  // Testar notificação de lembrete
  const testReminderNotification = useCallback(async () => {
    if (!user) return

    try {
      await NotificationService.notifyReminder(
        user.id,
        'Complete seu perfil',
        'Adicione mais informações para melhorar sua visibilidade',
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      )
      console.log('✅ Notificação de lembrete criada')
    } catch (error) {
      console.error('❌ Erro ao criar notificação de lembrete:', error)
    }
  }, [user])

  // Testar todas as notificações
  const testAllNotifications = useCallback(async () => {
    if (!user) return

    console.log('🧪 Testando todas as notificações...')
    
    await testMessageNotification()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testReviewNotification()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testFavoriteNotification()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testAchievementNotification()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testSystemNotification()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testSecurityNotification()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testMaintenanceNotification()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testUpdateNotification()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testReminderNotification()
    
    console.log('✅ Todos os testes de notificação concluídos!')
  }, [
    user,
    testMessageNotification,
    testReviewNotification,
    testFavoriteNotification,
    testAchievementNotification,
    testSystemNotification,
    testSecurityNotification,
    testMaintenanceNotification,
    testUpdateNotification,
    testReminderNotification
  ])

  return {
    testMessageNotification,
    testReviewNotification,
    testFavoriteNotification,
    testAchievementNotification,
    testSystemNotification,
    testSecurityNotification,
    testMaintenanceNotification,
    testUpdateNotification,
    testReminderNotification,
    testAllNotifications
  }
}
