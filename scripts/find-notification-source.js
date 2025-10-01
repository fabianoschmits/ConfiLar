const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://oolqodaehouaidxuowtw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY'
)

async function findNotificationSource() {
  try {
    console.log('🔍 Encontrando fonte das notificações duplicadas...\n')

    const testUserId = 'f7444305-a3bd-4d71-874a-bb95fd27f96a'

    // Limpar notificações antigas primeiro
    console.log('🧹 Limpando notificações antigas...')
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', testUserId)

    if (deleteError) {
      console.error('❌ Erro ao limpar notificações:', deleteError.message)
      return
    }

    console.log('✅ Notificações antigas limpas')
    console.log('\n📊 Agora envie UMA mensagem e aguarde...')
    console.log('⏳ Monitorando por 30 segundos...\n')

    // Monitorar por 30 segundos
    const startTime = Date.now()
    const notifications = new Map()

    const interval = setInterval(async () => {
      const { data: newNotifications, error } = await supabase
        .from('notifications')
        .select('id, title, message, type, created_at')
        .eq('user_id', testUserId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar notificações:', error.message)
        return
      }

      if (newNotifications && newNotifications.length > 0) {
        newNotifications.forEach(notification => {
          if (!notifications.has(notification.id)) {
            notifications.set(notification.id, notification)
            console.log(`\n🔔 NOVA NOTIFICAÇÃO DETECTADA!`)
            console.log(`   ID: ${notification.id}`)
            console.log(`   Título: ${notification.title}`)
            console.log(`   Mensagem: ${notification.message}`)
            console.log(`   Tipo: ${notification.type}`)
            console.log(`   Criada em: ${new Date(notification.created_at).toLocaleString('pt-BR')}`)
            console.log(`   Total de notificações: ${notifications.size}`)
          }
        })
      }

      if (Date.now() - startTime > 30000) {
        clearInterval(interval)
        console.log(`\n📊 RESUMO FINAL:`)
        console.log(`   Total de notificações criadas: ${notifications.size}`)
        
        if (notifications.size > 1) {
          console.log(`\n🚨 DUPLICAÇÃO DETECTADA! ${notifications.size} notificações para 1 mensagem`)
          console.log(`\n💡 POSSÍVEIS CAUSAS:`)
          console.log(`   1. Múltiplas instâncias do useNotificationTriggers rodando`)
          console.log(`   2. Sistema de controle de duplicação não funcionando`)
          console.log(`   3. Realtime criando múltiplas notificações`)
          console.log(`   4. Triggers no banco de dados`)
          console.log(`\n🔧 PRÓXIMAS AÇÕES:`)
          console.log(`   1. Desabilitar TODOS os hooks de notificação`)
          console.log(`   2. Testar se o problema persiste`)
          console.log(`   3. Reativar um por vez para identificar a fonte`)
        } else if (notifications.size === 1) {
          console.log(`\n✅ Apenas 1 notificação criada - problema resolvido!`)
        } else {
          console.log(`\n⚠️ Nenhuma notificação criada - sistema pode estar desabilitado`)
        }
        
        process.exit(0)
      }
    }, 2000)

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

findNotificationSource()
