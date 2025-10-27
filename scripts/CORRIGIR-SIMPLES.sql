-- =====================================================
-- CORREÇÃO SIMPLES - VERIFICAR E CORRIGIR
-- =====================================================

-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA points_packages
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'points_packages' 
ORDER BY ordinal_position;

-- 2. REMOVER RESTRIÇÃO NOT NULL DA COLUNA total_points (se existir)
DO $$ 
BEGIN
  RAISE NOTICE 'Verificando e corrigindo coluna total_points...';
  
  -- Verificar se a coluna existe e tem restrição NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'points_packages' 
    AND column_name = 'total_points' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE points_packages ALTER COLUMN total_points DROP NOT NULL;
    RAISE NOTICE '✅ Restrição NOT NULL removida da coluna total_points';
  ELSE
    RAISE NOTICE '✅ Coluna total_points não tem restrição NOT NULL ou não existe';
  END IF;
END $$;

-- 3. ATUALIZAR REGISTROS EXISTENTES COM VALORES PARA total_points
UPDATE points_packages 
SET total_points = COALESCE(points, 0)
WHERE total_points IS NULL;

-- 4. INSERIR DADOS PADRÃO (USANDO APENAS COLUNAS QUE EXISTEM)
INSERT INTO points_packages (name, points, price_brl, is_active, slug, total_points) VALUES
  ('Pacote Básico', 100, 10.00, true, 'pacote-basico-' || gen_random_uuid()::text, 100),
  ('Pacote Popular', 500, 45.00, true, 'pacote-popular-' || gen_random_uuid()::text, 500),
  ('Pacote Premium', 1000, 85.00, true, 'pacote-premium-' || gen_random_uuid()::text, 1000),
  ('Pacote VIP', 2500, 200.00, true, 'pacote-vip-' || gen_random_uuid()::text, 2500),
  ('Pacote Máximo', 5000, 375.00, true, 'pacote-maximo-' || gen_random_uuid()::text, 5000)
ON CONFLICT (slug) DO NOTHING;

-- 5. VERIFICAR SE OS DADOS FORAM INSERIDOS
SELECT id, name, slug, points, total_points, price_brl FROM points_packages ORDER BY points;

-- 6. INSERIR DADOS PADRÃO PARA ITENS DA LOJA (se a tabela existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_store_items') THEN
    INSERT INTO points_store_items (name, description, points_price, item_type, item_data, is_active, is_featured) VALUES
      ('Badge "Primeiro Passo"', 'Badge especial para novos usuários', 50, 'badge', '{"badge_type": "achievement", "color": "blue"}', true, true),
      ('Título "Iniciante"', 'Título personalizado para o perfil', 100, 'title', '{"title_text": "Iniciante", "color": "green"}', true, false),
      ('Badge "Ativo"', 'Badge para usuários ativos', 200, 'badge', '{"badge_type": "activity", "color": "orange"}', true, false),
      ('Título "Especialista"', 'Título para usuários experientes', 500, 'title', '{"title_text": "Especialista", "color": "purple"}', true, true),
      ('Badge "VIP"', 'Badge exclusivo VIP', 1000, 'badge', '{"badge_type": "vip", "color": "gold"}', true, true),
      ('Título "Lenda"', 'Título lendário', 2000, 'title', '{"title_text": "Lenda", "color": "rainbow"}', true, false)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✅ Itens da loja inseridos';
  ELSE
    RAISE NOTICE '⚠️ Tabela points_store_items não existe - pulando inserção';
  END IF;
END $$;

-- 7. INSERIR CONFIGURAÇÕES DO SISTEMA (se a tabela existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_system_config') THEN
    INSERT INTO points_system_config (config_key, config_value, description, is_active) VALUES
      ('min_withdrawal_points', '{"value": 100}', 'Pontos mínimos para saque', true),
      ('withdrawal_fee_percentage', '{"value": 5}', 'Taxa de saque em percentual', true),
      ('min_transfer_points', '{"value": 10}', 'Pontos mínimos para transferência', true),
      ('transfer_fee_percentage', '{"value": 2}', 'Taxa de transferência em percentual', true),
      ('daily_login_bonus', '{"value": 5}', 'Bônus de login diário', true),
      ('referral_bonus', '{"value": 50}', 'Bônus por indicação', true)
    ON CONFLICT (config_key) DO NOTHING;
    RAISE NOTICE '✅ Configurações do sistema inseridas';
  ELSE
    RAISE NOTICE '⚠️ Tabela points_system_config não existe - pulando inserção';
  END IF;
END $$;

-- 8. VERIFICAÇÃO FINAL
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
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_store_items') THEN
    IF EXISTS (SELECT 1 FROM points_store_items WHERE name LIKE '%Badge%') THEN
      RAISE NOTICE '✅ Itens da loja inseridos com sucesso';
    ELSE
      RAISE NOTICE '⚠️ Tabela points_store_items existe mas não tem dados';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ Tabela points_store_items não existe';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_system_config') THEN
    IF EXISTS (SELECT 1 FROM points_system_config WHERE config_key = 'min_withdrawal_points') THEN
      RAISE NOTICE '✅ Configurações do sistema inseridas com sucesso';
    ELSE
      RAISE NOTICE '⚠️ Tabela points_system_config existe mas não tem dados';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ Tabela points_system_config não existe';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CORREÇÃO FINALIZADA!';
  RAISE NOTICE '========================================';
END $$;
