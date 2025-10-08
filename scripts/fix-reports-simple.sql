-- =============================================
-- SCRIPT SIMPLES PARA CORRIGIR TABELA REPORTS
-- Execute este no Supabase SQL Editor
-- =============================================

-- Passo 1: Adicionar coluna reported_classified_id se não existir
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS reported_classified_id UUID;

-- Passo 2: Adicionar foreign key para a coluna (se ainda não tiver)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'reports_reported_classified_id_fkey'
  ) THEN
    ALTER TABLE reports 
    ADD CONSTRAINT reports_reported_classified_id_fkey 
    FOREIGN KEY (reported_classified_id) 
    REFERENCES classified_ads(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Passo 3: Remover constraint antiga de tipo
ALTER TABLE reports 
DROP CONSTRAINT IF EXISTS reports_type_check;

-- Passo 4: Adicionar nova constraint incluindo 'classified'
ALTER TABLE reports 
ADD CONSTRAINT reports_type_check 
CHECK (type IN ('user', 'post', 'message', 'review', 'classified', 'other'));

-- Passo 5: Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_reports_reported_classified_id 
ON reports(reported_classified_id);

-- Passo 6: Criar índice para o campo type
CREATE INDEX IF NOT EXISTS idx_reports_type 
ON reports(type);

-- ✅ Verificação Final
SELECT 
  'Coluna reported_classified_id existe?' as verificacao,
  EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'reports' 
    AND column_name = 'reported_classified_id'
  ) as resultado;

SELECT 
  'Constraint reports_type_check existe?' as verificacao,
  EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'reports_type_check'
  ) as resultado;

-- Mostrar estrutura atual da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'reports'
ORDER BY ordinal_position;

