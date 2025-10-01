const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestActions() {
  console.log('🎯 Criando ações de teste para gerar notificações...\n')

  try {
    // 1. Buscar usuários para teste
    console.log('👥 Buscando usuários para teste...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .limit(2)

    if (profilesError) {
      console.log('❌ Erro ao buscar usuários:', profilesError.message)
      return
    }

    if (!profiles || profiles.length < 2) {
      console.log('❌ Precisa de pelo menos 2 usuários para teste')
      return
    }

    const user1 = profiles[0]
    const user2 = profiles[1]

    console.log(`✅ Usuários: ${user1.full_name} (${user1.id}) e ${user2.full_name} (${user2.id})`)

    // 2. Criar uma mensagem
    console.log('\n📨 Criando mensagem de teste...')
    try {
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('user1_id', user1.id)
        .eq('user2_id', user2.id)
        .single()

      let conversationId = conversation?.id

      if (convError || !conversationId) {
        // Criar nova conversa
        const { data: newConv, error: newConvError } = await supabase
          .from('conversations')
          .insert({
            user1_id: user1.id,
            user2_id: user2.id
          })
          .select('id')
          .single()

        if (newConvError) {
          console.log('❌ Erro ao criar conversa:', newConvError.message)
        } else {
          conversationId = newConv.id
          console.log('✅ Nova conversa criada:', conversationId)
        }
      }

      if (conversationId) {
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: user1.id,
            receiver_id: user2.id,
            content: 'Olá! Esta é uma mensagem de teste para gerar notificação.',
            message_type: 'text'
          })
          .select('id')

        if (messageError) {
          console.log('❌ Erro ao criar mensagem:', messageError.message)
        } else {
          console.log('✅ Mensagem criada:', messageData[0].id)
        }
      }
    } catch (err) {
      console.log('❌ Erro geral na criação de mensagem:', err.message)
    }

    // 3. Criar uma avaliação
    console.log('\n⭐ Criando avaliação de teste...')
    try {
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: user1.id,
          reviewed_id: user2.id,
          rating_person: 5,
          comment: 'Excelente profissional! Recomendo.',
          ad_id: null
        })
        .select('id')

      if (reviewError) {
        console.log('❌ Erro ao criar avaliação:', reviewError.message)
      } else {
        console.log('✅ Avaliação criada:', reviewData[0].id)
      }
    } catch (err) {
      console.log('❌ Erro geral na criação de avaliação:', err.message)
    }

    // 4. Criar um favorito
    console.log('\n❤️ Criando favorito de teste...')
    try {
      const { data: favoriteData, error: favoriteError } = await supabase
        .from('favorites')
        .insert({
          user_id: user1.id,
          professional_id: user2.id
        })
        .select('id')

      if (favoriteError) {
        console.log('❌ Erro ao criar favorito:', favoriteError.message)
      } else {
        console.log('✅ Favorito criado:', favoriteData[0].id)
      }
    } catch (err) {
      console.log('❌ Erro geral na criação de favorito:', err.message)
    }

    // 5. Criar uma visualização de perfil
    console.log('\n👁️ Criando visualização de perfil de teste...')
    try {
      const { data: viewData, error: viewError } = await supabase
        .from('profile_views')
        .insert({
          viewer_id: user1.id,
          viewed_profile_id: user2.id,
          user_agent: 'Test Agent',
          referrer: 'https://confilar.vercel.app'
        })
        .select('id')

      if (viewError) {
        console.log('❌ Erro ao criar visualização:', viewError.message)
      } else {
        console.log('✅ Visualização criada:', viewData[0].id)
      }
    } catch (err) {
      console.log('❌ Erro geral na criação de visualização:', err.message)
    }

    // 6. Aguardar um pouco e verificar se as notificações foram criadas
    console.log('\n⏳ Aguardando 3 segundos para o sistema processar...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    console.log('\n📋 Verificando notificações criadas automaticamente...')
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user2.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (notificationsError) {
      console.log('❌ Erro ao buscar notificações:', notificationsError.message)
    } else {
      console.log(`✅ Total de notificações para ${user2.full_name}: ${notifications?.length || 0}`)
      if (notifications && notifications.length > 0) {
        console.log('📝 Notificações encontradas:')
        notifications.forEach(notification => {
          const timeAgo = new Date() - new Date(notification.created_at)
          const minutesAgo = Math.floor(timeAgo / 60000)
          console.log(`  - ${notification.type}: ${notification.title} (${minutesAgo}min atrás)`)
        })
      }
    }

    console.log('\n🎉 Ações de teste criadas! As notificações devem aparecer no sino do usuário.')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

createTestActions()
