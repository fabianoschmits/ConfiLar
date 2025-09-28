const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config()

async function setupEvaluationRequests() {
  try {
    // Verificar variáveis de ambiente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Variáveis de ambiente do Supabase não encontradas')
      console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌')
      console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌')
      return
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    console.log('🔧 Configurando tabela de solicitações de avaliação...')

    // Ler o arquivo SQL
    const sql = fs.readFileSync('scripts/create-evaluation-requests-table.sql', 'utf8')
    
    // Executar o SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('❌ Erro ao executar SQL:', error)
      return
    }

    console.log('✅ Tabela de solicitações de avaliação criada com sucesso!')
    console.log('📊 Resultado:', data)

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

setupEvaluationRequests()
