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
      try {
        const { data, error } = await supabase
          .from('post_views')
          .select('id')
          .eq('post_id', postId)

        if (error) {
          // Se for erro de permissão (403) ou tabela não existir, retornar 0
          if (error.code === 'PGRST205' || error.code === '42501' || 
              error.message?.includes('403') || error.message?.includes('permission denied')) {
            console.log('Sem permissão para acessar post_views, retornando 0 visualizações')
            return 0
          }
          throw error
        }
        return data?.length || 0
      } catch (error) {
        console.log('Erro ao buscar visualizações, retornando 0:', error)
        return 0
      }
    },
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
    gcTime: 1000 * 60 * 10, // Manter no cache por 10 minutos
    retry: false, // Não tentar novamente em caso de erro
  })

  // Mutation para registrar visualização
  const recordViewMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado')

      try {
        // Usar upsert para evitar conflitos de duplicata
        const { data, error } = await supabase
          .from('post_views')
          .upsert({
            post_id: postId,
            user_id: user.id,
            viewed_at: new Date().toISOString()
          }, {
            onConflict: 'post_id,user_id' // Especificar colunas de conflito
          })
          .select()
          .single()

        if (error) {
          // Se for erro de permissão (403) ou tabela não existir, simular sucesso
          if (error.code === 'PGRST205' || error.code === '42501' || 
              error.message?.includes('403') || error.message?.includes('permission denied')) {
            console.log('Sem permissão para inserir em post_views, simulando registro')
            return { id: 'simulated' }
          }
          // Se for erro de duplicata, não é um erro real
          if (error.code === '23505') {
            console.log('Visualização já registrada para este post')
            return { id: 'duplicate' }
          }
          // Se for erro de foreign key constraint, simular sucesso
          if (error.code === '23503') {
            console.log('Post não existe mais, simulando registro')
            return { id: 'simulated' }
          }
          // Se for qualquer erro relacionado a post_views, simular sucesso
          if (error.message?.includes('post_views')) {
            console.log('Erro relacionado a post_views, simulando registro')
            return { id: 'simulated' }
          }
          throw error
        }
        return data
      } catch (error: any) {
        console.log('Erro ao registrar visualização, simulando sucesso:', error?.message || error)
        return { id: 'simulated' }
      }
    },
    onSuccess: () => {
      // Atualizar cache local
      queryClient.setQueryData(['post-views', postId], (oldCount: number) => (oldCount || 0) + 1)
      setHasViewed(true)
    },
    onError: (error: any) => {
      // Não logar erro se for duplicata ou tabela não existir
      if (error.message?.includes('duplicate') || error.code === '23505' || error.code === 'PGRST205') {
        console.log('Visualização já registrada ou tabela não existe')
        setHasViewed(true)
        return
      }
      console.error('Erro ao registrar visualização:', error)
    }
  })

  // Verificar se o usuário já visualizou este post
  useEffect(() => {
    if (!user?.id) return

    const checkIfViewed = async () => {
      try {
        const { data, error } = await supabase
          .from('post_views')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle()

        if (!error && data) {
          setHasViewed(true)
        } else if (error) {
          // Se for erro de permissão ou tabela não existir, não fazer nada
          if (error.code === 'PGRST205' || error.code === '42501' || 
              error.message?.includes('403') || error.message?.includes('permission denied')) {
            console.log('Sem permissão para verificar visualização em post_views')
            return
          }
          console.log('Erro ao verificar visualização:', error)
        }
      } catch (error) {
        console.log('Erro ao verificar visualização:', error)
      }
    }

    checkIfViewed()
  }, [user?.id, postId])

  // Função para registrar visualização
  const recordView = useCallback(() => {
    if (!user?.id || hasViewed || recordViewMutation.isPending) return

    try {
      recordViewMutation.mutate()
    } catch (error) {
      console.error('Erro ao registrar visualização:', error)
    }
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
  const { recordView, hasViewed, isRecording } = usePostViews(postId)
  const [hasTracked, setHasTracked] = useState(false)

  useEffect(() => {
    if (hasViewed || hasTracked || isRecording) return

    // Registrar visualização após 1 segundo (tempo suficiente para o usuário ver o post)
    const timer = setTimeout(() => {
      if (!hasViewed && !hasTracked && !isRecording) {
        recordView()
        setHasTracked(true)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [recordView, hasViewed, hasTracked, isRecording])

  return { hasTracked }
}
