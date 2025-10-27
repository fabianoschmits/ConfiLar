-- =====================================================
-- VERIFICAR TABELA point_transactions
-- =====================================================

-- 1. VERIFICAR SE A TABELA EXISTE
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_name = 'point_transactions';

-- 2. VERIFICAR ESTRUTURA DA TABELA
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'point_transactions' 
ORDER BY ordinal_position;

-- 3. VERIFICAR SE HÁ DADOS
SELECT COUNT(*) as total_transactions FROM point_transactions;

-- 4. VERIFICAR DADOS RECENTES
SELECT 
  id, 
  user_id, 
  amount, 
  type, 
  source, 
  description, 
  created_at 
FROM point_transactions 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. VERIFICAR SE HÁ PROBLEMAS DE RLS
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'point_transactions';

