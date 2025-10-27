-- =====================================================
-- VERIFICAR E CORRIGIR ESTRUTURA DAS TABELAS
-- =====================================================

-- 1. VERIFICAR ESTRUTURA ATUAL DE points_packages
DO $$ 
BEGIN
  RAISE NOTICE 'Verificando estrutura de points_packages...';
  
  -- Verificar se a tabela existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_packages') THEN
    RAISE NOTICE '✅ Tabela points_packages existe';
    
    -- Verificar colunas existentes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_packages' AND column_name = 'points_amount') THEN
      RAISE NOTICE '✅ Coluna points_amount existe';
    ELSE
      RAISE NOTICE '❌ Coluna points_amount NÃO existe - será adicionada';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_packages' AND column_name = 'price_cents') THEN
      RAISE NOTICE '✅ Coluna price_cents existe';
    ELSE
      RAISE NOTICE '❌ Coluna price_cents NÃO existe - será adicionada';
    END IF;
    
  ELSE
    RAISE NOTICE '❌ Tabela points_packages NÃO existe - será criada';
  END IF;
END $$;

-- 2. ADICIONAR COLUNAS FALTANDO EM points_packages
DO $$ 
BEGIN
  RAISE NOTICE 'Adicionando colunas faltando em points_packages...';
  
  -- Adicionar points_amount se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_packages' AND column_name = 'points_amount') THEN
    ALTER TABLE points_packages ADD COLUMN points_amount INTEGER NOT NULL DEFAULT 0;
    RAISE NOTICE '✅ Coluna points_amount adicionada';
  END IF;
  
  -- Adicionar price_cents se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_packages' AND column_name = 'price_cents') THEN
    ALTER TABLE points_packages ADD COLUMN price_cents INTEGER NOT NULL DEFAULT 0;
    RAISE NOTICE '✅ Coluna price_cents adicionada';
  END IF;
  
  -- Adicionar description se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_packages' AND column_name = 'description') THEN
    ALTER TABLE points_packages ADD COLUMN description TEXT;
    RAISE NOTICE '✅ Coluna description adicionada';
  END IF;
  
  -- Adicionar bonus_points se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_packages' AND column_name = 'bonus_points') THEN
    ALTER TABLE points_packages ADD COLUMN bonus_points INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Coluna bonus_points adicionada';
  END IF;
  
  -- Adicionar is_featured se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_packages' AND column_name = 'is_featured') THEN
    ALTER TABLE points_packages ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    RAISE NOTICE '✅ Coluna is_featured adicionada';
  END IF;
  
  -- Adicionar updated_at se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_packages' AND column_name = 'updated_at') THEN
    ALTER TABLE points_packages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE '✅ Coluna updated_at adicionada';
  END IF;
END $$;

