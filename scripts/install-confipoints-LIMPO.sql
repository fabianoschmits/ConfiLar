-- ============================================
-- INSTALAÇÃO LIMPA CONFIPOINTS
-- ============================================
-- Este script DROPA tudo e recria do zero
-- Use APENAS se quiser reinstalar completamente
-- ============================================

DO $$ BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'INSTALAÇÃO LIMPA - DROPANDO TUDO ANTES';
  RAISE NOTICE '===========================================';
END $$;

-- DROPAR TUDO NA ORDEM CORRETA (dependências primeiro)
DROP TABLE IF EXISTS public.point_locks CASCADE;
DROP TABLE IF EXISTS public.fraud_detection CASCADE;
DROP TABLE IF EXISTS public.user_verification CASCADE;
DROP TABLE IF EXISTS public.points_store_purchases CASCADE;
DROP TABLE IF EXISTS public.points_store_items CASCADE;
DROP TABLE IF EXISTS public.points_transfers CASCADE;
DROP TABLE IF EXISTS public.points_withdrawals CASCADE;
DROP TABLE IF EXISTS public.points_purchases CASCADE;
DROP TABLE IF EXISTS public.points_packages CASCADE;
DROP TABLE IF EXISTS public.user_points_balance CASCADE;
DROP TABLE IF EXISTS public.points_config CASCADE;
DROP TABLE IF EXISTS public.point_transactions CASCADE;

