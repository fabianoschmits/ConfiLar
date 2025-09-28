import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface CommentsCountResult {
  count: number
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useCommentsCount(postId: string): CommentsCountResult {
  const queryClient = useQueryClient()

  // Query para buscar contagem de comentários
  const {
    data: count = 0,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['comments-count', postId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact' })
        .eq('post_id', postId)
        .eq('is_deleted', false)

      if (error) throw error
      return count || 0
    },
    staleTime: 1000 * 60 * 2, // Cache por 2 minutos
    gcTime: 1000 * 60 * 5, // Manter no cache por 5 minutos
  })

  // Mutation para atualizar contador no post
  const updatePostCountMutation = useMutation({
    mutationFn: async (newCount: number) => {
      const { error } = await supabase
        .from('feed_posts')
        .update({ comments_count: newCount })
        .eq('id', postId)

      if (error) throw error
      return newCount
    },
    onSuccess: (newCount) => {
      // Atualizar cache local
      queryClient.setQueryData(['comments-count', postId], newCount)
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
      queryClient.invalidateQueries({ queryKey: ['trending-posts'] })
    }
  })

  // Função para sincronizar contador
  const syncCount = async () => {
    try {
      const { count, error } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact' })
        .eq('post_id', postId)
        .eq('is_deleted', false)

      if (error) throw error
      
      const actualCount = count || 0
      
      // Atualizar no banco se necessário
      await updatePostCountMutation.mutateAsync(actualCount)
      
      return actualCount
    } catch (error) {
      console.error('Erro ao sincronizar contador de comentários:', error)
      throw error
    }
  }

  return {
    count,
    isLoading,
    error: error as Error | null,
    refetch: syncCount
  }
}

// Hook para atualizar contador quando comentário é adicionado/removido
export function useCommentsCountUpdater(postId: string) {
  const queryClient = useQueryClient()

  const incrementCount = () => {
    queryClient.setQueryData(['comments-count', postId], (oldCount: number) => (oldCount || 0) + 1)
    
    // Atualizar no banco
    queryClient.invalidateQueries({ queryKey: ['comments-count', postId] })
  }

  const decrementCount = () => {
    queryClient.setQueryData(['comments-count', postId], (oldCount: number) => Math.max((oldCount || 0) - 1, 0))
    
    // Atualizar no banco
    queryClient.invalidateQueries({ queryKey: ['comments-count', postId] })
  }

  const syncCount = async () => {
    try {
      const { count, error } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact' })
        .eq('post_id', postId)
        .eq('is_deleted', false)

      if (error) throw error
      
      const actualCount = count || 0
      queryClient.setQueryData(['comments-count', postId], actualCount)
      
      return actualCount
    } catch (error) {
      console.error('Erro ao sincronizar contador:', error)
      throw error
    }
  }

  return {
    incrementCount,
    decrementCount,
    syncCount
  }
}
