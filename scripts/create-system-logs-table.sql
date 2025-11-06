-- =====================================================
-- TABELA DE LOGS DO SISTEMA
-- =====================================================
-- Esta tabela armazena logs importantes do sistema ConfiLar
-- Similar ao sistema de logs do Supabase, mas focado nas informações do nosso projeto

CREATE TABLE IF NOT EXISTS system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Tipo e Severidade
  level VARCHAR(20) NOT NULL CHECK (level IN ('INFO', 'WARNING', 'ERROR', 'SUCCESS', 'DEBUG')),
  category VARCHAR(50) NOT NULL, -- 'auth', 'posts', 'users', 'payments', 'api', etc.
  action VARCHAR(100) NOT NULL, -- 'user_signup', 'user_login', 'post_created', 'payment_processed', etc.
  
  -- Mensagem e Detalhes
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}', -- Informações adicionais como user_id, post_id, etc.
  
  -- Metadados
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  endpoint VARCHAR(255), -- Ex: '/api/auth/signup', '/feed', etc.
  status_code INTEGER, -- HTTP status code
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_action ON system_logs(action);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_endpoint ON system_logs(endpoint);

-- RLS (Row Level Security)
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem ver logs
CREATE POLICY "Admins can view system logs" ON system_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- Política: Sistema pode inserir logs (usando service role)
CREATE POLICY "Service role can insert logs" ON system_logs
  FOR INSERT WITH CHECK (true);

-- Função para inserir log (pode ser chamada de qualquer lugar)
CREATE OR REPLACE FUNCTION create_system_log(
  p_level VARCHAR(20),
  p_category VARCHAR(50),
  p_action VARCHAR(100),
  p_message TEXT,
  p_details JSONB DEFAULT '{}',
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_endpoint VARCHAR(255) DEFAULT NULL,
  p_status_code INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO system_logs (
    level,
    category,
    action,
    message,
    details,
    user_id,
    ip_address,
    user_agent,
    endpoint,
    status_code
  ) VALUES (
    p_level,
    p_category,
    p_action,
    p_message,
    p_details,
    p_user_id,
    p_ip_address,
    p_user_agent,
    p_endpoint,
    p_status_code
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON TABLE system_logs IS 'Tabela de logs do sistema ConfiLar - armazena eventos importantes da aplicação';
COMMENT ON COLUMN system_logs.level IS 'Nível do log: INFO, WARNING, ERROR, SUCCESS, DEBUG';
COMMENT ON COLUMN system_logs.category IS 'Categoria do log: auth, posts, users, payments, api, etc.';
COMMENT ON COLUMN system_logs.action IS 'Ação específica: user_signup, user_login, post_created, etc.';
COMMENT ON COLUMN system_logs.details IS 'JSON com detalhes adicionais da ação';
COMMENT ON FUNCTION create_system_log IS 'Função helper para criar logs do sistema';

