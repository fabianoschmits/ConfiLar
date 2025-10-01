const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://oolqodaehouaidxuowtw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY'
)

async function createTestData() {
  try {
    console.log('🧪 Criando dados de teste para o sistema de notificações...\n')

    const testUserId = 'f7444305-a3bd-4d71-874a-bb95fd27f96a'
    const otherUserId = 'test-user-123' // ID fictício para simular outro usuário

    // 1. Criar uma mensagem de teste
    console.log('📨 Criando mensagem de teste...')
    try {
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: 'test-conversation-123',
          sender_id: otherUserId,
          receiver_id: testUserId,
          content: 'Olá! Esta é uma mensagem de teste para o sistema de notificações.',
          message_type: 'text',
          is_read: false
        })
        .select()

      if (messageError) {
        console.log('❌ Erro ao criar mensagem:', messageError.message)
      } else {
        console.log('✅ Mensagem de teste criada:', message[0].id)
      }
    } catch (error) {
      console.log('❌ Erro geral ao criar mensagem:', error.message)
    }

    // 2. Criar um favorito de teste
    console.log('\n❤️ Criando favorito de teste...')
    try {
      const { data: favorite, error: favoriteError } = await supabase
        .from('user_favorites')
        .insert({
          user_id: otherUserId,
          favorite_user_id: testUserId
        })
        .select()

      if (favoriteError) {
        console.log('❌ Erro ao criar favorito:', favoriteError.message)
      } else {
        console.log('✅ Favorito de teste criado:', favorite[0].id)
      }
    } catch (error) {
      console.log('❌ Erro geral ao criar favorito:', error.message)
    }

    // 3. Criar uma recomendação de teste
    console.log('\n⭐ Criando recomendação de teste...')
    try {
      const { data: recommendation, error: recommendationError } = await supabase
        .from('user_recommendations')
        .insert({
          recommender_id: otherUserId,
          recommended_id: testUserId,
          recommendation_type: 'Excelente profissional'
        })
        .select()

      if (recommendationError) {
        console.log('❌ Erro ao criar recomendação:', recommendationError.message)
      } else {
        console.log('✅ Recomendação de teste criada:', recommendation[0].id)
      }
    } catch (error) {
      console.log('❌ Erro geral ao criar recomendação:', error.message)
    }

    // 4. Criar uma avaliação de teste
    console.log('\n⭐ Criando avaliação de teste...')
    try {
      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: otherUserId,
          reviewed_id: testUserId,
          rating_person: 5,
          comment: 'Excelente trabalho!',
          title: 'Recomendo muito',
          is_recommended: true
        })
        .select()

      if (reviewError) {
        console.log('❌ Erro ao criar avaliação:', reviewError.message)
      } else {
        console.log('✅ Avaliação de teste criada:', review[0].id)
      }
    } catch (error) {
      console.log('❌ Erro geral ao criar avaliação:', error.message)
    }

    console.log('\n🎯 DADOS DE TESTE CRIADOS!')
    console.log('✅ Mensagem criada')
    console.log('✅ Favorito criado')
    console.log('✅ Recomendação criada')
    console.log('✅ Avaliação criada')
    console.log('\n📱 Agora recarregue a aplicação para ver as notificações!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createTestData()
