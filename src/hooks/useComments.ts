import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Comment, CommentFormData, CommentFilters } from '@/types/comments'

export function useComments(filters: CommentFilters) {
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
          parent_id,
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

      if (filters.parent_id) {
        query = query.eq('parent_id', filters.parent_id)
      } else {
        query = query.is('parent_id', null)
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
      console.log('🔍 addCommentMutation - Dados recebidos:', commentData)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Extrair menções e hashtags do conteúdo
      const mentions = extractMentions(commentData.content)
      const hashtags = extractHashtags(commentData.content)

      const insertData = {
        post_id: filters.post_id,
        user_id: user.id,
        parent_id: commentData.parent_id,
        content: commentData.content,
        mentions,
        hashtags
      }

      console.log('🔍 addCommentMutation - Dados para inserir:', insertData)

      const { data, error } = await supabase
        .from('post_comments')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao inserir comentário:', error)
        throw error
      }
      
      console.log('✅ Comentário inserido com sucesso:', data)
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
      if (!user) throw new Error('Usuário não autenticado')

      // Verificar se já curtiu
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single()

      if (existingLike) {
        // Remover like
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('id', existingLike.id)
        
        if (error) throw error
        return { action: 'removed' }
      } else {
        // Adicionar like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          })
        
        if (error) throw error
        return { action: 'added' }
      }
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
    console.log('🔍 useComments - addComment chamado:', {
      content,
      parentId,
      isReply: !!parentId
    })
    addCommentMutation.mutate({
      content,
      parent_id: parentId
    })
  }, [addCommentMutation])

  const likeComment = useCallback((commentId: string) => {
    likeCommentMutation.mutate(commentId)
  }, [likeCommentMutation])

  const startReply = useCallback((commentId: string) => {
    console.log('🔍 startReply chamado com ID:', commentId)
    setReplyTo(commentId)
    console.log('🔍 replyTo definido como:', commentId)
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
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id)
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
