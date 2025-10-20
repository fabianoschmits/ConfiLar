-- =====================================================
-- TESTE DE ENVIO DE MENSAGENS
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. Verificar se a tabela messages existe e sua estrutura
SELECT 
  'ESTRUTURA_MESSAGES' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'messages'
ORDER BY ordinal_position;

-- 2. Verificar se há conversas disponíveis
SELECT 
  'CONVERSAS_DISPONIVEIS' as status,
  COUNT(*) as total_conversas,
  COUNT(*) FILTER (WHERE client_id IS NOT NULL) as com_client_id,
  COUNT(*) FILTER (WHERE professional_id IS NOT NULL) as com_professional_id
FROM conversations;

-- 3. Verificar políticas RLS
SELECT 
  'POLITICAS_RLS' as status,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

-- 4. Verificar se RLS está habilitado
SELECT 
  'RLS_STATUS' as status,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'messages';

-- 5. Testar inserção de mensagem (simular envio)
DO $$
DECLARE
  test_conversation_id UUID;
  test_sender_id UUID;
  test_receiver_id UUID;
  message_id UUID;
  error_message TEXT;
BEGIN
  -- Obter uma conversa de teste
  SELECT id, client_id, professional_id 
  INTO test_conversation_id, test_sender_id, test_receiver_id
  FROM conversations 
  WHERE client_id IS NOT NULL AND professional_id IS NOT NULL
  LIMIT 1;
  
  IF test_conversation_id IS NOT NULL THEN
    RAISE NOTICE 'TESTE_MESSAGE: Conversa encontrada - ID: %, Sender: %, Receiver: %', 
      test_conversation_id, test_sender_id, test_receiver_id;
    
    -- Tentar inserir mensagem de teste
    BEGIN
      INSERT INTO messages (
        conversation_id,
        sender_id,
        receiver_id,
        content,
        is_read
      ) VALUES (
        test_conversation_id,
        test_sender_id,
        test_receiver_id,
        'Mensagem de teste - ' || NOW()::text,
        false
      ) RETURNING id INTO message_id;
      
      RAISE NOTICE 'TESTE_INSERT: SUCESSO - Mensagem inserida com ID: %', message_id;
      
      -- Verificar se a mensagem foi inserida
      IF EXISTS (SELECT 1 FROM messages WHERE id = message_id) THEN
        RAISE NOTICE 'TESTE_VERIFICACAO: SUCESSO - Mensagem encontrada no banco';
        
        -- Deletar mensagem de teste
        DELETE FROM messages WHERE id = message_id;
        RAISE NOTICE 'TESTE_CLEANUP: SUCESSO - Mensagem de teste removida';
      ELSE
        RAISE NOTICE 'TESTE_VERIFICACAO: ERRO - Mensagem não encontrada após inserção';
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT;
      RAISE NOTICE 'TESTE_INSERT: ERRO - %', error_message;
    END;
    
  ELSE
    RAISE NOTICE 'TESTE_MESSAGE: ERRO - Nenhuma conversa válida encontrada';
  END IF;
END $$;

-- 6. Verificar permissões de usuário autenticado
SELECT 
  'PERMISSOES_USUARIO' as status,
  has_table_privilege('authenticated', 'messages', 'SELECT') as can_select,
  has_table_privilege('authenticated', 'messages', 'INSERT') as can_insert,
  has_table_privilege('authenticated', 'messages', 'UPDATE') as can_update,
  has_table_privilege('authenticated', 'messages', 'DELETE') as can_delete;

-- 7. Verificar se há mensagens na tabela
SELECT 
  'CONTAGEM_MESSAGES' as status,
  COUNT(*) as total_messages,
  COUNT(*) FILTER (WHERE is_read = false) as unread_messages,
  COUNT(*) FILTER (WHERE is_read = true) as read_messages,
  MIN(created_at) as oldest_message,
  MAX(created_at) as newest_message
FROM messages;

-- 8. Verificar logs de erro (se houver)
SELECT 
  'LOGS_ERRO' as status,
  'Verifique os logs do Supabase para erros específicos' as observacao;

SELECT 
  'RESUMO_TESTE' as status,
  'Teste de envio de mensagens concluído!' as resultado,
  NOW() as timestamp;
