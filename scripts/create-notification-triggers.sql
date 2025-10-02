-- =====================================================
-- TRIGGERS PARA NOTIFICAÇÕES AUTOMÁTICAS - CONFILAR
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. FUNÇÃO PARA CRIAR NOTIFICAÇÃO DE NOVA MENSAGEM
-- =====================================================

CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
  existing_notification UUID;
BEGIN
  -- Não criar notificação se o remetente é o próprio destinatário
  IF NEW.sender_id = NEW.receiver_id THEN
    RETURN NEW;
  END IF;

  -- Buscar nome do remetente
  SELECT full_name INTO sender_name
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Verificar se já existe notificação para esta mensagem
  SELECT id INTO existing_notification
  FROM notifications
  WHERE user_id = NEW.receiver_id
    AND type = 'message'
    AND metadata->>'message_id' = NEW.id::text;

  -- Se não existe, criar notificação
  IF existing_notification IS NULL THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      priority,
      action_url,
      metadata
    ) VALUES (
      NEW.receiver_id,
      '💬 Nova mensagem de ' || COALESCE(sender_name, 'Usuário'),
      LEFT(NEW.content, 100),
      'message',
      'high',
      NULL, -- Não usar action_url para mensagens
      jsonb_build_object(
        'sender_name', COALESCE(sender_name, 'Usuário'),
        'conversation_id', NEW.conversation_id,
        'sender_id', NEW.sender_id,
        'message_id', NEW.id,
        'action_type', 'open_chat'
      )
    );
    
    RAISE NOTICE '✅ Notificação de mensagem criada para usuário %', NEW.receiver_id;
  ELSE
    RAISE NOTICE '⏭️ Notificação de mensagem já existe para usuário %', NEW.receiver_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para nova mensagem
DROP TRIGGER IF EXISTS trigger_notify_new_message ON messages;
CREATE TRIGGER trigger_notify_new_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION create_message_notification();

-- =====================================================
-- 2. FUNÇÃO PARA CRIAR NOTIFICAÇÃO DE NOVO FAVORITO
-- =====================================================

CREATE OR REPLACE FUNCTION create_favorite_notification()
RETURNS TRIGGER AS $$
DECLARE
  favoriter_name TEXT;
  existing_notification UUID;
BEGIN
  -- Buscar nome de quem favoritou
  SELECT full_name INTO favoriter_name
  FROM profiles
  WHERE id = NEW.user_id;

  -- Verificar se já existe notificação para este favorito
  SELECT id INTO existing_notification
  FROM notifications
  WHERE user_id = NEW.favorite_user_id
    AND type = 'favorite'
    AND metadata->>'favorite_id' = NEW.id::text;

  -- Se não existe, criar notificação
  IF existing_notification IS NULL THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      priority,
      action_url,
      metadata
    ) VALUES (
      NEW.favorite_user_id,
      '❤️ ' || COALESCE(favoriter_name, 'Usuário') || ' adicionou você aos favoritos',
      'Seu perfil foi adicionado aos favoritos',
      'favorite',
      'normal',
      '/perfil/' || NEW.user_id,
      jsonb_build_object(
        'favoriter_name', COALESCE(favoriter_name, 'Usuário'),
        'favoriter_id', NEW.user_id,
        'favorite_id', NEW.id
      )
    );
    
    RAISE NOTICE '✅ Notificação de favorito criada para usuário %', NEW.favorite_user_id;
  ELSE
    RAISE NOTICE '⏭️ Notificação de favorito já existe para usuário %', NEW.favorite_user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para novo favorito
DROP TRIGGER IF EXISTS trigger_notify_new_favorite ON user_favorites;
CREATE TRIGGER trigger_notify_new_favorite
AFTER INSERT ON user_favorites
FOR EACH ROW
EXECUTE FUNCTION create_favorite_notification();

-- =====================================================
-- 3. FUNÇÃO PARA CRIAR NOTIFICAÇÃO DE NOVA RECOMENDAÇÃO
-- =====================================================

CREATE OR REPLACE FUNCTION create_recommendation_notification()
RETURNS TRIGGER AS $$
DECLARE
  recommender_name TEXT;
  existing_notification UUID;
