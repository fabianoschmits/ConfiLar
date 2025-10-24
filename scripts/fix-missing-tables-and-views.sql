-- =====================================================
-- CORRIGIR TABELAS E VIEWS FALTANDO
-- ConfiLar - Sistema ConfiPoints
-- =====================================================

-- 1. Criar tabela notification_preferences se não existir
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

-- 2. Criar view user_points_stats se não existir
CREATE OR REPLACE VIEW user_points_stats AS
SELECT 
  p.id as user_id,
  p.full_name,
  p.points_balance,
  p.user_level,
  p.daily_points_earned,
  p.total_points_earned,
  p.total_points_spent,
  p.last_daily_reset,
  -- Estatísticas do mês
  COALESCE(month_stats.monthly_earned, 0) as monthly_earned,
  COALESCE(month_stats.monthly_spent, 0) as monthly_spent,
  -- Ranking
  ROW_NUMBER() OVER (ORDER BY p.total_points_earned DESC) as global_rank
FROM public.profiles p
LEFT JOIN (
  SELECT 
    user_id,
    SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as monthly_earned,
    SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as monthly_spent
  FROM public.point_transactions
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY user_id
) month_stats ON month_stats.user_id = p.id;

-- 3. Adicionar RLS para notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias preferências
CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id 
  ON notification_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_sound_enabled 
  ON notification_preferences(sound_enabled) 
  WHERE sound_enabled = true;

-- 5. Inserir preferências padrão para usuários existentes (se não existirem)
INSERT INTO notification_preferences (user_id, email_enabled, push_enabled, in_app_enabled)
SELECT 
  id as user_id,
  true as email_enabled,
  true as push_enabled,
  true as in_app_enabled
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;