-- 3. VERIFICAR E ADICIONAR COLUNAS EM OUTRAS TABELAS
DO $$ 
BEGIN
  RAISE NOTICE 'Verificando outras tabelas...';
  
  -- points_purchases
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_purchases') THEN
    RAISE NOTICE '✅ Tabela points_purchases existe';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_purchases' AND column_name = 'payment_method') THEN
      ALTER TABLE points_purchases ADD COLUMN payment_method VARCHAR(50);
      RAISE NOTICE '✅ Coluna payment_method adicionada em points_purchases';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_purchases' AND column_name = 'payment_id') THEN
      ALTER TABLE points_purchases ADD COLUMN payment_id VARCHAR(255);
      RAISE NOTICE '✅ Coluna payment_id adicionada em points_purchases';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_purchases' AND column_name = 'completed_at') THEN
      ALTER TABLE points_purchases ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
      RAISE NOTICE '✅ Coluna completed_at adicionada em points_purchases';
    END IF;
  END IF;
  
  -- points_withdrawals
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_withdrawals') THEN
    RAISE NOTICE '✅ Tabela points_withdrawals existe';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_withdrawals' AND column_name = 'admin_notes') THEN
      ALTER TABLE points_withdrawals ADD COLUMN admin_notes TEXT;
      RAISE NOTICE '✅ Coluna admin_notes adicionada em points_withdrawals';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_withdrawals' AND column_name = 'processed_by') THEN
      ALTER TABLE points_withdrawals ADD COLUMN processed_by UUID REFERENCES auth.users(id);
      RAISE NOTICE '✅ Coluna processed_by adicionada em points_withdrawals';
    END IF;
  END IF;
  
  -- points_transfers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_transfers') THEN
    RAISE NOTICE '✅ Tabela points_transfers existe';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_transfers' AND column_name = 'message') THEN
      ALTER TABLE points_transfers ADD COLUMN message TEXT;
      RAISE NOTICE '✅ Coluna message adicionada em points_transfers';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_transfers' AND column_name = 'expires_at') THEN
      ALTER TABLE points_transfers ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days');
      RAISE NOTICE '✅ Coluna expires_at adicionada em points_transfers';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_transfers' AND column_name = 'completed_at') THEN
      ALTER TABLE points_transfers ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
      RAISE NOTICE '✅ Coluna completed_at adicionada em points_transfers';
    END IF;
  END IF;
  
  -- points_store_items
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_store_items') THEN
    RAISE NOTICE '✅ Tabela points_store_items existe';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_store_items' AND column_name = 'item_data') THEN
      ALTER TABLE points_store_items ADD COLUMN item_data JSONB DEFAULT '{}'::jsonb;
      RAISE NOTICE '✅ Coluna item_data adicionada em points_store_items';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_store_items' AND column_name = 'is_featured') THEN
      ALTER TABLE points_store_items ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
      RAISE NOTICE '✅ Coluna is_featured adicionada em points_store_items';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_store_items' AND column_name = 'stock_quantity') THEN
      ALTER TABLE points_store_items ADD COLUMN stock_quantity INTEGER;
      RAISE NOTICE '✅ Coluna stock_quantity adicionada em points_store_items';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_store_items' AND column_name = 'updated_at') THEN
      ALTER TABLE points_store_items ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      RAISE NOTICE '✅ Coluna updated_at adicionada em points_store_items';
    END IF;
  END IF;
  
  -- points_store_purchases
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_store_purchases') THEN
    RAISE NOTICE '✅ Tabela points_store_purchases existe';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_store_purchases' AND column_name = 'is_active') THEN
      ALTER TABLE points_store_purchases ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
      RAISE NOTICE '✅ Coluna is_active adicionada em points_store_purchases';
    END IF;
  END IF;
  
  -- points_system_config
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_system_config') THEN
    RAISE NOTICE '✅ Tabela points_system_config existe';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_system_config' AND column_name = 'description') THEN
      ALTER TABLE points_system_config ADD COLUMN description TEXT;
      RAISE NOTICE '✅ Coluna description adicionada em points_system_config';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_system_config' AND column_name = 'updated_at') THEN
      ALTER TABLE points_system_config ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      RAISE NOTICE '✅ Coluna updated_at adicionada em points_system_config';
    END IF;
  END IF;
END $$;

-- 4. INSERIR DADOS PADRÃO PARA PACOTES DE PONTOS
INSERT INTO points_packages (name, description, points_amount, price_cents, bonus_points, is_active, is_featured) VALUES
  ('Pacote Básico', '100 pontos para começar', 100, 1000, 0, true, false),
  ('Pacote Popular', '500 pontos com bônus', 500, 4500, 50, true, true),
  ('Pacote Premium', '1000 pontos com bônus', 1000, 8500, 150, true, false),
  ('Pacote VIP', '2500 pontos com bônus', 2500, 20000, 500, true, true),
  ('Pacote Máximo', '5000 pontos com bônus', 5000, 37500, 1250, true, false)
ON CONFLICT DO NOTHING;

-- 5. INSERIR DADOS PADRÃO PARA ITENS DA LOJA
INSERT INTO points_store_items (name, description, points_price, item_type, item_data, is_active, is_featured) VALUES
  ('Badge "Primeiro Passo"', 'Badge especial para novos usuários', 50, 'badge', '{"badge_type": "achievement", "color": "blue"}', true, true),
  ('Título "Iniciante"', 'Título personalizado para o perfil', 100, 'title', '{"title_text": "Iniciante", "color": "green"}', true, false),
  ('Badge "Ativo"', 'Badge para usuários ativos', 200, 'badge', '{"badge_type": "activity", "color": "orange"}', true, false),
  ('Título "Especialista"', 'Título para usuários experientes', 500, 'title', '{"title_text": "Especialista", "color": "purple"}', true, true),
  ('Badge "VIP"', 'Badge exclusivo VIP', 1000, 'badge', '{"badge_type": "vip", "color": "gold"}', true, true),
  ('Título "Lenda"', 'Título lendário', 2000, 'title', '{"title_text": "Lenda", "color": "rainbow"}', true, false)
ON CONFLICT DO NOTHING;

