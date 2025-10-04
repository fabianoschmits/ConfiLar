-- Script para adicionar colunas faltantes na tabela notification_preferences

-- Adicionar coluna email_enabled
ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT true;

-- Adicionar coluna marketing_notifications
ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS marketing_notifications BOOLEAN DEFAULT false;

-- Adicionar coluna sms_notifications (opcional)
ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false;

-- Adicionar coluna system_notifications (opcional)
ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS system_notifications BOOLEAN DEFAULT true;

-- Adicionar coluna quiet_hours_start (opcional)
ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS quiet_hours_start TIME DEFAULT '22:00';

-- Adicionar coluna quiet_hours_end (opcional)
ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS quiet_hours_end TIME DEFAULT '08:00';

-- Adicionar coluna timezone (opcional)
ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo';

-- Atualizar registros existentes para ter valores padrão
UPDATE notification_preferences 
SET 
  email_enabled = true,
  marketing_notifications = false,
  sms_notifications = false,
  system_notifications = true,
  quiet_hours_start = '22:00',
  quiet_hours_end = '08:00',
  timezone = 'America/Sao_Paulo'
WHERE email_enabled IS NULL 
   OR marketing_notifications IS NULL 
   OR sms_notifications IS NULL 
   OR system_notifications IS NULL 
   OR quiet_hours_start IS NULL 
   OR quiet_hours_end IS NULL 
   OR timezone IS NULL;

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'notification_preferences' 
ORDER BY ordinal_position;
