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
      await NotificationService.notifyMaintenance(
        user.id,
        startTime,
        duration
      )
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
      await NotificationService.notifyUpdate(
        user.id,
        version,
        features
      )
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
      await NotificationService.notifySecurity(
        user.id,
        event,
        action
      )
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
      await NotificationService.notifyAchievement(
        user.id,
        achievementName,
        description,
        badgeUrl
      )
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
      await NotificationService.notifyReminder(
        user.id,
        title,
        message,
        reminderTime
      )
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
      await NotificationService.notifyAvailabilityChange(
        user.id,
        isAvailable
      )
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
      await NotificationService.notifyReputationChange(
        user.id,
        oldReputation,
        newReputation
      )
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
