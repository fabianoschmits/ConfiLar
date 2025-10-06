const fetch = require('node-fetch')

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

async function createTables() {
  try {
    console.log('🚀 Criando tabelas de teste no Supabase...')
    
    // SQL para criar as tabelas
    const sql = `
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

      -- Índices para performance
      CREATE INDEX IF NOT EXISTS idx_test_history_created_at ON test_history(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_test_history_test_type ON test_history(test_type);
      CREATE INDEX IF NOT EXISTS idx_test_history_status ON test_history(status);
      CREATE INDEX IF NOT EXISTS idx_test_logs_test_id ON test_logs(test_id);
      CREATE INDEX IF NOT EXISTS idx_test_logs_level ON test_logs(level);
      CREATE INDEX IF NOT EXISTS idx_test_logs_timestamp ON test_logs(timestamp DESC);

      -- RLS (Row Level Security)
      ALTER TABLE test_history ENABLE ROW LEVEL SECURITY;
      ALTER TABLE test_logs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE test_configurations ENABLE ROW LEVEL SECURITY;

      -- Políticas de segurança (apenas admins podem acessar)
      CREATE POLICY "Admins can view test history" ON test_history
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type = 'admin'
          )
        );

      CREATE POLICY "Admins can insert test history" ON test_history
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type = 'admin'
          )
        );

      CREATE POLICY "Admins can view test logs" ON test_logs
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type = 'admin'
          )
        );

      CREATE POLICY "Admins can insert test logs" ON test_logs
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type = 'admin'
          )
        );

      CREATE POLICY "Admins can manage test configurations" ON test_configurations
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type = 'admin'
          )
        );
    `

    // Executar SQL usando a API REST do Supabase
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
      console.log('✅ Tabelas criadas com sucesso!')
      
      // Inserir dados iniciais
      await insertInitialData()
      
    } else {
      const error = await response.text()
      console.log('⚠️ Erro ao criar tabelas:', error)
      console.log('📝 Execute o SQL manualmente no Supabase Dashboard')
      console.log('🔗 Acesse: https://supabase.com/dashboard/project/oolqodaehouaidxuowtw/sql')
    }

  } catch (error) {
    console.error('💥 Erro ao criar tabelas:', error)
    console.log('📝 Execute o SQL manualmente no Supabase Dashboard')
    console.log('🔗 Acesse: https://supabase.com/dashboard/project/oolqodaehouaidxuowtw/sql')
  }
}

async function insertInitialData() {
  console.log('📝 Inserindo dados iniciais...')
  
  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
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
    console.log('⚠️ Erro ao inserir dados iniciais:', error.message)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createTables()
}

module.exports = { createTables }
