const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTables() {
  try {
    console.log('🚀 Tentando criar tabelas de teste no Supabase...')
    
    // Tentar inserir dados para criar as tabelas automaticamente
    console.log('📝 Tentando inserir dados de teste para criar tabelas...')
    
    // Testar se a tabela test_history existe
    const { data: testData, error: testError } = await supabase
      .from('test_history')
      .select('*')
      .limit(1)
    
    if (testError && testError.code === 'PGRST205') {
      console.log('❌ Tabela test_history não existe')
      console.log('📝 Você precisa criar as tabelas manualmente no Supabase Dashboard')
      console.log('🔗 Acesse: https://supabase.com/dashboard/project/oolqodaehouaidxuowtw/sql')
      console.log('📋 Execute o SQL do arquivo: scripts/create-test-tables.sql')
      return
    }
    
    if (testError) {
      console.log('⚠️ Erro ao verificar tabela:', testError.message)
      return
    }
    
    console.log('✅ Tabela test_history existe!')
    
    // Inserir dados de teste
    const { data, error } = await supabase
      .from('test_history')
      .insert({
        test_type: 'unit',
        suite_name: 'Teste Inicial',
        test_name: 'Verificação de Sistema',
        status: 'passed',
        duration: 1000,
        coverage_percentage: 85.5,
        total_tests: 1,
        passed_tests: 1,
        failed_tests: 0,
        skipped_tests: 0,
        browser: 'Chrome',
        environment: 'development',
        output: 'Sistema de testes funcionando corretamente'
      })
      .select()
    
    if (error) {
      console.log('⚠️ Erro ao inserir dados de teste:', error.message)
    } else {
      console.log('✅ Dados de teste inseridos com sucesso!')
      console.log('🎉 Sistema de testes está funcionando!')
    }
    
  } catch (error) {
    console.error('💥 Erro:', error.message)
    console.log('📝 Execute o SQL manualmente no Supabase Dashboard')
    console.log('🔗 Acesse: https://supabase.com/dashboard/project/oolqodaehouaidxuowtw/sql')
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createTables()
}

module.exports = { createTables }
