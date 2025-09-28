-- =============================================
-- CORRIGIR ESTRUTURA DA TABELA REPORTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. VERIFICAR ESTRUTURA ATUAL
SELECT 
  'Estrutura atual:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'reports'
ORDER BY ordinal_position;

-- 2. ADICIONAR COLUNAS FALTANTES BASEADAS NA ESTRUTURA EXISTENTE
-- Adicionar coluna 'reason' se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'reason'
  ) THEN
    ALTER TABLE reports ADD COLUMN reason VARCHAR(100) NOT NULL DEFAULT 'Outros';
  END IF;
END $$;

-- 3. RENOMEAR report_type PARA type (se necessário)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'report_type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'type'
  ) THEN
    ALTER TABLE reports RENAME COLUMN report_type TO type;
  END IF;
END $$;

-- 4. ADICIONAR COLUNA type SE NÃO EXISTIR
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'type'
  ) THEN
    ALTER TABLE reports ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'other' 
    CHECK (type IN ('user', 'post', 'message', 'review', 'other'));
  END IF;
END $$;

-- 5. VERIFICAR ESTRUTURA FINAL
SELECT 
  'Estrutura final:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'reports'
ORDER BY ordinal_position;

-- 6. TESTE DE INSERÇÃO COM ESTRUTURA CORRETA
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

-- 7. VERIFICAR SE FUNCIONOU
SELECT 
  'Teste final:' as info,
  COUNT(*) as total_reports,
  MAX(created_at) as ultima_denuncia
FROM reports;
