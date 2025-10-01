const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://oolqodaehouaidxuowtw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY'
)

async function createTestNotification() {
  try {
    console.log('🔔 Criando notificação de teste para verificar realtime...\n')

    const testUserId = 'f7444305-a3bd-4d71-874a-bb95fd27f96a'
    const timestamp = new Date().toISOString()

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: testUserId,
        title: '🔔 Teste de Realtime',
        message: `Notificação criada em ${new Date().toLocaleString('pt-BR')} para testar o realtime`,
        type: 'info',
        priority: 'normal',
        is_read: false,
        action_url: null,
        metadata: {
          test: true,
          created_via: 'script',
          timestamp: timestamp
        }
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar notificação:', error.message)
      return
    }

    console.log('✅ Notificação de teste criada com sucesso!')
    console.log('   ID:', data.id)
    console.log('   Título:', data.title)
    console.log('   Mensagem:', data.message)
    console.log('   Criada em:', new Date(data.created_at).toLocaleString('pt-BR'))
    console.log('')
    console.log('🔔 Se o realtime estiver funcionando, você deve ver esta notificação aparecer instantaneamente no sino!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createTestNotification()
