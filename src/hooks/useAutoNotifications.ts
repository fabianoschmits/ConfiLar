import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useAutoNotifications() {
  
  // Post de boas-vindas para novos usuários
  const createWelcomePost = useCallback(async (userId: string, userName: string, userType: string) => {
    try {
      console.log('🎉 Criando post de boas-vindas para:', userName)
      
      const welcomeMessages = {
        professional: `🎉 **${userName}** acabou de se juntar à nossa comunidade! Como profissional, ele está pronto para oferecer seus serviços e ajudar outros usuários com seus projetos. Seja bem-vindo! 👋`,
        client: `🎉 **${userName}** acabou de se juntar à nossa comunidade! Como cliente, ele está em busca de profissionais qualificados para seus projetos. Seja bem-vindo! 👋`
      }
      
      const message = welcomeMessages[userType as keyof typeof welcomeMessages] || welcomeMessages.client
      
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          professional_id: userId,
          user_id: userId,
          title: `🎉 Novo membro: ${userName}`,
          description: message,
          images: [],
          location_state: 'SP',
          location_city: 'São Paulo',
          likes_count: 0,
          comments_count: 0,
          is_active: true,
          is_public: true,
          is_featured: false,
          tags: ['sistema', 'boas-vindas'],
          metadata: { type: 'welcome', user_type: userType }
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
      
      const message = reason 
        ? `💡 **${fromUserName}** recomendou **${toUserName}**! \n\n*"${reason}"*\n\nQue tal conhecer este profissional?`
        : `💡 **${fromUserName}** recomendou **${toUserName}**! \n\nQue tal conhecer este profissional?`
      
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          professional_id: fromUserId,
          user_id: fromUserId,
          title: `💡 Recomendação: ${toUserName}`,
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
      
      const stars = '⭐'.repeat(rating)
      const message = comment 
        ? `⭐ **${reviewerName}** avaliou **${reviewedName}** com ${stars} (${rating}/5)\n\n*"${comment}"*\n\nParabéns pelo excelente trabalho!`
        : `⭐ **${reviewerName}** avaliou **${reviewedName}** com ${stars} (${rating}/5)\n\nParabéns pelo excelente trabalho!`
      
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          professional_id: reviewerId,
          user_id: reviewerId,
          title: `⭐ Avaliação: ${reviewedName} - ${stars}`,
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
      
      const message = `❤️ **${userName}** adicionou **${favoritedName}** aos favoritos!\n\nQue tal conhecer este profissional também?`
      
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          professional_id: userId,
          user_id: userId,
          title: `❤️ Favorito: ${favoritedName}`,
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