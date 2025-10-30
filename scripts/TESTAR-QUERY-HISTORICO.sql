-- =============================================
-- SCRIPT PARA TESTAR QUERIES DE HISTÓRICO
-- =============================================
-- SUBSTITUA 'SEU-USER-ID' pelo ID do seu usuário
-- =============================================

-- 1. TESTE: Buscar da tabela point_transactions
DO $$
DECLARE
  v_user_id UUID := '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'; -- SUBSTITUA PELO SEU USER ID
  v_count INTEGER;
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'TESTANDO TABELA: point_transactions';
  RAISE NOTICE '===========================================';
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'point_transactions') THEN
    -- Contar registros do usuário
    EXECUTE format('SELECT COUNT(*) FROM point_transactions WHERE user_id = %L', v_user_id) INTO v_count;
    RAISE NOTICE 'Total de transações para o usuário: %', v_count;
    
    -- Mostrar últimas 5 transações
    RAISE NOTICE '📋 Últimas 5 transações:';
    FOR i IN (
      SELECT 
        id,
        amount,
        type,
        source,
        description,
        created_at
      FROM point_transactions 
      WHERE user_id = v_user_id
      ORDER BY created_at DESC 
      LIMIT 5
    ) LOOP
      RAISE NOTICE '  - % pontos | % | % | % | %', 
        i.amount, i.type, i.source, i.description, i.created_at;
    END LOOP;
  ELSE
    RAISE NOTICE '❌ Tabela point_transactions NÃO EXISTE';
  END IF;
END $$;

-- =============================================

-- 2. TESTE: Buscar da tabela user_points_history (se existir)
DO $$
DECLARE
  v_user_id UUID := '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'; -- SUBSTITUA PELO SEU USER ID
  v_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'TESTANDO TABELA: user_points_history';
  RAISE NOTICE '===========================================';
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_points_history') THEN
    EXECUTE format('SELECT COUNT(*) FROM user_points_history WHERE user_id = %L', v_user_id) INTO v_count;
    RAISE NOTICE 'Total de registros para o usuário: %', v_count;
  ELSE
    RAISE NOTICE '❌ Tabela user_points_history NÃO EXISTE';
  END IF;
END $$;

-- =============================================

-- 3. TESTE: Verificar saldo do usuário
DO $$
DECLARE
  v_user_id UUID := '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'; -- SUBSTITUA PELO SEU USER ID
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'VERIFICANDO SALDO DO USUÁRIO';
  RAISE NOTICE '===========================================';
  
  -- Tentar buscar de profiles
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'points_balance'
  ) THEN
    FOR i IN (
      SELECT 
        points_balance,
        total_points_earned,
        total_points_spent,
        user_level
      FROM profiles 
      WHERE id = v_user_id
    ) LOOP
      RAISE NOTICE 'Saldo: % pontos', i.points_balance;
      RAISE NOTICE 'Total ganho: % pontos', i.total_points_earned;
      RAISE NOTICE 'Total gasto: % pontos', i.total_points_spent;
      RAISE NOTICE 'Nível: %', i.user_level;
    END LOOP;
  END IF;
  
  -- Tentar buscar de user_points_balance
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_points_balance') THEN
    FOR i IN (
      SELECT 
        balance,
        total_earned,
        total_spent
      FROM user_points_balance 
      WHERE user_id = v_user_id
    ) LOOP
      RAISE NOTICE 'Saldo (user_points_balance): % pontos', i.balance;
      RAISE NOTICE 'Total ganho: % pontos', i.total_earned;
      RAISE NOTICE 'Total gasto: % pontos', i.total_spent;
    END LOOP;
  END IF;
END $$;

-- =============================================

-- 4. QUERY DIRETA: Buscar transações (execute manualmente)
-- SUBSTITUA o user_id abaixo pelo seu
SELECT 
  id,
  user_id,
  amount,
  type,
  source,
  description,
  created_at
FROM point_transactions
WHERE user_id = '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'
ORDER BY created_at DESC
LIMIT 10;

-- =============================================

-- 5. CRIAR TRANSAÇÃO DE TESTE (se necessário)
-- DESCOMENTE ABAIXO PARA CRIAR UMA TRANSAÇÃO DE TESTE

/*
INSERT INTO point_transactions (
  user_id,
  amount,
  type,
  source,
  description,
  created_at
) VALUES (
  '5f3a507a-6ab2-430c-b20e-1bd322a85c3b', -- SUBSTITUA PELO SEU USER ID
  100,
  'earn',
  'test',
  'Transação de teste criada pelo script',
  NOW()
);

-- Verificar se foi criada
SELECT * FROM point_transactions 
WHERE user_id = '5f3a507a-6ab2-430c-b20e-1bd322a85c3b' 
ORDER BY created_at DESC 
LIMIT 1;
*/

