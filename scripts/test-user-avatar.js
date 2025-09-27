const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Carregar variáveis de ambiente do arquivo .env
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
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  console.error('   Verifique se o arquivo .env existe e contém NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

console.log('🔧 Configuração do Supabase:')
console.log(`   URL: ${supabaseUrl}`)
console.log(`   Key: ${supabaseKey.substring(0, 20)}...`)
console.log('')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testUserAvatar() {
  console.log('🔍 Testando carregamento de avatar do usuário...\n')

  try {
    // Testar query dos posts com dados do usuário
    const { data: posts, error: postsError } = await supabase
      .from('feed_posts')
      .select(`
        id,
        professional_id,
        title,
        description,
        images,
        location_state,
        location_city,
        likes_count,
        comments_count,
        created_at,
        professional:profiles!feed_posts_professional_id_fkey(
          id,
          full_name,
          avatar_url,
          user_type
        )
      `)
      .order('created_at', { ascending: false })
      .limit(3)

    if (postsError) {
      console.error('❌ Erro ao buscar posts:', postsError)
      return
    }

    console.log(`✅ Encontrados ${posts.length} posts\n`)

    posts.forEach((post, index) => {
      console.log(`📝 Post ${index + 1}:`)
      console.log(`   ID: ${post.id}`)
      console.log(`   Título: ${post.title}`)
      console.log(`   Professional ID: ${post.professional_id}`)
      console.log(`   Professional Data:`, post.professional)
      
      if (post.professional) {
        console.log(`   ✅ Nome: ${post.professional.full_name}`)
        console.log(`   ✅ Avatar: ${post.professional.avatar_url || 'Nenhum'}`)
        console.log(`   ✅ Tipo: ${post.professional.user_type}`)
      } else {
        console.log(`   ❌ Dados do profissional não encontrados`)
      }
      console.log('')
    })

    // Testar query direta da tabela profiles
    console.log('🔍 Testando tabela profiles...\n')
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, user_type')
      .limit(3)

    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError)
    } else {
      console.log(`✅ Encontrados ${profiles.length} profiles\n`)
      
      profiles.forEach((profile, index) => {
        console.log(`👤 Profile ${index + 1}:`)
        console.log(`   ID: ${profile.id}`)
        console.log(`   Nome: ${profile.full_name}`)
        console.log(`   Avatar: ${profile.avatar_url || 'Nenhum'}`)
        console.log(`   Tipo: ${profile.user_type}`)
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testUserAvatar()
