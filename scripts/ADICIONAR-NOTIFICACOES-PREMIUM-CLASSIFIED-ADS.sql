-- =============================================
-- ADICIONAR NOTIFICAÇÕES PARA CLASSIFICADOS PREMIUM
-- =============================================
-- Este script adiciona notificações para:
-- 1. Anúncios premium expirando em breve (24h)
-- 2. Anúncios premium expirados
-- 3. Integração com função de desativação
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. FUNÇÃO PARA NOTIFICAR ANÚNCIOS EXPIRANDO
-- =============================================
CREATE OR REPLACE FUNCTION notify_premium_classifieds_expiring()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
  ad_record RECORD;
  owner_name TEXT;
  hours_until_expiry INTEGER;
BEGIN
  -- Buscar anúncios que vão expirar nas próximas 24h
  FOR ad_record IN
    SELECT id, user_id, title, premium_expires_at
    FROM classified_ads
    WHERE is_premium = TRUE
      AND premium_expires_at IS NOT NULL
      AND premium_expires_at > NOW()
      AND premium_expires_at < NOW() + INTERVAL '24 hours'
      AND is_active = TRUE
  LOOP
    -- Calcular horas até expiração
    hours_until_expiry := EXTRACT(EPOCH FROM (ad_record.premium_expires_at - NOW())) / 3600;
    
    -- Verificar se já existe notificação para este anúncio
    IF NOT EXISTS (
      SELECT 1 FROM notifications
      WHERE user_id = ad_record.user_id
        AND type = 'warning'
        AND metadata->>'classified_ad_id' = ad_record.id::text
        AND metadata->>'type' = 'premium_classified_expiring'
        AND created_at > NOW() - INTERVAL '25 hours' -- Evitar notificações duplicadas
    ) THEN
      -- Buscar nome do dono
      SELECT full_name INTO owner_name
      FROM profiles
      WHERE id = ad_record.user_id;

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
        ad_record.user_id,
        'warning',
        '⏰ Seu anúncio premium está expirando!',
        'O anúncio "' || COALESCE(LEFT(ad_record.title, 40), 'Premium') || '" vai expirar em menos de ' || 
        CASE 
          WHEN hours_until_expiry < 1 THEN '1 hora'
          WHEN hours_until_expiry = 1 THEN '1 hora'
          ELSE hours_until_expiry::text || ' horas'
        END,
        '/classificados',
        'high',
        jsonb_build_object(
          'classified_ad_id', ad_record.id,
          'classified_ad_title', ad_record.title,
          'expires_at', ad_record.premium_expires_at,
          'hours_until_expiry', hours_until_expiry,
          'type', 'premium_classified_expiring'
        ),
        FALSE
      );
      
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'Notificações de anúncios premium expirando criadas: %', v_count;
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION notify_premium_classifieds_expiring() IS 'Cria notificações para anúncios premium que expirarão em menos de 24 horas';

-- =============================================
-- 2. FUNÇÃO PARA NOTIFICAR ANÚNCIOS EXPIRADOS
-- =============================================
CREATE OR REPLACE FUNCTION notify_premium_classifieds_expired()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
  ad_record RECORD;
  owner_name TEXT;
BEGIN
  -- Buscar anúncios que acabaram de expirar (últimas 2 horas)
  FOR ad_record IN
    SELECT id, user_id, title, premium_expires_at
    FROM classified_ads
    WHERE is_premium = TRUE
      AND premium_expires_at IS NOT NULL
      AND premium_expires_at < NOW()
      AND premium_expires_at > NOW() - INTERVAL '2 hours' -- Apenas anúncios que expiraram há 2h ou menos
      AND is_active = FALSE -- Já foi desativado pela função de desativação
  LOOP
    -- Verificar se já existe notificação para este anúncio
    IF NOT EXISTS (
      SELECT 1 FROM notifications
      WHERE user_id = ad_record.user_id
        AND type = 'info'
        AND metadata->>'classified_ad_id' = ad_record.id::text
        AND metadata->>'type' = 'premium_classified_expired'
        AND created_at > NOW() - INTERVAL '3 hours' -- Evitar notificações duplicadas
    ) THEN
      -- Buscar nome do dono
      SELECT full_name INTO owner_name
      FROM profiles
      WHERE id = ad_record.user_id;

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
        ad_record.user_id,
        'info',
        '📅 Seu anúncio premium expirou',
        'O anúncio "' || COALESCE(LEFT(ad_record.title, 40), 'Premium') || '" expirou. Você pode criar um novo anúncio premium',
        '/classificados',
        'normal',
        jsonb_build_object(
          'classified_ad_id', ad_record.id,
          'classified_ad_title', ad_record.title,
          'expired_at', ad_record.premium_expires_at,
          'type', 'premium_classified_expired'
        ),
        FALSE
      );
      
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'Notificações de anúncios premium expirados criadas: %', v_count;
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION notify_premium_classifieds_expired() IS 'Cria notificações para anúncios premium que acabaram de expirar';

-- =============================================
-- 3. ATUALIZAR FUNÇÃO DE DESATIVAÇÃO PARA INCLUIR NOTIFICAÇÕES
-- =============================================
CREATE OR REPLACE FUNCTION deactivate_expired_premium_classifieds()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_count INTEGER;
  v_notification_count INTEGER;
