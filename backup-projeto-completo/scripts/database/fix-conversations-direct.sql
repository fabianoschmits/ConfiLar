-- Script para corrigir tabelas de conversas diretamente
-- Execute no SQL Editor do Supabase como usuário postgres

-- ========================================
-- 1. VERIFICAR ESTRUTURA ATUAL DAS TABELAS
-- ========================================

-- Verificar se as tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'conversation_participants', 'messages', 'profiles');

-- ========================================
-- 2. CORRIGIR ESTRUTURA DAS TABELAS (se necessário)
-- ========================================

-- Verificar se a tabela conversations tem as colunas corretas
DO $$
BEGIN
  -- Adicionar coluna updated_at se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'conversations' AND column_name = 'updated_at') THEN
    ALTER TABLE conversations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- Adicionar trigger para atualizar updated_at
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversations_updated_at') THEN
    CREATE OR REPLACE FUNCTION update_conversations_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    CREATE TRIGGER update_conversations_updated_at
      BEFORE UPDATE ON conversations
      FOR EACH ROW
      EXECUTE FUNCTION update_conversations_updated_at();
  END IF;
END $$;

-- ========================================
-- 3. DESABILITAR RLS TEMPORARIAMENTE PARA TESTE
-- ========================================
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. REMOVER POLÍTICAS RLS PROBLEMÁTICAS
-- ========================================
DROP POLICY IF EXISTS "Enable all for authenticated users" ON conversations;
DROP POLICY IF EXISTS "conversations_policy" ON conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;

DROP POLICY IF EXISTS "Enable all for authenticated users" ON conversation_participants;
DROP POLICY IF EXISTS "participants_policy" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert themselves as participants" ON conversation_participants;

DROP POLICY IF EXISTS "Enable all for authenticated users" ON messages;
DROP POLICY IF EXISTS "messages_policy" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;

-- ========================================
-- 5. VERIFICAR CONSTRAINTS E RELACIONAMENTOS
-- ========================================
-- Verificar se as foreign keys estão corretas
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
-- 6. TESTAR INSERÇÃO DIRETA
-- ========================================
-- Testar se conseguimos inserir dados diretamente
DO $$
DECLARE
  test_conversation_id UUID;
  test_profile_id UUID;
BEGIN
  -- Buscar um profile_id válido para teste
  SELECT id INTO test_profile_id FROM profiles LIMIT 1;
  
  IF test_profile_id IS NOT NULL THEN
    -- Criar conversa de teste
    INSERT INTO conversations DEFAULT VALUES RETURNING id INTO test_conversation_id;
    
    -- Adicionar participante
    INSERT INTO conversation_participants (conversation_id, profile_id) 
    VALUES (test_conversation_id, test_profile_id);
    
    -- Adicionar mensagem de teste
    INSERT INTO messages (conversation_id, sender_id, content) 
    VALUES (test_conversation_id, test_profile_id, 'Mensagem de teste');
    
    RAISE NOTICE 'Teste bem-sucedido! Conversa criada: %, Profile: %', test_conversation_id, test_profile_id;
  ELSE
    RAISE NOTICE 'Nenhum profile encontrado para teste';
  END IF;
END $$;

-- ========================================
-- 7. VERIFICAR RESULTADO FINAL
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

-- Verificar dados de teste
SELECT 
  'conversations' as table_name, COUNT(*) as record_count FROM conversations
UNION ALL
SELECT 'conversation_participants' as table_name, COUNT(*) as record_count FROM conversation_participants
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as record_count FROM messages;
