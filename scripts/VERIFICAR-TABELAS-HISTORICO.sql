-- =============================================
-- SCRIPT PARA VERIFICAR TABELAS DE HISTÓRICO
-- =============================================
-- Execute este script no Supabase SQL Editor
-- =============================================

-- 1. LISTAR TODAS AS TABELAS RELACIONADAS A PONTOS
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (
    table_name LIKE '%point%' OR 
    table_name LIKE '%transaction%' OR
    table_name LIKE '%confi%' OR
    table_name LIKE '%history%'
  )
ORDER BY table_name;

-- =============================================

-- 2. VERIFICAR SE TABELA point_transactions EXISTE
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'point_transactions') THEN
    RAISE NOTICE '✅ Tabela point_transactions EXISTE';
  ELSE
    RAISE NOTICE '❌ Tabela point_transactions NÃO EXISTE';
  END IF;
END $$;

-- =============================================

-- 3. VERIFICAR ESTRUTURA DA TABELA point_transactions (se existir)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'point_transactions'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================

-- 4. CONTAR REGISTROS NA TABELA point_transactions (se existir)
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'point_transactions') THEN
    EXECUTE 'SELECT COUNT(*) FROM point_transactions' INTO v_count;
    RAISE NOTICE 'Total de registros em point_transactions: %', v_count;
  ELSE
    RAISE NOTICE 'Tabela point_transactions não existe para contar';
  END IF;
END $$;

-- =============================================

-- 5. VERIFICAR SE EXISTE TABELA user_points_history
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_points_history') THEN
    RAISE NOTICE '✅ Tabela user_points_history EXISTE';
  ELSE
    RAISE NOTICE '❌ Tabela user_points_history NÃO EXISTE';
  END IF;
END $$;

-- =============================================

-- 6. VERIFICAR ESTRUTURA DA TABELA user_points_history (se existir)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_points_history'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================

-- 7. VERIFICAR TABELA profiles (colunas de pontos)
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND table_schema = 'public'
  AND (
    column_name LIKE '%point%' OR
    column_name LIKE '%balance%' OR
    column_name LIKE '%level%'
  )
ORDER BY column_name;

-- =============================================

-- 8. VERIFICAR SE EXISTE TABELA user_points_balance
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_points_balance') THEN
    RAISE NOTICE '✅ Tabela user_points_balance EXISTE';
  ELSE
    RAISE NOTICE '❌ Tabela user_points_balance NÃO EXISTE';
  END IF;
END $$;

-- =============================================

-- 9. LISTAR TODAS AS TABELAS PÚBLICAS
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =============================================

-- 10. TESTE: Buscar algumas transações de exemplo (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'point_transactions') THEN
    RAISE NOTICE '📋 Exemplo de registros em point_transactions:';
    PERFORM * FROM point_transactions LIMIT 3;
  END IF;
END $$;

