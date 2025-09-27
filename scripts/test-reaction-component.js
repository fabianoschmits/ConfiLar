const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testReactionComponent() {
  try {
    console.log('🔍 Testando componente de reações...')

    // Buscar um post que tem reações
    const { data: reactions, error: reactionsError } = await supabase
      .from('post_reactions')
      .select('post_id')
      .limit(1)

    if (reactionsError || !reactions || reactions.length === 0) {
      console.log('⚠️ Nenhuma reação encontrada. Adicione algumas reações na aplicação primeiro.')
      return
    }

    const postId = reactions[0].post_id
    console.log(`📋 Testando post: ${postId}`)

    // Simular a query que o hook useReactionUsers usa
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
      return
    }

    console.log(`✅ Query funcionou! Encontrados ${reactionUsers.length} usuários`)

    // Simular a lógica do componente
    const formatUserNames = () => {
      if (reactionUsers.length === 0) return ''
      
      const maxNames = 5
      const names = reactionUsers.slice(0, maxNames).map(user => user.profiles.name)
      const remaining = reactionUsers.length - maxNames
      
      if (remaining > 0) {
        return `${names.join(', ')} e mais ${remaining}`
      }
      
      return names.join(', ')
    }

    const formattedNames = formatUserNames()
    console.log(`📝 Nomes formatados: "${formattedNames}"`)

    // Simular a condição do componente
    const shouldShowNames = reactionUsers.length > 0
    console.log(`🔍 Deve mostrar nomes: ${shouldShowNames}`)

    if (shouldShowNames) {
      console.log('✅ O componente deve mostrar os nomes dos usuários')
      console.log(`📋 Texto que aparecerá: "Quem reagiu: ${formattedNames}"`)
    } else {
      console.log('❌ O componente não deve mostrar nomes (nenhum usuário encontrado)')
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testReactionComponent()
}

module.exports = { testReactionComponent }
