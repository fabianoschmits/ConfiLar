const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyFixTables() {
  try {
    console.log('🔧 Aplicando correções nas tabelas...')

    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'fix-tables-and-reactions.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    // Executar o SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent })

    if (error) {
      console.error('❌ Erro ao executar SQL:', error)
      return
    }

    console.log('✅ Correções aplicadas com sucesso!')
    console.log('📊 Resultado:', data)

    // Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['feed_posts', 'post_reactions', 'post_comments', 'notifications'])

    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError)
      return
    }

    console.log('📋 Tabelas encontradas:')
    tables.forEach(table => {
      console.log(`   ✅ ${table.table_name}`)
    })

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  applyFixTables()
}

module.exports = { applyFixTables }
