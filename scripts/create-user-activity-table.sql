-- Criar tabela de atividade do usuário
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_online BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'away', 'offline', 'inactive')),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_last_seen ON user_activity(last_seen);
CREATE INDEX IF NOT EXISTS idx_user_activity_is_online ON user_activity(is_online);
CREATE INDEX IF NOT EXISTS idx_user_activity_status ON user_activity(status);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_user_activity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_activity_updated_at
  BEFORE UPDATE ON user_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_user_activity_updated_at();

-- Função para marcar usuários como offline após 24h
CREATE OR REPLACE FUNCTION mark_inactive_users_offline()
RETURNS void AS $$
BEGIN
  UPDATE user_activity 
  SET 
    is_online = false,
    status = CASE 
      WHEN last_activity < NOW() - INTERVAL '7 days' THEN 'inactive'
      WHEN last_activity < NOW() - INTERVAL '1 day' THEN 'offline'
      ELSE 'away'
    END
  WHERE 
    is_online = true 
    AND last_activity < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Criar job para executar a função periodicamente (opcional)
-- Você pode configurar isso no Supabase Dashboard > Database > Functions
-- ou usar um cron job externo

-- Inserir dados iniciais para usuários existentes (opcional)
INSERT INTO user_activity (user_id, last_seen, is_online, status, last_activity)
SELECT 
  id,
  NOW(),
  true,
  'online',
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_activity)
ON CONFLICT (user_id) DO NOTHING;

-- Comentários sobre a tabela
COMMENT ON TABLE user_activity IS 'Tabela para rastrear atividade e status de conectividade dos usuários';
COMMENT ON COLUMN user_activity.user_id IS 'ID do usuário';
COMMENT ON COLUMN user_activity.last_seen IS 'Última vez que o usuário foi visto online';
COMMENT ON COLUMN user_activity.is_online IS 'Se o usuário está atualmente online';
COMMENT ON COLUMN user_activity.status IS 'Status do usuário: online, away, offline, inactive';
COMMENT ON COLUMN user_activity.last_activity IS 'Última atividade registrada do usuário';
