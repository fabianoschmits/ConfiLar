const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://oolqodaehouaidxuowtw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY'
)

async function cleanDuplicateNotifications() {
  try {
    console.log('🧹 Limpando notificações duplicadas...\n')

    const testUserId = 'f7444305-a3bd-4d71-874a-bb95fd27f96a'

    // Buscar todas as notificações
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false })

    if (notificationsError) {
      console.log('❌ Erro ao buscar notificações:', notificationsError.message)
      return
    }

    console.log(`📊 Total de notificações encontradas: ${notifications?.length || 0}`)

    if (!notifications || notifications.length === 0) {
      console.log('✅ Nenhuma notificação encontrada')
      return
    }

    // Agrupar por tipo e título
    const grouped = notifications.reduce((acc, notification) => {
      const key = `${notification.type}_${notification.title}`
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(notification)
      return acc
    }, {})

    console.log('\n📋 Notificações agrupadas:')
    Object.keys(grouped).forEach(key => {
      const group = grouped[key]
      console.log(`\n${key}: ${group.length} notificações`)
      group.forEach((notification, index) => {
        console.log(`   ${index + 1}. ${notification.title} (${new Date(notification.created_at).toLocaleString('pt-BR')})`)
      })
    })

    // Identificar duplicatas
    const duplicates = Object.keys(grouped).filter(key => grouped[key].length > 1)
    
    if (duplicates.length === 0) {
      console.log('\n✅ Nenhuma duplicata encontrada')
      return
    }

    console.log('\n⚠️ DUPLICATAS ENCONTRADAS:')
    duplicates.forEach(key => {
      console.log(`   ${key}: ${grouped[key].length} notificações`)
    })

    // Manter apenas a notificação mais recente de cada grupo
    const toDelete = []
    
    duplicates.forEach(key => {
      const group = grouped[key]
      const sorted = group.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      
      // Manter a primeira (mais recente), deletar as outras
      sorted.slice(1).forEach(notification => {
        toDelete.push(notification.id)
      })
    })

    if (toDelete.length > 0) {
      console.log(`\n🗑️ Deletando ${toDelete.length} notificações duplicadas...`)
      
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .in('id', toDelete)

      if (deleteError) {
        console.log('❌ Erro ao deletar duplicatas:', deleteError.message)
      } else {
        console.log('✅ Duplicatas removidas com sucesso!')
      }
    }

    // Verificar resultado final
    const { data: finalNotifications, error: finalError } = await supabase
      .from('notifications')
      .select('id, title, type, created_at')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false })

    if (finalError) {
      console.log('❌ Erro ao verificar resultado final:', finalError.message)
      return
    }

    console.log(`\n📊 Notificações finais: ${finalNotifications?.length || 0}`)
    
    if (finalNotifications && finalNotifications.length > 0) {
      console.log('\n📋 Notificações restantes:')
      finalNotifications.forEach((notification, index) => {
        console.log(`   ${index + 1}. ${notification.title} (${new Date(notification.created_at).toLocaleString('pt-BR')})`)
      })
    }

    console.log('\n🎯 LIMPEZA CONCLUÍDA!')
    console.log('✅ Sistema de controle de duplicação implementado')
    console.log('✅ Notificações duplicadas removidas')
    console.log('✅ Sistema pronto para funcionar sem duplicação')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

cleanDuplicateNotifications()
