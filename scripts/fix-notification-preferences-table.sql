-- =====================================================
-- CORRIGIR TABELA NOTIFICATION_PREFERENCES
-- ConfiLar - Sistema de Notificações
-- =====================================================

-- Verificar se a tabela existe, se não, criar
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  message_notifications BOOLEAN DEFAULT TRUE,
  referral_notifications BOOLEAN DEFAULT TRUE,
  system_notifications BOOLEAN DEFAULT TRUE,
  marketing_notifications BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Colunas de som
  sound_enabled BOOLEAN DEFAULT TRUE,
  sound_volume NUMERIC(3,2) DEFAULT 0.70 CHECK (sound_volume >= 0 AND sound_volume <= 1),
  respect_quiet_hours BOOLEAN DEFAULT TRUE,
  custom_sounds JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  UNIQUE(user_id)
);

-- Adicionar colunas de som se não existirem
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS sound_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS sound_volume NUMERIC(3,2) DEFAULT 0.70 CHECK (sound_volume >= 0 AND sound_volume <= 1),
ADD COLUMN IF NOT EXISTS respect_quiet_hours BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS custom_sounds JSONB DEFAULT '{}'::jsonb;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id 
ON notification_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_sound_enabled 
ON notification_preferences(sound_enabled);

-- Atualizar registros existentes com valores padrão
UPDATE notification_preferences
SET 
  sound_enabled = COALESCE(sound_enabled, TRUE),
  sound_volume = COALESCE(sound_volume, 0.70),
  respect_quiet_hours = COALESCE(respect_quiet_hours, TRUE),
  custom_sounds = COALESCE(custom_sounds, '{}'::jsonb)
WHERE sound_enabled IS NULL OR sound_volume IS NULL;

-- Comentários nas colunas
COMMENT ON TABLE notification_preferences IS 'Preferências de notificação dos usuários';
COMMENT ON COLUMN notification_preferences.user_id IS 'ID do usuário';
COMMENT ON COLUMN notification_preferences.sound_enabled IS 'Master switch para ativar/desativar todos os sons de notificações';
COMMENT ON COLUMN notification_preferences.sound_volume IS 'Volume global dos sons de notificações (0.0 a 1.0)';
COMMENT ON COLUMN notification_preferences.respect_quiet_hours IS 'Se TRUE, não toca sons durante o horário silencioso configurado';
COMMENT ON COLUMN notification_preferences.custom_sounds IS 'Mapeamento JSON de tipo de notificação para caminho de som customizado';

-- =====================================================
-- FUNÇÃO PARA VALIDAR VOLUME
-- =====================================================

CREATE OR REPLACE FUNCTION validate_sound_volume()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sound_volume < 0 OR NEW.sound_volume > 1 THEN
    RAISE EXCEPTION 'Volume deve estar entre 0.0 e 1.0';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validar volume
DROP TRIGGER IF EXISTS trigger_validate_sound_volume ON notification_preferences;
CREATE TRIGGER trigger_validate_sound_volume
  BEFORE INSERT OR UPDATE OF sound_volume
  ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION validate_sound_volume();

-- =====================================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias preferências
DROP POLICY IF EXISTS "Users can view own notification preferences" ON notification_preferences;
CREATE POLICY "Users can view own notification preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários atualizarem suas próprias preferências
DROP POLICY IF EXISTS "Users can update own notification preferences" ON notification_preferences;
CREATE POLICY "Users can update own notification preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários inserirem suas próprias preferências
DROP POLICY IF EXISTS "Users can insert own notification preferences" ON notification_preferences;
CREATE POLICY "Users can insert own notification preferences" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNÇÃO PARA CRIAR PREFERÊNCIAS PADRÃO
-- =====================================================

CREATE OR REPLACE FUNCTION create_default_notification_preferences(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO notification_preferences (
    user_id,
    email_enabled,
    push_enabled,
    sms_enabled,
    in_app_enabled,
    message_notifications,
    referral_notifications,
    system_notifications,
    marketing_notifications,
    sound_enabled,
    sound_volume,
    respect_quiet_hours,
    custom_sounds
  ) VALUES (
    user_uuid,
    TRUE,  -- email_enabled
    TRUE,  -- push_enabled
    FALSE, -- sms_enabled
    TRUE,  -- in_app_enabled
    TRUE,  -- message_notifications
    TRUE,  -- referral_notifications
    TRUE,  -- system_notifications
    FALSE, -- marketing_notifications
    TRUE,  -- sound_enabled
    0.70,  -- sound_volume
    TRUE,  -- respect_quiet_hours
    '{}'::jsonb -- custom_sounds
  ) ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- =====================================================
-- SUCESSO! ✅
-- =====================================================
-- Tabela notification_preferences corrigida com sucesso!
-- Agora os usuários podem:
-- 1. Ter preferências de notificação criadas automaticamente
-- 2. Configurar sons de notificação
-- 3. Ajustar volume e horários silenciosos
-- 4. Personalizar sons individuais
-- =====================================================
