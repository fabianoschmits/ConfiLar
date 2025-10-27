import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getRandomWelcomeMessage } from '@/data/welcomeMessages'

export function useWelcomePost() {
  const createWelcomePost = useCallback(async (userId: string, userName: string, userType: string) => {
    try {
      console.log('🎉 Criando post de boas-vindas para:', userName)
      
      // Gerar mensagem personalizada baseada no tipo de usuário
      const personalizedMessage = getRandomWelcomeMessage(userType as 'professional' | 'client', userName)
      
      // Criar post de boas-vindas
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          professional_id: userId,
          user_id: userId,
          title: `🎉 ${userName} se juntou à comunidade!`,
          description: personalizedMessage,
          content: personalizedMessage,
          images: [],
          service_category_id: null,
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
