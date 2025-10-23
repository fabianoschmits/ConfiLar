-- =====================================================
-- ADICIONAR CAMPOS DE SOM NO NOTIFICATION_PREFERENCES
-- ConfiLar - Sistema de Sons
-- =====================================================

-- Adicionar colunas de preferências de som
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS sound_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS sound_volume NUMERIC(3,2) DEFAULT 0.70 CHECK (sound_volume >= 0 AND sound_volume <= 1),
ADD COLUMN IF NOT EXISTS respect_quiet_hours BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS custom_sounds JSONB DEFAULT '{}'::jsonb;

-- Criar índice para performance
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
COMMENT ON COLUMN notification_preferences.sound_enabled IS 
'Master switch para ativar/desativar todos os sons de notificações';

COMMENT ON COLUMN notification_preferences.sound_volume IS 
'Volume global dos sons de notificações (0.0 a 1.0)';

COMMENT ON COLUMN notification_preferences.respect_quiet_hours IS 
'Se TRUE, não toca sons durante o horário silencioso configurado';

COMMENT ON COLUMN notification_preferences.custom_sounds IS 
'Mapeamento JSON de tipo de notificação para caminho de som customizado. Ex: {"message": "/sounds/custom-message.mp3"}';

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
-- CONSULTAS ÚTEIS
-- =====================================================

-- Ver preferências de som de todos os usuários
-- SELECT 
--   user_id,
--   sound_enabled,
--   sound_volume,
--   respect_quiet_hours,
--   custom_sounds
-- FROM notification_preferences;

-- Ver usuários com sons desabilitados
-- SELECT 
--   p.id,
--   p.full_name,
--   np.sound_enabled,
--   np.sound_volume
-- FROM profiles p
-- JOIN notification_preferences np ON p.id = np.user_id
-- WHERE np.sound_enabled = FALSE;

-- Ver usuários com sons customizados
-- SELECT 
--   p.id,
--   p.full_name,
--   np.custom_sounds
-- FROM profiles p
-- JOIN notification_preferences np ON p.id = np.user_id
-- WHERE jsonb_array_length(jsonb_object_keys(np.custom_sounds)) > 0;

COMMIT;

-- =====================================================
-- SUCESSO! ✅
-- =====================================================
-- Preferências de som adicionadas com sucesso!
-- Agora os usuários podem:
-- 1. Ativar/desativar sons (sound_enabled)
-- 2. Ajustar volume (sound_volume)
-- 3. Configurar horário silencioso (respect_quiet_hours)
-- 4. Personalizar sons individuais (custom_sounds)
-- =====================================================

