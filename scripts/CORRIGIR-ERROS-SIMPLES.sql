-- =====================================================
-- CORREÇÃO SIMPLES E DIRETA - SEM SINTAXE COMPLEXA
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

-- 2. CRIAR TABELA user_points_balance
CREATE TABLE IF NOT EXISTS user_points_balance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  available_balance INTEGER DEFAULT 0,
  locked_balance INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. CRIAR TABELA point_transactions
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'spend')),
  source VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  referral_id UUID,
  post_id UUID,
  related_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRIAR TABELA points_config
CREATE TABLE IF NOT EXISTS points_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_key VARCHAR(50) UNIQUE NOT NULL,
  points_value INTEGER NOT NULL,
  daily_limit INTEGER DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. INSERIR CONFIGURAÇÕES PADRÃO DE PONTOS
INSERT INTO points_config (action_key, points_value, daily_limit, description, is_active) VALUES
  ('referral_signup', 50, 0, 'Indicação se cadastrou', true),
  ('referral_profile_completed', 30, 0, 'Indicação completou perfil', true),
  ('referral_first_post', 20, 0, 'Indicação fez primeiro post', true),
  ('referral_first_review', 25, 0, 'Indicação fez primeira avaliação', true),
  ('referral_active_30_days', 100, 0, 'Indicação ativa há 30 dias', true),
  ('receive_like', 2, 50, 'Recebeu like', true),
  ('give_like', -1, 200, 'Deu like', true),
  ('receive_comment', 3, 30, 'Recebeu comentário', true),
  ('give_comment', -1, 200, 'Comentou', true),
  ('daily_login', 5, 1, 'Login diário', true),
  ('profile_completion', 20, 1, 'Completou perfil', true),
  ('first_post', 15, 1, 'Primeiro post', true),
  ('create_classified', 10, 10, 'Criou classificado', true),
  ('level_up', 0, 0, 'Subiu de nível', true),
  ('milestone_reached', 0, 0, 'Marcou marco', true)
ON CONFLICT (action_key) DO NOTHING;

-- 6. DROPAR E CRIAR FUNÇÃO get_user_points_balance
DROP FUNCTION IF EXISTS get_user_points_balance(UUID);

CREATE OR REPLACE FUNCTION get_user_points_balance(p_user_id UUID)
RETURNS TABLE (
  balance INTEGER,
  total_earned INTEGER,
  total_spent INTEGER,
  available_balance INTEGER,
  locked_balance INTEGER,
  level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(upb.balance, 0)::INTEGER as balance,
    COALESCE(upb.total_earned, 0)::INTEGER as total_earned,
    COALESCE(upb.total_spent, 0)::INTEGER as total_spent,
    COALESCE(upb.available_balance, 0)::INTEGER as available_balance,
    COALESCE(upb.locked_balance, 0)::INTEGER as locked_balance,
    COALESCE(p.user_level, 1)::INTEGER as level
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  LEFT JOIN public.user_points_balance upb ON upb.user_id = u.id
  WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. DROPAR E CRIAR FUNÇÃO add_points
DROP FUNCTION IF EXISTS add_points(UUID, INTEGER, VARCHAR, TEXT, JSONB);

CREATE OR REPLACE FUNCTION add_points(
  p_user_id UUID,
  p_points INTEGER,
  p_source VARCHAR(50),
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_type VARCHAR(20);
BEGIN
  v_type := CASE WHEN p_points > 0 THEN 'earn' ELSE 'spend' END;

  INSERT INTO public.user_points_balance (user_id, balance, total_earned, total_spent, available_balance)
  VALUES (
    p_user_id,
    GREATEST(0, p_points),
    CASE WHEN p_points > 0 THEN p_points ELSE 0 END,
    CASE WHEN p_points < 0 THEN ABS(p_points) ELSE 0 END,
    GREATEST(0, p_points)
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    balance = GREATEST(0, user_points_balance.balance + p_points),
    available_balance = GREATEST(0, user_points_balance.available_balance + p_points),
    total_earned = CASE WHEN p_points > 0 THEN user_points_balance.total_earned + p_points ELSE user_points_balance.total_earned END,
    total_spent = CASE WHEN p_points < 0 THEN user_points_balance.total_spent + ABS(p_points) ELSE user_points_balance.total_spent END,
    updated_at = NOW();

  INSERT INTO public.point_transactions (user_id, amount, type, source, description, metadata)
  VALUES (p_user_id, p_points, v_type, p_source, p_description, p_metadata)
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CRIAR VIEW user_points_stats
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

-- 9. CONFIGURAR RLS PARA notification_preferences
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

-- 10. CONFIGURAR RLS PARA user_points_balance
ALTER TABLE user_points_balance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own points balance" ON user_points_balance;
CREATE POLICY "Users can view own points balance"
  ON user_points_balance FOR SELECT
  USING (auth.uid() = user_id);

-- 11. CONFIGURAR RLS PARA point_transactions
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own point transactions" ON point_transactions;
CREATE POLICY "Users can view own point transactions"
  ON point_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- 12. CONFIGURAR RLS PARA points_config (público para leitura)
ALTER TABLE points_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view points config" ON points_config;
CREATE POLICY "Anyone can view points config"
  ON points_config FOR SELECT
  USING (true);

-- 13. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id 
  ON notification_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_user_points_balance_user_id 
  ON user_points_balance(user_id);

CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id 
  ON point_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at 
  ON point_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_points_config_action_key 
  ON points_config(action_key);

-- 14. INSERIR DADOS PADRÃO PARA USUÁRIOS EXISTENTES
INSERT INTO notification_preferences (user_id, email_enabled, push_enabled, in_app_enabled)
SELECT 
  id as user_id,
  true as email_enabled,
  true as push_enabled,
  true as in_app_enabled
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_points_balance (user_id, balance, total_earned, total_spent, available_balance)
SELECT 
  id as user_id,
  0 as balance,
  0 as total_earned,
  0 as total_spent,
  0 as available_balance
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_points_balance)
ON CONFLICT (user_id) DO NOTHING;
