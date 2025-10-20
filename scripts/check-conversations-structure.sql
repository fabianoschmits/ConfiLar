-- =====================================================
-- VERIFICAR ESTRUTURA DA TABELA CONVERSATIONS
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. Verificar todas as colunas da tabela conversations
SELECT 
  'COLUNAS_CONVERSATIONS' as status,
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'conversations'
ORDER BY ordinal_position;

-- 2. Verificar se a tabela existe
SELECT 
  'TABELA_EXISTE' as status,
  table_name,
  table_type,
  is_insertable_into
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'conversations';

-- 3. Verificar constraints da tabela
SELECT 
  'CONSTRAINTS_CONVERSATIONS' as status,
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public' 
  AND table_name = 'conversations'
ORDER BY constraint_name;

-- 4. Verificar chaves estrangeiras
SELECT 
  'FOREIGN_KEYS' as status,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'conversations'
ORDER BY kcu.column_name;

-- 5. Verificar índices da tabela
SELECT 
  'INDICES_CONVERSATIONS' as status,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'conversations'
ORDER BY indexname;

-- 6. Verificar dados de exemplo (primeiras 3 linhas)
SELECT 
  'DADOS_EXEMPLO' as status,
  *
FROM conversations
LIMIT 3;

-- 7. Verificar se há conversas com dados válidos
SELECT 
  'CONVERSAS_VALIDAS' as status,
  COUNT(*) as total_conversas,
  COUNT(*) FILTER (WHERE client_id IS NOT NULL) as com_client_id,
  COUNT(*) FILTER (WHERE professional_id IS NOT NULL) as com_professional_id,
  COUNT(*) FILTER (WHERE client_id IS NOT NULL AND professional_id IS NOT NULL) as completas
FROM conversations;

-- 8. Verificar se existem colunas com nomes similares
SELECT 
  'COLUNAS_SIMILARES' as status,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'conversations'
  AND (
    column_name LIKE '%participant%' OR
    column_name LIKE '%user%' OR
    column_name LIKE '%client%' OR
    column_name LIKE '%professional%'
  )
ORDER BY column_name;

-- 9. Verificar se há outras tabelas relacionadas
SELECT 
  'TABELAS_RELACIONADAS' as status,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (
    table_name LIKE '%conversation%' OR
    table_name LIKE '%message%' OR
    table_name LIKE '%chat%'
  )
ORDER BY table_name;

-- 10. Verificar triggers existentes na tabela conversations
SELECT 
  'TRIGGERS_CONVERSATIONS' as status,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' 
  AND event_object_table = 'conversations'
ORDER BY trigger_name;

SELECT 
  'RESUMO_VERIFICACAO' as status,
  'Estrutura da tabela conversations verificada!' as resultado,
  NOW() as timestamp;