-- Dropar funções
DROP FUNCTION IF EXISTS public.add_points(UUID, INTEGER, VARCHAR, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.deduct_points(UUID, INTEGER, VARCHAR, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_points_balance(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.create_withdrawal(UUID, INTEGER, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.transfer_points(UUID, UUID, INTEGER, TEXT) CASCADE;

DO $$ BEGIN
  RAISE NOTICE 'Tabelas e funções antigas removidas!';
  RAISE NOTICE '';
END $$;

-- ============================================
-- AGORA CRIAR TUDO NOVAMENTE
-- ============================================

DO $$ BEGIN
  RAISE NOTICE '[1/3] Criando Sistema de Pontos Base...';
END $$;

-- Expandir profiles (se ainda não tiver)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS points_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS user_level VARCHAR(20) DEFAULT 'bronze',
ADD COLUMN IF NOT EXISTS daily_points_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_daily_reset DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS total_points_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_points_spent INTEGER DEFAULT 0;

-- Tabela de transações
CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'spend', 'transfer', 'purchase', 'refund')),
  source VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  referral_id UUID,
  post_id UUID,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_point_transactions_user_id ON public.point_transactions(user_id);
CREATE INDEX idx_point_transactions_created_at ON public.point_transactions(created_at DESC);
CREATE INDEX idx_point_transactions_type ON public.point_transactions(type);
CREATE INDEX idx_point_transactions_source ON public.point_transactions(source);

ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own point transactions"
  ON public.point_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Tabela de configurações (NOME CORRETO DAS COLUNAS)
CREATE TABLE public.points_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_key VARCHAR(50) UNIQUE NOT NULL,
  points_value INTEGER NOT NULL,
  daily_limit INTEGER,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configurações
INSERT INTO public.points_config (action_key, points_value, daily_limit, description) VALUES
  ('daily_login', 10, 1, 'Login diário'),
  ('profile_complete', 150, 1, 'Completar perfil'),
  ('first_post', 50, 1, 'Primeiro post'),
  ('create_post', 5, 10, 'Criar post'),
  ('create_ad', 100, 10, 'Criar anúncio'),
  ('receive_like', 2, 500, 'Receber curtida'),
  ('give_like', -2, 500, 'Dar curtida'),
  ('receive_comment', 5, 200, 'Receber comentário'),
  ('give_comment', -1, 200, 'Fazer comentário'),
  ('comment', -1, 200, 'Comentar (alias)'),
  ('referral_signup', 200, NULL, 'Indicação cadastrou'),
  ('referral_profile_complete', 150, NULL, 'Indicação completou perfil'),
  ('referral_first_post', 100, NULL, 'Indicação primeiro post'),
  ('referral_first_review', 100, NULL, 'Indicação primeira avaliação'),
  ('referral_active_30days', 300, NULL, 'Indicação ativa 30 dias');

-- Tabela de saldo
CREATE TABLE public.user_points_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0 CHECK (balance >= 0),
  level INTEGER DEFAULT 1,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  locked_balance INTEGER DEFAULT 0,
  available_balance INTEGER DEFAULT 0,
  purchased_balance INTEGER DEFAULT 0,
  last_daily_reset DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_points_balance_user_id ON public.user_points_balance(user_id);
CREATE INDEX idx_user_points_balance_level ON public.user_points_balance(level);

ALTER TABLE public.user_points_balance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own balance"
  ON public.user_points_balance FOR SELECT
  USING (auth.uid() = user_id);

-- Função para adicionar pontos
CREATE FUNCTION public.add_points(
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

-- Função para deduzir pontos
CREATE FUNCTION public.deduct_points(
  p_user_id UUID,
  p_points INTEGER,
  p_source VARCHAR(50),
  p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  SELECT balance INTO v_current_balance 
  FROM public.user_points_balance 
  WHERE user_id = p_user_id;
  
  IF v_current_balance IS NULL OR v_current_balance < p_points THEN
    RAISE EXCEPTION 'Saldo insuficiente';
  END IF;
  
  RETURN public.add_points(p_user_id, -p_points, p_source, p_description, NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar saldo
CREATE FUNCTION public.get_user_points_balance(p_user_id UUID)
RETURNS TABLE (
  balance INTEGER,
  level INTEGER,
  total_earned INTEGER,
  total_spent INTEGER,
  locked_balance INTEGER,
  available_balance INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    upb.balance, 
    upb.level, 
    upb.total_earned, 
    upb.total_spent,
    upb.locked_balance,
    upb.available_balance
  FROM public.user_points_balance upb
  WHERE upb.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View para estatísticas de pontos do usuário
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

DO $$ BEGIN
  RAISE NOTICE '✅ Fase 1 OK!';
END $$;

-- ============================================
-- FASE 2: ECONOMIA
-- ============================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '[2/3] Criando Sistema de Economia...';
END $$;

-- Pacotes
CREATE TABLE public.points_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price_brl DECIMAL(10,2) NOT NULL,
  points INTEGER NOT NULL,
  bonus_percentage DECIMAL(5,2) DEFAULT 0,
  total_points INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.points_packages (name, slug, price_brl, points, bonus_percentage, total_points, is_featured, sort_order) VALUES
  ('Starter', 'starter', 1.00, 100, 0, 100, false, 1),
  ('Basic', 'basic', 5.00, 500, 5, 525, false, 2),
  ('Popular', 'popular', 10.00, 1000, 10, 1100, true, 3),
  ('Pro', 'pro', 50.00, 5000, 15, 5750, false, 4),
  ('Premium', 'premium', 100.00, 10000, 20, 12000, true, 5),
  ('Ultimate', 'ultimate', 500.00, 50000, 25, 62500, false, 6);

-- Compras
CREATE TABLE public.points_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.points_packages(id),
  amount_brl DECIMAL(10,2) NOT NULL,
  points_received INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.points_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own purchases" ON public.points_purchases FOR SELECT USING (auth.uid() = user_id);

-- Saques
CREATE TABLE public.points_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_amount INTEGER NOT NULL CHECK (points_amount >= 10000),
  amount_brl DECIMAL(10,2) NOT NULL,
  fee_brl DECIMAL(10,2) NOT NULL,
  net_amount_brl DECIMAL(10,2) NOT NULL,
  pix_key TEXT NOT NULL,
  pix_key_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.points_withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own withdrawals" ON public.points_withdrawals FOR SELECT USING (auth.uid() = user_id);

-- Transferências
CREATE TABLE public.points_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_amount INTEGER NOT NULL CHECK (points_amount >= 100),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.points_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transfers" ON public.points_transfers FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Loja
CREATE TABLE public.points_store_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  points_price INTEGER NOT NULL,
  duration_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.points_store_items (name, slug, category, points_price, duration_days) VALUES
  ('Badge Bronze', 'badge-bronze', 'badge', 1000, NULL),
  ('Badge Prata', 'badge-prata', 'badge', 2500, NULL),
  ('Destaque 7d', 'boost-7d', 'boost', 2000, 7),
  ('Verificação Premium', 'verify-premium', 'feature', 5000, 30),
  ('Perfil VIP', 'vip-profile', 'feature', 10000, 30);

-- Compras loja
CREATE TABLE public.points_store_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.points_store_items(id),
  points_spent INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

ALTER TABLE public.points_store_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own store purchases" ON public.points_store_purchases FOR SELECT USING (auth.uid() = user_id);

-- Funções
CREATE FUNCTION public.create_withdrawal(
  p_user_id UUID,
  p_points_amount INTEGER,
  p_pix_key TEXT,
  p_pix_key_type TEXT
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.points_withdrawals (user_id, points_amount, amount_brl, fee_brl, net_amount_brl, pix_key, pix_key_type)
  VALUES (p_user_id, p_points_amount, p_points_amount/100.0, p_points_amount/100.0*0.05, p_points_amount/100.0*0.95, p_pix_key, p_pix_key_type)
  RETURNING id INTO v_id;
  
  PERFORM public.deduct_points(p_user_id, p_points_amount, 'withdrawal', 'Saque');
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE FUNCTION public.transfer_points(
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_points_amount INTEGER,
  p_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.points_transfers (from_user_id, to_user_id, points_amount, message)
  VALUES (p_from_user_id, p_to_user_id, p_points_amount, p_message)
  RETURNING id INTO v_id;
  
  PERFORM public.deduct_points(p_from_user_id, p_points_amount, 'transfer_sent', 'Transferência');
  PERFORM public.add_points(p_to_user_id, p_points_amount, 'transfer_received', 'Transferência', NULL);
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  RAISE NOTICE '✅ Fase 2 OK!';
END $$;

-- ============================================
-- FASE 3: ANTI-FRAUDE
-- ============================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '[3/3] Criando Sistema Anti-Fraude...';
END $$;

CREATE TABLE public.user_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_verified BOOLEAN DEFAULT false,
  cpf_verified BOOLEAN DEFAULT false,
  verification_level INTEGER DEFAULT 0,
  unlock_days INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_verification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own verification" ON public.user_verification FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE public.point_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  locked_points INTEGER NOT NULL,
  unlock_date TIMESTAMPTZ NOT NULL,
  is_unlocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.point_locks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own locks" ON public.point_locks FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE public.fraud_detection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  fraud_score INTEGER DEFAULT 0,
  risk_level TEXT DEFAULT 'low',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.fraud_detection ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own fraud status" ON public.fraud_detection FOR SELECT USING (auth.uid() = user_id);

-- Popular tabelas
INSERT INTO public.user_verification (user_id, email_verified, verification_level)
SELECT id, email_confirmed_at IS NOT NULL, CASE WHEN email_confirmed_at IS NOT NULL THEN 1 ELSE 0 END
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.fraud_detection (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

DO $$ BEGIN
  RAISE NOTICE '✅ Fase 3 OK!';
END $$;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

DO $$
DECLARE
  v_tables INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_tables
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN (
    'point_transactions', 'points_config', 'user_points_balance',
    'points_packages', 'points_purchases', 'points_withdrawals',
    'points_transfers', 'points_store_items', 'points_store_purchases',
    'user_verification', 'point_locks', 'fraud_detection'
  );
  
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  IF v_tables = 12 THEN
    RAISE NOTICE '✅✅✅ SUCESSO TOTAL! ✅✅✅';
    RAISE NOTICE '';
    RAISE NOTICE 'Todas as % tabelas criadas!', v_tables;
    RAISE NOTICE 'Sistema 100%% funcional!';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximo: npm run build';
  ELSE
    RAISE WARNING 'Criadas % de 12 tabelas - verifique erros', v_tables;
  END IF;
  RAISE NOTICE '===========================================';
END $$;
