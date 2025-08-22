-- Script para corrigir políticas duplicadas e conflitantes
-- Execute no SQL Editor do Supabase

-- ========================================
-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES
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
-- 2. VERIFICAR SE RLS ESTÁ HABILITADO
-- ========================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. CRIAR POLÍTICAS RLS SIMPLES E CORRETAS
-- ========================================

-- Política para conversations (permitir tudo para usuários autenticados)
CREATE POLICY "conversations_authenticated_access" ON conversations
FOR ALL USING (auth.role() = 'authenticated');

-- Política para conversation_participants (permitir tudo para usuários autenticados)
CREATE POLICY "participants_authenticated_access" ON conversation_participants
FOR ALL USING (auth.role() = 'authenticated');

-- Política para messages (permitir tudo para usuários autenticados)
CREATE POLICY "messages_authenticated_access" ON messages
FOR ALL USING (auth.role() = 'authenticated');

-- ========================================
-- 4. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
-- ========================================
SELECT 
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages')
ORDER BY tablename, policyname;

-- ========================================
-- 5. TESTAR INSERÇÃO (OPCIONAL)
-- ========================================
-- Descomente as linhas abaixo para testar se as políticas funcionam
-- INSERT INTO conversations DEFAULT VALUES RETURNING id;
-- INSERT INTO conversation_participants (conversation_id, profile_id) VALUES ('ID_DA_CONVERSA', 'SEU_USER_ID');
-- INSERT INTO messages (conversation_id, sender_id, content) VALUES ('ID_DA_CONVERSA', 'SEU_USER_ID', 'Teste');
