-- =====================================================
-- CORRIGIR TODOS OS ERROS 400/406/404 NO SUPABASE
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'INICIANDO CORREÇÃO COMPLETA DO BANCO';
  RAISE NOTICE '========================================';
END $$;

-- 1. VERIFICAR E CRIAR TABELA notification_preferences
DO $$ 
BEGIN
  RAISE NOTICE '1. Verificando tabela notification_preferences...';
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_preferences') THEN
    CREATE TABLE notification_preferences (
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
    RAISE NOTICE '✅ Tabela notification_preferences criada';
  ELSE
    RAISE NOTICE '✅ Tabela notification_preferences já existe';
  END IF;
END $$;

-- 2. ADICIONAR COLUNAS FALTANDO EM notification_preferences
DO $$ 
DECLARE
  coluna TEXT;
BEGIN
  RAISE NOTICE '2. Adicionando colunas faltando em notification_preferences...';
  
  -- Adicionar in_app_enabled se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'in_app_enabled') THEN
    ALTER TABLE notification_preferences ADD COLUMN in_app_enabled BOOLEAN DEFAULT TRUE;
    RAISE NOTICE '✅ Coluna in_app_enabled adicionada';
  END IF;
  
  -- Adicionar sound_enabled se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'sound_enabled') THEN
    ALTER TABLE notification_preferences ADD COLUMN sound_enabled BOOLEAN DEFAULT TRUE;
    RAISE NOTICE '✅ Coluna sound_enabled adicionada';
  END IF;
  
  -- Adicionar sound_volume se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'sound_volume') THEN
    ALTER TABLE notification_preferences ADD COLUMN sound_volume NUMERIC(3,2) DEFAULT 0.70 CHECK (sound_volume >= 0 AND sound_volume <= 1);
    RAISE NOTICE '✅ Coluna sound_volume adicionada';
  END IF;
  
  -- Adicionar respect_quiet_hours se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'respect_quiet_hours') THEN
    ALTER TABLE notification_preferences ADD COLUMN respect_quiet_hours BOOLEAN DEFAULT TRUE;
    RAISE NOTICE '✅ Coluna respect_quiet_hours adicionada';
  END IF;
  
  -- Adicionar custom_sounds se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'custom_sounds') THEN
    ALTER TABLE notification_preferences ADD COLUMN custom_sounds JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE '✅ Coluna custom_sounds adicionada';
  END IF;
  
  -- Adicionar outras colunas se não existirem
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'email_enabled') THEN
    ALTER TABLE notification_preferences ADD COLUMN email_enabled BOOLEAN DEFAULT TRUE;
    RAISE NOTICE '✅ Coluna email_enabled adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'push_enabled') THEN
    ALTER TABLE notification_preferences ADD COLUMN push_enabled BOOLEAN DEFAULT TRUE;
    RAISE NOTICE '✅ Coluna push_enabled adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'message_notifications') THEN
    ALTER TABLE notification_preferences ADD COLUMN message_notifications BOOLEAN DEFAULT TRUE;
    RAISE NOTICE '✅ Coluna message_notifications adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'referral_notifications') THEN
    ALTER TABLE notification_preferences ADD COLUMN referral_notifications BOOLEAN DEFAULT TRUE;
    RAISE NOTICE '✅ Coluna referral_notifications adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'system_notifications') THEN
    ALTER TABLE notification_preferences ADD COLUMN system_notifications BOOLEAN DEFAULT TRUE;
    RAISE NOTICE '✅ Coluna system_notifications adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'marketing_notifications') THEN
    ALTER TABLE notification_preferences ADD COLUMN marketing_notifications BOOLEAN DEFAULT FALSE;
    RAISE NOTICE '✅ Coluna marketing_notifications adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'quiet_hours_start') THEN
    ALTER TABLE notification_preferences ADD COLUMN quiet_hours_start TIME DEFAULT '22:00';
    RAISE NOTICE '✅ Coluna quiet_hours_start adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'quiet_hours_end') THEN
    ALTER TABLE notification_preferences ADD COLUMN quiet_hours_end TIME DEFAULT '08:00';
    RAISE NOTICE '✅ Coluna quiet_hours_end adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'timezone') THEN
    ALTER TABLE notification_preferences ADD COLUMN timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo';
    RAISE NOTICE '✅ Coluna timezone adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'sms_enabled') THEN
    ALTER TABLE notification_preferences ADD COLUMN sms_enabled BOOLEAN DEFAULT FALSE;
    RAISE NOTICE '✅ Coluna sms_enabled adicionada';
  END IF;
END $$;

-- 3. VERIFICAR E CRIAR TABELA user_points_balance
DO $$ 
BEGIN
  RAISE NOTICE '3. Verificando tabela user_points_balance...';
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_points_balance') THEN
    RAISE NOTICE 'Criando tabela user_points_balance...';
  ELSE
    RAISE NOTICE '✅ Tabela user_points_balance já existe';
  END IF;
END $$;

-- Criar tabela user_points_balance se não existir
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

-- 4. VERIFICAR E CRIAR TABELA point_transactions
DO $$ 
BEGIN
  RAISE NOTICE '4. Verificando tabela point_transactions...';
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'point_transactions') THEN
    RAISE NOTICE 'Criando tabela point_transactions...';
  ELSE
    RAISE NOTICE '✅ Tabela point_transactions já existe';
  END IF;
END $$;

