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

async function checkStructure() {
  console.log('🔍 Verificando estrutura da tabela feed_posts...')
  
  try {
    // 1. Buscar todos os posts com todos os campos
    const { data: posts, error: postsError } = await supabase
      .from('feed_posts')
      .select('*')
      .limit(2)
    
    if (postsError) {
      console.error('❌ Erro ao buscar posts:', postsError)
      return
    }
    
    console.log('📊 Estrutura dos posts:')
    posts.forEach((post, index) => {
      console.log(`\nPost ${index + 1}:`)
      Object.keys(post).forEach(key => {
        console.log(`  ${key}: ${post[key]} (tipo: ${typeof post[key]})`)
      })
    })
    
    // 2. Testar inserção de um novo post
    console.log('\n🧪 Testando inserção de post...')
    const testPost = {
      user_id: posts[0].user_id,
      content: 'Teste de contador',
      images: [],
      location_state: 'SP',
      location_city: 'São Paulo',
      likes_count: 0,
      comments_count: 3
    }
    
    const { data: newPost, error: insertError } = await supabase
      .from('feed_posts')
      .insert(testPost)
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Erro ao inserir post:', insertError)
    } else {
      console.log('✅ Post inserido com sucesso:', newPost)
      
      // Deletar o post de teste
      await supabase
        .from('feed_posts')
        .delete()
        .eq('id', newPost.id)
      
      console.log('🗑️ Post de teste removido')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkStructure()
