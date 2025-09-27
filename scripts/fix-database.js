const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixDatabase() {
  try {
    console.log('🔧 Corrigindo banco de dados...')

    // 1. Atualizar tipos de reação
    console.log('📝 Atualizando tipos de reação...')
    
    // Primeiro, vamos verificar se a tabela post_reactions existe
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'post_reactions')

    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError)
      return
    }

    if (tables.length === 0) {
      console.log('⚠️ Tabela post_reactions não encontrada. Criando...')
      
      // Criar tabela post_reactions
      const { error: createError } = await supabase
        .from('post_reactions')
        .select('*')
        .limit(1)

      if (createError && createError.code === 'PGRST116') {
        console.log('📋 Tabela post_reactions precisa ser criada via SQL Editor no Supabase')
        console.log('🔗 Acesse: https://supabase.com/dashboard/project/[seu-projeto]/sql')
        console.log('📄 Execute o script: scripts/fix-tables-and-reactions.sql')
      }
    }

    // 2. Verificar tabela feed_posts
    console.log('📝 Verificando tabela feed_posts...')
    
    const { data: feedPosts, error: feedPostsError } = await supabase
      .from('feed_posts')
      .select('*')
      .limit(1)

    if (feedPostsError && feedPostsError.code === 'PGRST116') {
      console.log('⚠️ Tabela feed_posts não encontrada')
      console.log('📋 Execute o script SQL no Supabase Dashboard')
    } else {
      console.log('✅ Tabela feed_posts encontrada')
    }

    // 3. Verificar tabela notifications
    console.log('📝 Verificando tabela notifications...')
    
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1)

    if (notificationsError && notificationsError.code === 'PGRST116') {
      console.log('⚠️ Tabela notifications não encontrada')
      console.log('📋 Execute o script SQL no Supabase Dashboard')
    } else {
      console.log('✅ Tabela notifications encontrada')
    }

    console.log('\n📋 RESUMO:')
    console.log('1. Acesse o Supabase Dashboard')
    console.log('2. Vá para SQL Editor')
    console.log('3. Execute o script: scripts/fix-tables-and-reactions.sql')
    console.log('4. Isso criará/corrigirá todas as tabelas necessárias')

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixDatabase()
}

module.exports = { fixDatabase }
