-- Adicionar colunas faltantes na tabela notification_preferences

-- Adicionar colunas de som e vibração
ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS sound_enabled BOOLEAN DEFAULT true;

ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS vibration_enabled BOOLEAN DEFAULT true;

-- Adicionar colunas de favoritos e recomendações
ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS favorite_notifications BOOLEAN DEFAULT true;

ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS recommendation_notifications BOOLEAN DEFAULT true;

-- Atualizar registros existentes com valores padrão
UPDATE notification_preferences 
SET 
  sound_enabled = true,
  vibration_enabled = true,
  favorite_notifications = true,
  recommendation_notifications = true
WHERE 
  sound_enabled IS NULL 
  OR vibration_enabled IS NULL 
  OR favorite_notifications IS NULL 
  OR recommendation_notifications IS NULL;