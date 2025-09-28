-- =============================================
-- VERIFICAR ESTRUTURA DA TABELA REPORTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA
SELECT 
  'Estrutura atual da tabela reports:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'reports'
ORDER BY ordinal_position;

-- 2. VERIFICAR SE A COLUNA REASON EXISTE
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'reports' AND column_name = 'reason'
    ) THEN 'Coluna reason existe'
    ELSE 'Coluna reason NÃO existe'
  END as status_reason;

-- 3. VERIFICAR TODAS AS COLUNAS DA TABELA
SELECT 
  'Todas as colunas da tabela reports:' as info,
  string_agg(column_name, ', ' ORDER BY ordinal_position) as colunas
FROM information_schema.columns 
WHERE table_name = 'reports';
