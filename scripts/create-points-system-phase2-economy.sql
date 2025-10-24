-- ============================================
-- SISTEMA DE PONTOS - FASE 2 (ECONOMIA)
-- ============================================
-- Este script implementa o sistema de economia completo
-- incluindo compra, saque e transferência de pontos

-- ============================================
-- 1. TABELA DE PACOTES DE PONTOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.points_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informações do Pacote
  name VARCHAR(50) NOT NULL,
  description TEXT,
  slug VARCHAR(50) NOT NULL UNIQUE,
  
  -- Preços e Valores
  price_brl DECIMAL(10, 2) NOT NULL, -- Preço em reais
  points INTEGER NOT NULL, -- Quantidade de pontos base
  bonus_percentage INTEGER DEFAULT 0, -- % de bônus
  total_points INTEGER GENERATED ALWAYS AS (points + (points * bonus_percentage / 100)) STORED,
  
  -- Configurações
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE, -- Destaque
  sort_order INTEGER DEFAULT 0,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_packages_active ON public.points_packages(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_packages_featured ON public.points_packages(is_featured) WHERE is_featured = TRUE;

-- Inserir pacotes padrão
INSERT INTO public.points_packages (name, description, slug, price_brl, points, bonus_percentage, is_featured, sort_order) VALUES
  ('Starter', 'Pacote inicial para começar', 'starter', 10.00, 1000, 0, FALSE, 1),
  ('Basic', 'Pacote básico com bônus', 'basic', 25.00, 2500, 10, FALSE, 2),
  ('Plus', 'Pacote popular com bom bônus', 'plus', 50.00, 5000, 20, TRUE, 3),
  ('Pro', 'Pacote profissional com ótimo bônus', 'pro', 100.00, 10000, 30, TRUE, 4),
  ('Premium', 'Pacote premium com máximo bônus', 'premium', 250.00, 25000, 40, TRUE, 5)
ON CONFLICT (slug) DO UPDATE SET
  price_brl = EXCLUDED.price_brl,
  points = EXCLUDED.points,
  bonus_percentage = EXCLUDED.bonus_percentage,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- ============================================
-- 2. TABELA DE COMPRAS DE PONTOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.points_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.points_packages(id) ON DELETE SET NULL,
  
  -- Valores
  amount_brl DECIMAL(10, 2) NOT NULL,
  points_received INTEGER NOT NULL,
  
  -- Pagamento
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('pix', 'card', 'boleto')),
  payment_id VARCHAR(255), -- ID do gateway de pagamento
  payment_url TEXT, -- URL do pagamento (PIX, boleto, etc)
  qr_code TEXT, -- QR Code do PIX
  qr_code_base64 TEXT, -- QR Code em base64
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'cancelled', 'refunded')),
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.points_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.points_purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_id ON public.points_purchases(payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_purchases_created ON public.points_purchases(created_at DESC);

-- ============================================
-- 3. TABELA DE SAQUES DE PONTOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.points_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Valores
  points_amount INTEGER NOT NULL,
  brl_amount DECIMAL(10, 2) NOT NULL, -- Valor bruto em reais
  fee_percentage INTEGER NOT NULL DEFAULT 10,
  fee_amount DECIMAL(10, 2) NOT NULL, -- Taxa em reais
  net_amount DECIMAL(10, 2) NOT NULL, -- Valor líquido
  
  -- Informações de Saque
  pix_key VARCHAR(255) NOT NULL,
  pix_key_type VARCHAR(20) CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'completed', 'cancelled')),
  
  -- Admin
  admin_notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON public.points_withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.points_withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created ON public.points_withdrawals(created_at DESC);

