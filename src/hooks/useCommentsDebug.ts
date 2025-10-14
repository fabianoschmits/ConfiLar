import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface CommentFilters {
  post_id: string
}

export function useCommentsDebug(filters: CommentFilters) {
  const {
    data: comments,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['comments-debug', filters.post_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          id,
          post_id,
          user_id,
          parent_id,
          content,
          created_at,
          user:profiles!post_comments_user_id_fkey(
            id,
            full_name,
            avatar_url,
            user_type
          )
        `)
        .eq('post_id', filters.post_id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Erro ao carregar comentários:', error)
        throw error
      }

      return data
    },
    enabled: !!filters.post_id, // Só executa se tiver post_id
    staleTime: 30000, // Cache por 30 segundos
    refetchOnWindowFocus: false // Não recarrega ao focar na janela
  })

  return {
    comments,
    isLoading,
    error,
    refetch
  }
}
