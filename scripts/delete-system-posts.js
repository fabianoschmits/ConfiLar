const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deleteSystemPosts() {
  console.log('🔍 Verificando posts do sistema no feed...')
  
  try {
    // Buscar posts que são notificações do sistema
    const { data: posts, error } = await supabase
      .from('feed_posts')
      .select('*')
      .or('title.ilike.%Complete seu perfil%,title.ilike.%Primeiro acesso%,title.ilike.%Bem-vindo ao ConfiLar%,title.ilike.%Dica:%,title.ilike.%Responda mensagens%')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.log('❌ Erro ao buscar posts:', error.message)
      return
    }
    
    console.log(`📋 Posts do sistema encontrados: ${posts.length}`)
    
    if (posts.length > 0) {
      console.log('\n📝 Lista de posts do sistema a serem deletados:')
      posts.forEach((post, index) => {
        console.log(`\n${index + 1}. ${post.title}`)
        console.log(`   Descrição: ${post.description || 'Sem descrição'}`)
        console.log(`   ID: ${post.id}`)
        console.log(`   Criado: ${post.created_at}`)
        console.log(`   Profissional: ${post.professional_id}`)
      })
      
      console.log('\n🗑️ Deletando posts do sistema...')
      
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
      
      console.log(`\n🎉 Limpeza concluída! ${deletedCount} posts do sistema deletados.`)
    } else {
      console.log('✅ Nenhum post do sistema encontrado')
    }
    
    // Verificar posts restantes
    const { data: remainingPosts, error: remainingError } = await supabase
      .from('feed_posts')
      .select('id, title, description, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (!remainingError && remainingPosts) {
      console.log(`\n📊 Posts restantes no feed: ${remainingPosts.length}`)
      if (remainingPosts.length > 0) {
        console.log('📝 Posts restantes:')
        remainingPosts.forEach((post, index) => {
          console.log(`  ${index + 1}. ${post.title}`)
          if (post.description) {
            console.log(`     ${post.description}`)
          }
        })
      }
    }
    
  } catch (err) {
    console.log('❌ Erro geral:', err.message)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  deleteSystemPosts()
}

module.exports = { deleteSystemPosts }
