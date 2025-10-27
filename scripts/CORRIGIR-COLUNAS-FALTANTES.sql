-- =====================================================
-- CORRIGIR COLUNAS FALTANTES EM points_packages
-- =====================================================

-- 1. VERIFICAR ESTRUTURA ATUAL DE points_packages
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'points_packages' 
ORDER BY ordinal_position;

-- 2. ADICIONAR COLUNAS FALTANTES EM points_packages
DO $$ 
BEGIN
  RAISE NOTICE 'Adicionando colunas faltantes em points_packages...';
  
  -- Adicionar description se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'points_packages' AND column_name = 'description') THEN
    ALTER TABLE points_packages ADD COLUMN description TEXT;
    RAISE NOTICE '✅ Coluna description adicionada';
  END IF;
  
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

-- 3. ADICIONAR VALOR PADRÃO PARA COLUNA SLUG SE NÃO TIVER
DO $$ 
BEGIN
  -- Verificar se a coluna slug tem valor padrão
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'points_packages' 
    AND column_name = 'slug' 
    AND column_default IS NOT NULL
  ) THEN
    -- Adicionar valor padrão para slug
    ALTER TABLE points_packages ALTER COLUMN slug SET DEFAULT gen_random_uuid()::text;
    RAISE NOTICE '✅ Valor padrão adicionado para coluna slug';
  ELSE
    RAISE NOTICE '✅ Coluna slug já tem valor padrão';
  END IF;
END $$;

-- 4. ATUALIZAR REGISTROS EXISTENTES QUE TÊM SLUG NULL
UPDATE points_packages 
SET slug = gen_random_uuid()::text 
WHERE slug IS NULL;

-- 5. AGORA INSERIR DADOS PADRÃO COM SLUGS ÚNICOS
INSERT INTO points_packages (name, description, points_amount, price_cents, bonus_points, is_active, is_featured, slug) VALUES
  ('Pacote Básico', '100 pontos para começar', 100, 1000, 0, true, false, 'pacote-basico-' || gen_random_uuid()::text),
  ('Pacote Popular', '500 pontos com bônus', 500, 4500, 50, true, true, 'pacote-popular-' || gen_random_uuid()::text),
  ('Pacote Premium', '1000 pontos com bônus', 1000, 8500, 150, true, false, 'pacote-premium-' || gen_random_uuid()::text),
  ('Pacote VIP', '2500 pontos com bônus', 2500, 20000, 500, true, true, 'pacote-vip-' || gen_random_uuid()::text),
  ('Pacote Máximo', '5000 pontos com bônus', 5000, 37500, 1250, true, false, 'pacote-maximo-' || gen_random_uuid()::text)
ON CONFLICT (slug) DO NOTHING;

-- 6. VERIFICAR SE OS DADOS FORAM INSERIDOS
SELECT id, name, slug, points_amount, price_cents FROM points_packages ORDER BY points_amount;

-- 7. INSERIR DADOS PADRÃO PARA ITENS DA LOJA
INSERT INTO points_store_items (name, description, points_price, item_type, item_data, is_active, is_featured) VALUES
  ('Badge "Primeiro Passo"', 'Badge especial para novos usuários', 50, 'badge', '{"badge_type": "achievement", "color": "blue"}', true, true),
  ('Título "Iniciante"', 'Título personalizado para o perfil', 100, 'title', '{"title_text": "Iniciante", "color": "green"}', true, false),
  ('Badge "Ativo"', 'Badge para usuários ativos', 200, 'badge', '{"badge_type": "activity", "color": "orange"}', true, false),
  ('Título "Especialista"', 'Título para usuários experientes', 500, 'title', '{"title_text": "Especialista", "color": "purple"}', true, true),
  ('Badge "VIP"', 'Badge exclusivo VIP', 1000, 'badge', '{"badge_type": "vip", "color": "gold"}', true, true),
  ('Título "Lenda"', 'Título lendário', 2000, 'title', '{"title_text": "Lenda", "color": "rainbow"}', true, false)
ON CONFLICT DO NOTHING;

-- 8. INSERIR CONFIGURAÇÕES DO SISTEMA
INSERT INTO points_system_config (config_key, config_value, description, is_active) VALUES
  ('min_withdrawal_points', '{"value": 100}', 'Pontos mínimos para saque', true),
  ('withdrawal_fee_percentage', '{"value": 5}', 'Taxa de saque em percentual', true),
  ('min_transfer_points', '{"value": 10}', 'Pontos mínimos para transferência', true),
  ('transfer_fee_percentage', '{"value": 2}', 'Taxa de transferência em percentual', true),
  ('daily_login_bonus', '{"value": 5}', 'Bônus de login diário', true),
  ('referral_bonus', '{"value": 50}', 'Bônus por indicação', true)
ON CONFLICT (config_key) DO NOTHING;

-- 9. CONFIGURAR RLS PARA TODAS AS TABELAS
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

-- 10. CRIAR ÍNDICES PARA PERFORMANCE
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

-- 11. VERIFICAÇÃO FINAL
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICAÇÃO FINAL:';
  RAISE NOTICE '========================================';
  
  -- Verificar se os dados foram inseridos
  IF EXISTS (SELECT 1 FROM points_packages WHERE name = 'Pacote Básico') THEN
    RAISE NOTICE '✅ Pacotes de pontos inseridos com sucesso';
  ELSE
    RAISE NOTICE '❌ Falha ao inserir pacotes de pontos';
  END IF;
  
  IF EXISTS (SELECT 1 FROM points_store_items WHERE name LIKE '%Badge%') THEN
    RAISE NOTICE '✅ Itens da loja inseridos com sucesso';
  ELSE
    RAISE NOTICE '❌ Falha ao inserir itens da loja';
  END IF;
  
  IF EXISTS (SELECT 1 FROM points_system_config WHERE config_key = 'min_withdrawal_points') THEN
    RAISE NOTICE '✅ Configurações do sistema inseridas com sucesso';
  ELSE
    RAISE NOTICE '❌ Falha ao inserir configurações do sistema';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CORREÇÃO COMPLETA FINALIZADA!';
  RAISE NOTICE '========================================';
END $$;
