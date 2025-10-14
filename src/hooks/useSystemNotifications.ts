import { useCallback } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { NotificationService } from '@/services/NotificationService'

/**
 * Hook para notificações do sistema
 */
export function useSystemNotifications() {
  const { user } = useAuthContext()

  // Notificar manutenção
  const notifyMaintenance = useCallback(async (
    startTime: string,
    duration: string
  ) => {
    if (!user) return

    try {
      await NotificationService.createNotification({
        user_id: user.id,
        title: 'Manutenção programada',
        message: `Sistema entrará em manutenção às ${startTime} por ${duration}`,
        type: 'like', // Usando 'like' como fallback
        priority: 'high',
        action_url: '/sobre'
      })
    } catch (error) {
      console.error('Erro ao notificar manutenção:', error)
    }
  }, [user])

  // Notificar atualização
  const notifyUpdate = useCallback(async (
    version: string,
    features: string[]
  ) => {
    if (!user) return

    try {
      await NotificationService.createNotification({
        user_id: user.id,
        title: `Nova versão ${version} disponível!`,
        message: `Novidades: ${features.join(', ')}`,
        type: 'like', // Usando 'like' como fallback
        priority: 'normal',
        action_url: '/sobre'
      })
    } catch (error) {
      console.error('Erro ao notificar atualização:', error)
    }
  }, [user])

  // Notificar segurança
  const notifySecurity = useCallback(async (
    event: string,
    action: string
  ) => {
    if (!user) return

    try {
      await NotificationService.createNotification({
        user_id: user.id,
        title: `Alerta de segurança: ${event}`,
        message: `Ação recomendada: ${action}`,
        type: 'like', // Usando 'like' como fallback
        priority: 'high',
        action_url: '/configuracoes-privacidade'
      })
    } catch (error) {
      console.error('Erro ao notificar segurança:', error)
    }
  }, [user])

  // Notificar conquista
  const notifyAchievement = useCallback(async (
    achievementName: string,
    description: string,
    badgeUrl?: string
  ) => {
    if (!user) return

    try {
      await NotificationService.createNotification({
        user_id: user.id,
        title: `🏆 Conquista desbloqueada: ${achievementName}`,
        message: description,
        type: 'like', // Usando 'like' como fallback
        priority: 'normal',
        action_url: '/perfil',
        metadata: badgeUrl ? { badge_url: badgeUrl } : undefined
      })
    } catch (error) {
      console.error('Erro ao notificar conquista:', error)
    }
  }, [user])

  // Notificar lembrete
  const notifyReminder = useCallback(async (
    title: string,
    message: string,
    reminderTime: string
  ) => {
    if (!user) return

    try {
      await NotificationService.createNotification({
        user_id: user.id,
        title,
        message: `${message} (Lembrete para ${reminderTime})`,
        type: 'like', // Usando 'like' como fallback
        priority: 'normal',
        action_url: '/feed'
      })
    } catch (error) {
      console.error('Erro ao notificar lembrete:', error)
    }
  }, [user])

  // Notificar mudança de disponibilidade
  const notifyAvailabilityChange = useCallback(async (
    isAvailable: boolean
  ) => {
    if (!user) return

    try {
      await NotificationService.createNotification({
        user_id: user.id,
        title: 'Disponibilidade alterada',
        message: `Você está agora ${isAvailable ? 'disponível' : 'indisponível'}`,
        type: 'like', // Usando 'like' como fallback
        priority: 'low',
        action_url: '/perfil'
      })
    } catch (error) {
      console.error('Erro ao notificar mudança de disponibilidade:', error)
    }
  }, [user])

  // Notificar mudança de reputação
  const notifyReputationChange = useCallback(async (
    oldReputation: number,
    newReputation: number
  ) => {
    if (!user) return

    try {
      const change = newReputation - oldReputation
      await NotificationService.createNotification({
        user_id: user.id,
        title: 'Mudança na reputação',
        message: `Sua reputação ${change > 0 ? 'aumentou' : 'diminuiu'} ${Math.abs(change)} pontos (${oldReputation} → ${newReputation})`,
        type: 'like', // Usando 'like' como fallback
        priority: 'normal',
        action_url: '/perfil'
      })
    } catch (error) {
      console.error('Erro ao notificar mudança de reputação:', error)
    }
  }, [user])

  return {
    notifyMaintenance,
    notifyUpdate,
    notifySecurity,
    notifyAchievement,
    notifyReminder,
    notifyAvailabilityChange,
    notifyReputationChange
  }
}
