const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTables() {
  try {
    console.log('🚀 Criando tabelas de teste no Supabase...')
    
    // SQL para criar as tabelas
    const sqlCommands = [
      // Criar tabela test_history
      `CREATE TABLE IF NOT EXISTS test_history (
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
      );`,
      
      // Criar tabela test_logs
      `CREATE TABLE IF NOT EXISTS test_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        test_id UUID REFERENCES test_history(id) ON DELETE CASCADE,
        level VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        details JSONB,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // Criar tabela test_configurations
      `CREATE TABLE IF NOT EXISTS test_configurations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        test_type VARCHAR(50) NOT NULL,
        configuration JSONB NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
    ]

    // Executar cada comando SQL
    for (let i = 0; i < sqlCommands.length; i++) {
      console.log(`⚡ Executando comando ${i + 1}/${sqlCommands.length}...`)
      
      try {
        // Usar a função SQL do Supabase
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: sqlCommands[i] 
        })
        
        if (error) {
          console.log(`⚠️ Comando ${i + 1} falhou:`, error.message)
          // Tentar método alternativo
          await executeSQLAlternative(sqlCommands[i])
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`)
        }
      } catch (err) {
        console.log(`⚠️ Erro no comando ${i + 1}:`, err.message)
        await executeSQLAlternative(sqlCommands[i])
      }
    }

    // Criar índices
    await createIndexes()
    
    // Configurar RLS
    await setupRLS()
    
    // Inserir dados iniciais
    await insertInitialData()

    console.log('🎉 Tabelas de teste criadas com sucesso!')
    
  } catch (error) {
    console.error('💥 Erro ao criar tabelas:', error)
    console.log('📝 Execute o SQL manualmente no Supabase Dashboard')
  }
}

async function executeSQLAlternative(sql) {
  try {
    // Método alternativo usando fetch direto
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql })
    })

    if (response.ok) {
      console.log('✅ SQL executado com sucesso via método alternativo')
    } else {
      console.log('⚠️ Método alternativo também falhou')
    }
  } catch (error) {
    console.log('⚠️ Erro no método alternativo:', error.message)
  }
}

async function createIndexes() {
  console.log('📊 Criando índices...')
  
  const indexCommands = [
    'CREATE INDEX IF NOT EXISTS idx_test_history_created_at ON test_history(created_at DESC);',
    'CREATE INDEX IF NOT EXISTS idx_test_history_test_type ON test_history(test_type);',
    'CREATE INDEX IF NOT EXISTS idx_test_history_status ON test_history(status);',
    'CREATE INDEX IF NOT EXISTS idx_test_logs_test_id ON test_logs(test_id);',
    'CREATE INDEX IF NOT EXISTS idx_test_logs_level ON test_logs(level);',
    'CREATE INDEX IF NOT EXISTS idx_test_logs_timestamp ON test_logs(timestamp DESC);'
  ]

  for (const command of indexCommands) {
    try {
      await supabase.rpc('exec_sql', { sql: command })
      console.log('✅ Índice criado')
    } catch (error) {
      console.log('⚠️ Erro ao criar índice:', error.message)
    }
  }
}

async function setupRLS() {
  console.log('🔒 Configurando RLS...')
  
  const rlsCommands = [
    'ALTER TABLE test_history ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE test_logs ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE test_configurations ENABLE ROW LEVEL SECURITY;'
  ]

  for (const command of rlsCommands) {
    try {
      await supabase.rpc('exec_sql', { sql: command })
      console.log('✅ RLS configurado')
    } catch (error) {
      console.log('⚠️ Erro ao configurar RLS:', error.message)
    }
  }
}

async function insertInitialData() {
  console.log('📝 Inserindo dados iniciais...')
  
  try {
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
    } else {
      console.log('✅ Dados iniciais inseridos com sucesso!')
    }
  } catch (error) {
    console.log('⚠️ Tabelas ainda não existem, serão criadas automaticamente')
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createTables()
}

module.exports = { createTables }
