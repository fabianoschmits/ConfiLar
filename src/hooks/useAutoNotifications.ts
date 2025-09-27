import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useAutoNotifications() {
  
  // Post de boas-vindas para novos usuários (NOVO SISTEMA)
  const createWelcomePost = useCallback(async (userId: string, userName: string, userType: string) => {
    try {
      console.log('🎉 Criando post de boas-vindas para:', userName)
      
      // Verificar se já existe um post de boas-vindas para este usuário
      const { data: existingPost, error: checkError } = await supabase
        .from('feed_posts')
        .select('id')
        .eq('user_id', userId)
        .eq('metadata->>type', 'welcome')
        .single()

      if (existingPost) {
        console.log('⚠️ Post de boas-vindas já existe para este usuário, pulando...')
        return { success: true, data: existingPost, skipped: true }
      }

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

  // Post de recomendação entre usuários (UMA VEZ POR AÇÃO)
  const createRecommendationPost = useCallback(async (fromUserId: string, fromUserName: string, toUserId: string, toUserName: string, reason?: string) => {
    try {
      console.log('💡 Verificando se já existe post de recomendação:', fromUserName, '→', toUserName)
      
      // Verificar se já existe um post de recomendação para esta combinação (incluindo deletados)
      const { data: existingPost, error: checkError } = await supabase
        .from('feed_posts')
        .select('id, created_at')
        .eq('user_id', fromUserId)
        .eq('professional_id', toUserId)
        .eq('metadata->>type', 'recommendation')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingPost) {
        console.log('⚠️ Post de recomendação já existe para esta combinação, pulando...')
        return { success: true, data: existingPost, skipped: true }
      }
      
      console.log('💡 Criando post de recomendação:', fromUserName, '→', toUserName)
      
      // Buscar dados de localização do usuário que fez a recomendação
      const { data: userLocation, error: locationError } = await supabase
        .from('profiles')
        .select('location_city, location_state')
        .eq('id', fromUserId)
        .single()

      if (locationError) {
        console.log('⚠️ Erro ao buscar localização do usuário:', locationError.message)
      } else {
        console.log('📍 Localização encontrada para recomendação:', userLocation)
      }

      const message = `💡 ${fromUserName} recomendou ${toUserName}`
      
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          professional_id: toUserId,
          user_id: fromUserId,
          title: `💡 ${fromUserName} recomendou ${toUserName}`,
          description: message,
          images: [],
          location_state: userLocation?.location_state || 'SP',
          location_city: userLocation?.location_city || 'São Paulo',
          likes_count: 0,
          comments_count: 0,
          is_active: true,
          is_public: true,
          is_featured: false,
          tags: ['sistema', 'recomendacao'],
          metadata: { 
            type: 'recommendation', 
            from_user: fromUserName, 
            to_user: toUserName,
            from_user_id: fromUserId,
            to_user_id: toUserId,
            location_city: userLocation?.location_city,
            location_state: userLocation?.location_state
          }
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

  // Post de avaliação entre usuários (UMA VEZ POR AÇÃO)
  const createReviewPost = useCallback(async (reviewerId: string, reviewerName: string, reviewedId: string, reviewedName: string, rating: number, comment?: string) => {
    try {
      console.log('⭐ Verificando se já existe post de avaliação:', reviewerName, '→', reviewedName)
      
      // Verificar se já existe um post de avaliação para esta combinação (incluindo deletados)
      const { data: existingPost, error: checkError } = await supabase
        .from('feed_posts')
        .select('id, created_at')
        .eq('user_id', reviewerId)
        .eq('professional_id', reviewedId)
        .eq('metadata->>type', 'review')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingPost) {
        console.log('⚠️ Post de avaliação já existe para esta combinação, pulando...')
        return { success: true, data: existingPost, skipped: true }
      }
      
      console.log('⭐ Criando post de avaliação:', reviewerName, '→', reviewedName, rating, 'estrelas')
      const stars = '⭐'.repeat(Math.min(rating, 5))
      const message = `⭐ ${reviewerName} avaliou ${reviewedName} com ${stars} (${rating}/5)`
      
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          professional_id: reviewedId,
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

  // Post de favoritos (UMA VEZ POR AÇÃO)
  const createFavoritePost = useCallback(async (userId: string, userName: string, favoritedId: string, favoritedName: string) => {
    try {
      console.log('❤️ Verificando se já existe post de favorito:', userName, '→', favoritedName)
      
      // Verificar se já existe um post de favorito para esta combinação (incluindo deletados)
      const { data: existingPost, error: checkError } = await supabase
        .from('feed_posts')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('professional_id', favoritedId)
        .eq('metadata->>type', 'favorite')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingPost) {
        console.log('⚠️ Post de favorito já existe para esta combinação, pulando...')
        return { success: true, data: existingPost, skipped: true }
      }
      
      console.log('❤️ Criando post de favorito:', userName, '→', favoritedName)
      
      // Buscar dados de localização do usuário que favoritou
      const { data: userLocation, error: locationError } = await supabase
        .from('profiles')
        .select('location_city, location_state')
        .eq('id', userId)
        .single()

      if (locationError) {
        console.log('⚠️ Erro ao buscar localização do usuário:', locationError.message)
      } else {
        console.log('📍 Localização encontrada para favorito:', userLocation)
      }

      const message = `❤️ ${userName} adicionou ${favoritedName} aos favoritos`
      
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          professional_id: favoritedId,
          user_id: userId,
          title: `❤️ ${userName} favoritou ${favoritedName}`,
          description: message,
          images: [],
          location_state: userLocation?.location_state || 'SP',
          location_city: userLocation?.location_city || 'São Paulo',
          likes_count: 0,
          comments_count: 0,
          is_active: true,
          is_public: true,
          is_featured: false,
          tags: ['sistema', 'favorito'],
          metadata: { 
            type: 'favorite', 
            user: userName, 
            favorited: favoritedName,
            user_id: userId,
            favorited_id: favoritedId,
            location_city: userLocation?.location_city,
            location_state: userLocation?.location_state
          }
        })
        .select()
        .single()

      if (error) throw error
      console.log('✅ Post de favorito criado:', data.id)
      console.log('📊 Dados salvos no post:', {
        title: data.title,
        metadata: data.metadata,
        location_city: data.location_city,
        location_state: data.location_state
      })
      return { success: true, data }
    } catch (error) {
      console.error('❌ Erro ao criar post de favorito:', error)
      return { success: false, error }
    }
  }, [])

  // Post de estatísticas da plataforma (UMA VEZ POR DIA)
  const createStatsPost = useCallback(async (stats: { totalUsers: number, totalProjects: number, totalReviews: number }) => {
    try {
      console.log('📊 Verificando se já existe post de estatísticas hoje')
      
      // Verificar se já existe um post de estatísticas hoje
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      const { data: existingPost, error: checkError } = await supabase
        .from('feed_posts')
        .select('id, created_at')
        .eq('user_id', 'system')
        .eq('metadata->>type', 'platform_stats')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lte('created_at', `${today}T23:59:59.999Z`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingPost) {
        console.log('⚠️ Post de estatísticas já existe para hoje, pulando...')
        return { success: true, data: existingPost, skipped: true }
      }
      
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