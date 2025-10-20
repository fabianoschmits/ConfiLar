-- =====================================================
-- OBTER DETALHES DAS TABELAS CONVERSATIONS E MESSAGES
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. COLUNAS DA TABELA CONVERSATIONS
SELECT 
  'CONVERSATIONS_COLUMNS' as info_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'conversations'
ORDER BY ordinal_position;

-- 2. COLUNAS DA TABELA MESSAGES
SELECT 
  'MESSAGES_COLUMNS' as info_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'messages'
ORDER BY ordinal_position;

-- 3. DADOS DE EXEMPLO - CONVERSATIONS (primeira linha)
SELECT 
  'CONVERSATIONS_SAMPLE' as info_type,
  *
FROM conversations
LIMIT 1;

-- 4. DADOS DE EXEMPLO - MESSAGES (primeira linha)
SELECT 
  'MESSAGES_SAMPLE' as info_type,
  *
FROM messages
LIMIT 1;

-- 5. TRIGGERS ATIVOS NA TABELA MESSAGES
SELECT 
  'MESSAGES_TRIGGERS' as info_type,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public' 
  AND event_object_table = 'messages';

-- 6. FUNÇÕES QUE USAM MESSAGES
SELECT 
  'MESSAGES_FUNCTIONS' as info_type,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_definition LIKE '%messages%';

-- 7. VERIFICAR SE EXISTEM COLUNAS PARTICIPANT
SELECT 
  'PARTICIPANT_COLUMNS' as info_type,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'conversations'
  AND column_name LIKE '%participant%';

-- 8. CONTAR CONVERSAS E MENSAGENS
SELECT 
  'COUNTS' as info_type,
  'conversations' as table_name,
  COUNT(*) as total_rows
FROM conversations
UNION ALL
SELECT 
  'COUNTS' as info_type,
  'messages' as table_name,
  COUNT(*) as total_rows
FROM messages;
