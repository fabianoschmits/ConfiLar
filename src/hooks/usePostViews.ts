import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'

interface PostView {
  id: string
  post_id: string
  user_id: string
  viewed_at: string
}

export function usePostViews(postId: string) {
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const [hasViewed, setHasViewed] = useState(false)

  // Buscar contagem de visualizações
  const { data: viewsCount, isLoading } = useQuery({
    queryKey: ['post-views', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_views')
        .select('id')
        .eq('post_id', postId)

      if (error) throw error
      return data?.length || 0
    },
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
    gcTime: 1000 * 60 * 10, // Manter no cache por 10 minutos
  })

  // Mutation para registrar visualização
  const recordViewMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('post_views')
        .insert({
          post_id: postId,
          user_id: user.id,
          viewed_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Atualizar cache local
      queryClient.setQueryData(['post-views', postId], (oldCount: number) => (oldCount || 0) + 1)
      setHasViewed(true)
    },
    onError: (error) => {
      console.error('Erro ao registrar visualização:', error)
    }
  })

  // Verificar se o usuário já visualizou este post
  useEffect(() => {
    if (!user?.id) return

    const checkIfViewed = async () => {
      const { data, error } = await supabase
        .from('post_views')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!error && data) {
        setHasViewed(true)
      }
    }

    checkIfViewed()
  }, [user?.id, postId])

  // Função para registrar visualização
  const recordView = useCallback(() => {
    if (!user?.id || hasViewed) return

    recordViewMutation.mutate()
  }, [user?.id, hasViewed, recordViewMutation])

  return {
    viewsCount: viewsCount || 0,
    isLoading,
    recordView,
    hasViewed,
    isRecording: recordViewMutation.isPending
  }
}

// Hook para registrar visualização quando o post entra na tela
export function usePostViewTracker(postId: string) {
  const { recordView, hasViewed } = usePostViews(postId)
  const [hasTracked, setHasTracked] = useState(false)

  useEffect(() => {
    if (hasViewed || hasTracked) return

    // Registrar visualização após 1 segundo (tempo suficiente para o usuário ver o post)
    const timer = setTimeout(() => {
      recordView()
      setHasTracked(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [recordView, hasViewed, hasTracked])

  return { hasTracked }
}
