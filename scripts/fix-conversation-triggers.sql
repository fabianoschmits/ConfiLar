-- =====================================================
-- CORRIGIR TRIGGERS DA TABELA CONVERSATIONS
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. Verificar estrutura da tabela conversations
SELECT 
  'ESTRUTURA_CONVERSATIONS' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'conversations'
ORDER BY ordinal_position;

-- 2. Verificar funções existentes que podem estar causando problemas
SELECT 
  'FUNCOES_EXISTENTES' as status,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%message%'
ORDER BY routine_name;

-- 3. Remover funções problemáticas
DROP FUNCTION IF EXISTS notify_message() CASCADE;
DROP FUNCTION IF EXISTS notify_new_message() CASCADE;
DROP FUNCTION IF EXISTS create_message_notification() CASCADE;

-- 4. Remover triggers problemáticos
DROP TRIGGER IF EXISTS on_message_insert ON messages;
DROP TRIGGER IF EXISTS on_message_created ON messages;
DROP TRIGGER IF EXISTS trigger_notify_message ON messages;

-- 5. Criar função corrigida para notificações de mensagem
CREATE OR REPLACE FUNCTION notify_message()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
BEGIN
  -- Obter o ID do destinatário da conversa
  SELECT 
    CASE 
      WHEN c.client_id = NEW.sender_id THEN c.professional_id
      ELSE c.client_id
    END
  INTO recipient_id
  FROM conversations c
  WHERE c.id = NEW.conversation_id;

  -- Criar notificação se o destinatário foi encontrado
  IF recipient_id IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      is_read,
      priority,
      metadata
    ) VALUES (
      recipient_id,
      'Nova mensagem',
      'Você recebeu uma nova mensagem',
      'message',
      false,
      'normal',
      jsonb_build_object(
        'conversation_id', NEW.conversation_id,
        'message_id', NEW.id,
        'sender_id', NEW.sender_id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para notificações de mensagem
CREATE TRIGGER trigger_notify_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_message();

-- 7. Testar a função corrigida
DO $$
DECLARE
  test_conversation_id UUID;
  test_sender_id UUID;
  test_receiver_id UUID;
  message_id UUID;
  notification_count INTEGER;
BEGIN
  -- Obter uma conversa de teste
  SELECT id, client_id, professional_id 
  INTO test_conversation_id, test_sender_id, test_receiver_id
  FROM conversations 
  WHERE client_id IS NOT NULL AND professional_id IS NOT NULL
  LIMIT 1;
  
  IF test_conversation_id IS NOT NULL THEN
    RAISE NOTICE 'TESTE_TRIGGER: Conversa encontrada - ID: %, Client: %, Professional: %', 
      test_conversation_id, test_sender_id, test_receiver_id;
    
    -- Inserir mensagem de teste
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
      'Mensagem de teste para verificar trigger',
      false
    ) RETURNING id INTO message_id;
    
    RAISE NOTICE 'TESTE_INSERT: SUCESSO - Mensagem inserida com ID: %', message_id;
    
    -- Verificar se a notificação foi criada
    SELECT COUNT(*) INTO notification_count
    FROM notifications 
    WHERE user_id = test_receiver_id 
    AND type = 'message'
    AND metadata->>'message_id' = message_id::text;
    
    IF notification_count > 0 THEN
      RAISE NOTICE 'TESTE_NOTIFICATION: SUCESSO - % notificação(ões) criada(s)', notification_count;
    ELSE
      RAISE NOTICE 'TESTE_NOTIFICATION: ERRO - Nenhuma notificação criada';
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM notifications WHERE metadata->>'message_id' = message_id::text;
    DELETE FROM messages WHERE id = message_id;
    RAISE NOTICE 'TESTE_CLEANUP: SUCESSO - Dados de teste removidos';
    
  ELSE
    RAISE NOTICE 'TESTE_TRIGGER: ERRO - Nenhuma conversa válida encontrada';
  END IF;
END $$;

-- 8. Verificar triggers criados
SELECT 
  'TRIGGERS_CRIADOS' as status,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' 
  AND event_object_table = 'messages'
ORDER BY trigger_name;

-- 9. Verificar funções criadas
SELECT 
  'FUNCOES_CRIADAS' as status,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name = 'notify_message'
ORDER BY routine_name;

SELECT 
  'RESUMO_CORRECOES' as status,
  'Triggers da tabela conversations corrigidos com sucesso!' as resultado,
  NOW() as timestamp;
