-- =====================================================
-- CORRIGIR POLÍTICAS RLS DA TABELA MESSAGES
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Verificar se a tabela messages existe
SELECT 
  'TABELA_MESSAGES' as status,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'messages';

-- Verificar estrutura da tabela messages
SELECT 
  'ESTRUTURA_MESSAGES' as status,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'messages'
ORDER BY ordinal_position;

-- Verificar se RLS está habilitado
SELECT 
  'RLS_STATUS' as status,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'messages';

-- Verificar políticas existentes
SELECT 
  'POLITICAS_EXISTENTES' as status,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON messages;

-- Habilitar RLS se não estiver
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para messages
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.client_id = auth.uid() OR conversations.professional_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages in their conversations" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.client_id = auth.uid() OR conversations.professional_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE TO authenticated
  USING (sender_id = auth.uid());

-- Verificar políticas criadas
SELECT 
  'POLITICAS_CRIADAS' as status,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

-- Testar inserção de mensagem de teste
DO $$
DECLARE
  test_conversation_id UUID;
  test_user_id UUID;
  test_receiver_id UUID;
  message_id UUID;
BEGIN
  -- Obter uma conversa de teste
  SELECT id, client_id, professional_id INTO test_conversation_id, test_user_id, test_receiver_id
  FROM conversations 
  LIMIT 1;
  
  IF test_conversation_id IS NOT NULL THEN
    -- Inserir mensagem de teste
    INSERT INTO messages (
      conversation_id,
      sender_id,
      receiver_id,
      content,
      is_read
    ) VALUES (
      test_conversation_id,
      test_user_id,
      test_receiver_id,
      'Mensagem de teste para verificar RLS',
      false
    ) RETURNING id INTO message_id;
    
    RAISE NOTICE 'TESTE_INSERT_MESSAGE: SUCESSO - Mensagem inserida com ID: %', message_id;
    
    -- Deletar mensagem de teste
    DELETE FROM messages WHERE id = message_id;
    RAISE NOTICE 'TESTE_DELETE_MESSAGE: SUCESSO - Mensagem de teste removida';
  ELSE
    RAISE NOTICE 'TESTE_INSERT_MESSAGE: ERRO - Nenhuma conversa encontrada para teste';
  END IF;
END $$;

-- Verificar permissões de acesso
SELECT 
  'PERMISSOES_ACESSO' as status,
  has_table_privilege('authenticated', 'messages', 'SELECT') as can_select,
  has_table_privilege('authenticated', 'messages', 'INSERT') as can_insert,
  has_table_privilege('authenticated', 'messages', 'UPDATE') as can_update,
  has_table_privilege('authenticated', 'messages', 'DELETE') as can_delete;

SELECT 
  'RESUMO_CORRECOES' as status,
  'Políticas RLS da tabela messages corrigidas com sucesso!' as resultado,
  NOW() as timestamp;
