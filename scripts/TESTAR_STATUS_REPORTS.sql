-- =============================================
-- TESTAR VALORES VÁLIDOS DO STATUS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. VERIFICAR ENUM DO STATUS
SELECT 
  'Valores válidos do enum status:' as info,
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname LIKE '%status%' OR t.typname LIKE '%report%'
ORDER BY t.typname, e.enumsortorder;

-- 2. VERIFICAR CONSTRAINT DA COLUNA STATUS
SELECT 
  'Constraint da coluna status:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default,
  check_clause
FROM information_schema.columns c
LEFT JOIN information_schema.check_constraints cc ON c.table_name = cc.table_name
WHERE c.table_name = 'reports' AND c.column_name = 'status';

-- 3. TESTAR TODOS OS VALORES POSSÍVEIS
UPDATE reports 
SET status = 'pending' 
WHERE id = (SELECT id FROM reports LIMIT 1)
RETURNING id, status;

UPDATE reports 
SET status = 'reviewing' 
WHERE id = (SELECT id FROM reports LIMIT 1)
RETURNING id, status;

UPDATE reports 
SET status = 'resolved' 
WHERE id = (SELECT id FROM reports LIMIT 1)
RETURNING id, status;

UPDATE reports 
SET status = 'dismissed' 
WHERE id = (SELECT id FROM reports LIMIT 1)
RETURNING id, status;
