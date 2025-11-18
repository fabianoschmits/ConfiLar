import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ReactionType, ReactionCounts, UserReaction } from '@/types/reactions'
import { NotificationService } from '@/services/NotificationService'

export interface ReactionUser {
  id: string
  user_id: string
  name: string
  full_name: string | null
  avatar_url: string | null
  reaction_type: ReactionType
  created_at: string
}

export function useReactions(postId: string, postOwnerId?: string, postOwnerName?: string) {
  const queryClient = useQueryClient()

  // Query para buscar a reação atual do usuário
  const { data: userReaction } = useQuery({
    queryKey: ['user-reaction', postId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('post_reactions')
        .select('reaction_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Erro ao buscar reação do usuário:', error)
        return null
      }

      return data?.reaction_type as ReactionType || null
    },
    staleTime: 1000 * 60 * 2, // Cache por 2 minutos
    gcTime: 1000 * 60 * 5, // Manter no cache por 5 minutos
  })

  // Mutation para adicionar/remover reação
  const reactionMutation = useMutation({
    mutationFn: async ({ reactionType, postId }: { reactionType: ReactionType; postId: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Verificar se já existe reação do usuário
      const { data: existingReaction } = await supabase
        .from('post_reactions')
        .select('id, reaction_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // Remover reação se for a mesma
          const { error } = await supabase
            .from('post_reactions')
            .delete()
            .eq('id', existingReaction.id)
          
          if (error) throw error
          return { action: 'removed', reactionType: null }
        } else {
          // Atualizar reação
          const { error } = await supabase
            .from('post_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id)
          
          if (error) throw error
          return { action: 'updated', reactionType }
        }
      } else {
        // Adicionar nova reação
        const { error } = await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          })
        
        if (error) throw error
        
        // Criar notificação para o dono do post (se não for o próprio usuário e se tivermos as informações)
        // Executar em background sem bloquear
        if (postOwnerId && postOwnerId !== user.id && reactionType === 'like') {
          NotificationService.createLikeNotification(
            postId,
            postOwnerId,
            user.id,
            user.user_metadata?.full_name || 'Usuário'
          ).catch(err => console.warn('Erro ao criar notificação:', err))
          
          NotificationService.sendPushNotification(
            postOwnerId,
            'Nova curtida!',
            `${user.user_metadata?.full_name || 'Usuário'} curtiu seu post`
          ).catch(err => console.warn('Erro ao enviar push:', err))
        }
        
        return { action: 'added', reactionType }
      }
    },
    onMutate: async ({ reactionType, postId }) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: ['user-reaction', postId] })
      await queryClient.cancelQueries({ queryKey: ['reaction-counts', postId] })

      // Snapshot do valor anterior
      const previousUserReaction = queryClient.getQueryData(['user-reaction', postId])
      const previousCounts = queryClient.getQueryData(['reaction-counts', postId])

      // Atualizar otimisticamente
      queryClient.setQueryData(['user-reaction', postId], reactionType === userReaction ? null : reactionType)
      
      // Atualizar contagens otimisticamente
      if (previousCounts) {
        const currentCounts = previousCounts as any
        const isRemoving = reactionType === userReaction
        const previousType = userReaction as ReactionType | null

        queryClient.setQueryData(['reaction-counts', postId], {
          ...currentCounts,
          [reactionType]: isRemoving 
            ? Math.max(0, (currentCounts[reactionType] || 0) - 1)
            : (currentCounts[reactionType] || 0) + 1,
          [previousType || reactionType]: previousType && previousType !== reactionType
            ? Math.max(0, (currentCounts[previousType] || 0) - 1)
            : (currentCounts[previousType || reactionType] || 0),
          total: isRemoving 
            ? Math.max(0, (currentCounts.total || 0) - 1)
            : (currentCounts.total || 0) + 1
        })
      }

      return { previousUserReaction, previousCounts }
    },
    onError: (err, variables, context) => {
      // Reverter em caso de erro
      if (context?.previousUserReaction !== undefined) {
        queryClient.setQueryData(['user-reaction', variables.postId], context.previousUserReaction)
      }
      if (context?.previousCounts) {
        queryClient.setQueryData(['reaction-counts', variables.postId], context.previousCounts)
      }
    },
    onSuccess: (result, variables) => {
      // Invalidar cache para garantir sincronização
      queryClient.invalidateQueries({
        queryKey: ['user-reaction', variables.postId]
      })
      queryClient.invalidateQueries({
        queryKey: ['reaction-counts', variables.postId]
      })
      queryClient.invalidateQueries({
        queryKey: ['reaction-users', variables.postId]
      })
      queryClient.invalidateQueries({
        queryKey: ['unified-timeline']
      })
    }
  })

  const addReaction = useCallback((reactionType: ReactionType) => {
    reactionMutation.mutate({ reactionType, postId })
  }, [reactionMutation, postId])

  const removeReaction = useCallback(() => {
    if (userReaction) {
      reactionMutation.mutate({ reactionType: userReaction, postId })
    }
  }, [reactionMutation, postId, userReaction])

  return {
    addReaction,
    removeReaction,
    userReaction: userReaction || null,
    isLoading: reactionMutation.isPending
  }
}

// Hook para buscar contagens de reações
export function useReactionCounts(postId: string) {
  const queryClient = useQueryClient()

  const { data: reactionCounts, isLoading } = useQuery({
    queryKey: ['reaction-counts', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_reactions')
        .select('reaction_type')
        .eq('post_id', postId)

      if (error) throw error

      const counts: ReactionCounts = {
        like: 0,
        heart: 0,
        laugh: 0,
        fire: 0,
        total: 0
      }

      data?.forEach(reaction => {
        counts[reaction.reaction_type as ReactionType]++
        counts.total++
      })

      return counts
    },
    staleTime: 1000 * 60 * 2, // Cache por 2 minutos
    gcTime: 1000 * 60 * 5, // Manter no cache por 5 minutos
  })

  return {
    reactionCounts: reactionCounts || {
      like: 0,
      heart: 0,
      laugh: 0,
      fire: 0,
      total: 0
    },
    isLoading
  }
}

// Hook para buscar usuários que reagiram
export function useReactionUsers(postId: string) {
  const { data: reactionUsers, isLoading } = useQuery({
    queryKey: ['reaction-users', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_reactions')
        .select(`
          id,
          user_id,
          reaction_type,
          created_at,
          profiles!inner(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .eq('reaction_type', 'like')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(reaction => {
        const profile = reaction.profiles as any
        return {
          id: reaction.id,
          user_id: reaction.user_id,
          name: profile.full_name || 'Usuário',
          full_name: profile.full_name || null,
          avatar_url: profile.avatar_url || null,
          reaction_type: reaction.reaction_type as ReactionType,
          created_at: reaction.created_at
        }
      }) || []
    },
    staleTime: 1000 * 60 * 2, // Cache por 2 minutos
    gcTime: 1000 * 60 * 5, // Manter no cache por 5 minutos
  })

  return {
    reactionUsers: reactionUsers || [],
    isLoading
  }
}
