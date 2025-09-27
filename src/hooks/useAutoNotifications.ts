import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useAutoNotifications() {
  
  // Post de boas-vindas para novos usuários
  const createWelcomePost = useCallback(async (userId: string, userName: string, userType: string) => {
    try {
      console.log('🎉 Criando post de boas-vindas para:', userName)
      
      // Buscar informações completas do usuário
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('full_name, bio, location_city, location_state, avatar_url, user_type')
        .eq('id', userId)
        .single()

      if (userError) {
        console.log('⚠️ Erro ao buscar dados do usuário:', userError.message)
      }

      const message = `🎉 ${userName} se juntou à comunidade`
      
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          professional_id: userId,
          user_id: userId,
          title: `🎉 ${userName} se juntou à comunidade`,
          description: message,
          images: [],
          location_state: userData?.location_state || 'SP',
          location_city: userData?.location_city || 'São Paulo',
          likes_count: 0,
          comments_count: 0,
          is_active: true,
          is_public: true,
          is_featured: false,
          tags: ['sistema', 'boas-vindas'],
          metadata: { 
            type: 'welcome', 
            user: userName,
            user_type: userData?.user_type || userType,
            location_city: userData?.location_city,
            location_state: userData?.location_state,
            bio: userData?.bio,
            avatar_url: userData?.avatar_url
          }
        })
        .select()
        .single()

      if (error) throw error
      console.log('✅ Post de boas-vindas criado:', data.id)
      return { success: true, data }
    } catch (error) {
      console.error('❌ Erro ao criar post de boas-vindas:', error)
      return { success: false, error }
    }
  }, [])

  // Post de recomendação entre usuários
  const createRecommendationPost = useCallback(async (fromUserId: string, fromUserName: string, toUserId: string, toUserName: string, reason?: string) => {
    try {
      console.log('💡 Criando post de recomendação:', fromUserName, '→', toUserName)
      
      const message = `💡 ${fromUserName} recomendou ${toUserName}`
      
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          professional_id: fromUserId,
          user_id: fromUserId,
          title: `💡 ${fromUserName} recomendou ${toUserName}`,
          description: message,
          images: [],
          location_state: 'SP',
          location_city: 'São Paulo',
          likes_count: 0,
          comments_count: 0,
          is_active: true,
          is_public: true,
          is_featured: false,
          tags: ['sistema', 'recomendacao'],
          metadata: { type: 'recommendation', from_user: fromUserName, to_user: toUserName }
        })
        .select()
        .single()

      if (error) throw error
      console.log('✅ Post de recomendação criado:', data.id)
      return { success: true, data }
    } catch (error) {
      console.error('❌ Erro ao criar post de recomendação:', error)
      return { success: false, error }
    }
  }, [])

  // Post de avaliação entre usuários
  const createReviewPost = useCallback(async (reviewerId: string, reviewerName: string, reviewedId: string, reviewedName: string, rating: number, comment?: string) => {
    try {
      console.log('⭐ Criando post de avaliação:', reviewerName, '→', reviewedName, rating, 'estrelas')
      
      const stars = '⭐'.repeat(Math.min(rating, 5))
      const message = `⭐ ${reviewerName} avaliou ${reviewedName} com ${stars} (${rating}/5)`
      
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          professional_id: reviewerId,
          user_id: reviewerId,
          title: `⭐ ${reviewerName} avaliou ${reviewedName}`,
          description: message,
          images: [],
          location_state: 'SP',
          location_city: 'São Paulo',
          likes_count: 0,
          comments_count: 0,
          is_active: true,
          is_public: true,
          is_featured: false,
          tags: ['sistema', 'avaliacao'],
          metadata: { type: 'review', reviewer: reviewerName, reviewed: reviewedName, rating: rating }
        })
        .select()
        .single()

      if (error) throw error
      console.log('✅ Post de avaliação criado:', data.id)
      return { success: true, data }
    } catch (error) {
      console.error('❌ Erro ao criar post de avaliação:', error)
      return { success: false, error }
    }
  }, [])

  // Post de favoritos
  const createFavoritePost = useCallback(async (userId: string, userName: string, favoritedId: string, favoritedName: string) => {
    try {
      console.log('❤️ Criando post de favorito:', userName, '→', favoritedName)
      
      const message = `❤️ ${userName} adicionou ${favoritedName} aos favoritos`
      
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          professional_id: userId,
          user_id: userId,
          title: `❤️ ${userName} favoritou ${favoritedName}`,
          description: message,
          images: [],
          location_state: 'SP',
          location_city: 'São Paulo',
          likes_count: 0,
          comments_count: 0,
          is_active: true,
          is_public: true,
          is_featured: false,
          tags: ['sistema', 'favorito'],
          metadata: { type: 'favorite', user: userName, favorited: favoritedName }
        })
        .select()
        .single()

      if (error) throw error
      console.log('✅ Post de favorito criado:', data.id)
      return { success: true, data }
    } catch (error) {
      console.error('❌ Erro ao criar post de favorito:', error)
      return { success: false, error }
    }
  }, [])

  // Post de estatísticas da plataforma
  const createStatsPost = useCallback(async (stats: { totalUsers: number, totalProjects: number, totalReviews: number }) => {
    try {
      console.log('📊 Criando post de estatísticas:', stats)
      
      const message = `📊 **Estatísticas da Plataforma**\n\n👥 **${stats.totalUsers}** usuários cadastrados\n💼 **${stats.totalProjects}** projetos realizados\n⭐ **${stats.totalReviews}** avaliações\n\nNossa comunidade está crescendo! 🚀`
      
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          professional_id: 'system', // ID do sistema
          user_id: 'system',
          title: `📊 Estatísticas da Plataforma`,
          description: message,
          images: [],
          location_state: 'SP',
          location_city: 'São Paulo',
          likes_count: 0,
          comments_count: 0,
          is_active: true,
          is_public: true,
          is_featured: false,
          tags: ['sistema', 'estatisticas'],
          metadata: { type: 'platform_stats', stats: stats }
        })
        .select()
        .single()

      if (error) throw error
      console.log('✅ Post de estatísticas criado:', data.id)
      return { success: true, data }
    } catch (error) {
      console.error('❌ Erro ao criar post de estatísticas:', error)
      return { success: false, error }
    }
  }, [])

  return {
    createWelcomePost,
    createRecommendationPost,
    createReviewPost,
    createFavoritePost,
    createStatsPost
  }
}