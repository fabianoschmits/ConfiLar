import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Comment, CommentFormData, CommentFilters } from '@/types/comments'
import { NotificationService } from '@/services/NotificationService'
import { toast } from 'sonner'

export interface UseCommentsOptions extends CommentFilters {
  postOwnerId?: string
  postOwnerName?: string
}

export function useComments(options: UseCommentsOptions) {
  const { postOwnerId, postOwnerName, ...filters } = options
  const queryClient = useQueryClient()
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const {
    data: comments,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['comments', filters],
    queryFn: async () => {
      let query = supabase
        .from('post_comments')
        .select(`
          id,
          post_id,
          user_id,
          parent_comment_id,
          content,
          mentions,
          hashtags,
          created_at,
          updated_at,
          is_deleted,
          likes_count,
          user:profiles!post_comments_user_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          )
        `)
        .eq('post_id', filters.post_id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })

      if (filters.parent_comment_id) {
        query = query.eq('parent_comment_id', filters.parent_comment_id)
      } else {
        // Carregar TODOS os comentários (principais e respostas) para organizar em threads
        // Não filtrar por parent_comment_id aqui, vamos organizar depois
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      // Verificar likes do usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      let userLikes: string[] = []
      
      if (user && data && data.length > 0) {
        // Buscar TODOS os comentários (incluindo respostas) para verificar likes
        const allCommentIds: string[] = []
        const extractCommentIds = (comments: any[]) => {
          comments.forEach(comment => {
            allCommentIds.push(comment.id)
            if (comment.replies && comment.replies.length > 0) {
              extractCommentIds(comment.replies)
            }
          })
        }
        extractCommentIds(data)
        
        if (allCommentIds.length > 0) {
          const { data: likesData, error: likesError } = await supabase
            .from('comment_likes')
            .select('comment_id')
            .eq('user_id', user.id)
            .in('comment_id', allCommentIds)
          
          if (likesError) {
            console.error('❌ [useComments] Erro ao buscar likes:', likesError)
          } else {
            userLikes = likesData?.map(like => like.comment_id) || []
            console.log('✅ [useComments] Likes carregados:', userLikes.length, 'likes para', allCommentIds.length, 'comentários')
          }
        }
      }

      // Organizar comentários em threads primeiro
      const organizedComments = organizeComments((data || []) as any)
      
      // Depois adicionar informação de likes recursivamente
      const addLikesToComments = (comments: any[]): any[] => {
        return comments.map(comment => {
          const commentWithLikes = {
            ...comment,
            is_liked: userLikes.includes(comment.id),
            user: comment.user as any
          }
          
          // Se tiver respostas, processar recursivamente
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...commentWithLikes,
              replies: addLikesToComments(comment.replies)
            }
          }
          
          return commentWithLikes
        })
      }
      
      return addLikesToComments(organizedComments)
    },
    enabled: !!filters.post_id,
    staleTime: 1000 * 60 * 2, // Cache por 2 minutos
    gcTime: 1000 * 60 * 5, // Manter no cache por 5 minutos
  })

  const addCommentMutation = useMutation({
    mutationFn: async (commentData: CommentFormData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Extrair menções e hashtags do conteúdo
      const mentions = extractMentions(commentData.content)
      const hashtags = extractHashtags(commentData.content)

      const insertData = {
        post_id: filters.post_id,
        user_id: user.id,
        parent_comment_id: commentData.parent_comment_id,
        content: commentData.content,
        mentions,
        hashtags
      }

      const { data, error } = await supabase
        .from('post_comments')
        .insert(insertData)
        .select(`
          *,
          user:profiles!post_comments_user_id_fkey(id, full_name)
        `)
        .single()

      if (error) {
        console.error('❌ Erro ao inserir comentário:', error)
        throw error
      }
      
      // Criar notificações
      try {
        const userName = user.user_metadata?.full_name || 'Usuário'
        
        // Se for uma resposta a um comentário
        if (commentData.parent_comment_id) {
          // Buscar o autor do comentário original
          const { data: parentComment } = await supabase
            .from('post_comments')
            .select('user_id, user:profiles!post_comments_user_id_fkey(id, full_name)')
            .eq('id', commentData.parent_comment_id)
            .single()
          
          if (parentComment && parentComment.user_id !== user.id) {
            await NotificationService.createReplyNotification(
              filters.post_id,
              commentData.parent_comment_id,
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
        // Se for um comentário normal no post
        else if (postOwnerId && postOwnerName && postOwnerId !== user.id) {
          await NotificationService.createCommentNotification(
            filters.post_id,
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
        
        // Notificar usuários mencionados
        if (mentions.length > 0) {
          for (const mentionUsername of mentions) {
            // Buscar usuário mencionado pelo username
            const { data: mentionedUser } = await supabase
              .from('profiles')
              .select('id')
              .eq('full_name', mentionUsername)
              .single()
            
            if (mentionedUser && mentionedUser.id !== user.id) {
              await NotificationService.createMentionNotification(
                filters.post_id,
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
      } catch (notificationError) {
        console.warn('Erro ao criar notificações:', notificationError)
        // Não falhar a operação por causa das notificações
      }
      
      return data
    },
    onSuccess: () => {
      // Invalidar cache de comentários
      queryClient.invalidateQueries({
        queryKey: ['comments', filters]
      })
      
      // Invalidar cache da timeline
      queryClient.invalidateQueries({
        queryKey: ['unified-timeline']
      })

      setReplyTo(null)
    }
  })

  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ [likeComment] Usuário não autenticado')
        throw new Error('Usuário não autenticado')
      }

      console.log('👍 [likeComment] Iniciando curtida:', { commentId, userId: user.id })

      // Verificar se já curtiu
      const { data: existingLike, error: checkError } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (checkError) {
        console.error('❌ [likeComment] Erro ao verificar like existente:', checkError)
        // Não lançar erro se for apenas "não encontrado"
        if (checkError.code !== 'PGRST116') {
          throw checkError
        }
      }

      if (existingLike) {
        console.log('🔄 [likeComment] Removendo like existente:', existingLike.id)
        // Remover like
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('id', existingLike.id)
        
        if (error) {
          console.error('❌ [likeComment] Erro ao remover like:', error)
          throw error
        }
        
        // O contador será atualizado automaticamente por trigger no banco ao deletar de comment_likes
        // Não precisamos atualizar manualmente aqui para evitar duplicação
        console.log('✅ [likeComment] Like removido - contador será atualizado automaticamente pelo trigger')
        
        console.log('✅ [likeComment] Like removido com sucesso')
        return { action: 'removed', commentId }
      } else {
        console.log('➕ [likeComment] Adicionando novo like')
        // Adicionar like
        const { data: insertedLike, error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          })
          .select()
          .single()
        
        if (error) {
          console.error('❌ [likeComment] Erro ao adicionar like:', error)
          console.error('❌ [likeComment] Detalhes do erro:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
          throw error
        }
        
        console.log('✅ [likeComment] Like adicionado com sucesso:', insertedLike)
        
        // O contador será atualizado automaticamente por trigger no banco ao inserir em comment_likes
        // Não precisamos atualizar manualmente aqui para evitar duplicação
        console.log('✅ [likeComment] Like inserido - contador será atualizado automaticamente pelo trigger')
        
        return { action: 'added', commentId }
      }
    },
    onSuccess: async (result) => {
      console.log('✅ [likeComment] Mutation bem-sucedida:', result)
      
      // Buscar o comentário atualizado do banco para garantir que temos o contador correto
      // Aguardar um pouco para garantir que o trigger atualizou o contador
      let updatedLikesCount: number | null = null
      try {
        // Aguardar 200ms para garantir que o trigger processou
        await new Promise(resolve => setTimeout(resolve, 200))
        
        const { data: updatedComment, error: fetchError } = await supabase
          .from('post_comments')
          .select('id, likes_count')
          .eq('id', result.commentId)
          .single()
        
        if (!fetchError && updatedComment) {
          updatedLikesCount = updatedComment.likes_count || 0
          console.log('📊 [likeComment] Contador atualizado do banco:', updatedLikesCount)
        } else {
          console.warn('⚠️ [likeComment] Não foi possível buscar contador do banco:', fetchError)
        }
      } catch (error) {
        console.warn('⚠️ [likeComment] Erro ao buscar contador do banco:', error)
      }
      
      // Atualizar cache otimisticamente usando APENAS o valor do banco (nunca calcular)
      queryClient.setQueryData(['comments', filters], (oldComments: Comment[] = []) => {
        const updateCommentLikes = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === result.commentId) {
              // SEMPRE usar o valor do banco se disponível
              // Se não conseguir buscar, manter o valor atual e não calcular
              const newLikesCount = updatedLikesCount !== null
                ? updatedLikesCount
                : comment.likes_count // Manter o valor atual se não conseguir buscar
              
              console.log('🔄 [likeComment] Atualizando cache:', {
                commentId: comment.id,
                oldCount: comment.likes_count,
                newCount: newLikesCount,
                action: result.action,
                fromDatabase: updatedLikesCount !== null
              })
              
              return {
                ...comment,
                is_liked: result.action === 'added',
                likes_count: newLikesCount
              }
            }
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateCommentLikes(comment.replies)
              }
            }
            return comment
          })
        }
        return updateCommentLikes(oldComments)
      })
      
      // Invalidar cache de comentários para garantir sincronização (sem refetch para evitar duplicação)
      queryClient.invalidateQueries({
        queryKey: ['comments', filters]
      })
      
      // Invalidar cache da timeline
      queryClient.invalidateQueries({
        queryKey: ['unified-timeline']
      })
    },
    onError: (error: any) => {
      console.error('❌ [likeComment] Erro na mutation:', error)
      console.error('❌ [likeComment] Detalhes completos:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      })
      
      // Mostrar erro ao usuário
      if (error?.code === '42501' || error?.message?.includes('permission denied') || error?.message?.includes('403')) {
        toast.error('Erro de permissão', {
          description: 'Você não tem permissão para curtir este comentário. Verifique as configurações de privacidade.'
        })
      } else if (error?.code === '23505') {
        toast.error('Erro', {
          description: 'Você já curtiu este comentário.'
        })
      } else {
        toast.error('Erro ao curtir comentário', {
          description: error?.message || 'Tente novamente mais tarde.'
        })
      }
    }
  })

  const editCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Extrair menções e hashtags do conteúdo
      const mentions = extractMentions(content)
      const hashtags = extractHashtags(content)

      const { data, error } = await supabase
        .from('post_comments')
        .update({
          content,
          mentions,
          hashtags,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', user.id) // Garantir que só o autor pode editar
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidar cache de comentários
      queryClient.invalidateQueries({
        queryKey: ['comments', filters]
      })
    }
  })

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Soft delete - marcar como deletado
      const { error } = await supabase
        .from('post_comments')
        .update({
          is_deleted: true,
          content: '[Comentário removido]',
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', user.id) // Garantir que só o autor pode deletar

      if (error) throw error
      return { success: true }
    },
    onSuccess: () => {
      // Invalidar cache de comentários
      queryClient.invalidateQueries({
        queryKey: ['comments', filters]
      })
      
      // Invalidar cache da timeline
      queryClient.invalidateQueries({
        queryKey: ['unified-timeline']
      })
    }
  })

  const addComment = useCallback((content: string, parentId?: string) => {
    addCommentMutation.mutate({
      content,
      parent_comment_id: parentId
    })
  }, [addCommentMutation])

  const likeComment = useCallback((commentId: string) => {
    likeCommentMutation.mutate(commentId)
  }, [likeCommentMutation])

  const startReply = useCallback((commentId: string) => {
    setReplyTo(commentId)
  }, [])

  const cancelReply = useCallback(() => {
    setReplyTo(null)
  }, [])

  const editComment = useCallback((commentId: string, content: string) => {
    editCommentMutation.mutate({ commentId, content })
  }, [editCommentMutation])

  const deleteComment = useCallback((commentId: string) => {
    deleteCommentMutation.mutate(commentId)
  }, [deleteCommentMutation])

  return {
    comments: comments || [],
    isLoading,
    error,
    addComment,
    likeComment,
    editComment,
    deleteComment,
    startReply,
    cancelReply,
    replyTo,
    isAddingComment: addCommentMutation.isPending,
    isLikingComment: likeCommentMutation.isPending,
    isEditingComment: editCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
    refetch
  }
}

// Função para organizar comentários em threads
function organizeComments(comments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>()
  const rootComments: Comment[] = []

  // Primeiro, mapear todos os comentários
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  // Depois, organizar em hierarquia
  comments.forEach(comment => {
    if (comment.parent_comment_id) {
      const parent = commentMap.get(comment.parent_comment_id)
      if (parent) {
        parent.replies = parent.replies || []
        parent.replies.push(commentMap.get(comment.id)!)
      }
    } else {
      rootComments.push(commentMap.get(comment.id)!)
    }
  })

  return rootComments
}

// Função para extrair menções do texto
function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1])
  }

  return Array.from(new Set(mentions)) // Remover duplicatas
}

// Função para extrair hashtags do texto
function extractHashtags(text: string): string[] {
  const hashtagRegex = /#(\w+)/g
  const hashtags: string[] = []
  let match

  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1])
  }

  return Array.from(new Set(hashtags)) // Remover duplicatas
}
