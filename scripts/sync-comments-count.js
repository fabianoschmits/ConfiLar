const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Carregar variáveis de ambiente
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const envVars = {}
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        envVars[key.trim()] = value
      }
    })
    Object.assign(process.env, envVars)
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  console.error('   Precisa de NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Usar service key para contornar RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function syncCommentsCount() {
  console.log('🔄 Sincronizando contadores de comentários...')
  
  try {
    // 1. Buscar todos os posts
    const { data: posts, error: postsError } = await supabase
      .from('feed_posts')
      .select('id, comments_count')
    
    if (postsError) {
      console.error('❌ Erro ao buscar posts:', postsError)
      return
    }
    
    console.log(`📊 Processando ${posts.length} posts...`)
    
    let updatedCount = 0
    
    // 2. Para cada post, contar comentários e atualizar se necessário
    for (const post of posts) {
      // Contar comentários não deletados
      const { count, error: countError } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact' })
        .eq('post_id', post.id)
        .eq('is_deleted', false)
      
      if (countError) {
        console.error(`❌ Erro ao contar comentários do post ${post.id}:`, countError)
        continue
      }
      
      const commentsCount = count || 0
      
      // Atualizar apenas se o contador estiver incorreto
      if (post.comments_count !== commentsCount) {
        const { error: updateError } = await supabase
          .from('feed_posts')
          .update({ comments_count: commentsCount })
          .eq('id', post.id)
        
        if (updateError) {
          console.error(`❌ Erro ao atualizar post ${post.id}:`, updateError)
        } else {
          console.log(`✅ Post ${post.id}: ${post.comments_count} → ${commentsCount}`)
          updatedCount++
        }
      }
    }
    
    console.log(`\n🎉 Sincronização concluída! ${updatedCount} posts atualizados.`)
    
    // 3. Verificar resultado final
    const { data: finalPosts, error: finalError } = await supabase
      .from('feed_posts')
      .select('id, comments_count')
      .order('comments_count', { ascending: false })
    
    if (finalError) {
      console.error('❌ Erro ao verificar resultado final:', finalError)
      return
    }
    
    console.log('\n📊 Status atual dos posts:')
    finalPosts.forEach(post => {
      console.log(`   Post ${post.id}: ${post.comments_count} comentários`)
    })
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  syncCommentsCount()
}

module.exports = { syncCommentsCount }
