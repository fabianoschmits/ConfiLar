-- =============================================
-- SISTEMA AUTOMÁTICO DE EXPIRAÇÃO DE POSTS PREMIUM
-- =============================================
-- Este script cria funções e triggers para deletar automaticamente posts premium expirados
-- Os posts são deletados quando a data premium_expires_at é menor que a data atual

-- =============================================
-- 0. CRIAR COLUNAS PREMIUM SE NÃO EXISTIREM
-- =============================================
DO $$ 
BEGIN
  -- Adicionar coluna is_premium
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feed_posts' AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE feed_posts ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Coluna is_premium criada';
  ELSE
    RAISE NOTICE 'Coluna is_premium já existe';
  END IF;

  -- Adicionar coluna premium_points_spent
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feed_posts' AND column_name = 'premium_points_spent'
  ) THEN
    ALTER TABLE feed_posts ADD COLUMN premium_points_spent INTEGER DEFAULT 0;
    RAISE NOTICE 'Coluna premium_points_spent criada';
  ELSE
    RAISE NOTICE 'Coluna premium_points_spent já existe';
  END IF;

  -- Adicionar coluna premium_expires_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feed_posts' AND column_name = 'premium_expires_at'
  ) THEN
    ALTER TABLE feed_posts ADD COLUMN premium_expires_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Coluna premium_expires_at criada';
  ELSE
    RAISE NOTICE 'Coluna premium_expires_at já existe';
  END IF;

  -- Adicionar coluna premium_highlight_color
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feed_posts' AND column_name = 'premium_highlight_color'
  ) THEN
    ALTER TABLE feed_posts ADD COLUMN premium_highlight_color VARCHAR(7) DEFAULT '#FFD700';
    RAISE NOTICE 'Coluna premium_highlight_color criada';
  ELSE
    RAISE NOTICE 'Coluna premium_highlight_color já existe';
  END IF;
END $$;

-- =============================================
-- 1. FUNÇÃO PARA DELETAR POSTS EXPIRADOS
-- =============================================
CREATE OR REPLACE FUNCTION delete_expired_premium_posts()
RETURNS TABLE (deleted_count INTEGER, deleted_post_ids UUID[]) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER := 0;
  v_deleted_ids UUID[];
BEGIN
  -- Coletar IDs dos posts que serão deletados
  SELECT ARRAY_AGG(id) INTO v_deleted_ids
  FROM feed_posts
  WHERE is_premium = TRUE
    AND premium_expires_at IS NOT NULL
    AND premium_expires_at < NOW()
    AND is_active = TRUE;

  -- Deletar posts expirados
  DELETE FROM feed_posts
  WHERE is_premium = TRUE
    AND premium_expires_at IS NOT NULL
    AND premium_expires_at < NOW()
    AND is_active = TRUE;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  -- Log da operação
  RAISE NOTICE 'Deleted % expired premium posts', v_deleted_count;

  RETURN QUERY SELECT v_deleted_count, COALESCE(v_deleted_ids, ARRAY[]::UUID[]);
END;
$$;

-- =============================================
-- 2. FUNÇÃO PARA DESATIVAR POSTS EXPIRADOS (Soft Delete)
-- =============================================
-- Alternativa ao delete: apenas marca como inativo
CREATE OR REPLACE FUNCTION deactivate_expired_premium_posts()
RETURNS TABLE (deactivated_count INTEGER, deactivated_post_ids UUID[]) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deactivated_count INTEGER := 0;
  v_deactivated_ids UUID[];
