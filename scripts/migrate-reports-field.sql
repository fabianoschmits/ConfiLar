-- =============================================
-- MIGRAÇÃO: report_type → type
-- Este script migra o campo report_type para type
-- =============================================

-- PASSO 1: Copiar dados de report_type para type (se type estiver NULL)
UPDATE reports 
SET type = report_type 
WHERE type IS NULL;

-- PASSO 2: Preencher type com report_type onde ambos existem mas são diferentes
UPDATE reports 
SET type = report_type 
WHERE type != report_type OR type IS NULL;

-- PASSO 3: Tornar o campo 'type' NOT NULL
ALTER TABLE reports 
ALTER COLUMN type SET NOT NULL;

-- PASSO 4: Remover constraint antiga de report_type (se existir)
ALTER TABLE reports 
DROP CONSTRAINT IF EXISTS reports_report_type_check;

-- PASSO 5: Adicionar constraint CHECK no campo 'type' (incluindo 'classified')
ALTER TABLE reports 
DROP CONSTRAINT IF EXISTS reports_type_check;

ALTER TABLE reports 
ADD CONSTRAINT reports_type_check 
CHECK (type IN ('user', 'post', 'message', 'review', 'classified', 'other'));

-- PASSO 6: Criar índice no campo 'type' para performance
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);

-- PASSO 7: Tornar report_type nullable (para depreciar gradualmente)
ALTER TABLE reports 
ALTER COLUMN report_type DROP NOT NULL;

-- PASSO 8: Adicionar comentário explicativo
COMMENT ON COLUMN reports.type IS 'Tipo da denúncia (campo ativo)';
COMMENT ON COLUMN reports.report_type IS 'DEPRECATED - Use campo type';

-- =============================================
-- VERIFICAÇÕES FINAIS
-- =============================================

-- Verificar se há registros com type NULL
SELECT 
  'Registros com type NULL:' as verificacao,
  COUNT(*) as total
FROM reports 
WHERE type IS NULL;

-- Verificar distribuição por tipo
SELECT 
  type,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentagem
FROM reports
GROUP BY type
ORDER BY total DESC;

-- Verificar se a constraint existe
SELECT 
  'Constraint reports_type_check:' as verificacao,
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'reports_type_check';

-- Mostrar estrutura final dos campos relevantes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'reports'
  AND column_name IN ('type', 'report_type', 'reported_classified_id')
ORDER BY 
  CASE 
    WHEN column_name = 'type' THEN 1
    WHEN column_name = 'report_type' THEN 2
    ELSE 3
  END;

-- Mensagem de sucesso
DO $$ 
BEGIN
  RAISE NOTICE '✅ Migração concluída com sucesso!';
  RAISE NOTICE '📝 O campo "type" agora é o campo principal (NOT NULL)';
  RAISE NOTICE '⚠️  O campo "report_type" está deprecated (nullable)';
  RAISE NOTICE '🗑️  Você pode remover "report_type" no futuro com: ALTER TABLE reports DROP COLUMN report_type;';
END $$;

