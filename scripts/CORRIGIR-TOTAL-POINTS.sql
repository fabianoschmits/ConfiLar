-- =====================================================
-- CORRIGIR PROBLEMA DA COLUNA total_points
-- =====================================================

-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'points_packages' 
ORDER BY ordinal_position;

-- 2. REMOVER RESTRIÇÃO NOT NULL DA COLUNA total_points
DO $$ 
BEGIN
  RAISE NOTICE 'Removendo restrição NOT NULL da coluna total_points...';
  
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

-- 4. AGORA INSERIR NOVOS DADOS COM total_points
INSERT INTO points_packages (name, description, points, points_amount, price_cents, price_brl, bonus_points, is_active, is_featured, slug, total_points) VALUES
  ('Pacote Básico', '100 pontos para começar', 100, 100, 1000, 10.00, 0, true, false, 'pacote-basico-' || gen_random_uuid()::text, 100),
  ('Pacote Popular', '500 pontos com bônus', 500, 500, 4500, 45.00, 50, true, true, 'pacote-popular-' || gen_random_uuid()::text, 550),
  ('Pacote Premium', '1000 pontos com bônus', 1000, 1000, 8500, 85.00, 150, true, false, 'pacote-premium-' || gen_random_uuid()::text, 1150),
  ('Pacote VIP', '2500 pontos com bônus', 2500, 2500, 20000, 200.00, 500, true, true, 'pacote-vip-' || gen_random_uuid()::text, 3000),
  ('Pacote Máximo', '5000 pontos com bônus', 5000, 5000, 37500, 375.00, 1250, true, false, 'pacote-maximo-' || gen_random_uuid()::text, 6250)
ON CONFLICT (slug) DO NOTHING;

-- 5. VERIFICAR SE OS DADOS FORAM INSERIDOS
SELECT id, name, slug, points, bonus_points, total_points, price_brl FROM points_packages ORDER BY points;

-- 6. INSERIR DADOS PADRÃO PARA ITENS DA LOJA
INSERT INTO points_store_items (name, description, points_price, item_type, item_data, is_active, is_featured) VALUES
  ('Badge "Primeiro Passo"', 'Badge especial para novos usuários', 50, 'badge', '{"badge_type": "achievement", "color": "blue"}', true, true),
  ('Título "Iniciante"', 'Título personalizado para o perfil', 100, 'title', '{"title_text": "Iniciante", "color": "green"}', true, false),
  ('Badge "Ativo"', 'Badge para usuários ativos', 200, 'badge', '{"badge_type": "activity", "color": "orange"}', true, false),
  ('Título "Especialista"', 'Título para usuários experientes', 500, 'title', '{"title_text": "Especialista", "color": "purple"}', true, true),
  ('Badge "VIP"', 'Badge exclusivo VIP', 1000, 'badge', '{"badge_type": "vip", "color": "gold"}', true, true),
  ('Título "Lenda"', 'Título lendário', 2000, 'title', '{"title_text": "Lenda", "color": "rainbow"}', true, false)
ON CONFLICT DO NOTHING;

-- 7. INSERIR CONFIGURAÇÕES DO SISTEMA
INSERT INTO points_system_config (config_key, config_value, description, is_active) VALUES
  ('min_withdrawal_points', '{"value": 100}', 'Pontos mínimos para saque', true),
  ('withdrawal_fee_percentage', '{"value": 5}', 'Taxa de saque em percentual', true),
  ('min_transfer_points', '{"value": 10}', 'Pontos mínimos para transferência', true),
  ('transfer_fee_percentage', '{"value": 2}', 'Taxa de transferência em percentual', true),
  ('daily_login_bonus', '{"value": 5}', 'Bônus de login diário', true),
  ('referral_bonus', '{"value": 50}', 'Bônus por indicação', true)
ON CONFLICT (config_key) DO NOTHING;

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
  RAISE NOTICE '✅ CORREÇÃO FINALIZADA!';
  RAISE NOTICE '========================================';
END $$;
