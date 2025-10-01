const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deleteNotificationPosts() {
  console.log('🔍 Verificando posts de notificação no feed...')
  
  try {
    // Buscar posts que parecem ser notificações (com emojis típicos)
    const { data: posts, error } = await supabase
      .from('feed_posts')
      .select('*')
      .or('title.ilike.%❤️%,title.ilike.%💡%,title.ilike.%🎉%,title.ilike.%👋%,title.ilike.%💡%,title.ilike.%📝%')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.log('❌ Erro ao buscar posts:', error.message)
      return
    }
    
    console.log(`📋 Posts de notificação encontrados: ${posts.length}`)
    
    if (posts.length > 0) {
      console.log('\n📝 Lista de posts a serem deletados:')
      posts.forEach((post, index) => {
        console.log(`\n${index + 1}. ${post.title}`)
        console.log(`   ID: ${post.id}`)
        console.log(`   Criado: ${post.created_at}`)
        console.log(`   Profissional: ${post.professional_id}`)
      })
      
      console.log('\n🗑️ Deletando posts de notificação...')
      
      let deletedCount = 0
      for (const post of posts) {
        const { error: deleteError } = await supabase
          .from('feed_posts')
          .delete()
          .eq('id', post.id)
        
        if (deleteError) {
          console.log(`❌ Erro ao deletar post ${post.id}:`, deleteError.message)
        } else {
          console.log(`✅ Post deletado: ${post.title}`)
          deletedCount++
        }
      }
      
      console.log(`\n🎉 Limpeza concluída! ${deletedCount} posts deletados.`)
    } else {
      console.log('✅ Nenhum post de notificação encontrado')
    }
    
    // Verificar se ainda há posts no feed
    const { data: remainingPosts, error: remainingError } = await supabase
      .from('feed_posts')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (!remainingError && remainingPosts) {
      console.log(`\n📊 Posts restantes no feed: ${remainingPosts.length}`)
      if (remainingPosts.length > 0) {
        console.log('📝 Últimos posts:')
        remainingPosts.forEach((post, index) => {
          console.log(`  ${index + 1}. ${post.title} (${post.created_at})`)
        })
      }
    }
    
  } catch (err) {
    console.log('❌ Erro geral:', err.message)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  deleteNotificationPosts()
}

module.exports = { deleteNotificationPosts }
