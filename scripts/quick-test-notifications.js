const { createClient } = require('@supabase/supabase-js')

// Configurações do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseKey)

async function quickTest() {
  console.log('🧪 Teste rápido de notificações...\n')

  try {
    // 1. Buscar primeiro usuário
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .limit(1)

    if (usersError || !users || users.length === 0) {
      console.error('❌ Nenhum usuário encontrado')
      return
    }

    const userId = users[0].id
    console.log(`✅ Usuário encontrado: ${users[0].full_name} (${userId})`)

    // 2. Criar notificação de teste
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'system',
        title: 'Teste da Página de Notificações',
        message: 'Esta é uma notificação criada pelo teste da página. Se você está vendo isso, o sistema está funcionando!',
        is_read: false
      })
      .select()
      .single()

    if (notificationError) {
      console.error('❌ Erro ao criar notificação:', notificationError.message)
      return
    }

    console.log('✅ Notificação criada com sucesso!')
    console.log(`   ID: ${notification.id}`)
    console.log(`   Título: ${notification.title}`)
    console.log(`   Mensagem: ${notification.message}`)

    // 3. Verificar notificações do usuário
    const { data: userNotifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (fetchError) {
      console.error('❌ Erro ao buscar notificações:', fetchError.message)
      return
    }

    console.log(`\n📋 Notificações do usuário (${userNotifications.length} encontradas):`)
    userNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. [${notif.type}] ${notif.title} - ${notif.is_read ? 'Lida' : 'Não lida'}`)
    })

    console.log('\n🎯 Próximos passos:')
    console.log('1. Acesse: http://localhost:3000/teste-notificacoes')
    console.log('2. Faça login com o usuário de teste')
    console.log('3. Clique no sino de notificações no header')
    console.log('4. Verifique se a notificação aparece na lista')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

quickTest()
