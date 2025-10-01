const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://oolqodaehouaidxuowtw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY'
)

async function createTestMessageAndCheck() {
  try {
    console.log('🧪 Criando mensagem de teste e verificando notificações...\n')

    const testUserId = 'f7444305-a3bd-4d71-874a-bb95fd27f96a'

    // Buscar outro usuário
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

    // Buscar conversa existente
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('id')
      .or(`client_id.eq.${testUserId},professional_id.eq.${testUserId}`)
      .limit(1)

    if (conversationsError || !conversations || conversations.length === 0) {
      console.log('❌ Não foi possível encontrar conversa')
      return
    }

    const conversationId = conversations[0].id
    console.log(`✅ Conversa encontrada: ${conversationId}`)

    // Criar mensagem de teste
    console.log('\n📨 Criando mensagem de teste...')
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: otherUserId,
        receiver_id: testUserId,
        content: `Mensagem de teste para verificar notificações - ${new Date().toLocaleString('pt-BR')}`,
        message_type: 'text',
        is_read: false
      })
      .select()

    if (messageError) {
      console.log('❌ Erro ao criar mensagem:', messageError.message)
      return
    }

    console.log(`✅ Mensagem criada: ${message[0].id}`)

    // Aguardar um pouco
    console.log('\n⏳ Aguardando 3 segundos...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Verificar se o sistema de monitoramento detectou
    console.log('\n🔍 Verificando se o sistema detectou a mensagem...')
    
    // Simular o que o hook de monitoramento faria
    const { data: recentMessages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        sender_id,
        receiver_id,
        conversation_id,
        created_at,
        is_read,
        sender:profiles!messages_sender_id_fkey(full_name)
      `)
      .eq('receiver_id', testUserId)
      .eq('is_read', false)
      .neq('sender_id', testUserId)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Últimos 5 minutos
      .order('created_at', { ascending: false })

    if (messagesError) {
      console.log('❌ Erro ao buscar mensagens:', messagesError.message)
      return
    }

    console.log(`📨 Mensagens não lidas encontradas: ${recentMessages?.length || 0}`)

    if (recentMessages && recentMessages.length > 0) {
      console.log('\n📋 Mensagens detectadas:')
      recentMessages.forEach((message, index) => {
        const senderName = message.sender?.full_name || 'Usuário'
        console.log(`   ${index + 1}. ${senderName}: ${message.content}`)
        console.log(`      ID: ${message.id}`)
        console.log(`      Criada em: ${new Date(message.created_at).toLocaleString('pt-BR')}`)
      })

      // Verificar se já existe notificação para esta mensagem
      console.log('\n🔍 Verificando notificações existentes...')
      const { data: existingNotifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', testUserId)
        .eq('type', 'message')
        .order('created_at', { ascending: false })

      if (notificationsError) {
        console.log('❌ Erro ao buscar notificações:', notificationsError.message)
        return
      }

      console.log(`📊 Notificações de mensagem existentes: ${existingNotifications?.length || 0}`)

      if (existingNotifications && existingNotifications.length > 0) {
        console.log('\n📋 Notificações existentes:')
        existingNotifications.forEach((notification, index) => {
          console.log(`   ${index + 1}. ${notification.title}`)
          console.log(`      Criada em: ${new Date(notification.created_at).toLocaleString('pt-BR')}`)
        })
      }

      // Se não há notificação, criar uma
      if (!existingNotifications || existingNotifications.length === 0) {
        console.log('\n🔔 Criando notificação para a mensagem...')
        
        const { data: newNotification, error: createError } = await supabase
          .from('notifications')
          .insert({
            user_id: testUserId,
            title: `💬 Nova mensagem de ${otherUserName}`,
            message: message[0].content,
            type: 'message',
            priority: 'high',
            is_read: false,
            action_url: null,
            metadata: {
              sender_name: otherUserName,
              conversation_id: conversationId,
              sender_id: otherUserId,
              action_type: 'open_chat'
            }
          })
          .select()

        if (createError) {
          console.log('❌ Erro ao criar notificação:', createError.message)
        } else {
          console.log('✅ Notificação criada:', newNotification[0].id)
        }
      } else {
        console.log('⏭️ Notificação já existe para esta mensagem')
      }
    } else {
      console.log('⚠️ Nenhuma mensagem não lida encontrada')
    }

    console.log('\n🎯 TESTE CONCLUÍDO!')
    console.log('📱 Recarregue a aplicação para ver as notificações')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createTestMessageAndCheck()