BEGIN
  -- Desativar classificados premium expirados
  UPDATE classified_ads
  SET 
    is_active = false,
    is_premium = false,
    is_featured = false,
    updated_at = NOW()
  WHERE 
    is_premium = true
    AND premium_expires_at IS NOT NULL
    AND premium_expires_at < NOW()
    AND is_active = true;
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  
  -- Criar notificações para anúncios que acabaram de ser desativados
  IF affected_count > 0 THEN
    v_notification_count := notify_premium_classifieds_expired();
  END IF;
  
  RETURN affected_count;
END;
$$;

COMMENT ON FUNCTION deactivate_expired_premium_classifieds() IS 'Desativa anúncios premium expirados e cria notificações para os usuários';

-- =============================================
-- 4. FUNÇÃO PARA MANTER SISTEMA PREMIUM (COMPLETA)
-- =============================================
CREATE OR REPLACE FUNCTION maintain_premium_classifieds()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deactivated_count INTEGER;
  v_expiring_notifications INTEGER;
  v_expired_notifications INTEGER;
BEGIN
  -- Desativar anúncios expirados e criar notificações
  v_deactivated_count := deactivate_expired_premium_classifieds();
  
  -- Criar notificações para anúncios que vão expirar
  v_expiring_notifications := notify_premium_classifieds_expiring();
  
  -- Notificações de expirados já são criadas pela função de desativação
  v_expired_notifications := 0;
  
  RETURN jsonb_build_object(
    'deactivated_count', v_deactivated_count,
    'expiring_notifications', v_expiring_notifications,
    'expired_notifications', v_expired_notifications,
    'timestamp', NOW()
  );
END;
$$;

COMMENT ON FUNCTION maintain_premium_classifieds() IS 'Função completa para manutenção do sistema premium: desativa expirados e cria notificações';

-- =============================================
-- 5. ATUALIZAR CRON JOB PARA INCLUIR NOTIFICAÇÕES
-- =============================================
DO $$
BEGIN
  -- Verificar se pg_cron está disponível
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Remover job existente se houver
    BEGIN
      PERFORM cron.unschedule('deactivate-expired-premium-classifieds');
      RAISE NOTICE 'Job antigo removido (se existia)';
    EXCEPTION
      WHEN OTHERS THEN
        NULL; -- Job não existe, tudo bem
    END;

    -- Criar novo job que inclui notificações
    BEGIN
      PERFORM cron.schedule(
        'maintain-premium-classifieds',
        '59 2 * * *', -- Todos os dias às 02:59 UTC (23:59 horário de Brasília)
        'SELECT maintain_premium_classifieds();'
      );
      RAISE NOTICE '✅ Job pg_cron atualizado com sucesso!';
      RAISE NOTICE '   Agora inclui desativação e notificações';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Erro ao criar job pg_cron: %', SQLERRM;
        RAISE NOTICE '   Você precisará executar manualmente ou usar uma alternativa externa';
    END;
  ELSE
    RAISE NOTICE '⚠️  pg_cron não está habilitado no seu projeto Supabase';
    RAISE NOTICE '   Use Vercel Cron Jobs ou outra alternativa externa';
  END IF;
END $$;

-- =============================================
-- 6. VERIFICAÇÕES
-- =============================================

-- Verificar se as funções foram criadas
SELECT 
  'Verificação das funções:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'notify_premium_classifieds_expiring'
    ) THEN '✅ notify_premium_classifieds_expiring existe'
    ELSE '❌ notify_premium_classifieds_expiring não encontrada'
  END as status_expiring;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'notify_premium_classifieds_expired'
    ) THEN '✅ notify_premium_classifieds_expired existe'
    ELSE '❌ notify_premium_classifieds_expired não encontrada'
  END as status_expired;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'maintain_premium_classifieds'
    ) THEN '✅ maintain_premium_classifieds existe'
    ELSE '❌ maintain_premium_classifieds não encontrada'
  END as status_maintain;

-- Testar função de notificações expirando (não cria se não houver anúncios)
SELECT 
  'Teste função expirando:' as info,
  notify_premium_classifieds_expiring() as notificacoes_criadas;

-- Testar função de manutenção completa
SELECT 
  'Teste função completa:' as info,
  maintain_premium_classifieds() as resultado;

-- =============================================
-- 7. NOTAS IMPORTANTES
-- =============================================
-- 1. As notificações são criadas automaticamente:
--    - Anúncios expirando: quando faltam menos de 24 horas
--    - Anúncios expirados: quando são desativados
--
-- 2. O cron job executa diariamente às 23:59 (horário de Brasília)
--    e cria notificações automaticamente
--
-- 3. Para testar manualmente:
--    SELECT notify_premium_classifieds_expiring(); -- Notificar expirando
--    SELECT notify_premium_classifieds_expired(); -- Notificar expirados
--    SELECT maintain_premium_classifieds(); -- Função completa
--
-- 4. Se pg_cron não estiver disponível, atualize a API route:
--    /api/cron/expired-premium-classifieds para chamar maintain_premium_classifieds()

