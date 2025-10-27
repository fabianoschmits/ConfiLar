-- =====================================================
-- CORREÇÃO ULTRA SIMPLES - VERIFICAR E CORRIGIR
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

-- 4. INSERIR DADOS PADRÃO (USANDO APENAS COLUNAS BÁSICAS)
INSERT INTO points_packages (name, points, price_brl, is_active, slug, total_points) VALUES
  ('Pacote Básico', 100, 10.00, true, 'pacote-basico-' || gen_random_uuid()::text, 100),
  ('Pacote Popular', 500, 45.00, true, 'pacote-popular-' || gen_random_uuid()::text, 500),
  ('Pacote Premium', 1000, 85.00, true, 'pacote-premium-' || gen_random_uuid()::text, 1000),
  ('Pacote VIP', 2500, 200.00, true, 'pacote-vip-' || gen_random_uuid()::text, 2500),
  ('Pacote Máximo', 5000, 375.00, true, 'pacote-maximo-' || gen_random_uuid()::text, 5000)
ON CONFLICT (slug) DO NOTHING;

-- 5. VERIFICAR SE OS DADOS FORAM INSERIDOS
SELECT id, name, slug, points, total_points, price_brl FROM points_packages ORDER BY points;

-- 6. VERIFICAÇÃO FINAL
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
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CORREÇÃO FINALIZADA!';
  RAISE NOTICE '========================================';
END $$;
