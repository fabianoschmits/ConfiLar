import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { NotificationService } from '@/services/NotificationService'
import { usePoints } from './usePoints'
import { useAuthContext } from '@/contexts/AuthContext'

interface UsePostLikesWithPointsProps {
  postId: string
  postOwnerId: string
  postOwnerName: string
}

export function usePostLikesWithPoints({ postId, postOwnerId, postOwnerName }: UsePostLikesWithPointsProps) {
  const queryClient = useQueryClient()
  const { user } = useAuthContext()
  const { addPoints, checkDailyLimit } = usePoints(user?.id)
  const [isLiking, setIsLiking] = useState(false)

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Usuário não autenticado')

      setIsLiking(true)

      // Verificar se já curtiu
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

      if (existingLike) {
        // Remover like
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('id', existingLike.id)
        
        if (error) throw error

        // Remover pontos (se aplicável)
        try {
          // Verificar se há limite diário para dar like
          const limitCheck = await checkDailyLimit('premium_like')
          if (limitCheck.canEarn) {
            // Adicionar pontos de volta (remover o gasto)
            await addPoints({
              action_type: 'premium_like',
              description: 'Removeu curtida (pontos devolvidos)',
              metadata: { 
                post_id: postId, 
                post_owner_id: postOwnerId,
                action: 'unlike'
              },
              post_id: postId,
              related_user_id: postOwnerId
            })
          }
        } catch (pointsError) {
          console.warn('Erro ao processar pontos ao remover curtida:', pointsError)
          // Não falhar a operação por causa dos pontos
        }

        return { action: 'removed' }
      } else {
        // Verificar limite diário antes de curtir
        const limitCheck = await checkDailyLimit('premium_like')
        if (!limitCheck.canEarn) {
          throw new Error(`Limite diário de curtidas atingido (${limitCheck.dailyLimit}). Tente novamente amanhã.`)
        }

        // Adicionar like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          })
        
        if (error) throw error

        // Adicionar pontos para quem curtiu (gastar pontos)
        try {
          await addPoints({
            action_type: 'premium_like',
            description: 'Curtiu um post',
            metadata: { 
              post_id: postId, 
              post_owner_id: postOwnerId,
              post_owner_name: postOwnerName
            },
            post_id: postId,
            related_user_id: postOwnerId
          })
        } catch (pointsError) {
          console.warn('Erro ao processar pontos ao curtir:', pointsError)
          // Não falhar a operação por causa dos pontos
        }

        // Criar notificação para o dono do post (se não for o próprio usuário)
        if (postOwnerId !== user.id) {
          try {
            await NotificationService.createLikeNotification(
              postId,
              postOwnerId,
              user.id,
              (user as any).user_metadata?.full_name || 'Usuário'
            )

            // Enviar push notification
            await NotificationService.sendPushNotification(
              postOwnerId,
              'Nova curtida!',
              `${(user as any).user_metadata?.full_name || 'Usuário'} curtiu seu post`
            )
          } catch (notificationError) {
            console.warn('Erro ao criar notificação de curtida:', notificationError)
            // Não falhar a operação por causa da notificação
          }
        }

        return { action: 'added' }
      }
    },
    onSuccess: () => {
      // Invalidar cache da timeline
      queryClient.invalidateQueries({
        queryKey: ['unified-timeline']
      })
      
      // Invalidar cache específico do post
      queryClient.invalidateQueries({
        queryKey: ['post', postId]
      })

      // Invalidar cache de pontos
      queryClient.invalidateQueries({
        queryKey: ['user-points-balance', user?.id]
      })
      queryClient.invalidateQueries({
        queryKey: ['user-points-stats', user?.id]
      })
      queryClient.invalidateQueries({
        queryKey: ['user-points-history', user?.id]
      })
    },
    onError: (error) => {
      console.error('Erro ao curtir post:', error)
    },
    onSettled: () => {
      setIsLiking(false)
    }
  })

  const toggleLike = () => {
    if (!isLiking) {
      likeMutation.mutate()
    }
  }

  return {
    toggleLike,
    isLiking,
    isLiked: false, // Será determinado pelo componente pai baseado no estado atual
    error: likeMutation.error
  }
}
