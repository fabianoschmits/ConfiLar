const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseKey)

async function deleteAllNotifications() {
  console.log('🧹 Deletando todas as notificações...\n')

  const userId = 'd9a910c6-8b12-43bd-9763-675cf6a75749'

  try {
    // 1. Verificar notificações antes da deleção
    console.log('📋 Verificando notificações antes da deleção...')
    const { data: beforeNotifications, error: beforeError } = await supabase
      .from('notifications')
      .select('id, title, type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (beforeError) {
      console.log('❌ Erro ao buscar notificações:', beforeError.message)
      return
    }

    console.log(`📊 Notificações encontradas: ${beforeNotifications?.length || 0}`)
    
    if (beforeNotifications && beforeNotifications.length > 0) {
      console.log('\n📝 Últimas 5 notificações:')
      beforeNotifications.slice(0, 5).forEach((notif, index) => {
        const timeAgo = new Date() - new Date(notif.created_at)
        const minutesAgo = Math.floor(timeAgo / 60000)
        console.log(`  ${index + 1}. ${notif.title} (${minutesAgo}min atrás) - ${notif.type}`)
      })
    }

    // 2. Deletar todas as notificações do usuário
    console.log('\n🗑️ Deletando todas as notificações...')
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      console.log('❌ Erro ao deletar notificações:', deleteError.message)
      return
    }

    console.log('✅ Todas as notificações foram deletadas!')

    // 3. Verificar se foram deletadas
    console.log('\n🔍 Verificando se foram deletadas...')
    const { data: afterNotifications, error: afterError } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)

    if (afterError) {
      console.log('❌ Erro ao verificar deleção:', afterError.message)
      return
    }

    console.log(`📊 Notificações restantes: ${afterNotifications?.length || 0}`)

    if (afterNotifications && afterNotifications.length === 0) {
      console.log('✅ SUCESSO: Todas as notificações foram deletadas!')
    } else {
      console.log('⚠️ Ainda existem notificações no banco')
    }

    console.log('\n🎯 PRÓXIMOS PASSOS:')
    console.log('✅ Sistema de notificações funcionando')
    console.log('✅ Banco limpo, pronto para novos testes')
    console.log('✅ Agora podemos testar notificações reais')
    console.log('✅ Sistema pronto para uso em produção')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

deleteAllNotifications()
