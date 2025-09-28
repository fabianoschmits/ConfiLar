-- =============================================
-- ADICIONAR COLUNAS FALTANTES NA TABELA REPORTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. ADICIONAR COLUNA admin_notes SE NÃO EXISTIR
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE reports ADD COLUMN admin_notes TEXT;
  END IF;
END $$;

-- 2. ADICIONAR COLUNA resolution SE NÃO EXISTIR
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'resolution'
  ) THEN
    ALTER TABLE reports ADD COLUMN resolution TEXT;
  END IF;
END $$;

-- 3. ADICIONAR COLUNA updated_at SE NÃO EXISTIR
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE reports ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 4. VERIFICAR ESTRUTURA FINAL
SELECT 
  'Estrutura final:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'reports'
ORDER BY ordinal_position;

-- 5. TESTE DE ATUALIZAÇÃO
UPDATE reports 
SET 
  status = 'resolved',
  admin_notes = 'Teste de atualização',
  resolution = 'Denúncia resolvida com sucesso',
  updated_at = NOW()
WHERE id = (SELECT id FROM reports LIMIT 1)
RETURNING id, status, admin_notes, resolution, updated_at;
