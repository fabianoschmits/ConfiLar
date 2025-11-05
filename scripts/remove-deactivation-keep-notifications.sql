-- =====================================================
-- REMOVER DESATIVAÇÃO/DELETAR - MANTER APENAS NOTIFICAÇÕES
-- Execute este script no Supabase SQL Editor
-- =====================================================
-- Este script modifica as funções para NÃO desativar/deletar
-- posts e anúncios premium, apenas criar notificações
-- =====================================================

-- =====================================================
-- 1. MODIFICAR FUNÇÃO DE CLASSIFICADOS PREMIUM
-- =====================================================
-- Altera para apenas criar notificações sem desativar
CREATE OR REPLACE FUNCTION deactivate_expired_premium_classifieds()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_count INTEGER;
  v_expired_count INTEGER;
BEGIN
  -- Contar anúncios expirados (sem desativar)
  SELECT COUNT(*) INTO v_expired_count
  FROM classified_ads
  WHERE 
    is_premium = true
    AND premium_expires_at IS NOT NULL
    AND premium_expires_at < NOW()
    AND is_active = true;
  
  -- Criar notificações para anúncios expirados (sem desativar)
  IF v_expired_count > 0 THEN
    v_notification_count := notify_premium_classifieds_expired();
  ELSE
    v_notification_count := 0;
  END IF;
  
  -- Retornar contagem de notificações criadas (não mais contagem de desativados)
  RETURN v_notification_count;
END;
$$;

COMMENT ON FUNCTION deactivate_expired_premium_classifieds() IS 
'⚠️ MODIFICADA: Apenas cria notificações para anúncios premium expirados. NÃO desativa mais os anúncios.';

-- =====================================================
-- 2. MODIFICAR FUNÇÃO DE MANUTENÇÃO COMPLETA
-- =====================================================
CREATE OR REPLACE FUNCTION maintain_premium_classifieds()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expired_notifications INTEGER;
  v_expiring_notifications INTEGER;
BEGIN
  -- Criar notificações para anúncios que vão expirar (24h)
  v_expiring_notifications := notify_premium_classifieds_expiring();
  
  -- Criar notificações para anúncios expirados (sem desativar)
  v_expired_notifications := deactivate_expired_premium_classifieds();
  
  RETURN jsonb_build_object(
    'deactivated_count', 0, -- Sempre 0 agora, pois não desativa mais
    'expiring_notifications', v_expiring_notifications,
    'expired_notifications', v_expired_notifications,
    'timestamp', NOW()
  );
END;
$$;

COMMENT ON FUNCTION maintain_premium_classifieds() IS 
'⚠️ MODIFICADA: Apenas cria notificações. NÃO desativa mais anúncios premium expirados.';

-- =====================================================
-- 3. VERIFICAR E MODIFICAR FUNÇÕES DE POSTS PREMIUM (SE EXISTIREM)
-- =====================================================

-- Modificar função de posts premium (se existir)
CREATE OR REPLACE FUNCTION deactivate_expired_premium_posts()
RETURNS TABLE (deactivated_count INTEGER, deactivated_post_ids UUID[]) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expired_count INTEGER := 0;
  v_expired_ids UUID[];
BEGIN
  -- Apenas contar posts expirados (sem desativar)
  SELECT 
    COUNT(*),
    ARRAY_AGG(id)
  INTO 
    v_expired_count,
    v_expired_ids
  FROM feed_posts
  WHERE is_premium = TRUE
    AND premium_expires_at IS NOT NULL
    AND premium_expires_at < NOW()
    AND is_active = TRUE;

  -- Log da operação
  RAISE NOTICE '⚠️ MODIFICADA: Apenas contando % posts premium expirados (sem desativar)', v_expired_count;

  RETURN QUERY SELECT v_expired_count, COALESCE(v_expired_ids, ARRAY[]::UUID[]);
END;
$$;

COMMENT ON FUNCTION deactivate_expired_premium_posts() IS 
'⚠️ MODIFICADA: Apenas conta posts premium expirados. NÃO desativa mais os posts.';

-- Modificar função maintain_premium_posts (se existir)
CREATE OR REPLACE FUNCTION maintain_premium_posts()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_expired_count INTEGER;
BEGIN
  -- Apenas contar posts expirados (sem desativar)
  SELECT deactivated_count INTO v_expired_count
  FROM deactivate_expired_premium_posts();
  
  -- Construir resultado
  v_result := json_build_object(
    'success', TRUE,
    'deactivated_count', 0, -- Sempre 0 agora
    'expired_count', v_expired_count, -- Contagem apenas
    'timestamp', NOW()
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION maintain_premium_posts() IS 
'⚠️ MODIFICADA: Apenas conta posts premium expirados. NÃO desativa mais os posts.';

-- =====================================================
-- 4. VERIFICAÇÃO FINAL
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Funções modificadas com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Funções atualizadas:';
  RAISE NOTICE '   - deactivate_expired_premium_classifieds() - Apenas notificações';
  RAISE NOTICE '   - maintain_premium_classifieds() - Apenas notificações';
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'deactivate_expired_premium_posts') THEN
    RAISE NOTICE '   - deactivate_expired_premium_posts() - Apenas contagem';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'maintain_premium_posts') THEN
    RAISE NOTICE '   - maintain_premium_posts() - Apenas contagem';
  END IF;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ IMPORTANTE:';
  RAISE NOTICE '   - Posts e anúncios premium NÃO serão mais desativados automaticamente';
  RAISE NOTICE '   - Apenas notificações serão criadas';
  RAISE NOTICE '   - Os cron jobs podem ser removidos (funções ainda podem ser chamadas manualmente)';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- 5. TESTE DAS FUNÇÕES
-- =====================================================
-- Descomente para testar:
-- SELECT maintain_premium_classifieds() as resultado;

