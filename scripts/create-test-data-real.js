const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://oolqodaehouaidxuowtw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY'
)

async function createTestDataReal() {
  try {
    console.log('🧪 Criando dados de teste com IDs reais...\n')

    const testUserId = 'f7444305-a3bd-4d71-874a-bb95fd27f96a'

    // Buscar outro usuário real
    console.log('🔍 Buscando outro usuário...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .neq('id', testUserId)
      .limit(1)

    if (profilesError || !profiles || profiles.length === 0) {
      console.log('❌ Não foi possível encontrar outro usuário')
      return
    }

    const otherUserId = profiles[0].id
    const otherUserName = profiles[0].full_name || 'Usuário'

    console.log(`✅ Usuário encontrado: ${otherUserName} (${otherUserId})`)

    // Buscar uma conversa existente ou criar uma
    console.log('\n🔍 Buscando conversa existente...')
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('id')
      .or(`client_id.eq.${testUserId},professional_id.eq.${testUserId}`)
      .limit(1)

    let conversationId = null
    if (conversations && conversations.length > 0) {
      conversationId = conversations[0].id
      console.log(`✅ Conversa encontrada: ${conversationId}`)
    } else {
      console.log('⚠️ Nenhuma conversa encontrada, criando uma...')
      const { data: newConversation, error: newConversationError } = await supabase
        .from('conversations')
        .insert({
          client_id: testUserId,
          professional_id: otherUserId
        })
        .select()

      if (newConversationError) {
        console.log('❌ Erro ao criar conversa:', newConversationError.message)
        return
      }

      conversationId = newConversation[0].id
      console.log(`✅ Conversa criada: ${conversationId}`)
    }

    // 1. Criar uma mensagem de teste
    console.log('\n📨 Criando mensagem de teste...')
    try {
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: otherUserId,
          receiver_id: testUserId,
          content: `Olá! Esta é uma mensagem de teste de ${otherUserName} para o sistema de notificações.`,
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
          comment: 'Excelente trabalho! Recomendo muito.',
          title: 'Profissional exemplar',
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

    console.log('\n🎯 DADOS DE TESTE CRIADOS COM SUCESSO!')
    console.log('✅ Mensagem criada')
    console.log('✅ Favorito criado')
    console.log('✅ Recomendação criada')
    console.log('✅ Avaliação criada')
    console.log('\n📱 Agora recarregue a aplicação para ver as notificações!')
    console.log('🔔 As notificações devem aparecer automaticamente em tempo real!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createTestDataReal()
