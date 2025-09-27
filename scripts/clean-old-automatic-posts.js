/**
 * Script para deletar posts automáticos antigos
 * Executa a limpeza via JavaScript
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function cleanOldAutomaticPosts() {
  try {
    console.log('🧹 Iniciando limpeza de posts automáticos antigos...')
    
    // 1. Verificar posts existentes
    console.log('\n📊 Verificando posts existentes...')
    const { data: existingPosts, error: checkError } = await supabase
      .from('feed_posts')
      .select('id, title, created_at, metadata')
      .or('metadata->>type.eq.favorite,metadata->>type.eq.recommendation,metadata->>type.eq.review,metadata->>type.eq.welcome')
      .order('created_at', { ascending: false })

    if (checkError) {
      console.error('❌ Erro ao verificar posts:', checkError)
      return
    }

    console.log(`📈 Encontrados ${existingPosts?.length || 0} posts automáticos antigos`)
    
    if (existingPosts && existingPosts.length > 0) {
      // Mostrar alguns exemplos
      console.log('\n📋 Exemplos de posts que serão deletados:')
      existingPosts.slice(0, 5).forEach((post, index) => {
        console.log(`${index + 1}. [${post.metadata?.type}] ${post.title} (${post.created_at})`)
      })
    }

    // 2. Deletar posts automáticos
    console.log('\n🗑️ Deletando posts automáticos...')
    const { error: deleteError } = await supabase
      .from('feed_posts')
      .delete()
      .or('metadata->>type.eq.favorite,metadata->>type.eq.recommendation,metadata->>type.eq.review,metadata->>type.eq.welcome')

    if (deleteError) {
      console.error('❌ Erro ao deletar posts:', deleteError)
      return
    }

    console.log('✅ Posts automáticos deletados com sucesso!')

    // 3. Verificar resultado
    console.log('\n🔍 Verificando resultado...')
    const { data: remainingPosts, error: finalCheckError } = await supabase
      .from('feed_posts')
      .select('id, metadata')
      .or('metadata->>type.eq.favorite,metadata->>type.eq.recommendation,metadata->>type.eq.review,metadata->>type.eq.welcome')

    if (finalCheckError) {
      console.error('❌ Erro ao verificar resultado:', finalCheckError)
      return
    }

    console.log(`📊 Posts automáticos restantes: ${remainingPosts?.length || 0}`)

    // 4. Verificar total de posts no feed
    const { count: totalPosts, error: countError } = await supabase
      .from('feed_posts')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Erro ao contar posts:', countError)
      return
    }

    console.log(`📈 Total de posts no feed: ${totalPosts}`)

    console.log('\n🎉 Limpeza concluída! Agora você pode testar o novo sistema.')
    console.log('💡 Para testar:')
    console.log('   1. Adicione alguém aos favoritos')
    console.log('   2. Recomende alguém')
    console.log('   3. Verifique se os posts aparecem no feed social')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar limpeza
cleanOldAutomaticPosts()
