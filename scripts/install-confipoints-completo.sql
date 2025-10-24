-- ============================================
-- INSTALAÇÃO COMPLETA DO SISTEMA CONFIPOINTS
-- ============================================
-- Execute APENAS ESTE arquivo no Supabase
-- Contém: Fase 1 + Fase 2 + Anti-Fraude
-- Tempo estimado: ~30 segundos
-- ============================================

DO $$ BEGIN
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'INICIANDO INSTALAÇÃO DO CONFIPOINTS';
  RAISE NOTICE '=========================================';
END $$;

-- ============================================
-- PARTE 1/3: SISTEMA DE PONTOS BASE (FASE 1)
-- ============================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '1/3 - Instalando Sistema de Pontos Base...';
END $$;

-- Expandir profiles com campos de pontos
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS points_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_daily_login DATE,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS first_post_created BOOLEAN DEFAULT false;

-- Tabela de saldo de pontos do usuário
CREATE TABLE IF NOT EXISTS user_points_balance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance INTEGER DEFAULT 0 CHECK (balance >= 0),
  level INTEGER DEFAULT 1,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  last_daily_reset DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_points_balance_user_id ON user_points_balance(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_balance_level ON user_points_balance(level);

-- RLS
ALTER TABLE user_points_balance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own balance" ON user_points_balance;
CREATE POLICY "Users can view own balance"
  ON user_points_balance FOR SELECT
  USING (auth.uid() = user_id);

-- Tabela de transações de pontos
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  source TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_transactions_action_type ON point_transactions(action_type);

-- RLS
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON point_transactions;
CREATE POLICY "Users can view own transactions"
  ON point_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Tabela de configurações
CREATE TABLE IF NOT EXISTS points_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type TEXT NOT NULL UNIQUE,
  points_value INTEGER NOT NULL,
  daily_limit INTEGER,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO points_config (action_type, points_value, daily_limit, description) VALUES
  ('daily_login', 10, 1, 'Login diário'),
  ('profile_complete', 150, 1, 'Completar perfil'),
  ('first_post', 50, 1, 'Primeiro post'),
  ('create_ad', 100, 10, 'Criar anúncio'),
  ('receive_like', 2, 500, 'Receber curtida'),
  ('give_like', -2, 500, 'Dar curtida'),
  ('receive_comment', 5, 200, 'Receber comentário'),
  ('give_comment', -1, 200, 'Fazer comentário'),
  ('referral_signup', 200, NULL, 'Indicação se cadastrou'),
  ('referral_profile', 150, NULL, 'Indicação completou perfil'),
  ('referral_first_post', 100, NULL, 'Indicação fez primeiro post'),
  ('referral_first_review', 100, NULL, 'Indicação fez primeira avaliação'),
  ('referral_30days', 300, NULL, 'Indicação ativa 30 dias')
ON CONFLICT (action_type) DO NOTHING;

-- Função para adicionar pontos (versão flexível)
CREATE OR REPLACE FUNCTION add_points(
  p_user_id UUID,
  p_points INTEGER,
  p_action_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_current_balance INTEGER;
BEGIN
  -- Criar ou atualizar saldo
  INSERT INTO user_points_balance (user_id, balance, total_earned)
  VALUES (p_user_id, p_points, CASE WHEN p_points > 0 THEN p_points ELSE 0 END)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    balance = user_points_balance.balance + p_points,
    total_earned = CASE WHEN p_points > 0 THEN user_points_balance.total_earned + p_points ELSE user_points_balance.total_earned END,
    total_spent = CASE WHEN p_points < 0 THEN user_points_balance.total_spent + ABS(p_points) ELSE user_points_balance.total_spent END,
    updated_at = NOW()
  RETURNING balance INTO v_current_balance;
  
  -- Criar transação
  INSERT INTO point_transactions (user_id, points, action_type, source, description, metadata)
  VALUES (p_user_id, p_points, p_action_type, 'system', p_description, p_metadata)
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para deduzir pontos
CREATE OR REPLACE FUNCTION deduct_points(
  p_user_id UUID,
  p_points INTEGER,
  p_action_type TEXT,
  p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_current_balance INTEGER;
BEGIN
  -- Verificar saldo
  SELECT balance INTO v_current_balance FROM user_points_balance WHERE user_id = p_user_id;
  
  IF v_current_balance IS NULL OR v_current_balance < p_points THEN
    RAISE EXCEPTION 'Saldo insuficiente';
  END IF;
  
  -- Atualizar saldo
  UPDATE user_points_balance
  SET 
    balance = balance - p_points,
    total_spent = total_spent + p_points,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Criar transação
  INSERT INTO point_transactions (user_id, points, action_type, description)
  VALUES (p_user_id, -p_points, p_action_type, p_description)
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar saldo
CREATE OR REPLACE FUNCTION get_user_points_balance(p_user_id UUID)
RETURNS TABLE (
  balance INTEGER,
  level INTEGER,
  total_earned INTEGER,
  total_spent INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT upb.balance, upb.level, upb.total_earned, upb.total_spent
  FROM user_points_balance upb
  WHERE upb.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  RAISE NOTICE '✅ Fase 1 concluída!';
END $$;

-- ============================================
-- PARTE 2/3: SISTEMA DE ECONOMIA (FASE 2)
-- ============================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '2/3 - Instalando Sistema de Economia...';
END $$;

-- Tabela de pacotes de pontos
CREATE TABLE IF NOT EXISTS points_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  price_brl DECIMAL(10,2) NOT NULL CHECK (price_brl > 0),
  points INTEGER NOT NULL CHECK (points > 0),
  bonus_percentage DECIMAL(5,2) DEFAULT 0.00,
  total_points INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_packages_slug ON points_packages(slug);
CREATE INDEX IF NOT EXISTS idx_points_packages_active ON points_packages(is_active) WHERE is_active = true;

-- Inserir pacotes padrão
INSERT INTO points_packages (name, slug, price_brl, points, bonus_percentage, total_points, is_featured, sort_order) VALUES
  ('Starter', 'starter', 1.00, 100, 0.00, 100, false, 1),
  ('Basic', 'basic', 5.00, 500, 5.00, 525, false, 2),
  ('Popular', 'popular', 10.00, 1000, 10.00, 1100, true, 3),
  ('Pro', 'pro', 50.00, 5000, 15.00, 5750, false, 4),
  ('Premium', 'premium', 100.00, 10000, 20.00, 12000, true, 5),
  ('Ultimate', 'ultimate', 500.00, 50000, 25.00, 62500, false, 6)
ON CONFLICT (slug) DO NOTHING;

-- Tabela de compras de pontos
CREATE TABLE IF NOT EXISTS points_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  package_id UUID REFERENCES points_packages(id),
  amount_brl DECIMAL(10,2) NOT NULL,
  points_received INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  payment_id TEXT,
  payment_url TEXT,
  qr_code TEXT,
  qr_code_base64 TEXT,
  status TEXT DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_points_purchases_user_id ON points_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_points_purchases_status ON points_purchases(status);

-- RLS
ALTER TABLE points_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchases" ON points_purchases;
CREATE POLICY "Users can view own purchases"
  ON points_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Tabela de saques
CREATE TABLE IF NOT EXISTS points_withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points_amount INTEGER NOT NULL CHECK (points_amount >= 10000),
  amount_brl DECIMAL(10,2) NOT NULL,
  fee_brl DECIMAL(10,2) NOT NULL,
  net_amount_brl DECIMAL(10,2) NOT NULL,
  pix_key TEXT NOT NULL,
  pix_key_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_points_withdrawals_user_id ON points_withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_points_withdrawals_status ON points_withdrawals(status);

-- RLS
ALTER TABLE points_withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own withdrawals" ON points_withdrawals;
CREATE POLICY "Users can view own withdrawals"
  ON points_withdrawals FOR SELECT
  USING (auth.uid() = user_id);

-- Tabela de transferências
CREATE TABLE IF NOT EXISTS points_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points_amount INTEGER NOT NULL CHECK (points_amount >= 100),
  fee_percentage DECIMAL(5,2) DEFAULT 0.00,
  fee_amount INTEGER DEFAULT 0,
  net_amount INTEGER NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'completed',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_transfers_from_user ON points_transfers(from_user_id);
CREATE INDEX IF NOT EXISTS idx_points_transfers_to_user ON points_transfers(to_user_id);

-- RLS
ALTER TABLE points_transfers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transfers" ON points_transfers;
CREATE POLICY "Users can view own transfers"
  ON points_transfers FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Tabela de itens da loja
CREATE TABLE IF NOT EXISTS points_store_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  points_price INTEGER NOT NULL CHECK (points_price > 0),
  duration_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  stock INTEGER,
  max_per_user INTEGER,
  icon_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_store_items_category ON points_store_items(category);
CREATE INDEX IF NOT EXISTS idx_points_store_items_active ON points_store_items(is_active) WHERE is_active = true;

-- Inserir itens padrão
INSERT INTO points_store_items (name, slug, category, points_price, duration_days, description) VALUES
  ('Badge Bronze', 'badge-bronze', 'badge', 1000, NULL, 'Badge exclusivo Bronze'),
  ('Badge Prata', 'badge-prata', 'badge', 2500, NULL, 'Badge exclusivo Prata'),
  ('Badge Ouro', 'badge-ouro', 'badge', 5000, NULL, 'Badge exclusivo Ouro'),
  ('Destaque 7 dias', 'boost-7d', 'boost', 2000, 7, 'Destaque seus posts por 7 dias'),
  ('Destaque 30 dias', 'boost-30d', 'boost', 7000, 30, 'Destaque seus posts por 30 dias'),
  ('Verificação Premium', 'verify-premium', 'feature', 5000, 30, 'Selo verificado por 30 dias'),
  ('Posts Ilimitados', 'unlimited-posts', 'feature', 3000, 30, 'Crie posts ilimitados por 30 dias'),
  ('Anúncios Destaque', 'featured-ads', 'visibility', 4000, 30, 'Seus anúncios em destaque'),
  ('Chat Prioritário', 'priority-chat', 'feature', 2000, 30, 'Suporte prioritário'),
  ('Perfil VIP', 'vip-profile', 'feature', 10000, 30, 'Todos os recursos VIP')
ON CONFLICT (slug) DO NOTHING;

-- Tabela de compras na loja
CREATE TABLE IF NOT EXISTS points_store_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES points_store_items(id) NOT NULL,
  points_spent INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_points_store_purchases_user_id ON points_store_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_points_store_purchases_active ON points_store_purchases(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE points_store_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own store purchases" ON points_store_purchases;
CREATE POLICY "Users can view own store purchases"
  ON points_store_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Função para criar saque
CREATE OR REPLACE FUNCTION create_withdrawal(
  p_user_id UUID,
  p_points_amount INTEGER,
  p_pix_key TEXT,
  p_pix_key_type TEXT
) RETURNS UUID AS $$
DECLARE
  v_withdrawal_id UUID;
  v_amount_brl DECIMAL(10,2);
  v_fee_brl DECIMAL(10,2);
  v_net_amount_brl DECIMAL(10,2);
  v_current_balance INTEGER;
BEGIN
  -- Verificar saldo
  SELECT balance INTO v_current_balance FROM user_points_balance WHERE user_id = p_user_id;
  
  IF v_current_balance IS NULL OR v_current_balance < p_points_amount THEN
    RAISE EXCEPTION 'Saldo insuficiente';
  END IF;
  
  -- Calcular valores
  v_amount_brl := p_points_amount / 100.0;
  v_fee_brl := v_amount_brl * 0.05;
  v_net_amount_brl := v_amount_brl - v_fee_brl;
  
  -- Criar saque
  INSERT INTO points_withdrawals (
    user_id, points_amount, amount_brl, fee_brl, net_amount_brl, pix_key, pix_key_type
  ) VALUES (
    p_user_id, p_points_amount, v_amount_brl, v_fee_brl, v_net_amount_brl, p_pix_key, p_pix_key_type
  ) RETURNING id INTO v_withdrawal_id;
  
  -- Deduzir pontos
  PERFORM deduct_points(p_user_id, p_points_amount, 'withdrawal', 'Saque de pontos');
  
  RETURN v_withdrawal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para transferir pontos
CREATE OR REPLACE FUNCTION transfer_points(
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_points_amount INTEGER,
  p_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_transfer_id UUID;
  v_from_balance INTEGER;
BEGIN
  -- Verificar se não é para si mesmo
  IF p_from_user_id = p_to_user_id THEN
    RAISE EXCEPTION 'Não é possível transferir para si mesmo';
  END IF;
  
  -- Verificar saldo
  SELECT balance INTO v_from_balance FROM user_points_balance WHERE user_id = p_from_user_id;
  
  IF v_from_balance IS NULL OR v_from_balance < p_points_amount THEN
    RAISE EXCEPTION 'Saldo insuficiente';
  END IF;
  
  -- Criar transferência
  INSERT INTO points_transfers (from_user_id, to_user_id, points_amount, net_amount, message)
  VALUES (p_from_user_id, p_to_user_id, p_points_amount, p_points_amount, p_message)
  RETURNING id INTO v_transfer_id;
  
  -- Deduzir do remetente
  PERFORM deduct_points(p_from_user_id, p_points_amount, 'transfer_sent', 'Transferência enviada');
  
  -- Adicionar ao destinatário
  PERFORM add_points(p_to_user_id, 'transfer_received', 'Transferência recebida');
  
  RETURN v_transfer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  RAISE NOTICE '✅ Fase 2 concluída!';
END $$;

-- ============================================
-- PARTE 3/3: SISTEMA ANTI-FRAUDE
-- ============================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '3/3 - Instalando Sistema Anti-Fraude...';
END $$;

-- Tabela de verificação de usuários
CREATE TABLE IF NOT EXISTS user_verification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_verified BOOLEAN DEFAULT false,
  cpf_verified BOOLEAN DEFAULT false,
  selfie_verified BOOLEAN DEFAULT false,
  premium_verified BOOLEAN DEFAULT false,
  cpf TEXT,
  selfie_url TEXT,
  verification_date TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  verification_level INTEGER DEFAULT 0,
  daily_points_limit INTEGER DEFAULT 1000,
  monthly_withdrawal_limit DECIMAL(10,2) DEFAULT 0.00,
  max_referrals_per_month INTEGER DEFAULT 0,
  unlock_days INTEGER DEFAULT 30,
  last_ip TEXT,
  last_device_fingerprint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_verification_user_id ON user_verification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verification_level ON user_verification(verification_level);

-- RLS
ALTER TABLE user_verification ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own verification" ON user_verification;
CREATE POLICY "Users can view own verification"
  ON user_verification FOR SELECT
  USING (auth.uid() = user_id);

-- Tabela de bloqueio de pontos
CREATE TABLE IF NOT EXISTS point_locks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID REFERENCES point_transactions(id) ON DELETE SET NULL,
  locked_points INTEGER NOT NULL CHECK (locked_points > 0),
  original_unlock_date TIMESTAMPTZ NOT NULL,
  current_unlock_date TIMESTAMPTZ NOT NULL,
  unlock_percentage DECIMAL(5,2) DEFAULT 100.00,
  lock_reason TEXT NOT NULL,
  lock_type TEXT DEFAULT 'time_based',
  unlocked_25_at TIMESTAMPTZ,
  unlocked_50_at TIMESTAMPTZ,
  unlocked_75_at TIMESTAMPTZ,
  unlocked_100_at TIMESTAMPTZ,
  is_fully_unlocked BOOLEAN DEFAULT false,
  remaining_locked INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_locks_user_id ON point_locks(user_id);
CREATE INDEX IF NOT EXISTS idx_point_locks_unlock_date ON point_locks(current_unlock_date) WHERE is_fully_unlocked = false;

-- RLS
ALTER TABLE point_locks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own locks" ON point_locks;
CREATE POLICY "Users can view own locks"
  ON point_locks FOR SELECT
  USING (auth.uid() = user_id);

-- Tabela de detecção de fraudes
CREATE TABLE IF NOT EXISTS fraud_detection (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  same_ip_users UUID[] DEFAULT ARRAY[]::UUID[],
  same_device_users UUID[] DEFAULT ARRAY[]::UUID[],
  same_cpf_users UUID[] DEFAULT ARRAY[]::UUID[],
  same_pix_users UUID[] DEFAULT ARRAY[]::UUID[],
  fraud_score INTEGER DEFAULT 0 CHECK (fraud_score >= 0 AND fraud_score <= 100),
  risk_level TEXT DEFAULT 'low',
  multiple_accounts_detected BOOLEAN DEFAULT false,
  suspicious_referrals BOOLEAN DEFAULT false,
  rapid_account_creation BOOLEAN DEFAULT false,
  farming_pattern_detected BOOLEAN DEFAULT false,
  withdrawal_abuse_detected BOOLEAN DEFAULT false,
  circular_referrals_detected BOOLEAN DEFAULT false,
  total_accounts_same_ip INTEGER DEFAULT 0,
  total_referrals_7days INTEGER DEFAULT 0,
  total_transactions_24h INTEGER DEFAULT 0,
  account_flagged BOOLEAN DEFAULT false,
  account_frozen BOOLEAN DEFAULT false,
  points_locked BOOLEAN DEFAULT false,
  withdrawals_blocked BOOLEAN DEFAULT false,
  referrals_blocked BOOLEAN DEFAULT false,
  admin_notes TEXT,
  investigation_status TEXT DEFAULT 'none',
  investigated_by UUID REFERENCES auth.users(id),
  first_flag_date TIMESTAMPTZ,
  last_check TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fraud_detection_user_id ON fraud_detection(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_score ON fraud_detection(fraud_score);

-- RLS
ALTER TABLE fraud_detection ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own fraud status" ON fraud_detection;
CREATE POLICY "Users can view own fraud status"
  ON fraud_detection FOR SELECT
  USING (auth.uid() = user_id);

-- Adicionar colunas em user_points_balance
ALTER TABLE user_points_balance 
ADD COLUMN IF NOT EXISTS locked_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchased_balance INTEGER DEFAULT 0;

-- Atualizar balances existentes
UPDATE user_points_balance
SET 
  available_balance = COALESCE(available_balance, balance),
  locked_balance = COALESCE(locked_balance, 0),
  purchased_balance = COALESCE(purchased_balance, 0)
WHERE available_balance IS NULL;

-- Função para calcular saldos
CREATE OR REPLACE FUNCTION calculate_point_balances(p_user_id UUID)
RETURNS TABLE (
  total_balance INTEGER,
  locked_balance INTEGER,
  available_balance INTEGER,
  purchased_balance INTEGER,
  can_withdraw INTEGER
) AS $$
DECLARE
  v_total INTEGER;
  v_locked INTEGER;
  v_purchased INTEGER;
BEGIN
  SELECT balance, COALESCE(purchased_balance, 0)
  INTO v_total, v_purchased
  FROM user_points_balance
  WHERE user_id = p_user_id;
  
  SELECT COALESCE(SUM(
    CASE 
      WHEN is_fully_unlocked = false AND current_unlock_date > NOW()
      THEN locked_points
      ELSE 0
    END
  ), 0)::INTEGER
  INTO v_locked
  FROM point_locks
  WHERE user_id = p_user_id;
  
  RETURN QUERY SELECT 
    v_total as total_balance,
    v_locked as locked_balance,
    (v_total - v_locked) as available_balance,
    v_purchased as purchased_balance,
    (v_total - v_locked + v_purchased) as can_withdraw;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar verificação para usuários existentes
INSERT INTO user_verification (user_id, email_verified, verification_level, unlock_days)
SELECT 
  id,
  email_confirmed_at IS NOT NULL,
  CASE WHEN email_confirmed_at IS NOT NULL THEN 1 ELSE 0 END,
  30
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Criar fraud_detection para usuários existentes
INSERT INTO fraud_detection (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

DO $$ BEGIN
  RAISE NOTICE '✅ Fase 3 concluída!';
END $$;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'VERIFICANDO INSTALAÇÃO...';
  RAISE NOTICE '=========================================';
END $$;

DO $$
DECLARE
  v_tables INTEGER;
  v_functions INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_tables
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND (table_name LIKE '%point%' OR table_name IN ('user_verification', 'fraud_detection'));
  
  SELECT COUNT(*) INTO v_functions
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
  AND routine_name LIKE '%point%';
  
  RAISE NOTICE '';
  RAISE NOTICE 'Tabelas criadas: %', v_tables;
  RAISE NOTICE 'Funções criadas: %', v_functions;
  RAISE NOTICE '';
  
  IF v_tables >= 13 THEN
    RAISE NOTICE '✅✅✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO! ✅✅✅';
    RAISE NOTICE '';
    RAISE NOTICE 'Sistema ConfiPoints está pronto para uso!';
    RAISE NOTICE '- Fase 1: Sistema de Pontos Base ✅';
    RAISE NOTICE '- Fase 2: Sistema de Economia ✅';
    RAISE NOTICE '- Fase 3: Sistema Anti-Fraude ✅';
  ELSE
    RAISE WARNING '⚠️ Instalação pode estar incompleta. Verifique os erros acima.';
  END IF;
END $$;

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'PRÓXIMOS PASSOS:';
  RAISE NOTICE '1. Execute: npm run build';
  RAISE NOTICE '2. Teste o sistema';
  RAISE NOTICE '3. Faça deploy!';
  RAISE NOTICE '=========================================';
END $$;
