-- Tabela para histórico de testes
CREATE TABLE IF NOT EXISTS test_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_type VARCHAR(50) NOT NULL, -- 'unit', 'integration', 'e2e'
  suite_name VARCHAR(100) NOT NULL,
  test_name VARCHAR(200) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'passed', 'failed', 'running', 'skipped'
  duration INTEGER, -- em milissegundos
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
  level VARCHAR(20) NOT NULL, -- 'info', 'warn', 'error', 'debug'
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
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can insert test history" ON test_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can view test logs" ON test_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can insert test logs" ON test_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can manage test configurations" ON test_configurations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_test_history_updated_at 
  BEFORE UPDATE ON test_history 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_configurations_updated_at 
  BEFORE UPDATE ON test_configurations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir configurações padrão de teste
INSERT INTO test_configurations (name, test_type, configuration) VALUES
('Jest Unit Tests', 'unit', '{"timeout": 30000, "coverage": true, "watch": false}'),
('Jest Integration Tests', 'integration', '{"timeout": 60000, "coverage": true, "watch": false}'),
('Playwright E2E Tests', 'e2e', '{"timeout": 300000, "browsers": ["chromium", "firefox", "webkit"], "headless": true}')
ON CONFLICT (name) DO NOTHING;
