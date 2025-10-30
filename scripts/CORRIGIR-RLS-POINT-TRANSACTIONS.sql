-- =============================================
-- CORRIGIR RLS DA TABELA point_transactions
-- =============================================
-- Execute este script no Supabase SQL Editor
-- =============================================

-- 1. VERIFICAR POLICIES EXISTENTES
DO $$
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'VERIFICANDO POLICIES EXISTENTES';
  RAISE NOTICE '===========================================';
END $$;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'point_transactions';

-- =============================================

-- 2. REMOVER POLICIES ANTIGAS
DROP POLICY IF EXISTS "Users can view own point transactions" ON public.point_transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.point_transactions;
DROP POLICY IF EXISTS "point_transactions_select_policy" ON public.point_transactions;

-- =============================================

-- 3. CRIAR POLICY CORRETA PARA SELECT
CREATE POLICY "point_transactions_select_policy"
  ON public.point_transactions
  FOR SELECT
  USING (
    -- Usuário pode ver suas próprias transações
    auth.uid() = user_id
  );

-- =============================================

-- 4. GARANTIR QUE RLS ESTÁ HABILITADO
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- =============================================

-- 5. VERIFICAR SE FOI CRIADA
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'POLICIES ATUALIZADAS';
  RAISE NOTICE '===========================================';
END $$;

SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'point_transactions';

-- =============================================

-- 6. TESTE: Buscar transações (execute como usuário autenticado)
-- Isso deve funcionar quando executado via API com auth.uid()
/*
SELECT 
  id,
  amount,
  type,
  source,
  description,
  created_at
FROM point_transactions
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;
*/

