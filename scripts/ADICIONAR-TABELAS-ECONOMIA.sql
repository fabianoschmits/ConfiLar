-- =====================================================
-- ADICIONAR TABELAS DO SISTEMA DE ECONOMIA (FASE 2)
-- =====================================================

-- 1. CRIAR TABELA points_packages
CREATE TABLE IF NOT EXISTS points_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  points_amount INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  bonus_points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR TABELA points_purchases
CREATE TABLE IF NOT EXISTS points_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES points_packages(id),
  points_amount INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. CRIAR TABELA points_withdrawals
CREATE TABLE IF NOT EXISTS points_withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_amount INTEGER NOT NULL,
  withdrawal_method VARCHAR(50) NOT NULL,
  account_details JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id)
);

-- 4. CRIAR TABELA points_transfers
CREATE TABLE IF NOT EXISTS points_transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_amount INTEGER NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. CRIAR TABELA points_store_items
CREATE TABLE IF NOT EXISTS points_store_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  points_price INTEGER NOT NULL,
  item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('badge', 'title', 'feature', 'item')),
  item_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  stock_quantity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CRIAR TABELA points_store_purchases
CREATE TABLE IF NOT EXISTS points_store_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES points_store_items(id),
  points_cost INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- 7. CRIAR TABELA points_system_config
CREATE TABLE IF NOT EXISTS points_system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. INSERIR DADOS PADRÃO PARA PACOTES DE PONTOS
INSERT INTO points_packages (name, description, points_amount, price_cents, bonus_points, is_active, is_featured) VALUES
  ('Pacote Básico', '100 pontos para começar', 100, 1000, 0, true, false),
  ('Pacote Popular', '500 pontos com bônus', 500, 4500, 50, true, true),
  ('Pacote Premium', '1000 pontos com bônus', 1000, 8500, 150, true, false),
  ('Pacote VIP', '2500 pontos com bônus', 2500, 20000, 500, true, true),
  ('Pacote Máximo', '5000 pontos com bônus', 5000, 37500, 1250, true, false)
ON CONFLICT DO NOTHING;

-- 9. INSERIR DADOS PADRÃO PARA ITENS DA LOJA
INSERT INTO points_store_items (name, description, points_price, item_type, item_data, is_active, is_featured) VALUES
  ('Badge "Primeiro Passo"', 'Badge especial para novos usuários', 50, 'badge', '{"badge_type": "achievement", "color": "blue"}', true, true),
  ('Título "Iniciante"', 'Título personalizado para o perfil', 100, 'title', '{"title_text": "Iniciante", "color": "green"}', true, false),
  ('Badge "Ativo"', 'Badge para usuários ativos', 200, 'badge', '{"badge_type": "activity", "color": "orange"}', true, false),
  ('Título "Especialista"', 'Título para usuários experientes', 500, 'title', '{"title_text": "Especialista", "color": "purple"}', true, true),
  ('Badge "VIP"', 'Badge exclusivo VIP', 1000, 'badge', '{"badge_type": "vip", "color": "gold"}', true, true),
  ('Título "Lenda"', 'Título lendário', 2000, 'title', '{"title_text": "Lenda", "color": "rainbow"}', true, false)
ON CONFLICT DO NOTHING;

-- 10. INSERIR CONFIGURAÇÕES DO SISTEMA
INSERT INTO points_system_config (config_key, config_value, description, is_active) VALUES
  ('min_withdrawal_points', '{"value": 100}', 'Pontos mínimos para saque', true),
  ('withdrawal_fee_percentage', '{"value": 5}', 'Taxa de saque em percentual', true),
  ('min_transfer_points', '{"value": 10}', 'Pontos mínimos para transferência', true),
  ('transfer_fee_percentage', '{"value": 2}', 'Taxa de transferência em percentual', true),
  ('daily_login_bonus', '{"value": 5}', 'Bônus de login diário', true),
  ('referral_bonus', '{"value": 50}', 'Bônus por indicação', true)
ON CONFLICT (config_key) DO NOTHING;

-- 11. CONFIGURAR RLS PARA points_packages
ALTER TABLE points_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active points packages" ON points_packages;
CREATE POLICY "Anyone can view active points packages"
  ON points_packages FOR SELECT
  USING (is_active = true);

-- 12. CONFIGURAR RLS PARA points_purchases
ALTER TABLE points_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchases" ON points_purchases;
CREATE POLICY "Users can view own purchases"
  ON points_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- 13. CONFIGURAR RLS PARA points_withdrawals
ALTER TABLE points_withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own withdrawals" ON points_withdrawals;
CREATE POLICY "Users can view own withdrawals"
  ON points_withdrawals FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create withdrawals" ON points_withdrawals;
CREATE POLICY "Users can create withdrawals"
  ON points_withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 14. CONFIGURAR RLS PARA points_transfers
ALTER TABLE points_transfers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transfers" ON points_transfers;
CREATE POLICY "Users can view own transfers"
  ON points_transfers FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

DROP POLICY IF EXISTS "Users can create transfers" ON points_transfers;
CREATE POLICY "Users can create transfers"
  ON points_transfers FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- 15. CONFIGURAR RLS PARA points_store_items
ALTER TABLE points_store_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active store items" ON points_store_items;
CREATE POLICY "Anyone can view active store items"
  ON points_store_items FOR SELECT
  USING (is_active = true);

-- 16. CONFIGURAR RLS PARA points_store_purchases
ALTER TABLE points_store_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own store purchases" ON points_store_purchases;
CREATE POLICY "Users can view own store purchases"
  ON points_store_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- 17. CONFIGURAR RLS PARA points_system_config
ALTER TABLE points_system_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view system config" ON points_system_config;
CREATE POLICY "Anyone can view system config"
  ON points_system_config FOR SELECT
  USING (is_active = true);

-- 18. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_points_purchases_user_id ON points_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_points_purchases_status ON points_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_points_withdrawals_user_id ON points_withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_points_withdrawals_status ON points_withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_points_transfers_from_user ON points_transfers(from_user_id);
CREATE INDEX IF NOT EXISTS idx_points_transfers_to_user ON points_transfers(to_user_id);
CREATE INDEX IF NOT EXISTS idx_points_transfers_status ON points_transfers(status);
CREATE INDEX IF NOT EXISTS idx_points_store_purchases_user_id ON points_store_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_points_store_purchases_item_id ON points_store_purchases(item_id);
CREATE INDEX IF NOT EXISTS idx_points_store_purchases_active ON points_store_purchases(is_active);
