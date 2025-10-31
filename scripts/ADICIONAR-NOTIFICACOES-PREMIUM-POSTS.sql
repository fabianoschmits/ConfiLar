-- =============================================
-- ADICIONAR NOTIFICAÇÕES PARA POSTS PREMIUM
-- =============================================
-- Este script adiciona notificações para:
-- 1. Posts premium expirando em breve (24h)
-- 2. Posts premium expirados
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. FUNÇÃO PARA NOTIFICAR POSTS EXPIRANDO
-- =============================================
CREATE OR REPLACE FUNCTION notify_premium_posts_expiring()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
  post_record RECORD;
  owner_name TEXT;
BEGIN
  -- Buscar posts que vão expirar nas próximas 24h
  FOR post_record IN
    SELECT id, user_id, title, premium_expires_at
    FROM feed_posts
    WHERE is_premium = TRUE
      AND premium_expires_at IS NOT NULL
      AND premium_expires_at > NOW()
      AND premium_expires_at < NOW() + INTERVAL '24 hours'
      AND is_active = TRUE
  LOOP
    -- Verificar se já existe notificação para este post
    IF NOT EXISTS (
      SELECT 1 FROM notifications
      WHERE user_id = post_record.user_id
        AND type = 'warning'
        AND metadata->>'post_id' = post_record.id::text
        AND metadata->>'type' = 'premium_expiring'
        AND created_at > NOW() - INTERVAL '25 hours' -- Evitar notificações duplicadas
    ) THEN
      -- Buscar nome do dono
      SELECT full_name INTO owner_name
      FROM profiles
      WHERE id = post_record.user_id;

      -- Criar notificação
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        action_url,
        priority,
        metadata,
        is_read
      ) VALUES (
        post_record.user_id,
        'warning',
        '⏰ Seu post premium está expirando!',
        'O post "' || COALESCE(LEFT(post_record.title, 40), 'Premium') || '" vai expirar em menos de 24 horas',
        '/feed',
        'high',
        jsonb_build_object(
          'post_id', post_record.id,
          'post_title', post_record.title,
          'expires_at', post_record.premium_expires_at,
          'type', 'premium_expiring'
        ),
        FALSE
      );
      
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'Notificações de expiração criadas: %', v_count;
  RETURN v_count;
END;
$$;

-- =============================================
-- 2. FUNÇÃO PARA NOTIFICAR POSTS EXPIRADOS
-- =============================================
CREATE OR REPLACE FUNCTION notify_premium_posts_expired()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
  post_record RECORD;
  owner_name TEXT;
BEGIN
  -- Buscar posts que acabaram de expirar (últimas 2 horas)
  FOR post_record IN
    SELECT id, user_id, title, premium_expires_at
    FROM feed_posts
    WHERE is_premium = TRUE
      AND premium_expires_at IS NOT NULL
      AND premium_expires_at < NOW()
      AND premium_expires_at > NOW() - INTERVAL '2 hours' -- Apenas posts que expiraram há 2h ou menos
      AND is_active = FALSE -- Já foi desativado
  LOOP
    -- Verificar se já existe notificação para este post
    IF NOT EXISTS (
      SELECT 1 FROM notifications
      WHERE user_id = post_record.user_id
        AND type = 'info'
        AND metadata->>'post_id' = post_record.id::text
        AND metadata->>'type' = 'premium_expired'
        AND created_at > NOW() - INTERVAL '3 hours' -- Evitar notificações duplicadas
    ) THEN
      -- Buscar nome do dono
      SELECT full_name INTO owner_name
      FROM profiles
      WHERE id = post_record.user_id;

      -- Criar notificação
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        action_url,
        priority,
        metadata,
        is_read
      ) VALUES (
        post_record.user_id,
        'info',
        '📅 Seu post premium expirou',
        'O post "' || COALESCE(LEFT(post_record.title, 40), 'Premium') || '" expirou. Você pode criar um novo post premium',
        '/confipoints/comprar',
        'normal',
        jsonb_build_object(
          'post_id', post_record.id,
          'post_title', post_record.title,
          'expired_at', post_record.premium_expires_at,
          'type', 'premium_expired'
        ),
        FALSE
      );
      
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'Notificações de expiração criadas: %', v_count;
  RETURN v_count;
END;
$$;

-- =============================================
-- 3. ATUALIZAR FUNÇÃO maintain_premium_posts
-- =============================================
CREATE OR REPLACE FUNCTION maintain_premium_posts()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_deactivated_count INTEGER;
  v_deactivated_ids UUID[];
  v_expiring_notifications INTEGER;
  v_expired_notifications INTEGER;
BEGIN
  -- 1. Notificar posts que vão expirar em breve
  v_expiring_notifications := notify_premium_posts_expiring();
  
  -- 2. Desativar posts expirados
  SELECT * INTO v_deactivated_count, v_deactivated_ids
  FROM deactivate_expired_premium_posts();
  
  -- 3. Notificar posts que acabaram de expirar
  v_expired_notifications := notify_premium_posts_expired();

  -- Construir resultado
  v_result := json_build_object(
    'success', TRUE,
    'deactivated_count', v_deactivated_count,
    'deactivated_post_ids', v_deactivated_ids,
    'expiring_notifications', v_expiring_notifications,
    'expired_notifications', v_expired_notifications,
    'timestamp', NOW()
  );

  RETURN v_result;
END;
$$;

-- =============================================
-- 4. GARANTIR PERMISSÕES
-- =============================================
GRANT EXECUTE ON FUNCTION notify_premium_posts_expiring() TO service_role;
GRANT EXECUTE ON FUNCTION notify_premium_posts_expired() TO service_role;
GRANT EXECUTE ON FUNCTION maintain_premium_posts() TO service_role;

-- =============================================
-- 5. TESTAR AS FUNÇÕES
-- =============================================
-- Descomente para testar manualmente:

-- Testar notificações de expiração
-- SELECT notify_premium_posts_expiring();

-- Testar notificações de expirados
-- SELECT notify_premium_posts_expired();

-- Testar função completa
-- SELECT * FROM maintain_premium_posts();

-- =============================================
-- 6. MENSAGEM DE SUCESSO
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ NOTIFICAÇÕES DE PREMIUM POSTS CONFIGURADAS!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Funcionalidades:';
  RAISE NOTICE '   1. Notifica quando post vai expirar em 24h';
  RAISE NOTICE '   2. Notifica quando post expira';
  RAISE NOTICE '   3. Notificações são executadas automaticamente pelo cron';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 O cron job já existente será atualizado automaticamente!';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Para testar:';
  RAISE NOTICE '   SELECT * FROM maintain_premium_posts();';
  RAISE NOTICE '';
END $$;

-- =============================================
-- FIM DO SCRIPT
-- =============================================

