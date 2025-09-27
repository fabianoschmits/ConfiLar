const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testReactionUsers() {
  try {
    console.log('🔍 Testando busca de usuários que reagiram...')

    // Primeiro, vamos ver quais posts têm reações
    const { data: reactions, error: reactionsError } = await supabase
      .from('post_reactions')
      .select('post_id, reaction_type, user_id')
      .limit(10)

    if (reactionsError) {
      console.error('❌ Erro ao buscar reações:', reactionsError.message)
      return
    }

    console.log(`📊 Encontradas ${reactions.length} reações:`)
    reactions.forEach((reaction, index) => {
      console.log(`   ${index + 1}. Post: ${reaction.post_id}, Tipo: ${reaction.reaction_type}, User: ${reaction.user_id}`)
    })

    if (reactions.length === 0) {
      console.log('⚠️ Nenhuma reação encontrada. Adicione algumas reações na aplicação primeiro.')
      return
    }

    // Testar a query que o hook useReactionUsers usa
    const postId = reactions[0].post_id
    console.log(`\n🧪 Testando query para post: ${postId}`)

    const { data: reactionUsers, error: usersError } = await supabase
      .from('post_reactions')
      .select(`
        id,
        reaction_type,
        created_at,
        profiles!inner(
          id,
          name
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false })

    if (usersError) {
      console.log('❌ Erro na query:', usersError.message)
      console.log('🔍 Código:', usersError.code)
    } else {
      console.log('✅ Query funcionou!')
      console.log(`📊 Usuários que reagiram: ${reactionUsers.length}`)
      
      reactionUsers.forEach((reaction, index) => {
        console.log(`   ${index + 1}. ${reaction.profiles.name} - ${reaction.reaction_type}`)
      })

      // Testar formatação dos nomes
      if (reactionUsers.length > 0) {
        const maxNames = 5
        const names = reactionUsers.slice(0, maxNames).map(user => user.profiles.name)
        const remaining = reactionUsers.length - maxNames
        
        let formattedNames
        if (remaining > 0) {
          formattedNames = `${names.join(', ')} e mais ${remaining}`
        } else {
          formattedNames = names.join(', ')
        }
        
        console.log(`\n📝 Nomes formatados: "${formattedNames}"`)
      }
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testReactionUsers()
}

module.exports = { testReactionUsers }
