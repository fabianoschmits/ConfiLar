import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useWelcomePost() {
  const createWelcomePost = useCallback(async (userId: string, userName: string, userType: string) => {
    try {
      console.log('🎉 Criando post de boas-vindas para:', userName)
      
      // Determinar mensagem baseada no tipo de usuário
      const welcomeMessages = {
        professional: `Olá! Sou ${userName} e acabei de me juntar à plataforma ConfiLar! 🎉 Estou aqui para oferecer meus serviços profissionais e ajudar outros usuários com seus projetos. Fico feliz em fazer parte desta comunidade!`,
        client: `Olá! Sou ${userName} e acabei de me juntar à plataforma ConfiLar! 🎉 Estou aqui para encontrar profissionais qualificados para meus projetos. Mal posso esperar para conhecer a comunidade!`
      }
      
      const message = welcomeMessages[userType as keyof typeof welcomeMessages] || welcomeMessages.client
      
      // Criar post de boas-vindas
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          professional_id: userId,
          user_id: userId,
          title: `🎉 ${userName} se juntou à comunidade!`,
          description: message,
          content: message,
          images: [],
          location_state: 'SP', // Default
          location_city: 'São Paulo', // Default
          likes_count: 0,
          comments_count: 0,
          is_active: true,
          is_public: true,
          is_featured: false,
          tags: ['sistema', 'boas-vindas'],
          metadata: { 
            type: 'welcome', 
            user: userName,
            user_type: userType
          }
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao criar post de boas-vindas:', error)
        return { success: false, error }
      }

      console.log('✅ Post de boas-vindas criado com sucesso:', data.id)
      return { success: true, data }
    } catch (error) {
      console.error('❌ Erro geral ao criar post de boas-vindas:', error)
      return { success: false, error }
    }
  }, [])

  return { createWelcomePost }
}
