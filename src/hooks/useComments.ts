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
        const commentIds = data.map(comment => comment.id)
        const { data: likesData } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentIds)
        
        userLikes = likesData?.map(like => like.comment_id) || []
      }

      // Organizar comentários em threads
      const commentsWithLikes = (data || []).map(comment => ({
        ...comment,
        is_liked: userLikes.includes(comment.id),
        user: comment.user as any // Cast para resolver tipo
      }))
      const organizedComments = organizeComments(commentsWithLikes as any)
      return organizedComments
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
        
        // Atualizar contador no comentário (decrementar)
        try {
          const rpcResult = await supabase.rpc('decrement_comment_likes_count', { 
            comment_id: commentId 
          })
          
          if (rpcResult.error) {
            console.warn('⚠️ [likeComment] RPC falhou, tentando atualização direta:', rpcResult.error)
            throw rpcResult.error
          }
          
          console.log('✅ [likeComment] Contador decrementado via RPC')
        } catch (rpcError) {
          console.log('🔄 [likeComment] Tentando atualização direta do contador (decrementar)')
          // Se a função não existir, tentar atualizar diretamente
          const { data: comment, error: fetchError } = await supabase
            .from('post_comments')
            .select('likes_count')
            .eq('id', commentId)
            .single()
          
          if (fetchError) {
            console.error('❌ [likeComment] Erro ao buscar comentário para atualizar contador:', fetchError)
          } else if (comment) {
            const newCount = Math.max((comment.likes_count || 0) - 1, 0)
            console.log('📊 [likeComment] Atualizando contador:', { 
              oldCount: comment.likes_count, 
              newCount 
            })
            
            const { error: updateError } = await supabase
              .from('post_comments')
              .update({ 
                likes_count: newCount
              })
              .eq('id', commentId)
            
            if (updateError) {
              console.error('❌ [likeComment] Erro ao atualizar contador diretamente:', updateError)
            } else {
              console.log('✅ [likeComment] Contador decrementado diretamente com sucesso')
            }
          }
        }
        
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
        
        // Atualizar contador no comentário (incrementar)
        try {
          const rpcResult = await supabase.rpc('increment_comment_likes_count', { 
            comment_id: commentId 
          })
          
          if (rpcResult.error) {
            console.warn('⚠️ [likeComment] RPC falhou, tentando atualização direta:', rpcResult.error)
            throw rpcResult.error
          }
          
          console.log('✅ [likeComment] Contador atualizado via RPC')
        } catch (rpcError) {
          console.log('🔄 [likeComment] Tentando atualização direta do contador')
          // Se a função não existir, tentar atualizar diretamente
          const { data: comment, error: fetchError } = await supabase
            .from('post_comments')
            .select('likes_count')
            .eq('id', commentId)
            .single()
          
          if (fetchError) {
            console.error('❌ [likeComment] Erro ao buscar comentário para atualizar contador:', fetchError)
          } else if (comment) {
            const newCount = (comment.likes_count || 0) + 1
            console.log('📊 [likeComment] Atualizando contador:', { 
              oldCount: comment.likes_count, 
              newCount 
            })
            
            const { error: updateError } = await supabase
              .from('post_comments')
              .update({ 
                likes_count: newCount
              })
              .eq('id', commentId)
            
            if (updateError) {
              console.error('❌ [likeComment] Erro ao atualizar contador diretamente:', updateError)
            } else {
              console.log('✅ [likeComment] Contador atualizado diretamente com sucesso')
            }
          }
        }
        
        return { action: 'added', commentId }
      }
    },
    onSuccess: async (result) => {
      console.log('✅ [likeComment] Mutation bem-sucedida:', result)
      
      // Buscar o comentário atualizado do banco para garantir que temos o contador correto
      let updatedLikesCount: number | null = null
      try {
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
      
      // Atualizar cache otimisticamente
      queryClient.setQueryData(['comments', filters], (oldComments: Comment[] = []) => {
        const updateCommentLikes = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === result.commentId) {
              // Usar o valor do banco se disponível, senão calcular otimisticamente
              const newLikesCount = updatedLikesCount !== null
                ? updatedLikesCount
                : (result.action === 'added' 
                  ? (comment.likes_count || 0) + 1 
                  : Math.max((comment.likes_count || 0) - 1, 0))
              
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
      
      // Invalidar cache de comentários para garantir sincronização (após um pequeno delay)
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['comments', filters]
        })
      }, 500)
      
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
