-- =============================================
-- DIAGNÓSTICO RÁPIDO - HISTÓRICO DE CONFIPOINTS
-- =============================================
-- Execute este script completo no Supabase SQL Editor
-- =============================================

DO $$
DECLARE
  v_user_id UUID := '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'; -- SEU USER ID AQUI
  v_count INTEGER;
  v_table_exists BOOLEAN;
BEGIN
  RAISE NOTICE '🔍 ========================================';
  RAISE NOTICE '🔍 DIAGNÓSTICO DE HISTÓRICO DE CONFIPOINTS';
  RAISE NOTICE '🔍 ========================================';
  RAISE NOTICE '';
  
  -- =========================================
  -- 1. VERIFICAR TABELA point_transactions
  -- =========================================
  RAISE NOTICE '📋 1. Verificando tabela point_transactions...';
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'point_transactions' AND table_schema = 'public'
  ) INTO v_table_exists;
  
  IF v_table_exists THEN
    RAISE NOTICE '   ✅ Tabela point_transactions EXISTE';
    
    -- Contar total de registros
    EXECUTE 'SELECT COUNT(*) FROM point_transactions' INTO v_count;
    RAISE NOTICE '   📊 Total de registros na tabela: %', v_count;
    
    -- Contar registros do usuário
    EXECUTE format('SELECT COUNT(*) FROM point_transactions WHERE user_id = %L', v_user_id) INTO v_count;
    RAISE NOTICE '   👤 Registros do seu usuário: %', v_count;
    
    -- Mostrar estrutura
    RAISE NOTICE '   📐 Colunas da tabela:';
    FOR rec IN (
      SELECT column_name, data_type 
      FROM information_schema.columns
      WHERE table_name = 'point_transactions' AND table_schema = 'public'
      ORDER BY ordinal_position
    ) LOOP
      RAISE NOTICE '      - % (%)', rec.column_name, rec.data_type;
    END LOOP;
    
  ELSE
    RAISE NOTICE '   ❌ Tabela point_transactions NÃO EXISTE';
  END IF;
  
  RAISE NOTICE '';
  
  -- =========================================
  -- 2. VERIFICAR OUTRAS TABELAS
  -- =========================================
  RAISE NOTICE '📋 2. Verificando outras tabelas relacionadas...';
  
  -- user_points_history
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_points_history' AND table_schema = 'public'
  ) INTO v_table_exists;
  
  IF v_table_exists THEN
    RAISE NOTICE '   ✅ user_points_history existe';
  ELSE
    RAISE NOTICE '   ❌ user_points_history NÃO existe';
  END IF;
  
  -- points_history
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'points_history' AND table_schema = 'public'
  ) INTO v_table_exists;
  
  IF v_table_exists THEN
    RAISE NOTICE '   ✅ points_history existe';
  ELSE
    RAISE NOTICE '   ❌ points_history NÃO existe';
  END IF;
  
  -- transactions
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'transactions' AND table_schema = 'public'
  ) INTO v_table_exists;
  
  IF v_table_exists THEN
    RAISE NOTICE '   ✅ transactions existe';
  ELSE
    RAISE NOTICE '   ❌ transactions NÃO existe';
  END IF;
  
  RAISE NOTICE '';
  
  -- =========================================
  -- 3. LISTAR TODAS TABELAS COM "POINT" NO NOME
  -- =========================================
  RAISE NOTICE '📋 3. Tabelas com "point" no nome:';
  
  FOR rec IN (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name LIKE '%point%'
    ORDER BY table_name
  ) LOOP
    RAISE NOTICE '   📦 %', rec.table_name;
  END LOOP;
  
  RAISE NOTICE '';
  
  -- =========================================
  -- 4. VERIFICAR SALDO DO USUÁRIO
  -- =========================================
  RAISE NOTICE '📋 4. Verificando saldo do usuário...';
  
  -- Em profiles
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'points_balance'
  ) THEN
    FOR rec IN (
      EXECUTE format('SELECT points_balance, total_points_earned, total_points_spent FROM profiles WHERE id = %L', v_user_id)
    ) LOOP
      RAISE NOTICE '   💰 Saldo (profiles): % pontos', rec.points_balance;
      RAISE NOTICE '   📈 Total ganho: % pontos', rec.total_points_earned;
      RAISE NOTICE '   📉 Total gasto: % pontos', rec.total_points_spent;
    END LOOP;
  END IF;
  
  -- Em user_points_balance
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_points_balance'
  ) THEN
    EXECUTE format('SELECT COUNT(*) FROM user_points_balance WHERE user_id = %L', v_user_id) INTO v_count;
    IF v_count > 0 THEN
      FOR rec IN (
        EXECUTE format('SELECT balance, total_earned, total_spent FROM user_points_balance WHERE user_id = %L', v_user_id)
      ) LOOP
        RAISE NOTICE '   💰 Saldo (user_points_balance): % pontos', rec.balance;
        RAISE NOTICE '   📈 Total ganho: % pontos', rec.total_earned;
        RAISE NOTICE '   📉 Total gasto: % pontos', rec.total_spent;
      END LOOP;
    END IF;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🔍 ========================================';
  RAISE NOTICE '🔍 FIM DO DIAGNÓSTICO';
  RAISE NOTICE '🔍 ========================================';
  
END $$;

-- =============================================
-- QUERY MANUAL: Buscar últimas 10 transações
-- (Execute separadamente se a tabela existir)
-- =============================================

-- SUBSTITUA O USER_ID ABAIXO
/*
SELECT 
  id,
  amount,
  type,
  source,
  description,
  metadata,
  created_at
FROM point_transactions
WHERE user_id = '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'
ORDER BY created_at DESC
LIMIT 10;
*/

