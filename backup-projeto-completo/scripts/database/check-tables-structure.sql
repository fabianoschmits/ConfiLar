-- Script para verificar a estrutura das tabelas de conversas
-- Execute no SQL Editor do Supabase para diagnosticar o problema

-- ========================================
-- 1. VERIFICAR TABELAS EXISTENTES
-- ========================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'conversations', 
  'conversation_participants', 
  'messages', 
  'profiles',
  'auth_users'
)
ORDER BY table_name;

-- ========================================
-- 2. VERIFICAR ESTRUTURA DA TABELA conversations
-- ========================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 3. VERIFICAR ESTRUTURA DA TABELA conversation_participants
-- ========================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'conversation_participants' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 4. VERIFICAR ESTRUTURA DA TABELA messages
-- ========================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 5. VERIFICAR ESTRUTURA DA TABELA profiles
-- ========================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 6. VERIFICAR CONSTRAINTS E CHAVES
-- ========================================
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name IN ('conversations', 'conversation_participants', 'messages', 'profiles')
AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- ========================================
-- 7. VERIFICAR POLÍTICAS RLS EXISTENTES
-- ========================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'profiles')
ORDER BY tablename, policyname;

-- ========================================
-- 8. VERIFICAR SE RLS ESTÁ HABILITADO
-- ========================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'profiles')
ORDER BY tablename;

-- ========================================
-- 9. VERIFICAR DADOS DE EXEMPLO (se houver)
-- ========================================
-- Verificar se há dados nas tabelas
SELECT 'conversations' as table_name, COUNT(*) as record_count FROM conversations
UNION ALL
SELECT 'conversation_participants' as table_name, COUNT(*) as record_count FROM conversation_participants
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as record_count FROM messages
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles;

-- ========================================
-- 10. VERIFICAR TIPOS DE DADOS ESPECÍFICOS
-- ========================================
-- Verificar se profile_id é realmente UUID
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns 
WHERE table_name = 'conversation_participants' 
AND column_name = 'profile_id'
AND table_schema = 'public';

-- Verificar se auth.uid() retorna UUID
SELECT 
  pg_typeof(auth.uid()) as auth_uid_type,
  auth.uid() as current_user_id;
