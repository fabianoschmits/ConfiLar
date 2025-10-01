const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://oolqodaehouaidxuowtw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY'
)

async function monitorNotificationCreation() {
  try {
    console.log('🔍 Monitorando criação de notificações em tempo real...\n')

    const testUserId = 'f7444305-a3bd-4d71-874a-bb95fd27f96a'

    // Configurar canal de realtime para notificações
    const channel = supabase
      .channel('monitor-notifications-creation')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${testUserId}`
        },
        (payload) => {
          console.log('🔔 ✅ NOVA NOTIFICAÇÃO CRIADA!')
          console.log('   ID:', payload.new.id)
          console.log('   Título:', payload.new.title)
          console.log('   Mensagem:', payload.new.message)
          console.log('   Tipo:', payload.new.type)
          console.log('   Timestamp:', new Date(payload.new.created_at).toLocaleString('pt-BR'))
          console.log('')
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${testUserId}`
        },
        (payload) => {
          console.log('🗑️ ✅ NOTIFICAÇÃO DELETADA!')
          console.log('   ID:', payload.old.id)
          console.log('   Título:', payload.old.title)
          console.log('   Timestamp:', new Date().toLocaleString('pt-BR'))
          console.log('')
        }
      )
      .subscribe()

    console.log('✅ Monitor de notificações ativo')
    console.log('⏳ Aguardando criação/deleção de notificações... (Pressione Ctrl+C para sair)\n')

    // Manter o script rodando
    process.on('SIGINT', () => {
      console.log('\n🔔 Desconectando monitor...')
      channel.unsubscribe()
      console.log('✅ Monitor desconectado. Script finalizado.')
      process.exit(0)
    })

    // Manter o processo vivo
    setInterval(() => {
      // Apenas para manter o script rodando
    }, 1000)

  } catch (error) {
    console.error('❌ Erro ao monitorar notificações:', error)
  }
}

monitorNotificationCreation()