/**
 * Script para criar posts de boas-vindas para usuários que não têm
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createWelcomePost(userId, userName, userType, userData) {
  try {
    console.log(`🎉 Criando post de boas-vindas para: ${userName}`)
    
    const message = `🎉 ${userName} se juntou à comunidade`
    
    const { data, error } = await supabase
      .from('feed_posts')
      .insert({
        professional_id: userId,
        user_id: userId,
        title: `🎉 ${userName} se juntou à comunidade`,
        description: message,
        content: message,
        images: [],
        location_state: userData?.location_state || 'SP',
        location_city: userData?.location_city || 'São Paulo',
        likes_count: 0,
        comments_count: 0,
        is_active: true,
        is_public: true,
        is_featured: false,
        tags: ['sistema', 'boas-vindas'],
        metadata: { 
          type: 'welcome', 
          user: userName,
          user_type: userData?.user_type || userType,
          location_city: userData?.location_city,
          location_state: userData?.location_state,
          bio: userData?.bio,
          avatar_url: userData?.avatar_url
        }
      })
      .select()
      .single()

    if (error) throw error
    
    console.log(`✅ Post de boas-vindas criado: ${data.id}`)
    return { success: true, data }
  } catch (error) {
    console.error(`❌ Erro ao criar post de boas-vindas para ${userName}:`, error)
    return { success: false, error }
  }
}

async function createMissingWelcomePosts() {
  console.log('🔍 Procurando usuários sem posts de boas-vindas...')
  
  try {
    // Buscar todos os usuários
    const { data: allUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, user_type, location_city, location_state, bio, avatar_url')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError)
      return
    }

    console.log(`📊 Total de usuários encontrados: ${allUsers?.length || 0}`)

    let createdCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const user of allUsers || []) {
      // Verificar se já tem post de boas-vindas
      const { data: existingPost, error: checkError } = await supabase
        .from('feed_posts')
        .select('id')
        .eq('user_id', user.id)
        .eq('metadata->>type', 'welcome')
        .single()

      if (checkError && checkError.code === 'PGRST116') {
        // Não existe post de boas-vindas, criar
        console.log(`\n📝 Criando post para: ${user.full_name}`)
        const result = await createWelcomePost(user.id, user.full_name, user.user_type, user)
        
        if (result.success) {
          createdCount++
        } else {
          errorCount++
        }
      } else if (existingPost) {
        console.log(`⏭️ Pulando ${user.full_name} - já tem post de boas-vindas`)
        skippedCount++
      } else {
        console.log(`⚠️ Erro ao verificar ${user.full_name}:`, checkError)
        errorCount++
      }
    }

    console.log('\n📊 Resumo:')
    console.log(`✅ Posts criados: ${createdCount}`)
    console.log(`⏭️ Posts pulados: ${skippedCount}`)
    console.log(`❌ Erros: ${errorCount}`)

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar
createMissingWelcomePosts().then(() => {
  console.log('\n✅ Processo concluído!')
  process.exit(0)
}).catch(error => {
  console.error('❌ Erro no processo:', error)
  process.exit(1)
})
