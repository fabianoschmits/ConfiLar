const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://oolqodaehouaidxuowtw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY'
)

async function investigateNotificationSources() {
  try {
    console.log('🔍 INVESTIGAÇÃO COMPLETA DO SISTEMA DE NOTIFICAÇÕES...\n')

    const testUserId = 'f7444305-a3bd-4d71-874a-bb95fd27f96a'

    // Limpar notificações existentes
    console.log('🧹 Limpando notificações existentes...')
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', testUserId)

    if (deleteError) {
      console.error('❌ Erro ao limpar notificações:', deleteError.message)
      return
    }

    console.log('✅ Notificações limpas')
    console.log('\n📊 TODOS os hooks estão DESABILITADOS')
    console.log('   Se alguma notificação for criada, há OUTRA FONTE!')
    console.log('\n⏳ Monitorando por 2 minutos...')
    console.log('   Por favor, envie UMA mensagem e aguarde\n')

    // Monitorar por 2 minutos
    const startTime = Date.now()
    const notifications = new Map()
    let lastCount = 0

    const interval = setInterval(async () => {
      const { data: newNotifications, error } = await supabase
        .from('notifications')
        .select('id, title, message, type, created_at, user_id')
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
            console.log(`\n🚨 NOTIFICAÇÃO CRIADA AUTOMATICAMENTE!`)
            console.log(`   ID: ${notification.id}`)
            console.log(`   Título: ${notification.title}`)
            console.log(`   Tipo: ${notification.type}`)
            console.log(`   Usuário: ${notification.user_id}`)
            console.log(`   Criada em: ${new Date(notification.created_at).toLocaleString('pt-BR')}`)
            console.log(`   Total: ${notifications.size}`)
            console.log(`\n   ⚠️ ISSO SIGNIFICA QUE HÁ OUTRA FONTE CRIANDO NOTIFICAÇÕES!`)
            console.log(`   🔍 POSSÍVEIS CAUSAS:`)
            console.log(`      1. Triggers no banco de dados`)
            console.log(`      2. Outra fonte de NotificationService.create no código`)
            console.log(`      3. Realtime criando notificações automaticamente`)
            console.log(`      4. Sistema de notificações em outro lugar`)
          }
        })
      }

      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      if (elapsed % 30 === 0 && elapsed > 0) {
        console.log(`   ⏱️ ${elapsed}s decorridos... (${notifications.size} notificações)`)
      }

      if (Date.now() - startTime > 120000) { // 2 minutos
        clearInterval(interval)
        console.log(`\n📊 RESULTADO DA INVESTIGAÇÃO:`)
        console.log(`   Total de notificações criadas: ${notifications.size}`)
        
        if (notifications.size === 0) {
          console.log(`\n✅ PERFEITO! Nenhuma notificação criada com hooks desabilitados`)
          console.log(`   Isso significa que a duplicação vem dos hooks`)
          console.log(`\n🔧 PRÓXIMOS PASSOS:`)
          console.log(`   1. Reativar apenas useNotificationTriggers`)
          console.log(`   2. Testar se há duplicação`)
          console.log(`   3. Se houver, o problema está no useNotificationTriggers`)
        } else {
          console.log(`\n🚨 PROBLEMA IDENTIFICADO! ${notifications.size} notificações criadas mesmo com hooks desabilitados`)
          console.log(`\n💡 POSSÍVEIS CAUSAS:`)
          console.log(`   1. Triggers no banco de dados`)
          console.log(`   2. Outra fonte de NotificationService.create no código`)
          console.log(`   3. Realtime criando notificações automaticamente`)
          console.log(`   4. Sistema de notificações em outro lugar`)
          console.log(`\n🔧 PRÓXIMOS PASSOS:`)
          console.log(`   1. Verificar triggers no banco de dados`)
          console.log(`   2. Buscar todas as fontes de NotificationService.create`)
          console.log(`   3. Verificar se há outros sistemas de notificação`)
        }
        
        process.exit(0)
      }
    }, 5000)

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

investigateNotificationSources()
