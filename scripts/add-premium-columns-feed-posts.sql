-- =============================================
-- ADICIONAR COLUNAS PREMIUM NA TABELA FEED_POSTS
-- =============================================
-- Execute este script ANTES do create-auto-delete-expired-posts.sql
-- se você não tiver as colunas premium ainda

-- =============================================
-- 1. VERIFICAR E CRIAR COLUNAS
-- =============================================
DO $$ 
BEGIN
  RAISE NOTICE '🔍 Verificando colunas da tabela feed_posts...';
  
  -- Adicionar coluna is_premium
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feed_posts' AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE feed_posts ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
    RAISE NOTICE '✅ Coluna is_premium criada';
  ELSE
    RAISE NOTICE '⚠️  Coluna is_premium já existe';
  END IF;

  -- Adicionar coluna premium_points_spent
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feed_posts' AND column_name = 'premium_points_spent'
  ) THEN
    ALTER TABLE feed_posts ADD COLUMN premium_points_spent INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Coluna premium_points_spent criada';
  ELSE
    RAISE NOTICE '⚠️  Coluna premium_points_spent já existe';
  END IF;

  -- Adicionar coluna premium_expires_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feed_posts' AND column_name = 'premium_expires_at'
  ) THEN
    ALTER TABLE feed_posts ADD COLUMN premium_expires_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE '✅ Coluna premium_expires_at criada';
  ELSE
    RAISE NOTICE '⚠️  Coluna premium_expires_at já existe';
  END IF;

  -- Adicionar coluna premium_highlight_color
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feed_posts' AND column_name = 'premium_highlight_color'
  ) THEN
    ALTER TABLE feed_posts ADD COLUMN premium_highlight_color VARCHAR(7) DEFAULT '#FFD700';
    RAISE NOTICE '✅ Coluna premium_highlight_color criada';
  ELSE
    RAISE NOTICE '⚠️  Coluna premium_highlight_color já existe';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Verificação concluída!';
END $$;

-- =============================================
-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- =============================================
-- Índice para busca rápida de posts premium
CREATE INDEX IF NOT EXISTS idx_feed_posts_is_premium 
ON feed_posts(is_premium) 
WHERE is_premium = TRUE;

-- Índice para busca de posts expirados
CREATE INDEX IF NOT EXISTS idx_feed_posts_premium_expires 
ON feed_posts(premium_expires_at) 
WHERE is_premium = TRUE;

-- Índice composto
CREATE INDEX IF NOT EXISTS idx_feed_posts_premium_active_expires 
ON feed_posts(is_premium, is_active, premium_expires_at) 
WHERE is_premium = TRUE;

-- =============================================
-- 3. VERIFICAR ESTRUTURA FINAL
-- =============================================
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'feed_posts'
  AND column_name IN ('is_premium', 'premium_points_spent', 'premium_expires_at', 'premium_highlight_color')
ORDER BY column_name;

-- =============================================
-- 4. ATUALIZAR POSTS EXISTENTES COM TAGS PREMIUM
-- =============================================
-- Se você já tem posts com tags = ['premium'], atualize-os
DO $$
DECLARE
  v_updated_count INTEGER := 0;
BEGIN
  -- Atualizar posts que têm tag 'premium' mas não estão marcados como is_premium
  UPDATE feed_posts
  SET is_premium = TRUE
  WHERE 'premium' = ANY(tags)
    AND (is_premium IS NULL OR is_premium = FALSE);

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  IF v_updated_count > 0 THEN
    RAISE NOTICE '✅ Atualizados % posts existentes com tag premium', v_updated_count;
  ELSE
    RAISE NOTICE 'ℹ️  Nenhum post antigo com tag premium encontrado';
  END IF;
END $$;

-- =============================================
-- FIM DO SCRIPT
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ COLUNAS PREMIUM CONFIGURADAS!';
  RAISE NOTICE '====================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Próximos passos:';
  RAISE NOTICE '1. Execute: scripts/create-auto-delete-expired-posts.sql';
  RAISE NOTICE '2. Configure cron job para manutenção automática';
  RAISE NOTICE '';
END $$;

