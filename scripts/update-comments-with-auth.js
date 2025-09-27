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

async function updateCommentsWithAuth() {
  console.log('🔧 Atualizando contadores com autenticação...')
  
  try {
    // 1. Verificar se há usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('❌ Erro de autenticação:', authError)
      return
    }
    
    if (!user) {
      console.log('⚠️ Nenhum usuário autenticado. Tentando sem autenticação...')
    } else {
      console.log(`✅ Usuário autenticado: ${user.email}`)
    }
    
    // 2. Buscar todos os posts
    const { data: posts, error: postsError } = await supabase
      .from('feed_posts')
      .select('id, comments_count')
    
    if (postsError) {
      console.error('❌ Erro ao buscar posts:', postsError)
      return
    }
    
    console.log(`📊 Encontrados ${posts.length} posts`)
    
    // 3. Para cada post, contar comentários e atualizar
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
      
      // Tentar atualizar o contador
      if (post.comments_count !== commentsCount) {
        const { error: updateError } = await supabase
          .from('feed_posts')
          .update({ comments_count: commentsCount })
          .eq('id', post.id)
        
        if (updateError) {
          console.error(`❌ Erro ao atualizar post ${post.id}:`, updateError)
          
          // Tentar com RPC se disponível
          console.log(`🔄 Tentando com RPC para post ${post.id}...`)
          const { error: rpcError } = await supabase.rpc('update_post_comments_count', {
            post_id: post.id,
            new_count: commentsCount
          })
          
          if (rpcError) {
            console.error(`❌ Erro RPC para post ${post.id}:`, rpcError)
          } else {
            console.log(`✅ Post ${post.id} atualizado via RPC: ${commentsCount}`)
          }
        } else {
          console.log(`✅ Post ${post.id} atualizado: ${post.comments_count} → ${commentsCount}`)
        }
      } else {
        console.log(`✅ Post ${post.id} já está correto: ${commentsCount}`)
      }
    }
    
    console.log('\n🎉 Processo concluído!')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

updateCommentsWithAuth()
