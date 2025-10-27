-- =====================================================
-- VERIFICAR QUAIS TABELAS EXISTEM NO BANCO
-- =====================================================

-- 1. VERIFICAR TODAS AS TABELAS RELACIONADAS A PONTOS
SELECT 
  table_name, 
  table_type,
  table_schema
FROM information_schema.tables 
WHERE table_name IN (
  'feed_posts_likes',
  'comments', 
  'feed_posts',
  'classifieds',
  'profiles',
  'points_purchases',
  'user_points_balance',
  'point_transactions',
  'points_config',
  'user_vip_badges'
)
ORDER BY table_name;

-- 2. VERIFICAR ESTRUTURA DAS TABELAS PRINCIPAIS
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICANDO ESTRUTURA DO BANCO:';
  RAISE NOTICE '========================================';
  
  -- Verificar tabelas de pontos
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_points_balance') THEN
    RAISE NOTICE '✅ user_points_balance existe';
  ELSE
    RAISE NOTICE '❌ user_points_balance NÃO existe';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'point_transactions') THEN
    RAISE NOTICE '✅ point_transactions existe';
  ELSE
    RAISE NOTICE '❌ point_transactions NÃO existe';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_config') THEN
    RAISE NOTICE '✅ points_config existe';
  ELSE
    RAISE NOTICE '❌ points_config NÃO existe';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_purchases') THEN
    RAISE NOTICE '✅ points_purchases existe';
  ELSE
    RAISE NOTICE '❌ points_purchases NÃO existe';
  END IF;
  
  -- Verificar tabelas de conteúdo
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feed_posts') THEN
    RAISE NOTICE '✅ feed_posts existe';
  ELSE
    RAISE NOTICE '❌ feed_posts NÃO existe';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feed_posts_likes') THEN
    RAISE NOTICE '✅ feed_posts_likes existe';
  ELSE
    RAISE NOTICE '❌ feed_posts_likes NÃO existe';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
    RAISE NOTICE '✅ comments existe';
  ELSE
    RAISE NOTICE '❌ comments NÃO existe';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'classifieds') THEN
    RAISE NOTICE '✅ classifieds existe';
  ELSE
    RAISE NOTICE '❌ classifieds NÃO existe';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE NOTICE '✅ profiles existe';
  ELSE
    RAISE NOTICE '❌ profiles NÃO existe';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;

-- 3. VERIFICAR COLUNAS PREMIUM EXISTENTES
DO $$ 
BEGIN
  RAISE NOTICE 'Verificando colunas premium...';
  
  -- Verificar colunas premium em feed_posts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feed_posts') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feed_posts' AND column_name = 'is_premium') THEN
      RAISE NOTICE '✅ feed_posts.is_premium existe';
    ELSE
      RAISE NOTICE '❌ feed_posts.is_premium NÃO existe';
    END IF;
  END IF;
  
  -- Verificar colunas premium em classifieds
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'classifieds') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classifieds' AND column_name = 'is_premium') THEN
      RAISE NOTICE '✅ classifieds.is_premium existe';
    ELSE
      RAISE NOTICE '❌ classifieds.is_premium NÃO existe';
    END IF;
  END IF;
  
  -- Verificar colunas premium em feed_posts_likes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feed_posts_likes') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feed_posts_likes' AND column_name = 'is_premium') THEN
      RAISE NOTICE '✅ feed_posts_likes.is_premium existe';
    ELSE
      RAISE NOTICE '❌ feed_posts_likes.is_premium NÃO existe';
    END IF;
  END IF;
  
  -- Verificar colunas premium em comments
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'is_premium') THEN
      RAISE NOTICE '✅ comments.is_premium existe';
    ELSE
      RAISE NOTICE '❌ comments.is_premium NÃO existe';
    END IF;
  END IF;
END $$;

