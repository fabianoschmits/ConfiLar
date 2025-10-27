import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface CommentFilters {
  post_id: string
}

interface CommentUser {
  id: string
  full_name: string
  avatar_url: string | null
  user_type: string
}

interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_comment_id: string | null
  content: string
  created_at: string
  user: CommentUser
}

export function useCommentsDebug(filters: CommentFilters) {
  const {
    data: comments,
    isLoading,
    error,
    refetch
  } = useQuery<Comment[]>({
    queryKey: ['comments-debug', filters.post_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          id,
          post_id,
          user_id,
          parent_comment_id,
          content,
          created_at,
          profiles!post_comments_user_id_fkey(
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

      // Mapear os dados para o formato esperado
      const mappedData = data?.map(comment => ({
        ...comment,
        user: Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles
      })) || []

      return mappedData as Comment[]
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
