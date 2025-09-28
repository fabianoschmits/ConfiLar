-- =============================================
-- ADICIONAR COLUNAS FALTANTES NA TABELA REPORTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. ADICIONAR COLUNA REASON SE NÃO EXISTIR
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'reason'
  ) THEN
    ALTER TABLE reports ADD COLUMN reason VARCHAR(100) NOT NULL DEFAULT 'Outros';
  END IF;
END $$;

-- 2. ADICIONAR COLUNA DESCRIPTION SE NÃO EXISTIR
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'description'
  ) THEN
    ALTER TABLE reports ADD COLUMN description TEXT NOT NULL DEFAULT 'Sem descrição';
  END IF;
END $$;

-- 3. ADICIONAR COLUNA STATUS SE NÃO EXISTIR
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'status'
  ) THEN
    ALTER TABLE reports ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed'));
  END IF;
END $$;

-- 4. ADICIONAR COLUNA PRIORITY SE NÃO EXISTIR
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'priority'
  ) THEN
    ALTER TABLE reports ADD COLUMN priority VARCHAR(10) NOT NULL DEFAULT 'medium' 
    CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
  END IF;
END $$;

-- 5. ADICIONAR COLUNA ADMIN_NOTES SE NÃO EXISTIR
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE reports ADD COLUMN admin_notes TEXT;
  END IF;
END $$;

-- 6. ADICIONAR COLUNA RESOLUTION SE NÃO EXISTIR
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'resolution'
  ) THEN
    ALTER TABLE reports ADD COLUMN resolution TEXT;
  END IF;
END $$;

-- 7. VERIFICAR ESTRUTURA FINAL
SELECT 
  'Estrutura final da tabela reports:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'reports'
ORDER BY ordinal_position;

-- 8. TESTE DE INSERÇÃO
INSERT INTO reports (
  type, 
  reason, 
  description, 
  status, 
  priority, 
  reporter_id
) VALUES (
  'test',
  'Teste de sistema',
  'Verificando se a estrutura está correta',
  'pending',
  'low',
  auth.uid()
) ON CONFLICT DO NOTHING;

-- 9. VERIFICAR SE A INSERÇÃO FUNCIONOU
SELECT 
  'Teste de inserção:' as info,
  COUNT(*) as total_reports,
  MAX(created_at) as ultima_denuncia
FROM reports;
