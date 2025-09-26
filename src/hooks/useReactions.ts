import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ReactionType, ReactionCounts, UserReaction } from '@/types/reactions'

export function useReactions(postId: string) {
  const queryClient = useQueryClient()
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType | null>>({})

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
        return { action: 'added', reactionType }
      }
    },
    onSuccess: (result, variables) => {
      // Atualizar estado local
      setUserReactions(prev => ({
        ...prev,
        [variables.postId]: result.reactionType
      }))

      // Invalidar cache da timeline
      queryClient.invalidateQueries({
        queryKey: ['unified-timeline']
      })
    }
  })

  const addReaction = useCallback((reactionType: ReactionType) => {
    reactionMutation.mutate({ reactionType, postId })
  }, [reactionMutation, postId])

  const removeReaction = useCallback(() => {
    const currentReaction = userReactions[postId]
    if (currentReaction) {
      reactionMutation.mutate({ reactionType: currentReaction, postId })
    }
  }, [reactionMutation, postId, userReactions, postId])

  return {
    addReaction,
    removeReaction,
    userReaction: userReactions[postId] || null,
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
        love: 0,
        laugh: 0,
        thumbs_up: 0,
        thumbs_down: 0,
        fire: 0,
        star: 0,
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
      love: 0,
      laugh: 0,
      thumbs_up: 0,
      thumbs_down: 0,
      fire: 0,
      star: 0,
      total: 0
    },
    isLoading
  }
}