BEGIN
  -- Coletar IDs dos posts que serão desativados
  SELECT ARRAY_AGG(id) INTO v_deactivated_ids
  FROM feed_posts
  WHERE is_premium = TRUE
    AND premium_expires_at IS NOT NULL
    AND premium_expires_at < NOW()
    AND is_active = TRUE;

  -- Desativar posts expirados (soft delete)
  UPDATE feed_posts
  SET 
    is_active = FALSE,
    is_featured = FALSE,
    updated_at = NOW()
  WHERE is_premium = TRUE
    AND premium_expires_at IS NOT NULL
    AND premium_expires_at < NOW()
    AND is_active = TRUE;

  GET DIAGNOSTICS v_deactivated_count = ROW_COUNT;

  -- Log da operação
  RAISE NOTICE 'Deactivated % expired premium posts', v_deactivated_count;

  RETURN QUERY SELECT v_deactivated_count, COALESCE(v_deactivated_ids, ARRAY[]::UUID[]);
END;
$$;

-- =============================================
-- 3. FUNÇÃO DE MANUTENÇÃO COMBINADA
-- =============================================
-- Esta função pode ser chamada periodicamente para manter o sistema limpo
CREATE OR REPLACE FUNCTION maintain_premium_posts()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_deactivated_count INTEGER;
  v_deactivated_ids UUID[];
BEGIN
  -- Desativar posts expirados
  SELECT * INTO v_deactivated_count, v_deactivated_ids
  FROM deactivate_expired_premium_posts();

  -- Construir resultado
  v_result := json_build_object(
    'success', TRUE,
    'deactivated_count', v_deactivated_count,
    'deactivated_post_ids', v_deactivated_ids,
    'timestamp', NOW()
  );

  RETURN v_result;
END;
$$;

-- =============================================
-- 4. TRIGGER PARA VERIFICAR EXPIRAÇÃO AO BUSCAR POSTS
-- =============================================
-- Este trigger atualiza automaticamente posts expirados quando são acessados
CREATE OR REPLACE FUNCTION check_post_expiration()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se o post é premium e está expirado, desativar
  IF NEW.is_premium = TRUE AND 
     NEW.premium_expires_at IS NOT NULL AND 
     NEW.premium_expires_at < NOW() AND 
     NEW.is_active = TRUE THEN
    
    NEW.is_active := FALSE;
    NEW.is_featured := FALSE;
    NEW.updated_at := NOW();
    
    RAISE NOTICE 'Post % expired and deactivated', NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Criar trigger (DROP primeiro se já existir)
DROP TRIGGER IF EXISTS trigger_check_post_expiration ON feed_posts;

CREATE TRIGGER trigger_check_post_expiration
  BEFORE UPDATE OF updated_at ON feed_posts
  FOR EACH ROW
  WHEN (NEW.is_premium = TRUE AND NEW.premium_expires_at IS NOT NULL)
  EXECUTE FUNCTION check_post_expiration();

-- =============================================
-- 5. VIEW PARA MONITORAR POSTS EXPIRADOS
-- =============================================
CREATE OR REPLACE VIEW v_expired_premium_posts AS
SELECT 
  id,
  user_id,
  title,
  premium_points_spent,
  premium_expires_at,
  created_at,
  is_active,
  EXTRACT(EPOCH FROM (NOW() - premium_expires_at)) / 3600 AS hours_expired
FROM feed_posts
WHERE is_premium = TRUE
  AND premium_expires_at IS NOT NULL
  AND premium_expires_at < NOW()
ORDER BY premium_expires_at DESC;

-- =============================================
-- 6. VIEW PARA MONITORAR POSTS PRÓXIMOS DA EXPIRAÇÃO
-- =============================================
CREATE OR REPLACE VIEW v_expiring_soon_premium_posts AS
SELECT 
  id,
  user_id,
  title,
  premium_points_spent,
  premium_expires_at,
  created_at,
  EXTRACT(EPOCH FROM (premium_expires_at - NOW())) / 3600 AS hours_remaining
FROM feed_posts
WHERE is_premium = TRUE
  AND premium_expires_at IS NOT NULL
  AND premium_expires_at > NOW()
  AND premium_expires_at < NOW() + INTERVAL '24 hours' -- Expira nas próximas 24h
  AND is_active = TRUE
ORDER BY premium_expires_at ASC;

