const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://oolqodaehouaidxuowtw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY'
)

async function createTestMessage() {
  try {
    console.log('💬 Criando mensagem de teste para verificar realtime do chat...\n')

    // Buscar uma conversa existente
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('id, client_id, professional_id')
      .limit(1)

    if (conversationsError || !conversations || conversations.length === 0) {
      console.error('❌ Nenhuma conversa encontrada. Crie uma conversa primeiro.')
      return
    }

    const conversation = conversations[0]
    const testUserId = 'f7444305-a3bd-4d71-874a-bb95fd27f96a'
    
    // Determinar o receiver_id (quem não é o testUserId)
    const receiverId = conversation.client_id === testUserId 
      ? conversation.professional_id 
      : conversation.client_id

    console.log('📊 Usando conversa:', conversation.id)
    console.log('📊 Enviando para usuário:', receiverId)

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: testUserId,
        receiver_id: receiverId,
        content: `💬 Mensagem de teste criada em ${new Date().toLocaleString('pt-BR')} para testar o realtime do chat`,
        is_read: false
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar mensagem:', error.message)
      return
    }

    console.log('✅ Mensagem de teste criada com sucesso!')
    console.log('   ID:', data.id)
    console.log('   Conteúdo:', data.content)
    console.log('   Conversa:', data.conversation_id)
    console.log('   Remetente:', data.sender_id)
    console.log('   Destinatário:', data.receiver_id)
    console.log('   Criada em:', new Date(data.created_at).toLocaleString('pt-BR'))
    console.log('')
    console.log('💬 Se o realtime estiver funcionando, você deve ver:')
    console.log('   - A notificação flutuante aparecer instantaneamente')
    console.log('   - O contador de mensagens não lidas atualizar')
    console.log('   - O toast de nova mensagem aparecer')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createTestMessage()
