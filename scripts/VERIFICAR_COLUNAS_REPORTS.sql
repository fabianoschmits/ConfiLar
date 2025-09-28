-- =============================================
-- VERIFICAR COLUNAS DA TABELA REPORTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. VERIFICAR ESTRUTURA COMPLETA
SELECT 
  'Estrutura da tabela reports:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'reports'
ORDER BY ordinal_position;

-- 2. VERIFICAR SE COLUNAS ESPECÍFICAS EXISTEM
SELECT 
  'Verificação de colunas:' as info,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'admin_notes'
  ) THEN 'admin_notes: EXISTE' ELSE 'admin_notes: NÃO EXISTE' END as admin_notes_status,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'resolution'
  ) THEN 'resolution: EXISTE' ELSE 'resolution: NÃO EXISTE' END as resolution_status,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'updated_at'
  ) THEN 'updated_at: EXISTE' ELSE 'updated_at: NÃO EXISTE' END as updated_at_status;

-- 3. TESTE DE ATUALIZAÇÃO SIMPLES
UPDATE reports 
SET status = 'resolved' 
WHERE id = (SELECT id FROM reports LIMIT 1)
RETURNING id, status, updated_at;
