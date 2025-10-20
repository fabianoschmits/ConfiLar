-- =====================================================
-- VERIFICAR ESTRUTURA DA TABELA MESSAGES
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. Verificar todas as colunas da tabela messages
SELECT 
  'COLUNAS_MESSAGES' as status,
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'messages'
ORDER BY ordinal_position;

-- 2. Verificar se a tabela existe
SELECT 
  'TABELA_EXISTE' as status,
  table_name,
  table_type,
  is_insertable_into
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'messages';

-- 3. Verificar constraints da tabela
SELECT 
  'CONSTRAINTS_MESSAGES' as status,
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public' 
  AND table_name = 'messages'
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
  AND tc.table_name = 'messages'
ORDER BY kcu.column_name;

-- 5. Verificar dados de exemplo (primeiras 3 linhas)
SELECT 
  'DADOS_EXEMPLO' as status,
  *
FROM messages
LIMIT 3;

-- 6. Verificar se há mensagens com dados válidos
SELECT 
  'MENSAGENS_VALIDAS' as status,
  COUNT(*) as total_mensagens,
  COUNT(*) FILTER (WHERE sender_id IS NOT NULL) as com_sender_id,
  COUNT(*) FILTER (WHERE receiver_id IS NOT NULL) as com_receiver_id,
  COUNT(*) FILTER (WHERE conversation_id IS NOT NULL) as com_conversation_id
FROM messages;

-- 7. Verificar triggers existentes na tabela messages
SELECT 
  'TRIGGERS_MESSAGES' as status,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' 
  AND event_object_table = 'messages'
ORDER BY trigger_name;

-- 8. Verificar funções que referenciam a tabela messages
SELECT 
  'FUNCOES_MESSAGES' as status,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_definition LIKE '%messages%'
ORDER BY routine_name;

SELECT 
  'RESUMO_VERIFICACAO' as status,
  'Estrutura da tabela messages verificada!' as resultado,
  NOW() as timestamp;
