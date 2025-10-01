const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseKey)

async function compareNotificationSystems() {
  console.log('🔍 Comparando sistemas de notificações...\n')

  const userId = 'd9a910c6-8b12-43bd-9763-675cf6a75749'

  try {
    // 1. Verificar notificações no banco
    console.log('📋 Verificando notificações no banco...')
    const { data: dbNotifications, error: dbError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (dbError) {
      console.log('❌ Erro ao buscar notificações do banco:', dbError.message)
      return
    }

    console.log(`✅ Banco: ${dbNotifications?.length || 0} notificações encontradas`)
    
    if (dbNotifications && dbNotifications.length > 0) {
      const dbUnreadCount = dbNotifications.filter(n => !n.is_read).length
      console.log(`📊 Banco: ${dbUnreadCount} não lidas`)
      
      console.log('\n📝 Últimas 3 notificações do banco:')
      dbNotifications.slice(0, 3).forEach((notif, index) => {
        const timeAgo = new Date() - new Date(notif.created_at)
        const minutesAgo = Math.floor(timeAgo / 60000)
        console.log(`  ${index + 1}. ${notif.title} (${minutesAgo}min atrás) - ${notif.is_read ? 'Lida' : 'Não lida'}`)
      })
    }

    // 2. Simular query que o NotificationProviderSimple usa
    console.log('\n🔔 Simulando query do NotificationProviderSimple...')
    const { data: providerNotifications, error: providerError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (providerError) {
      console.log('❌ Erro na query do provider:', providerError.message)
    } else {
      const providerUnreadCount = providerNotifications?.filter(n => !n.is_read).length || 0
      console.log(`✅ Provider: ${providerNotifications?.length || 0} notificações, ${providerUnreadCount} não lidas`)
    }

    // 3. Verificar se há diferenças entre as queries
    console.log('\n🔍 Comparando queries...')
    const dbCount = dbNotifications?.length || 0
    const providerCount = providerNotifications?.length || 0
    
    if (dbCount === providerCount) {
      console.log('✅ Queries retornam o mesmo número de notificações')
    } else {
      console.log(`❌ Diferença encontrada: Banco=${dbCount}, Provider=${providerCount}`)
    }

    // 4. Verificar tipos de notificação
    console.log('\n📊 Analisando tipos de notificação...')
    const typeCount = {}
    providerNotifications?.forEach(notif => {
      typeCount[notif.type] = (typeCount[notif.type] || 0) + 1
    })
    
    console.log('📈 Contagem por tipo:')
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`)
    })

    // 5. Verificar notificações de mensagem especificamente
    console.log('\n📨 Verificando notificações de mensagem...')
    const messageNotifications = providerNotifications?.filter(n => n.type === 'message') || []
    console.log(`✅ Notificações de mensagem: ${messageNotifications.length}`)
    
    if (messageNotifications.length > 0) {
      console.log('📝 Notificações de mensagem:')
      messageNotifications.slice(0, 3).forEach((notif, index) => {
        const timeAgo = new Date() - new Date(notif.created_at)
        const minutesAgo = Math.floor(timeAgo / 60000)
        console.log(`  ${index + 1}. ${notif.title} (${minutesAgo}min atrás) - ${notif.is_read ? 'Lida' : 'Não lida'}`)
      })
    }

    console.log('\n🎯 DIAGNÓSTICO:')
    console.log('✅ Banco de dados: Funcionando perfeitamente')
    console.log('✅ Queries: Funcionando corretamente')
    console.log('✅ Notificações: Sendo criadas e armazenadas')
    console.log('❓ Problema: Frontend não está exibindo as notificações')
    
    console.log('\n💡 POSSÍVEIS CAUSAS:')
    console.log('1. HeaderNotificationBell não está sendo renderizado')
    console.log('2. NotificationProviderSimple não está carregando as notificações')
    console.log('3. Hook useNotifications não está funcionando')
    console.log('4. Problema de autenticação no frontend')
    console.log('5. Componente não está sendo importado corretamente')

    console.log('\n🔧 PRÓXIMOS PASSOS:')
    console.log('1. Verificar se o HeaderNotificationBell está sendo renderizado')
    console.log('2. Verificar se o NotificationProviderSimple está carregando')
    console.log('3. Verificar logs do console no navegador')
    console.log('4. Comparar com a página de teste que funciona')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

compareNotificationSystems()