-- ============================================
-- 4. TABELA DE TRANSFERÊNCIAS DE PONTOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.points_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Usuários
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Valores
  points_amount INTEGER NOT NULL,
  fee_percentage INTEGER NOT NULL DEFAULT 5,
  fee_amount INTEGER NOT NULL, -- Taxa em pontos
  net_amount INTEGER NOT NULL, -- Líquido recebido
  
  -- Informações
  message TEXT,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled', 'reversed')),
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT no_self_transfer CHECK (from_user_id != to_user_id),
  CONSTRAINT positive_amount CHECK (points_amount > 0)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_transfers_from ON public.points_transfers(from_user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to ON public.points_transfers(to_user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_created ON public.points_transfers(created_at DESC);

-- ============================================
-- 5. TABELA DE ITENS DA LOJA
-- ============================================

CREATE TABLE IF NOT EXISTS public.points_store_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informações
  name VARCHAR(100) NOT NULL,
  description TEXT,
  slug VARCHAR(100) NOT NULL UNIQUE,
  
  -- Categoria
  category VARCHAR(50) NOT NULL CHECK (category IN ('badge', 'feature', 'highlight', 'verification', 'boost')),
  
  -- Preço e Duração
  points_price INTEGER NOT NULL,
  duration_days INTEGER, -- NULL = permanente
  
  -- Configurações
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  stock INTEGER, -- NULL = ilimitado
  max_per_user INTEGER, -- NULL = ilimitado
  
  -- Visual
  icon TEXT,
  color TEXT,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_store_items_active ON public.points_store_items(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_store_items_category ON public.points_store_items(category);

-- Inserir itens padrão
INSERT INTO public.points_store_items (name, description, slug, category, points_price, duration_days, icon, color) VALUES
  ('Badge Especial', 'Badge exclusivo para seu perfil', 'badge-special', 'badge', 5000, NULL, 'shield', '#FFD700'),
  ('Anúncio em Destaque', 'Destaque seu anúncio por 7 dias', 'highlight-7d', 'highlight', 7000, 7, 'star', '#FF6B6B'),
  ('Anúncio em Destaque (30 dias)', 'Destaque seu anúncio por 30 dias', 'highlight-30d', 'highlight', 25000, 30, 'star', '#FF6B6B'),
  ('Post Fixado', 'Fixe seu post no topo por 7 dias', 'post-pinned-7d', 'boost', 3500, 7, 'pin', '#4ECDC4'),
  ('Perfil Verificado Premium', 'Selo de verificação premium', 'verified-premium', 'verification', 10000, NULL, 'check-circle', '#00D9FF')
ON CONFLICT (slug) DO UPDATE SET
  points_price = EXCLUDED.points_price,
  duration_days = EXCLUDED.duration_days,
  updated_at = NOW();

-- ============================================
-- 6. TABELA DE COMPRAS NA LOJA
-- ============================================

CREATE TABLE IF NOT EXISTS public.points_store_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.points_store_items(id) ON DELETE CASCADE,
  
  -- Valores
  points_spent INTEGER NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL = permanente
  used_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_store_purchases_user ON public.points_store_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_store_purchases_item ON public.points_store_purchases(item_id);
CREATE INDEX IF NOT EXISTS idx_store_purchases_active ON public.points_store_purchases(is_active) WHERE is_active = TRUE;

-- ============================================
-- 7. TABELA DE CONFIGURAÇÕES DO SISTEMA
-- ============================================

CREATE TABLE IF NOT EXISTS public.points_system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(50) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO public.points_system_config (key, value, description) VALUES
  ('conversion_rate', '{"brl_to_points": 100, "points_to_brl": 0.01}'::jsonb, 'Taxa de conversão entre reais e pontos'),
  ('withdrawal_fee', '{"percentage": 10, "minimum": 0}'::jsonb, 'Taxa de saque'),
  ('withdrawal_limits', '{"min_points": 10000, "max_points_daily": 100000, "max_points_monthly": 500000}'::jsonb, 'Limites de saque'),
  ('transfer_fee', '{"percentage": 5, "minimum": 10}'::jsonb, 'Taxa de transferência'),
  ('transfer_limits', '{"min_points": 100, "max_points_daily": 50000}'::jsonb, 'Limites de transferência')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- ============================================
-- 8. FUNÇÕES PARA ECONOMIA
-- ============================================

-- Função para criar compra de pontos
CREATE OR REPLACE FUNCTION create_points_purchase(
  p_user_id UUID,
  p_package_id UUID,
  p_payment_method VARCHAR
)
RETURNS UUID AS $$
DECLARE
  v_purchase_id UUID;
  v_package RECORD;
BEGIN
  -- Buscar pacote
  SELECT * INTO v_package
  FROM public.points_packages
  WHERE id = p_package_id AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pacote não encontrado ou inativo';
  END IF;
  
  -- Criar compra
  INSERT INTO public.points_purchases (
    user_id,
    package_id,
    amount_brl,
    points_received,
    payment_method,
    status,
    expires_at
  ) VALUES (
    p_user_id,
    p_package_id,
    v_package.price_brl,
    v_package.total_points,
    p_payment_method,
    'pending',
    NOW() + INTERVAL '30 minutes'
  ) RETURNING id INTO v_purchase_id;
  
  RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql;

-- Função para aprovar compra
CREATE OR REPLACE FUNCTION approve_points_purchase(p_purchase_id UUID)
RETURNS VOID AS $$
DECLARE
  v_purchase RECORD;
BEGIN
  -- Buscar compra
  SELECT * INTO v_purchase
  FROM public.points_purchases
  WHERE id = p_purchase_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Compra não encontrada ou já processada';
  END IF;
  
  -- Adicionar pontos ao usuário
  PERFORM add_points(
    v_purchase.user_id,
    'purchase',
    'Compra de pontos aprovada',
    jsonb_build_object('purchase_id', p_purchase_id, 'amount_brl', v_purchase.amount_brl)
  );
  
  -- Atualizar status da compra
  UPDATE public.points_purchases
  SET 
    status = 'approved',
    approved_at = NOW()
  WHERE id = p_purchase_id;
END;
$$ LANGUAGE plpgsql;

-- Função para criar saque
CREATE OR REPLACE FUNCTION create_withdrawal(
  p_user_id UUID,
  p_points_amount INTEGER,
  p_pix_key VARCHAR,
  p_pix_key_type VARCHAR
)
RETURNS UUID AS $$
DECLARE
  v_withdrawal_id UUID;
  v_user_balance INTEGER;
  v_brl_amount DECIMAL;
  v_fee_config JSONB;
  v_fee_amount DECIMAL;
  v_net_amount DECIMAL;
  v_limits JSONB;
BEGIN
  -- Verificar saldo
  SELECT points_balance INTO v_user_balance
  FROM public.profiles
  WHERE id = p_user_id;
  
  IF v_user_balance < p_points_amount THEN
    RAISE EXCEPTION 'Saldo insuficiente';
  END IF;
  
  -- Buscar configurações
  SELECT value INTO v_limits
  FROM public.points_system_config
  WHERE key = 'withdrawal_limits';
  
  IF p_points_amount < (v_limits->>'min_points')::INTEGER THEN
    RAISE EXCEPTION 'Valor mínimo de saque: % pontos', v_limits->>'min_points';
  END IF;
  
  SELECT value INTO v_fee_config
  FROM public.points_system_config
  WHERE key = 'withdrawal_fee';
  
  -- Calcular valores
  v_brl_amount := p_points_amount * 0.01;
  v_fee_amount := v_brl_amount * (v_fee_config->>'percentage')::INTEGER / 100;
  v_net_amount := v_brl_amount - v_fee_amount;
  
  -- Remover pontos do usuário
  PERFORM add_points(
    p_user_id,
    'withdrawal',
    'Solicitação de saque',
    jsonb_build_object('points', p_points_amount, 'brl_amount', v_brl_amount)
  );
  
  -- Criar saque
  INSERT INTO public.points_withdrawals (
    user_id,
    points_amount,
    brl_amount,
    fee_percentage,
    fee_amount,
    net_amount,
    pix_key,
    pix_key_type,
    status
  ) VALUES (
    p_user_id,
    p_points_amount,
    v_brl_amount,
    (v_fee_config->>'percentage')::INTEGER,
    v_fee_amount,
    v_net_amount,
    p_pix_key,
    p_pix_key_type,
    'pending'
  ) RETURNING id INTO v_withdrawal_id;
  
  RETURN v_withdrawal_id;
END;
$$ LANGUAGE plpgsql;

-- Função para transferir pontos
CREATE OR REPLACE FUNCTION transfer_points(
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_points_amount INTEGER,
  p_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_transfer_id UUID;
  v_from_balance INTEGER;
  v_fee_config JSONB;
  v_fee_amount INTEGER;
  v_net_amount INTEGER;
BEGIN
  -- Validar usuários diferentes
  IF p_from_user_id = p_to_user_id THEN
    RAISE EXCEPTION 'Não é possível transferir para si mesmo';
  END IF;
  
  -- Verificar saldo
  SELECT points_balance INTO v_from_balance
  FROM public.profiles
  WHERE id = p_from_user_id;
  
  IF v_from_balance < p_points_amount THEN
    RAISE EXCEPTION 'Saldo insuficiente';
  END IF;
  
  -- Buscar configurações
  SELECT value INTO v_fee_config
  FROM public.points_system_config
  WHERE key = 'transfer_fee';
  
  -- Calcular valores
  v_fee_amount := GREATEST(
    p_points_amount * (v_fee_config->>'percentage')::INTEGER / 100,
    (v_fee_config->>'minimum')::INTEGER
  );
  v_net_amount := p_points_amount - v_fee_amount;
  
  -- Remover pontos do remetente
  PERFORM add_points(
    p_from_user_id,
    'transfer_out',
    'Transferência enviada',
    jsonb_build_object('to_user_id', p_to_user_id, 'points', p_points_amount, 'fee', v_fee_amount)
  );
  
  -- Adicionar pontos ao destinatário
  PERFORM add_points(
    p_to_user_id,
    'transfer_in',
    'Transferência recebida',
    jsonb_build_object('from_user_id', p_from_user_id, 'points', v_net_amount)
  );
  
  -- Criar registro de transferência
  INSERT INTO public.points_transfers (
    from_user_id,
    to_user_id,
    points_amount,
    fee_percentage,
    fee_amount,
    net_amount,
    message,
    status
  ) VALUES (
    p_from_user_id,
    p_to_user_id,
    p_points_amount,
    (v_fee_config->>'percentage')::INTEGER,
    v_fee_amount,
    v_net_amount,
    p_message,
    'completed'
  ) RETURNING id INTO v_transfer_id;
  
  RETURN v_transfer_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.points_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_store_purchases ENABLE ROW LEVEL SECURITY;

-- Policies para points_packages (todos podem ver ativos)
DROP POLICY IF EXISTS "Anyone can view active packages" ON public.points_packages;
CREATE POLICY "Anyone can view active packages" ON public.points_packages
  FOR SELECT TO authenticated
  USING (is_active = TRUE);

-- Policies para points_purchases
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.points_purchases;
CREATE POLICY "Users can view their own purchases" ON public.points_purchases
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Policies para points_withdrawals
DROP POLICY IF EXISTS "Users can view their own withdrawals" ON public.points_withdrawals;
CREATE POLICY "Users can view their own withdrawals" ON public.points_withdrawals
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Policies para points_transfers
DROP POLICY IF EXISTS "Users can view their transfers" ON public.points_transfers;
CREATE POLICY "Users can view their transfers" ON public.points_transfers
  FOR SELECT TO authenticated
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- Policies para points_store_items (todos podem ver ativos)
DROP POLICY IF EXISTS "Anyone can view active store items" ON public.points_store_items;
CREATE POLICY "Anyone can view active store items" ON public.points_store_items
  FOR SELECT TO authenticated
  USING (is_active = TRUE);

-- Policies para points_store_purchases
DROP POLICY IF EXISTS "Users can view their store purchases" ON public.points_store_purchases;
CREATE POLICY "Users can view their store purchases" ON public.points_store_purchases
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- 10. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE public.points_packages IS 'Pacotes de pontos disponíveis para compra';
COMMENT ON TABLE public.points_purchases IS 'Histórico de compras de pontos';
COMMENT ON TABLE public.points_withdrawals IS 'Solicitações de saque de pontos';
COMMENT ON TABLE public.points_transfers IS 'Transferências de pontos entre usuários';
COMMENT ON TABLE public.points_store_items IS 'Itens disponíveis na loja premium';
COMMENT ON TABLE public.points_store_purchases IS 'Compras realizadas na loja premium';

COMMENT ON FUNCTION create_points_purchase IS 'Cria uma nova compra de pontos';
COMMENT ON FUNCTION approve_points_purchase IS 'Aprova uma compra de pontos e adiciona ao saldo';
COMMENT ON FUNCTION create_withdrawal IS 'Cria uma solicitação de saque';
COMMENT ON FUNCTION transfer_points IS 'Transfere pontos entre usuários';

-- ============================================
-- SISTEMA DE PONTOS FASE 2 - ECONOMIA IMPLEMENTADA! 🎉
-- ============================================
