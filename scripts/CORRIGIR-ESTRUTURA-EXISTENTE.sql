-- =====================================================
-- CORRIGIR ESTRUTURA DA TABELA EXISTENTE
-- =====================================================

-- 1. VERIFICAR ESTRUTURA ATUAL
DO $$ 
BEGIN
  RAISE NOTICE 'Verificando estrutura atual da tabela notification_preferences...';
  
  -- Verificar se a tabela existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_preferences') THEN
    RAISE NOTICE '✅ Tabela notification_preferences existe';
    
    -- Verificar colunas existentes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'in_app_enabled') THEN
      RAISE NOTICE '✅ Coluna in_app_enabled existe';
    ELSE
      RAISE NOTICE '❌ Coluna in_app_enabled NÃO existe - será adicionada';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'sound_enabled') THEN
      RAISE NOTICE '✅ Coluna sound_enabled existe';
    ELSE
      RAISE NOTICE '❌ Coluna sound_enabled NÃO existe - será adicionada';
    END IF;
    
  ELSE
    RAISE NOTICE '❌ Tabela notification_preferences NÃO existe - será criada';
  END IF;
END $$;

-- 2. ADICIONAR COLUNAS FALTANDO (se não existirem)
DO $$ 
BEGIN
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

-- 3. CRIAR VIEW user_points_stats (se não existir)
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

-- 4. ADICIONAR RLS E POLÍTICAS
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

-- 5. ADICIONAR RLS PARA point_transactions
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own point transactions" ON point_transactions;
CREATE POLICY "Users can view own point transactions"
  ON point_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- 6. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id 
  ON notification_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id 
  ON point_transactions(user_id);

-- 7. INSERIR PREFERÊNCIAS PADRÃO PARA USUÁRIOS EXISTENTES
INSERT INTO notification_preferences (user_id, email_enabled, push_enabled, in_app_enabled)
SELECT 
  id as user_id,
  true as email_enabled,
  true as push_enabled,
  true as in_app_enabled
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- 8. VERIFICAÇÃO FINAL
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICAÇÃO FINAL:';
  RAISE NOTICE '========================================';
  
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
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SCRIPT EXECUTADO COM SUCESSO!';
  RAISE NOTICE '========================================';
END $$;
