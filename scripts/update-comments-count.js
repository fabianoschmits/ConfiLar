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
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateCommentsCount() {
  console.log('🔧 Atualizando contadores de comentários...')
  
  try {
    // 1. Buscar todos os posts
    const { data: posts, error: postsError } = await supabase
      .from('feed_posts')
      .select('id')
    
    if (postsError) {
      console.error('❌ Erro ao buscar posts:', postsError)
      return
    }
    
    console.log(`📊 Encontrados ${posts.length} posts`)
    
    // 2. Para cada post, contar comentários não deletados
    for (const post of posts) {
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
      
      // 3. Atualizar o contador no post
      const { error: updateError } = await supabase
        .from('feed_posts')
        .update({ comments_count: commentsCount })
        .eq('id', post.id)
      
      if (updateError) {
        console.error(`❌ Erro ao atualizar post ${post.id}:`, updateError)
        continue
      }
      
      console.log(`✅ Post ${post.id}: ${commentsCount} comentários`)
    }
    
    console.log('\n🎉 Contadores de comentários atualizados com sucesso!')
    
    // 4. Verificar resultado
    const { data: updatedPosts, error: verifyError } = await supabase
      .from('feed_posts')
      .select('id, comments_count')
      .order('comments_count', { ascending: false })
      .limit(5)
    
    if (verifyError) {
      console.error('❌ Erro ao verificar resultado:', verifyError)
      return
    }
    
    console.log('\n📊 Resultado final:')
    updatedPosts.forEach(post => {
      console.log(`   Post ${post.id}: ${post.comments_count} comentários`)
    })
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

updateCommentsCount()
