const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTables() {
  try {
    console.log('🔍 Verificando tabelas no banco de dados...')

    const tablesToCheck = [
      'feed_posts',
      'post_reactions', 
      'post_comments',
      'notifications',
      'profiles'
    ]

    const results = {}

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (error) {
          if (error.code === 'PGRST116') {
            results[tableName] = '❌ NÃO EXISTE'
          } else {
            results[tableName] = `⚠️ ERRO: ${error.message}`
          }
        } else {
          results[tableName] = '✅ EXISTE'
        }
      } catch (err) {
        results[tableName] = `❌ ERRO: ${err.message}`
      }
    }

    console.log('\n📊 RESULTADO DA VERIFICAÇÃO:')
    console.log('=' .repeat(50))
    
    Object.entries(results).forEach(([table, status]) => {
      console.log(`${table.padEnd(20)} ${status}`)
    })

    console.log('\n📋 PRÓXIMOS PASSOS:')
    
    const missingTables = Object.entries(results)
      .filter(([_, status]) => status.includes('❌'))
      .map(([table, _]) => table)

    if (missingTables.length > 0) {
      console.log('🔧 Tabelas que precisam ser criadas:')
      missingTables.forEach(table => console.log(`   - ${table}`))
      
      console.log('\n📝 SOLUÇÃO:')
      console.log('1. Acesse o Supabase Dashboard')
      console.log('2. Vá para SQL Editor')
      console.log('3. Execute o script: scripts/fix-tables-and-reactions.sql')
      console.log('4. Isso criará todas as tabelas necessárias')
    } else {
      console.log('✅ Todas as tabelas existem!')
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkTables()
}

module.exports = { checkTables }
