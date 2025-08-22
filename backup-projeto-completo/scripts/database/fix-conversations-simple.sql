-- Script simplificado para corrigir tabelas de conversas
-- Execute no SQL Editor do Supabase como usuário postgres

-- ========================================
-- 1. VERIFICAR ESTRUTURA ATUAL DAS TABELAS
-- ========================================

-- Verificar se as tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'conversation_participants', 'messages', 'profiles');

-- ========================================
-- 2. DESABILITAR RLS TEMPORARIAMENTE
-- ========================================
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. REMOVER TODAS AS POLÍTICAS RLS
-- ========================================
-- Remover políticas da tabela conversations
DROP POLICY IF EXISTS "Enable all for authenticated users" ON conversations;
DROP POLICY IF EXISTS "conversations_policy" ON conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;

-- Remover políticas da tabela conversation_participants
DROP POLICY IF EXISTS "Enable all for authenticated users" ON conversation_participants;
DROP POLICY IF EXISTS "participants_policy" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert themselves as participants" ON conversation_participants;

-- Remover políticas da tabela messages
DROP POLICY IF EXISTS "Enable all for authenticated users" ON messages;
DROP POLICY IF EXISTS "messages_policy" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;

-- ========================================
-- 4. VERIFICAR CONSTRAINTS E RELACIONAMENTOS
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
WHERE tc.table_name IN ('conversation_participants', 'messages')
AND tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public';

-- ========================================
-- 5. VERIFICAR RESULTADO FINAL
-- ========================================
-- Verificar se RLS está desabilitado
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages')
ORDER BY tablename;

-- Verificar se não há políticas RLS
SELECT 
  tablename,
  policyname
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages')
ORDER BY tablename;

-- ========================================
-- 6. TESTAR INSERÇÃO SIMPLES
-- ========================================
-- Verificar se há profiles para teste
SELECT COUNT(*) as total_profiles FROM profiles;

-- Verificar se há conversas existentes
SELECT COUNT(*) as total_conversations FROM conversations;

-- Verificar se há participantes existentes
SELECT COUNT(*) as total_participants FROM conversation_participants;

-- Verificar se há mensagens existentes
SELECT COUNT(*) as total_messages FROM messages;
