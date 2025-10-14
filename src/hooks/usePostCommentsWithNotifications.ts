import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { NotificationService } from '@/services/NotificationService'

interface CommentFormData {
  content: string
  parent_id?: string
}

interface UsePostCommentsWithNotificationsProps {
  postId: string
  postOwnerId: string
  postOwnerName: string
}

export function usePostCommentsWithNotifications({ 
  postId, 
  postOwnerId, 
  postOwnerName 
}: UsePostCommentsWithNotificationsProps) {
  const queryClient = useQueryClient()
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const addCommentMutation = useMutation({
    mutationFn: async (commentData: CommentFormData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Extrair menções do conteúdo
      const mentions = extractMentions(commentData.content)

      const insertData = {
        post_id: postId,
        user_id: user.id,
        parent_id: commentData.parent_id,
        content: commentData.content,
        mentions
      }

      const { data, error } = await supabase
        .from('post_comments')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error

      // Criar notificações
      try {
        const userName = user.user_metadata?.full_name || 'Usuário'

        // Notificar o dono do post (se não for o próprio usuário)
        if (postOwnerId !== user.id) {
          await NotificationService.createCommentNotification(
            postId,
            postOwnerId,
            user.id,
            userName,
            commentData.content
          )

          await NotificationService.sendPushNotification(
            postOwnerId,
            'Novo comentário!',
            `${userName} comentou em seu post`
          )
        }

        // Notificar menções
        if (mentions.length > 0) {
          for (const mention of mentions) {
            // Buscar ID do usuário mencionado
            const { data: mentionedUser } = await supabase
              .from('profiles')
              .select('id, full_name')
              .ilike('full_name', mention.replace('@', ''))
              .single()

            if (mentionedUser && mentionedUser.id !== user.id) {
              await NotificationService.createMentionNotification(
                postId,
                mentionedUser.id,
                user.id,
                userName,
                commentData.content
              )

              await NotificationService.sendPushNotification(
                mentionedUser.id,
                'Você foi mencionado!',
                `${userName} te mencionou em um comentário`
              )
            }
          }
        }

        // Se é resposta a um comentário, notificar o autor do comentário original
        if (commentData.parent_id) {
          const { data: parentComment } = await supabase
            .from('post_comments')
            .select('user_id, user:profiles!post_comments_user_id_fkey(full_name)')
            .eq('id', commentData.parent_id)
            .single()

          if (parentComment && parentComment.user_id !== user.id) {
            await NotificationService.createReplyNotification(
              postId,
              commentData.parent_id,
              parentComment.user_id,
              user.id,
              userName,
              commentData.content
            )

            await NotificationService.sendPushNotification(
              parentComment.user_id,
              'Nova resposta!',
              `${userName} respondeu seu comentário`
            )
          }
        }
      } catch (notificationError) {
        console.warn('Erro ao criar notificações de comentário:', notificationError)
        // Não falhar a operação por causa das notificações
      }

      return data
    },
    onSuccess: () => {
      // Invalidar cache de comentários
      queryClient.invalidateQueries({
        queryKey: ['comments', { post_id: postId }]
      })
      
      // Invalidar cache da timeline
      queryClient.invalidateQueries({
        queryKey: ['unified-timeline']
      })

      setReplyTo(null)
    }
  })

  const addComment = (content: string, parentId?: string) => {
    addCommentMutation.mutate({
      content,
      parent_id: parentId
    })
  }

  return {
    addComment,
    addCommentMutation,
    replyTo,
    setReplyTo
  }
}

// Função auxiliar para extrair menções
function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[0]) // Incluir o @
  }

  return [...new Set(mentions)] // Remover duplicatas
}