-- Criar tabela point_transactions se não existir
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'spend')),
  source VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  referral_id UUID REFERENCES referrals(id),
  post_id UUID,
  related_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. VERIFICAR E CRIAR TABELA points_config
DO $$ 
BEGIN
  RAISE NOTICE '5. Verificando tabela points_config...';
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_config') THEN
    RAISE NOTICE 'Criando tabela points_config...';
  ELSE
    RAISE NOTICE '✅ Tabela points_config já existe';
  END IF;
END $$;

-- Criar tabela points_config se não existir
CREATE TABLE IF NOT EXISTS points_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_key VARCHAR(50) UNIQUE NOT NULL,
  points_value INTEGER NOT NULL,
  daily_limit INTEGER DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. INSERIR DADOS PADRÃO EM points_config
DO $$ 
BEGIN
  RAISE NOTICE '6. Inserindo configurações padrão de pontos...';
  
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
  
  RAISE NOTICE '✅ Configurações de pontos inseridas';
END $$;

-- 7. CRIAR FUNÇÃO get_user_points_balance
DO $$ 
BEGIN
  RAISE NOTICE '7. Criando função get_user_points_balance...';
  
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
  
  RAISE NOTICE '✅ Função get_user_points_balance criada';
END $$;

-- 8. CRIAR FUNÇÃO add_points
DO $$ 
BEGIN
  RAISE NOTICE '8. Criando função add_points...';
  
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
  
  RAISE NOTICE '✅ Função add_points criada';
END $$;

-- 9. CRIAR VIEW user_points_stats
DO $$ 
BEGIN
  RAISE NOTICE '9. Criando view user_points_stats...';
  
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
  
  RAISE NOTICE '✅ View user_points_stats criada';
END $$;

-- 10. CONFIGURAR RLS PARA TODAS AS TABELAS
DO $$ 
BEGIN
  RAISE NOTICE '10. Configurando RLS...';
  
  -- notification_preferences
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
  
  -- user_points_balance
  ALTER TABLE user_points_balance ENABLE ROW LEVEL SECURITY;
  
  DROP POLICY IF EXISTS "Users can view own points balance" ON user_points_balance;
  CREATE POLICY "Users can view own points balance"
    ON user_points_balance FOR SELECT
    USING (auth.uid() = user_id);
  
  -- point_transactions
  ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
  
  DROP POLICY IF EXISTS "Users can view own point transactions" ON point_transactions;
  CREATE POLICY "Users can view own point transactions"
    ON point_transactions FOR SELECT
    USING (auth.uid() = user_id);
  
  -- points_config (público para leitura)
  ALTER TABLE points_config ENABLE ROW LEVEL SECURITY;
  
  DROP POLICY IF EXISTS "Anyone can view points config" ON points_config;
  CREATE POLICY "Anyone can view points config"
    ON points_config FOR SELECT
    USING (true);
  
  RAISE NOTICE '✅ RLS configurado';
END $$;

-- 11. CRIAR ÍNDICES
DO $$ 
BEGIN
  RAISE NOTICE '11. Criando índices...';
  
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
  
  RAISE NOTICE '✅ Índices criados';
END $$;

-- 12. INSERIR DADOS PADRÃO PARA USUÁRIOS EXISTENTES
DO $$ 
BEGIN
  RAISE NOTICE '12. Inserindo dados padrão para usuários existentes...';
  
  -- Inserir preferências de notificação
  INSERT INTO notification_preferences (user_id, email_enabled, push_enabled, in_app_enabled)
  SELECT 
    id as user_id,
    true as email_enabled,
    true as push_enabled,
    true as in_app_enabled
  FROM auth.users
  WHERE id NOT IN (SELECT user_id FROM notification_preferences)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Inserir saldo de pontos inicial
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
  
  RAISE NOTICE '✅ Dados padrão inseridos';
END $$;

-- 13. VERIFICAÇÃO FINAL
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICAÇÃO FINAL:';
  RAISE NOTICE '========================================';
  
  -- Verificar tabelas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_preferences') THEN
    RAISE NOTICE '✅ notification_preferences: OK';
  ELSE
    RAISE NOTICE '❌ notification_preferences: FALTANDO';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_points_balance') THEN
    RAISE NOTICE '✅ user_points_balance: OK';
  ELSE
    RAISE NOTICE '❌ user_points_balance: FALTANDO';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'point_transactions') THEN
    RAISE NOTICE '✅ point_transactions: OK';
  ELSE
    RAISE NOTICE '❌ point_transactions: FALTANDO';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_config') THEN
    RAISE NOTICE '✅ points_config: OK';
  ELSE
    RAISE NOTICE '❌ points_config: FALTANDO';
  END IF;
  
  -- Verificar views
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'user_points_stats') THEN
    RAISE NOTICE '✅ user_points_stats: OK';
  ELSE
    RAISE NOTICE '❌ user_points_stats: FALTANDO';
  END IF;
  
  -- Verificar funções
  IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_user_points_balance') THEN
    RAISE NOTICE '✅ get_user_points_balance: OK';
  ELSE
    RAISE NOTICE '❌ get_user_points_balance: FALTANDO';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'add_points') THEN
    RAISE NOTICE '✅ add_points: OK';
  ELSE
    RAISE NOTICE '❌ add_points: FALTANDO';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CORREÇÃO COMPLETA FINALIZADA!';
  RAISE NOTICE '========================================';
END $$;
