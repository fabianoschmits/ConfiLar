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

-- Habilitar RLS
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view their own activity" ON user_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity" ON user_activity
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity" ON user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Inserir dados iniciais para usuários existentes
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
