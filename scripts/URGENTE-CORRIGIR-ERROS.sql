-- =====================================================
-- URGENTE: CORRIGIR TODOS OS ERROS 404/406/400
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. CRIAR TABELA notification_preferences
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
  sound_enabled BOOLEAN DEFAULT TRUE,
  sound_volume NUMERIC(3,2) DEFAULT 0.70 CHECK (sound_volume >= 0 AND sound_volume <= 1),
  respect_quiet_hours BOOLEAN DEFAULT TRUE,
  custom_sounds JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id)
);

-- 2. CRIAR VIEW user_points_stats
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
  COALESCE(month_stats.monthly_earned, 0) as monthly_earned,
  COALESCE(month_stats.monthly_spent, 0) as monthly_spent,
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

-- 3. ADICIONAR RLS PARA notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notification preferences" ON notification_preferences;
CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notification preferences" ON notification_preferences;
CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notification preferences" ON notification_preferences;
CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. ADICIONAR RLS PARA point_transactions (se não existir)
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own point transactions" ON point_transactions;
CREATE POLICY "Users can view own point transactions"
  ON point_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- 5. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id 
  ON notification_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id 
  ON point_transactions(user_id);

-- 6. INSERIR PREFERÊNCIAS PADRÃO PARA USUÁRIOS EXISTENTES
INSERT INTO notification_preferences (user_id, email_enabled, push_enabled, in_app_enabled)
SELECT 
  id as user_id,
  true as email_enabled,
  true as push_enabled,
  true as in_app_enabled
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- 7. VERIFICAR SE AS TABELAS EXISTEM
DO $$ 
BEGIN
  RAISE NOTICE 'Verificando tabelas...';
  
  -- Verificar notification_preferences
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_preferences') THEN
    RAISE NOTICE '✅ notification_preferences: OK';
  ELSE
    RAISE NOTICE '❌ notification_preferences: FALTANDO';
  END IF;
  
  -- Verificar user_points_stats
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'user_points_stats') THEN
    RAISE NOTICE '✅ user_points_stats: OK';
  ELSE
    RAISE NOTICE '❌ user_points_stats: FALTANDO';
  END IF;
  
  -- Verificar point_transactions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'point_transactions') THEN
    RAISE NOTICE '✅ point_transactions: OK';
  ELSE
    RAISE NOTICE '❌ point_transactions: FALTANDO';
  END IF;
  
  RAISE NOTICE 'Script executado com sucesso!';
END $$;
