-- =============================================
-- SCRIPT PARA CORRIGIR TABELA DE DENÚNCIAS
-- Versão 2.0 - Apenas alterações, não recria tabela
-- =============================================

-- 1. Adicionar coluna reported_classified_id (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'reported_classified_id'
  ) THEN
    ALTER TABLE reports 
    ADD COLUMN reported_classified_id UUID REFERENCES classified_ads(id) ON DELETE CASCADE;
    RAISE NOTICE 'Coluna reported_classified_id adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna reported_classified_id já existe';
  END IF;
END $$;

-- 2. Adicionar tipo 'classified' ao CHECK constraint
-- Primeiro, remover a constraint antiga se existir
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'reports' AND constraint_name = 'reports_type_check'
  ) THEN
    ALTER TABLE reports DROP CONSTRAINT reports_type_check;
    RAISE NOTICE 'Constraint antiga removida';
  END IF;
END $$;

-- Criar nova constraint com 'classified'
ALTER TABLE reports 
ADD CONSTRAINT reports_type_check 
CHECK (type IN ('user', 'post', 'message', 'review', 'classified', 'other'));

-- 3. Criar índice para performance (se não existir)
CREATE INDEX IF NOT EXISTS idx_reports_reported_classified_id 
ON reports(reported_classified_id);

-- 4. Verificar e corrigir dados inconsistentes
-- Contar registros com type NULL
DO $$ 
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count FROM reports WHERE type IS NULL;
  
  IF null_count > 0 THEN
    RAISE NOTICE 'Encontrados % registros com type NULL, corrigindo...', null_count;
    
    -- Se houver report_type, copiar para type
    UPDATE reports 
    SET type = 
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'reports' AND column_name = 'report_type'
        ) THEN 'other'
        ELSE 'other'
      END
    WHERE type IS NULL;
    
    RAISE NOTICE 'Registros corrigidos';
  ELSE
    RAISE NOTICE 'Nenhum registro com type NULL';
  END IF;
END $$;

-- =============================================
-- VERIFICAÇÃO FINAL
-- =============================================

-- Verificar estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'reports'
ORDER BY ordinal_position;

-- Verificar constraints
SELECT 
  constraint_name, 
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'reports';

-- Contar denúncias por tipo
SELECT 
  type,
  COUNT(*) as total
FROM reports
GROUP BY type
ORDER BY total DESC;

