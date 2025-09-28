const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function testTableExists() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Variáveis de ambiente não encontradas')
      return
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    console.log('🔍 Verificando se a tabela evaluation_requests existe...')

    // Tentar acessar a tabela
    const { data, error } = await supabase
      .from('evaluation_requests')
      .select('id')
      .limit(1)

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Tabela evaluation_requests não existe')
        console.log('💡 Execute os comandos SQL do arquivo SETUP_EVALUATION_TABLE.md no Supabase Dashboard')
      } else {
        console.error('❌ Erro ao acessar tabela:', error.message)
      }
    } else {
      console.log('✅ Tabela evaluation_requests existe e está funcionando!')
      console.log('📊 Registros encontrados:', data?.length || 0)
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testTableExists()
