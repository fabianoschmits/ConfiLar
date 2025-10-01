const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://oolqodaehouaidxuowtw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY'
)

async function removeDuplicateNotifications() {
  try {
    console.log('🧹 Removendo notificações duplicadas...\n')

    const testUserId = 'f7444305-a3bd-4d71-874a-bb95fd27f96a'

    // Buscar todas as notificações
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('id, title, message, type, created_at')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar notificações:', error.message)
      return
    }

    console.log(`📊 Total de notificações encontradas: ${notifications.length}`)

    if (notifications.length === 0) {
      console.log('✅ Nenhuma notificação encontrada')
      return
    }

    // Agrupar por título e mensagem
    const grouped = {}
    notifications.forEach(notification => {
      const key = `${notification.title}|${notification.message}`
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(notification)
    })

    // Encontrar duplicatas
    const duplicates = Object.entries(grouped).filter(([key, notifications]) => notifications.length > 1)

    if (duplicates.length === 0) {
      console.log('✅ Nenhuma duplicata encontrada')
      return
    }

    console.log(`🚨 Encontradas ${duplicates.length} grupos de duplicatas\n`)

    let totalRemoved = 0

    // Remover duplicatas (manter apenas a mais recente)
    for (const [key, notifications] of duplicates) {
      const [title, message] = key.split('|')
      console.log(`🧹 Processando: "${title}"`)
      console.log(`   Total: ${notifications.length} notificações`)
      
      // Ordenar por data de criação (mais recente primeiro)
      const sorted = notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      // Manter apenas a primeira (mais recente) e remover as outras
      const toRemove = sorted.slice(1)
      
      console.log(`   Mantendo: ${sorted[0].id} (${new Date(sorted[0].created_at).toLocaleString('pt-BR')})`)
      console.log(`   Removendo: ${toRemove.length} duplicatas`)
      
      for (const notification of toRemove) {
        const { error: deleteError } = await supabase
          .from('notifications')
          .delete()
          .eq('id', notification.id)
        
        if (deleteError) {
          console.error(`   ❌ Erro ao remover ${notification.id}:`, deleteError.message)
        } else {
          console.log(`   ✅ Removido: ${notification.id}`)
          totalRemoved++
        }
      }
      
      console.log('')
    }

    console.log(`✅ Limpeza concluída! ${totalRemoved} notificações duplicadas removidas`)

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

removeDuplicateNotifications()
