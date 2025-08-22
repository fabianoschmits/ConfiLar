-- Script para corrigir políticas RLS das tabelas de conversas
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'conversation_participants', 'messages', 'profiles');

-- 2. Verificar estrutura da tabela conversations
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND table_schema = 'public';

-- 3. Verificar estrutura da tabela conversation_participants
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'conversation_participants' 
AND table_schema = 'public';

-- 4. Verificar estrutura da tabela messages
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND table_schema = 'public';

-- 5. Verificar estrutura da tabela profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- 6. Verificar políticas RLS existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'profiles');

-- 7. Remover políticas RLS existentes (se houver)
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert themselves as participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;

-- 8. Criar políticas RLS para conversations
CREATE POLICY "Users can view their own conversations" ON conversations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = id
    AND cp.profile_id = auth.uid()::text
  )
);

CREATE POLICY "Users can insert their own conversations" ON conversations
FOR INSERT WITH CHECK (true);

-- 9. Criar políticas RLS para conversation_participants
CREATE POLICY "Users can view conversations they participate in" ON conversation_participants
FOR SELECT USING (
  profile_id = auth.uid()::text
);

CREATE POLICY "Users can insert themselves as participants" ON conversation_participants
FOR INSERT WITH CHECK (
  profile_id = auth.uid()::text
);

-- 10. Criar políticas RLS para messages
CREATE POLICY "Users can view messages in their conversations" ON messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_id
    AND cp.profile_id = auth.uid()::text
  )
);

CREATE POLICY "Users can insert messages in their conversations" ON messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_id
    AND cp.profile_id = auth.uid()::text
  )
);

-- 11. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'profiles');

-- 12. Testar inserção de dados (opcional)
-- INSERT INTO conversations DEFAULT VALUES RETURNING id;
-- INSERT INTO conversation_participants (conversation_id, profile_id) VALUES ('ID_DA_CONVERSA', 'SEU_USER_ID');
-- INSERT INTO messages (conversation_id, sender_id, content) VALUES ('ID_DA_CONVERSA', 'SEU_USER_ID', 'Teste');
