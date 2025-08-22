-- Script corrigido para resolver erro UUID vs Text
-- Execute no SQL Editor do Supabase

-- 1. Habilitar RLS nas tabelas
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes
DROP POLICY IF EXISTS "Enable all" ON conversations;
DROP POLICY IF EXISTS "Enable all" ON conversation_participants;
DROP POLICY IF EXISTS "Enable all" ON messages;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert themselves as participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;

-- 3. Criar políticas simples (sem conversões de tipo)
CREATE POLICY "Enable all for authenticated users" ON conversations
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON conversation_participants
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON messages
FOR ALL USING (auth.role() = 'authenticated');

-- 4. Verificar se funcionou
SELECT tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages');