-- =============================================
-- 7. GARANTIR PERMISSÕES
-- =============================================
-- Permitir que usuários autenticados visualizem as views
GRANT SELECT ON v_expired_premium_posts TO authenticated;
GRANT SELECT ON v_expiring_soon_premium_posts TO authenticated;

-- Permitir que a aplicação execute as funções de manutenção
GRANT EXECUTE ON FUNCTION delete_expired_premium_posts() TO service_role;
GRANT EXECUTE ON FUNCTION deactivate_expired_premium_posts() TO service_role;
GRANT EXECUTE ON FUNCTION maintain_premium_posts() TO service_role;

-- =============================================
-- 8. CRIAR ÍNDICES PARA PERFORMANCE
-- =============================================
-- Índice para busca rápida de posts expirados
CREATE INDEX IF NOT EXISTS idx_feed_posts_premium_expires 
ON feed_posts(premium_expires_at) 
WHERE is_premium = TRUE AND is_active = TRUE;

-- Índice composto para queries de expiração
CREATE INDEX IF NOT EXISTS idx_feed_posts_premium_active_expires 
ON feed_posts(is_premium, is_active, premium_expires_at) 
WHERE is_premium = TRUE;

-- =============================================
-- 9. COMENTÁRIOS E DOCUMENTAÇÃO
-- =============================================
COMMENT ON FUNCTION delete_expired_premium_posts() IS 'Deleta permanentemente posts premium expirados (hard delete)';
COMMENT ON FUNCTION deactivate_expired_premium_posts() IS 'Desativa posts premium expirados (soft delete recomendado)';
COMMENT ON FUNCTION maintain_premium_posts() IS 'Função de manutenção que deve ser chamada periodicamente para limpar posts expirados';
COMMENT ON VIEW v_expired_premium_posts IS 'Lista todos os posts premium que já expiraram';
COMMENT ON VIEW v_expiring_soon_premium_posts IS 'Lista posts premium que vão expirar nas próximas 24 horas';

-- =============================================
-- 10. TESTE DAS FUNÇÕES
-- =============================================
-- Descomente para testar:

-- Ver posts expirados
-- SELECT * FROM v_expired_premium_posts;

-- Ver posts que vão expirar em breve
-- SELECT * FROM v_expiring_soon_premium_posts;

-- Executar manutenção manual
-- SELECT * FROM maintain_premium_posts();

-- Verificar quantos posts seriam afetados (sem executar)
-- SELECT COUNT(*) FROM feed_posts 
-- WHERE is_premium = TRUE 
--   AND premium_expires_at IS NOT NULL 
--   AND premium_expires_at < NOW() 
--   AND is_active = TRUE;

-- =============================================
-- 11. AGENDAMENTO AUTOMÁTICO (SUPABASE EDGE FUNCTIONS OU CRON)
-- =============================================
-- Para execução automática, crie uma Edge Function no Supabase ou use pg_cron:

-- Exemplo com pg_cron (se disponível):
-- SELECT cron.schedule('cleanup-expired-premium-posts', '0 * * * *', 'SELECT maintain_premium_posts()');
-- Isso executa a função a cada hora

-- =============================================
-- FIM DO SCRIPT
-- =============================================

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Sistema de expiração automática de posts premium criado com sucesso!';
  RAISE NOTICE '📋 Funções disponíveis:';
  RAISE NOTICE '   - delete_expired_premium_posts() - Hard delete';
  RAISE NOTICE '   - deactivate_expired_premium_posts() - Soft delete (recomendado)';
  RAISE NOTICE '   - maintain_premium_posts() - Manutenção completa';
  RAISE NOTICE '📊 Views de monitoramento:';
  RAISE NOTICE '   - v_expired_premium_posts';
  RAISE NOTICE '   - v_expiring_soon_premium_posts';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ IMPORTANTE: Execute maintain_premium_posts() periodicamente!';
  RAISE NOTICE '   Recomendado: A cada hora ou usar pg_cron/Edge Functions';
END $$;

