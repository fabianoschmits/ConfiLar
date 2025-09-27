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
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixUserAvatars() {
  console.log('🔧 Corrigindo avatares dos usuários...\n')

  try {
    // Buscar usuários sem avatar
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .is('avatar_url', null)

    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError)
      return
    }

    console.log(`📋 Encontrados ${profiles.length} usuários sem avatar\n`)

    if (profiles.length === 0) {
      console.log('✅ Todos os usuários já têm avatar!')
      return
    }

    // Atualizar avatares usando DiceBear API
    for (const profile of profiles) {
      const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(profile.full_name)}&backgroundColor=transparent&size=100&facialHairProbability=30`
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', profile.id)

      if (updateError) {
        console.error(`❌ Erro ao atualizar avatar de ${profile.full_name}:`, updateError)
      } else {
        console.log(`✅ Avatar atualizado para: ${profile.full_name}`)
      }
    }

    console.log('\n🎉 Correção de avatares concluída!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

fixUserAvatars()
