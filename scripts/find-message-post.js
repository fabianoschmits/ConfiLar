const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://oolqodaehouaidxuowtw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY'
)

async function findMessagePost() {
  try {
    console.log('🔍 Procurando post com "teste de notificações"...\n')

    // Buscar post com o conteúdo "teste de notificações"
    const { data, error } = await supabase
      .from('feed_posts')
      .select('*')
      .or('title.ilike.%teste de notificações%,description.ilike.%teste de notificações%')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro:', error.message)
      return
    }

    if (data.length === 0) {
      console.log('✅ Nenhum post encontrado com "teste de notificações"')
      console.log('❓ A mensagem pode ter sido deletada ou não está mais visível no feed\n')
      
      // Buscar todos os posts recentes
      const { data: recentPosts, error: recentError } = await supabase
        .from('feed_posts')
        .select('id, title, description, metadata, created_at')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (!recentError && recentPosts) {
        console.log('📋 Últimos 10 posts no feed:')
        recentPosts.forEach((post, index) => {
          console.log(`\n${index + 1}. ${post.title}`)
          console.log(`   Descrição: ${post.description?.substring(0, 80)}...`)
          console.log(`   Tipo: ${post.metadata?.type || 'não definido'}`)
          console.log(`   Criado em: ${new Date(post.created_at).toLocaleString('pt-BR')}`)
        })
      }
    } else {
      console.log(`🚨 Encontrados ${data.length} post(s) com "teste de notificações":\n`)
      
      data.forEach((post, index) => {
        console.log(`${index + 1}. ID: ${post.id}`)
        console.log(`   Título: ${post.title}`)
        console.log(`   Descrição: ${post.description}`)
        console.log(`   Tipo: ${post.metadata?.type || 'não definido'}`)
        console.log(`   Metadata:`, JSON.stringify(post.metadata, null, 2))
        console.log(`   Criado em: ${new Date(post.created_at).toLocaleString('pt-BR')}\n`)
      })
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

findMessagePost()

