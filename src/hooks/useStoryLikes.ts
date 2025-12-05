import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { NotificationService } from '@/services/NotificationService'
import { toast } from 'sonner'

interface UseStoryLikesProps {
  storyId: string
  storyOwnerId: string
  storyOwnerName: string
}

interface LikeUser {
  id: string
  full_name: string
  avatar_url?: string
  is_premium: boolean
  created_at: string
}

export function useStoryLikes({ storyId, storyOwnerId, storyOwnerName }: UseStoryLikesProps) {
  const queryClient = useQueryClient()
  const [isLiking, setIsLiking] = useState(false)
  const [isPremiumLiking, setIsPremiumLiking] = useState(false)

  // Buscar contagem de likes
  const { data: likeCounts } = useQuery({
    queryKey: ['story-likes-count', storyId],
    queryFn: async () => {
      const [normalLikes, premiumLikes] = await Promise.all([
        supabase
          .from('story_likes')
          .select('id', { count: 'exact', head: true })
          .eq('story_id', storyId)
          .eq('is_premium', false),
        supabase
          .from('story_likes')
          .select('id', { count: 'exact', head: true })
          .eq('story_id', storyId)
          .eq('is_premium', true)
      ])

      return {
        normal: normalLikes.count || 0,
        premium: premiumLikes.count || 0,
        total: (normalLikes.count || 0) + (premiumLikes.count || 0)
      }
    }
  })

  // Buscar lista de usuários que curtiram (para animação)
  const { data: likeUsers } = useQuery({
    queryKey: ['story-likes-users', storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_likes')
        .select(`
          id,
          is_premium,
          created_at,
          user:profiles!story_likes_user_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('story_id', storyId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      return (data || []).map((like: any) => ({
        id: like.user.id,
        full_name: like.user.full_name,
        avatar_url: like.user.avatar_url,
        is_premium: like.is_premium,
        created_at: like.created_at
      })) as LikeUser[]
    }
  })

  // Verificar se o usuário atual curtiu
  const { data: userLike } = useQuery({
    queryKey: ['story-user-like', storyId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('story_likes')
        .select('id, is_premium')
        .eq('story_id', storyId)
        .eq('user_id', user.id)
        .eq('is_premium', false)
        .maybeSingle()

      if (error) throw error
      return data
    }
  })

  // Verificar se o usuário atual deu like premium
  const { data: userPremiumLike } = useQuery({
    queryKey: ['story-user-premium-like', storyId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('story_likes')
        .select('id, is_premium')
        .eq('story_id', storyId)
        .eq('user_id', user.id)
        .eq('is_premium', true)
        .maybeSingle()

      if (error) throw error
      return data
    }
  })

  // Mutation para like normal
  const likeMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      setIsLiking(true)

      if (userLike) {
        // Remover like
        const { error } = await supabase
          .from('story_likes')
          .delete()
          .eq('id', userLike.id)
        
        if (error) throw error
        return { action: 'removed' }
      } else {
        // Adicionar like
        const { error } = await supabase
          .from('story_likes')
          .insert({
            story_id: storyId,
            user_id: user.id,
            is_premium: false
          })
        
        if (error) throw error

        // Criar notificação para o dono do story (se não for o próprio usuário)
        if (storyOwnerId !== user.id) {
          try {
            await NotificationService.sendPushNotification(
              storyOwnerId,
              '❤️ Nova curtida no story!',
              `${user.user_metadata?.full_name || 'Usuário'} curtiu seu story`
            )
          } catch (notificationError) {
            console.warn('Erro ao criar notificação de curtida:', notificationError)
          }
        }

        return { action: 'added' }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-likes-count', storyId] })
      queryClient.invalidateQueries({ queryKey: ['story-likes-users', storyId] })
      queryClient.invalidateQueries({ queryKey: ['story-user-like', storyId] })
    },
    onError: (error) => {
      console.error('Erro ao curtir story:', error)
      toast.error('Erro ao curtir story')
    },
    onSettled: () => {
      setIsLiking(false)
    }
  })

  // Mutation para like premium
  const premiumLikeMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      setIsPremiumLiking(true)

      // Verificar se já deu like premium
      if (userPremiumLike) {
        toast.info('Você já deu um like premium neste story')
        return { action: 'already_liked' }
      }

      // Chamar API para processar like premium (deduzir pontos, etc)
      const response = await fetch('/api/points/premium-like-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          storyOwnerId,
          storyOwnerName
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao dar like premium')
      }

      const data = await response.json()
      return data
    },
    onSuccess: (data) => {
      if (data.action !== 'already_liked') {
        toast.success('💰 Like premium enviado!')
        queryClient.invalidateQueries({ queryKey: ['story-likes-count', storyId] })
        queryClient.invalidateQueries({ queryKey: ['story-likes-users', storyId] })
        queryClient.invalidateQueries({ queryKey: ['story-user-premium-like', storyId] })
        queryClient.invalidateQueries({ queryKey: ['user-points'] })
      }
    },
    onError: (error: any) => {
      console.error('Erro ao dar like premium:', error)
      toast.error(error.message || 'Erro ao dar like premium')
    },
    onSettled: () => {
      setIsPremiumLiking(false)
    }
  })

  const toggleLike = () => {
    if (!isLiking) {
      likeMutation.mutate()
    }
  }

  const givePremiumLike = () => {
    if (!isPremiumLiking) {
      premiumLikeMutation.mutate()
    }
  }

  return {
    // Actions
    toggleLike,
    givePremiumLike,
    
    // States
    isLiking,
    isPremiumLiking,
    isLiked: !!userLike,
    isPremiumLiked: !!userPremiumLike,
    
    // Data
    likeCounts: likeCounts || { normal: 0, premium: 0, total: 0 },
    likeUsers: likeUsers || []
  }
}

