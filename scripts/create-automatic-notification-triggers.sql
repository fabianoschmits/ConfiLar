-- =====================================================
-- TRIGGERS AUTOMÁTICOS PARA NOTIFICAÇÕES
-- Mover lógica do frontend para o banco de dados
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
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_notify_new_conversation ON messages;
CREATE TRIGGER trigger_notify_new_conversation
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION notify_new_conversation();

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
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_notify_new_review ON reviews;
CREATE TRIGGER trigger_notify_new_review
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION notify_new_review();

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
    
    RAISE NOTICE '✅ Trigger para comments criado com sucesso';
  ELSE
    RAISE NOTICE '⚠️ Tabela comments não existe, trigger não criado';
  END IF;
END $$;

-- =====================================================
-- 4. NOTIFICAÇÃO AUTOMÁTICA - NOVO SEGUIDOR
-- =====================================================

-- Função para criar notificação de novo seguidor
CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS TRIGGER AS $$
DECLARE
  follower_name TEXT;
BEGIN
  -- Buscar nome do seguidor
  SELECT full_name INTO follower_name
  FROM profiles
  WHERE id = NEW.follower_id;
  
  -- Criar notificação para o seguido
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    priority,
    metadata
  ) VALUES (
    NEW.following_id,
    'follow',
    'Novo seguidor',
    COALESCE(follower_name, 'Alguém') || ' começou a te seguir',
    '/perfil/' || NEW.follower_id,
    'low',
    jsonb_build_object(
      'follower_id', NEW.follower_id,
      'follower_name', follower_name
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger (se tabela followers existir)
-- DROP TRIGGER IF EXISTS trigger_notify_new_follower ON followers;
-- CREATE TRIGGER trigger_notify_new_follower
-- AFTER INSERT ON followers
-- FOR EACH ROW
-- EXECUTE FUNCTION notify_new_follower();

-- =====================================================
-- 5. NOTIFICAÇÃO AUTOMÁTICA - POST CURTIDO
-- =====================================================

-- Função para criar notificação de curtida
CREATE OR REPLACE FUNCTION notify_post_liked()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  liker_name TEXT;
BEGIN
  -- Buscar nome de quem curtiu
  SELECT full_name INTO liker_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Buscar autor do post
  SELECT user_id INTO post_author_id
  FROM posts
  WHERE id = NEW.post_id;
  
  -- Se não é o próprio autor curtindo
  IF post_author_id != NEW.user_id THEN
    -- Criar notificação
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
      'post_like',
      'Nova curtida',
      COALESCE(liker_name, 'Alguém') || ' curtiu seu post',
      '/feed?post=' || NEW.post_id,
      'low',
      jsonb_build_object(
        'post_id', NEW.post_id,
        'liker_id', NEW.user_id,
        'liker_name', liker_name
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger (se tabela post_likes existir)
-- DROP TRIGGER IF EXISTS trigger_notify_post_liked ON post_likes;
-- CREATE TRIGGER trigger_notify_post_liked
-- AFTER INSERT ON post_likes
-- FOR EACH ROW
-- EXECUTE FUNCTION notify_post_liked();

-- =====================================================
-- 6. NOTIFICAÇÃO AUTOMÁTICA - FAVORITO
-- =====================================================

-- Função para criar notificação de favorito
CREATE OR REPLACE FUNCTION notify_favorited()
RETURNS TRIGGER AS $$
DECLARE
  favoriter_name TEXT;
BEGIN
  -- Buscar nome de quem favoritou
  SELECT full_name INTO favoriter_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Criar notificação para o favoritado
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
    'favorite',
    'Você foi favoritado',
    COALESCE(favoriter_name, 'Alguém') || ' adicionou você aos favoritos',
    '/perfil/' || NEW.user_id,
    'low',
    jsonb_build_object(
      'favoriter_id', NEW.user_id,
      'favoriter_name', favoriter_name
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger (se tabela favorites existir)
-- DROP TRIGGER IF EXISTS trigger_notify_favorited ON favorites;
-- CREATE TRIGGER trigger_notify_favorited
-- AFTER INSERT ON favorites
-- FOR EACH ROW
-- EXECUTE FUNCTION notify_favorited();

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Ver triggers criados
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'trigger_notify%'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- SUCESSO! ✅
-- =====================================================
-- Triggers criados com sucesso!
-- 
-- Benefícios:
-- ✅ Notificações automáticas (não depende do frontend)
-- ✅ Mais confiável (sempre executa)
-- ✅ Melhor performance (direto no banco)
-- ✅ Sem duplicação (trigger garante execução única)
-- ✅ Manutenção centralizada
-- 
-- IMPORTANTE:
-- - Alguns triggers estão comentados porque as tabelas podem não existir
-- - Descomente conforme necessário
-- - Ajuste os nomes de colunas se diferentes
-- =====================================================

