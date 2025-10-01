const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://oolqodaehouaidxuowtw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY'
)

async function monitorNotificationCreation() {
  try {
    console.log('🔍 Monitorando criação de notificações em tempo real...\n')
    console.log('📱 Envie uma mensagem de outro usuário para testar')
    console.log('⏹️ Pressione Ctrl+C para parar\n')

    const testUserId = 'f7444305-a3bd-4d71-874a-bb95fd27f96a'
    let lastNotificationCount = 0

    // Verificar notificações iniciais
    const { data: initialNotifications, error: initialError } = await supabase
      .from('notifications')
      .select('id, title, type, created_at')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false })

    if (initialError) {
      console.log('❌ Erro ao buscar notificações iniciais:', initialError.message)
      return
    }

    lastNotificationCount = initialNotifications?.length || 0
    console.log(`📊 Notificações iniciais: ${lastNotificationCount}`)

    // Monitorar em tempo real
    const channel = supabase
      .channel('notifications-monitor')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${testUserId}`
        },
        (payload) => {
          const newNotification = payload.new
          console.log('\n🔔 NOVA NOTIFICAÇÃO CRIADA!')
          console.log(`   ID: ${newNotification.id}`)
          console.log(`   Título: ${newNotification.title}`)
          console.log(`   Tipo: ${newNotification.type}`)
          console.log(`   Criada em: ${new Date(newNotification.created_at).toLocaleString('pt-BR')}`)
          console.log(`   Metadata: ${JSON.stringify(newNotification.metadata)}`)
          
          lastNotificationCount++
          console.log(`📊 Total de notificações: ${lastNotificationCount}`)
        }
      )
      .subscribe()

    console.log('✅ Monitoramento ativo! Aguardando novas notificações...')

    // Manter o script rodando
    process.on('SIGINT', () => {
      console.log('\n🛑 Parando monitoramento...')
      channel.unsubscribe()
      process.exit(0)
    })

    // Verificar duplicatas a cada 30 segundos
    setInterval(async () => {
      try {
        const { data: currentNotifications, error: currentError } = await supabase
          .from('notifications')
          .select('id, title, type, created_at')
          .eq('user_id', testUserId)
          .order('created_at', { ascending: false })

        if (currentError) {
          console.log('❌ Erro ao verificar notificações:', currentError.message)
          return
        }

        const currentCount = currentNotifications?.length || 0
        
        if (currentCount > lastNotificationCount) {
          console.log(`\n📊 Verificação: ${currentCount} notificações encontradas`)
          
          // Verificar duplicatas
          const grouped = currentNotifications.reduce((acc, notification) => {
            const key = `${notification.type}_${notification.title}`
            if (!acc[key]) {
              acc[key] = []
            }
            acc[key].push(notification)
            return acc
          }, {})

          const duplicates = Object.keys(grouped).filter(key => grouped[key].length > 1)
          
          if (duplicates.length > 0) {
            console.log('⚠️ DUPLICATAS DETECTADAS:')
            duplicates.forEach(key => {
              console.log(`   ${key}: ${grouped[key].length} notificações`)
            })
          }
        }
      } catch (error) {
        console.log('❌ Erro na verificação periódica:', error.message)
      }
    }, 30000)

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

monitorNotificationCreation()
