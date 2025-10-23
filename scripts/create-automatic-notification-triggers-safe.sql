-- =====================================================
-- TRIGGERS AUTOMÁTICOS PARA NOTIFICAÇÕES (VERSÃO SEGURA)
-- Verifica se tabelas existem antes de criar triggers
-- =====================================================

-- =====================================================
-- 1. NOTIFICAÇÃO AUTOMÁTICA - NOVA CONVERSA
-- =====================================================

-- Função para criar notificação de nova conversa
CREATE OR REPLACE FUNCTION notify_new_conversation()
RETURNS TRIGGER AS $$
DECLARE
  is_first_message BOOLEAN;
  sender_name TEXT;
BEGIN
  -- Verificar se é a primeira mensagem da conversa
  SELECT NOT EXISTS (
    SELECT 1 FROM messages 
    WHERE conversation_id = NEW.conversation_id 
    AND id != NEW.id
  ) INTO is_first_message;
  
  -- Se for a primeira mensagem, criar notificação
  IF is_first_message THEN
    -- Buscar nome do remetente
    SELECT full_name INTO sender_name
    FROM profiles
    WHERE id = NEW.sender_id;
    
    -- Criar notificação para o destinatário
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      action_url,
      priority,
      metadata
    ) VALUES (
      NEW.receiver_id,
      'message',
      'Nova conversa',
      COALESCE(sender_name, 'Alguém') || ' iniciou uma conversa com você',
      '/mensagens?conversation=' || NEW.conversation_id,
      'high',
      jsonb_build_object(
        'conversation_id', NEW.conversation_id,
        'sender_id', NEW.sender_id,
        'sender_name', sender_name
      )
    );
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro, não falhar o INSERT
  RAISE WARNING 'Erro ao criar notificação de nova conversa: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger apenas se tabela messages existir
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'messages'
  ) THEN
    DROP TRIGGER IF EXISTS trigger_notify_new_conversation ON messages;
    CREATE TRIGGER trigger_notify_new_conversation
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_conversation();
    
    RAISE NOTICE '✅ Trigger notify_new_conversation criado com sucesso';
  ELSE
    RAISE NOTICE '⚠️ Tabela messages não existe, trigger não criado';
  END IF;
END $$;

-- =====================================================
-- 2. NOTIFICAÇÃO AUTOMÁTICA - NOVA AVALIAÇÃO
-- =====================================================

-- Função para criar notificação de nova avaliação
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER AS $$
DECLARE
  reviewer_name TEXT;
BEGIN
  -- Buscar nome do avaliador
  SELECT full_name INTO reviewer_name
  FROM profiles
  WHERE id = NEW.reviewer_id;
  
  -- Criar notificação para o avaliado
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    priority,
    metadata
  ) VALUES (
    NEW.professional_id,
    'review',
    'Nova avaliação recebida',
    COALESCE(reviewer_name, 'Alguém') || ' te avaliou com ' || NEW.rating || ' estrelas',
    '/avaliacoes',
    'normal',
    jsonb_build_object(
      'review_id', NEW.id,
      'reviewer_id', NEW.reviewer_id,
      'reviewer_name', reviewer_name,
      'rating', NEW.rating
    )
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Erro ao criar notificação de avaliação: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger apenas se tabela reviews existir
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'reviews'
  ) THEN
    DROP TRIGGER IF EXISTS trigger_notify_new_review ON reviews;
    CREATE TRIGGER trigger_notify_new_review
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_review();
    
    RAISE NOTICE '✅ Trigger notify_new_review criado com sucesso';
  ELSE
    RAISE NOTICE '⚠️ Tabela reviews não existe, trigger não criado';
  END IF;
END $$;

-- =====================================================
-- 3. NOTIFICAÇÃO AUTOMÁTICA - NOVO COMENTÁRIO
-- =====================================================

-- Função para criar notificação de novo comentário
CREATE OR REPLACE FUNCTION notify_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  commenter_name TEXT;
  parent_author_id UUID;
BEGIN
  -- Buscar nome do comentador
  SELECT full_name INTO commenter_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Buscar autor do post
  SELECT user_id INTO post_author_id
  FROM posts
  WHERE id = NEW.post_id;
  
  -- Se não é o próprio autor comentando
  IF post_author_id != NEW.user_id THEN
    -- Criar notificação para o autor do post
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      action_url,
      priority,
      metadata
    ) VALUES (
      post_author_id,
      'post_comment',
      'Novo comentário',
      COALESCE(commenter_name, 'Alguém') || ' comentou no seu post',
      '/feed?post=' || NEW.post_id,
      'normal',
      jsonb_build_object(
        'post_id', NEW.post_id,
        'comment_id', NEW.id,
        'commenter_id', NEW.user_id,
        'commenter_name', commenter_name
      )
    );
  END IF;
  
  -- Se é resposta a um comentário
  IF NEW.parent_id IS NOT NULL THEN
    -- Buscar autor do comentário pai
    SELECT user_id INTO parent_author_id
    FROM comments
    WHERE id = NEW.parent_id;
    
    -- Se não é o próprio autor respondendo
    IF parent_author_id != NEW.user_id AND parent_author_id != post_author_id THEN
      -- Criar notificação para o autor do comentário pai
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        action_url,
        priority,
        metadata
      ) VALUES (
        parent_author_id,
        'post_comment',
        'Resposta ao seu comentário',
        COALESCE(commenter_name, 'Alguém') || ' respondeu ao seu comentário',
        '/feed?post=' || NEW.post_id || '&comment=' || NEW.id,
        'normal',
        jsonb_build_object(
          'post_id', NEW.post_id,
          'comment_id', NEW.id,
          'parent_id', NEW.parent_id,
          'commenter_id', NEW.user_id,
          'commenter_name', commenter_name
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Erro ao criar notificação de comentário: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger apenas se tabela comments existir
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'comments'
  ) THEN
    DROP TRIGGER IF EXISTS trigger_notify_new_comment ON comments;
    CREATE TRIGGER trigger_notify_new_comment
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_comment();
    
    RAISE NOTICE '✅ Trigger notify_new_comment criado com sucesso';
  ELSE
    RAISE NOTICE '⚠️ Tabela comments não existe, trigger não criado (isso é normal)';
  END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Ver triggers criados
DO $$
DECLARE
  trigger_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'trigger_notify%';
  
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'RESUMO: % trigger(s) criado(s) com sucesso!', trigger_count;
  RAISE NOTICE '================================================';
END $$;

-- Listar triggers criados
SELECT 
  trigger_name as "Trigger",
  event_object_table as "Tabela",
  action_timing as "Quando",
  event_manipulation as "Ação"
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'trigger_notify%'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- SUCESSO! ✅
-- =====================================================
-- Apenas triggers para tabelas existentes foram criados
-- 
-- Se alguma tabela não existir, isso é NORMAL e o trigger
-- será ignorado sem causar erro
-- 
-- Benefícios:
-- ✅ Notificações automáticas
-- ✅ Não depende do frontend
-- ✅ Mais confiável
-- ✅ Melhor performance
-- ✅ Tratamento de erros incluído
-- =====================================================

