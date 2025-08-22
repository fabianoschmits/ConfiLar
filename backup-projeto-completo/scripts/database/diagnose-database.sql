-- Script de diagnóstico completo do banco de dados
-- Execute no SQL Editor do Supabase para analisar a estrutura real

-- ========================================
-- 1. VERIFICAR TODAS AS TABELAS EXISTENTES
-- ========================================
SELECT 
  table_name,
  table_type,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ========================================
-- 2. VERIFICAR ESTRUTURA DAS TABELAS DE CONVERSAS
-- ========================================
-- conversations
SELECT 
  'conversations' as table_name,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- conversation_participants
SELECT 
  'conversation_participants' as table_name,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'conversation_participants' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- messages
SELECT 
  'messages' as table_name,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- profiles
SELECT 
  'profiles' as table_name,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 3. VERIFICAR CONSTRAINTS E RELACIONAMENTOS
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
-- 4. VERIFICAR POLÍTICAS RLS ATUAIS
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
-- 5. VERIFICAR SE RLS ESTÁ HABILITADO
-- ========================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'profiles')
ORDER BY tablename;

-- ========================================
-- 6. VERIFICAR DADOS EXISTENTES
-- ========================================
-- Contar registros em cada tabela
SELECT 'conversations' as table_name, COUNT(*) as record_count FROM conversations
UNION ALL
SELECT 'conversation_participants' as table_name, COUNT(*) as record_count FROM conversation_participants
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as record_count FROM messages
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles;

-- ========================================
-- 7. VERIFICAR TIPOS DE DADOS ESPECÍFICOS
-- ========================================
-- Verificar tipos das colunas principais
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name,
  CASE 
    WHEN udt_name = 'uuid' THEN 'UUID'
    WHEN udt_name = 'text' THEN 'TEXT'
    WHEN udt_name = 'int8' THEN 'BIGINT'
    WHEN udt_name = 'timestamp' THEN 'TIMESTAMP'
    ELSE udt_name
  END as readable_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'conversation_participants', 'messages', 'profiles')
AND column_name IN ('id', 'profile_id', 'conversation_id', 'sender_id', 'user_id')
ORDER BY table_name, column_name;

-- ========================================
-- 8. VERIFICAR SE AUTH.UID() FUNCIONA
-- ========================================
-- Testar se auth.uid() retorna algo
SELECT 
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'auth.uid() funciona'
    ELSE 'auth.uid() não funciona'
  END as auth_status,
  pg_typeof(auth.uid()) as auth_uid_type,
  auth.uid() as current_user_id;

-- ========================================
-- 9. VERIFICAR PERMISSÕES DO USUÁRIO ATUAL
-- ========================================
SELECT 
  current_user as current_user,
  session_user as session_user,
  current_setting('role') as current_role;