BEGIN
  -- Buscar nome de quem recomendou
  SELECT full_name INTO recommender_name
  FROM profiles
  WHERE id = NEW.recommender_id;

  -- Verificar se já existe notificação para esta recomendação
  SELECT id INTO existing_notification
  FROM notifications
  WHERE user_id = NEW.recommended_id
    AND type = 'recommendation'
    AND metadata->>'recommendation_id' = NEW.id::text;

  -- Se não existe, criar notificação
  IF existing_notification IS NULL THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      priority,
      action_url,
      metadata
    ) VALUES (
      NEW.recommended_id,
      '⭐ ' || COALESCE(recommender_name, 'Usuário') || ' recomendou você',
      'Você recebeu uma nova recomendação',
      'recommendation',
      'normal',
      '/perfil/' || NEW.recommender_id,
      jsonb_build_object(
        'recommender_name', COALESCE(recommender_name, 'Usuário'),
        'recommender_id', NEW.recommender_id,
        'recommendation_id', NEW.id,
        'recommendation_type', NEW.recommendation_type
      )
    );
    
    RAISE NOTICE '✅ Notificação de recomendação criada para usuário %', NEW.recommended_id;
  ELSE
    RAISE NOTICE '⏭️ Notificação de recomendação já existe para usuário %', NEW.recommended_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para nova recomendação
DROP TRIGGER IF EXISTS trigger_notify_new_recommendation ON user_recommendations;
CREATE TRIGGER trigger_notify_new_recommendation
AFTER INSERT ON user_recommendations
FOR EACH ROW
EXECUTE FUNCTION create_recommendation_notification();

-- =====================================================
-- 4. FUNÇÃO PARA CRIAR NOTIFICAÇÃO DE NOVA AVALIAÇÃO
-- =====================================================

CREATE OR REPLACE FUNCTION create_review_notification()
RETURNS TRIGGER AS $$
DECLARE
  reviewer_name TEXT;
  existing_notification UUID;
BEGIN
  -- Não criar notificação se o avaliador é o próprio avaliado
  IF NEW.reviewer_id = NEW.reviewed_id THEN
    RETURN NEW;
  END IF;

  -- Buscar nome do avaliador
  SELECT full_name INTO reviewer_name
  FROM profiles
  WHERE id = NEW.reviewer_id;

  -- Verificar se já existe notificação para esta avaliação
  SELECT id INTO existing_notification
  FROM notifications
  WHERE user_id = NEW.reviewed_id
    AND type = 'review'
    AND metadata->>'review_id' = NEW.id::text;

  -- Se não existe, criar notificação
  IF existing_notification IS NULL THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      priority,
      action_url,
      metadata
    ) VALUES (
      NEW.reviewed_id,
      '⭐ ' || COALESCE(reviewer_name, 'Usuário') || ' avaliou você',
      'Você recebeu uma avaliação de ' || NEW.rating_person || ' estrelas',
      'review',
      'normal',
      '/avaliacoes',
      jsonb_build_object(
        'reviewer_name', COALESCE(reviewer_name, 'Usuário'),
        'reviewer_id', NEW.reviewer_id,
        'review_id', NEW.id,
        'rating', NEW.rating_person
      )
    );
    
    RAISE NOTICE '✅ Notificação de avaliação criada para usuário %', NEW.reviewed_id;
  ELSE
    RAISE NOTICE '⏭️ Notificação de avaliação já existe para usuário %', NEW.reviewed_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para nova avaliação
DROP TRIGGER IF EXISTS trigger_notify_new_review ON reviews;
CREATE TRIGGER trigger_notify_new_review
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION create_review_notification();

-- =====================================================
-- 5. VERIFICAR SE OS TRIGGERS FORAM CRIADOS
-- =====================================================

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'trigger_notify_%'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 6. TESTAR TRIGGERS (OPCIONAL - COMENTADO)
-- =====================================================

-- COMENTADO: Descomente para testar
/*
-- Teste 1: Criar mensagem de teste
INSERT INTO messages (sender_id, receiver_id, conversation_id, content)
VALUES (
  'seu-user-id-aqui',
  'outro-user-id-aqui',
  gen_random_uuid(),
  'Teste de notificação'
);

-- Verificar se notificação foi criada
SELECT * FROM notifications 
WHERE user_id = 'outro-user-id-aqui' 
AND type = 'message'
ORDER BY created_at DESC
LIMIT 1;
*/
