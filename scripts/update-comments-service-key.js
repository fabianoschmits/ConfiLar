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

async function updateCommentsWithServiceKey() {
  console.log('🔧 Atualizando contadores com service key...')
  
  try {
    // 1. Buscar todos os posts
    const { data: posts, error: postsError } = await supabase
      .from('feed_posts')
      .select('id, comments_count')
    
    if (postsError) {
      console.error('❌ Erro ao buscar posts:', postsError)
      return
    }
    
    console.log(`📊 Encontrados ${posts.length} posts`)
    
    // 2. Para cada post, contar comentários e atualizar
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
      console.log(`📝 Post ${post.id}: ${commentsCount} comentários (atual: ${post.comments_count})`)
      
      // Atualizar o contador
      if (post.comments_count !== commentsCount) {
        const { error: updateError } = await supabase
          .from('feed_posts')
          .update({ comments_count: commentsCount })
          .eq('id', post.id)
        
        if (updateError) {
          console.error(`❌ Erro ao atualizar post ${post.id}:`, updateError)
        } else {
          console.log(`✅ Post ${post.id} atualizado: ${post.comments_count} → ${commentsCount}`)
        }
      } else {
        console.log(`✅ Post ${post.id} já está correto: ${commentsCount}`)
      }
    }
    
    console.log('\n🎉 Contadores atualizados!')
    
    // 3. Verificar resultado final
    const { data: finalPosts, error: finalError } = await supabase
      .from('feed_posts')
      .select('id, comments_count')
      .order('comments_count', { ascending: false })
    
    if (finalError) {
      console.error('❌ Erro ao verificar resultado final:', finalError)
      return
    }
    
    console.log('\n📊 Resultado final:')
    finalPosts.forEach(post => {
      console.log(`   Post ${post.id}: ${post.comments_count} comentários`)
    })
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

updateCommentsWithServiceKey()