-- 6. INSERIR CONFIGURAÇÕES DO SISTEMA
INSERT INTO points_system_config (config_key, config_value, description, is_active) VALUES
  ('min_withdrawal_points', '{"value": 100}', 'Pontos mínimos para saque', true),
  ('withdrawal_fee_percentage', '{"value": 5}', 'Taxa de saque em percentual', true),
  ('min_transfer_points', '{"value": 10}', 'Pontos mínimos para transferência', true),
  ('transfer_fee_percentage', '{"value": 2}', 'Taxa de transferência em percentual', true),
  ('daily_login_bonus', '{"value": 5}', 'Bônus de login diário', true),
  ('referral_bonus', '{"value": 50}', 'Bônus por indicação', true)
ON CONFLICT (config_key) DO NOTHING;

-- 7. CONFIGURAR RLS PARA TODAS AS TABELAS
DO $$ 
BEGIN
  RAISE NOTICE 'Configurando RLS...';
  
  -- points_packages
  ALTER TABLE points_packages ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Anyone can view active points packages" ON points_packages;
  CREATE POLICY "Anyone can view active points packages"
    ON points_packages FOR SELECT
    USING (is_active = true);
  
  -- points_purchases
  ALTER TABLE points_purchases ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Users can view own purchases" ON points_purchases;
  CREATE POLICY "Users can view own purchases"
    ON points_purchases FOR SELECT
    USING (auth.uid() = user_id);
  
  -- points_withdrawals
  ALTER TABLE points_withdrawals ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Users can view own withdrawals" ON points_withdrawals;
  CREATE POLICY "Users can view own withdrawals"
    ON points_withdrawals FOR SELECT
    USING (auth.uid() = user_id);
  
  DROP POLICY IF EXISTS "Users can create withdrawals" ON points_withdrawals;
  CREATE POLICY "Users can create withdrawals"
    ON points_withdrawals FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  
  -- points_transfers
  ALTER TABLE points_transfers ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Users can view own transfers" ON points_transfers;
  CREATE POLICY "Users can view own transfers"
    ON points_transfers FOR SELECT
    USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
  
  DROP POLICY IF EXISTS "Users can create transfers" ON points_transfers;
  CREATE POLICY "Users can create transfers"
    ON points_transfers FOR INSERT
    WITH CHECK (auth.uid() = from_user_id);
  
  -- points_store_items
  ALTER TABLE points_store_items ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Anyone can view active store items" ON points_store_items;
  CREATE POLICY "Anyone can view active store items"
    ON points_store_items FOR SELECT
    USING (is_active = true);
  
  -- points_store_purchases
  ALTER TABLE points_store_purchases ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Users can view own store purchases" ON points_store_purchases;
  CREATE POLICY "Users can view own store purchases"
    ON points_store_purchases FOR SELECT
    USING (auth.uid() = user_id);
  
  -- points_system_config
  ALTER TABLE points_system_config ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Anyone can view system config" ON points_system_config;
  CREATE POLICY "Anyone can view system config"
    ON points_system_config FOR SELECT
    USING (is_active = true);
  
  RAISE NOTICE '✅ RLS configurado para todas as tabelas';
END $$;

-- 8. CRIAR ÍNDICES PARA PERFORMANCE
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

-- 9. VERIFICAÇÃO FINAL
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICAÇÃO FINAL:';
  RAISE NOTICE '========================================';
  
  -- Verificar tabelas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_packages') THEN
    RAISE NOTICE '✅ points_packages: OK';
  ELSE
    RAISE NOTICE '❌ points_packages: FALTANDO';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_purchases') THEN
    RAISE NOTICE '✅ points_purchases: OK';
  ELSE
    RAISE NOTICE '❌ points_purchases: FALTANDO';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_withdrawals') THEN
    RAISE NOTICE '✅ points_withdrawals: OK';
  ELSE
    RAISE NOTICE '❌ points_withdrawals: FALTANDO';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_transfers') THEN
    RAISE NOTICE '✅ points_transfers: OK';
  ELSE
    RAISE NOTICE '❌ points_transfers: FALTANDO';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_store_items') THEN
    RAISE NOTICE '✅ points_store_items: OK';
  ELSE
    RAISE NOTICE '❌ points_store_items: FALTANDO';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_store_purchases') THEN
    RAISE NOTICE '✅ points_store_purchases: OK';
  ELSE
    RAISE NOTICE '❌ points_store_purchases: FALTANDO';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_system_config') THEN
    RAISE NOTICE '✅ points_system_config: OK';
  ELSE
    RAISE NOTICE '❌ points_system_config: FALTANDO';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CORREÇÃO COMPLETA FINALIZADA!';
  RAISE NOTICE '========================================';
END $$;
