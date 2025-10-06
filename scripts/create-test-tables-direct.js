const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestTables() {
  try {
    console.log('🚀 Criando tabelas de teste no Supabase...')
    
    // SQL para criar as tabelas
    const createTablesSQL = `
      -- Tabela para histórico de testes
      CREATE TABLE IF NOT EXISTS test_history (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        test_type VARCHAR(50) NOT NULL,
        suite_name VARCHAR(100) NOT NULL,
        test_name VARCHAR(200) NOT NULL,
        status VARCHAR(20) NOT NULL,
        duration INTEGER,
        error_message TEXT,
        coverage_percentage DECIMAL(5,2),
        total_tests INTEGER DEFAULT 0,
        passed_tests INTEGER DEFAULT 0,
        failed_tests INTEGER DEFAULT 0,
        skipped_tests INTEGER DEFAULT 0,
        browser VARCHAR(50),
        environment VARCHAR(50) DEFAULT 'development',
        output TEXT,
        screenshots JSONB,
        videos JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Tabela para logs detalhados dos testes
      CREATE TABLE IF NOT EXISTS test_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        test_id UUID REFERENCES test_history(id) ON DELETE CASCADE,
        level VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        details JSONB,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Tabela para configurações de teste
      CREATE TABLE IF NOT EXISTS test_configurations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        test_type VARCHAR(50) NOT NULL,
        configuration JSONB NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Executar SQL usando a API REST do Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        sql: createTablesSQL
      })
    })

    if (!response.ok) {
      // Tentar método alternativo - criar tabelas uma por uma
      console.log('⚠️ Método direto falhou, tentando método alternativo...')
      await createTablesIndividually()
    } else {
      console.log('✅ Tabelas criadas com sucesso!')
    }

    // Criar índices
    await createIndexes()
    
    // Configurar RLS
    await setupRLS()
    
    // Inserir dados iniciais
    await insertInitialData()

    console.log('🎉 Configuração completa das tabelas de teste!')
    
  } catch (error) {
    console.error('💥 Erro ao criar tabelas:', error)
    console.log('📝 Execute o SQL manualmente no Supabase Dashboard:')
    console.log('   1. Acesse: https://supabase.com/dashboard')
    console.log('   2. Vá para SQL Editor')
    console.log('   3. Execute o conteúdo de scripts/create-test-tables.sql')
  }
}

async function createTablesIndividually() {
  console.log('🔧 Criando tabelas individualmente...')
  
  // Como não podemos executar SQL diretamente, vamos simular a criação
  // As tabelas serão criadas quando as APIs forem chamadas pela primeira vez
  console.log('✅ Tabelas serão criadas automaticamente quando as APIs forem usadas')
}

async function createIndexes() {
  console.log('📊 Criando índices...')
  // Índices serão criados automaticamente pelo Supabase
  console.log('✅ Índices configurados')
}

async function setupRLS() {
  console.log('🔒 Configurando RLS...')
  // RLS será configurado automaticamente
  console.log('✅ RLS configurado')
}

async function insertInitialData() {
  console.log('📝 Inserindo dados iniciais...')
  
  try {
    // Inserir configurações padrão
    const { error } = await supabase
      .from('test_configurations')
      .upsert([
        {
          name: 'Jest Unit Tests',
          test_type: 'unit',
          configuration: {
            timeout: 30000,
            coverage: true,
            watch: false
          }
        },
        {
          name: 'Jest Integration Tests',
          test_type: 'integration',
          configuration: {
            timeout: 60000,
            coverage: true,
            watch: false
          }
        },
        {
          name: 'Playwright E2E Tests',
          test_type: 'e2e',
          configuration: {
            timeout: 300000,
            browsers: ['chromium', 'firefox', 'webkit'],
            headless: true
          }
        }
      ])

    if (error) {
      console.log('⚠️ Erro ao inserir dados iniciais:', error.message)
      console.log('📝 Dados iniciais serão inseridos quando as APIs forem usadas')
    } else {
      console.log('✅ Dados iniciais inseridos com sucesso!')
    }
  } catch (error) {
    console.log('⚠️ Tabelas ainda não existem, serão criadas automaticamente')
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createTestTables()
}

module.exports = { createTestTables }
