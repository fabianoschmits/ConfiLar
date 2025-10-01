import { useCallback } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { NotificationService } from '@/services/NotificationService'

/**
 * Hook para notificações relacionadas ao perfil
 */
export function useProfileNotifications() {
  const { user } = useAuthContext()

  // Notificar visualização de perfil
  const notifyProfileView = useCallback(async (
    recipientId: string,
    viewerName: string,
    profileId: string
  ) => {
    if (!user) return

    try {
      await NotificationService.notifyProfileView(
        recipientId,
        viewerName,
        profileId
      )
    } catch (error) {
      console.error('Erro ao notificar visualização de perfil:', error)
    }
  }, [user])

  // Notificar novo favorito
  const notifyNewFavorite = useCallback(async (
    recipientId: string,
    favoriterName: string,
    profileId: string
  ) => {
    if (!user) return

    try {
      await NotificationService.notifyNewFavorite(
        recipientId,
        favoriterName,
        profileId
      )
    } catch (error) {
      console.error('Erro ao notificar novo favorito:', error)
    }
  }, [user])

  // Notificar remoção de favorito
  const notifyFavoriteRemoval = useCallback(async (
    recipientId: string,
    unfavoriterName: string
  ) => {
    if (!user) return

    try {
      await NotificationService.create({
        user_id: recipientId,
        title: 'Removido dos favoritos',
        message: `${unfavoriterName} removeu você dos favoritos`,
        type: 'favorite',
        priority: 'low',
        action_url: '/perfil'
      })
    } catch (error) {
      console.error('Erro ao notificar remoção de favorito:', error)
    }
  }, [user])

  // Notificar atualização de perfil
  const notifyProfileUpdate = useCallback(async (
    recipientId: string,
    updateType: string
  ) => {
    if (!user) return

    try {
      await NotificationService.create({
        user_id: recipientId,
        title: 'Perfil atualizado',
        message: `Seu perfil foi atualizado: ${updateType}`,
        type: 'system',
        priority: 'normal',
        action_url: '/perfil'
      })
    } catch (error) {
      console.error('Erro ao notificar atualização de perfil:', error)
    }
  }, [user])

  // Notificar verificação de perfil
  const notifyProfileVerification = useCallback(async (
    recipientId: string,
    status: 'approved' | 'rejected' | 'pending'
  ) => {
    if (!user) return

    try {
      await NotificationService.notifyVerification(
        recipientId,
        'perfil',
        status
      )
    } catch (error) {
      console.error('Erro ao notificar verificação de perfil:', error)
    }
  }, [user])

  return {
    notifyProfileView,
    notifyNewFavorite,
    notifyFavoriteRemoval,
    notifyProfileUpdate,
    notifyProfileVerification
  }
}
