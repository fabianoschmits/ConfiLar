-- =============================================
-- VERIFICAÇÃO DO SISTEMA DE POSTS PREMIUM
-- =============================================
-- Execute este script para verificar se tudo foi instalado corretamente

-- =============================================
-- 1. VERIFICAR COLUNAS PREMIUM
-- =============================================
SELECT 
  '✅ Colunas Premium' as verificacao,
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'feed_posts'
  AND column_name IN ('is_premium', 'premium_points_spent', 'premium_expires_at', 'premium_highlight_color')
ORDER BY column_name;

-- =============================================
-- 2. VERIFICAR FUNÇÕES CRIADAS
-- =============================================
SELECT 
  '✅ Funções de Limpeza' as verificacao,
  routine_name as funcao,
  routine_type as tipo
FROM information_schema.routines
WHERE routine_name IN (
  'delete_expired_premium_posts',
  'deactivate_expired_premium_posts',
  'maintain_premium_posts',
  'check_post_expiration'
)
ORDER BY routine_name;

-- =============================================
-- 3. VERIFICAR VIEWS CRIADAS
-- =============================================
SELECT 
  '✅ Views de Monitoramento' as verificacao,
  table_name as view_name
FROM information_schema.views
WHERE table_name IN (
  'v_expired_premium_posts',
  'v_expiring_soon_premium_posts'
)
ORDER BY table_name;

-- =============================================
-- 4. VERIFICAR TRIGGER
-- =============================================
SELECT 
  '✅ Trigger Automático' as verificacao,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_check_post_expiration'
  AND event_object_table = 'feed_posts';

-- =============================================
-- 5. VERIFICAR ÍNDICES
-- =============================================
SELECT 
  '✅ Índices de Performance' as verificacao,
  indexname as indice,
  tablename as tabela
FROM pg_indexes
WHERE tablename = 'feed_posts'
  AND indexname LIKE '%premium%'
ORDER BY indexname;

-- =============================================
-- 6. ESTATÍSTICAS DE POSTS
-- =============================================
SELECT 
  '📊 Estatísticas Atuais' as info,
  COUNT(*) as total_posts,
  COUNT(*) FILTER (WHERE is_premium = TRUE) as posts_premium,
  COUNT(*) FILTER (WHERE is_premium = TRUE AND is_active = TRUE) as posts_premium_ativos,
  COUNT(*) FILTER (WHERE is_premium = TRUE AND premium_expires_at < NOW()) as posts_expirados
FROM feed_posts;

-- =============================================
-- 7. TESTAR FUNÇÃO DE MANUTENÇÃO
-- =============================================
SELECT 
  '🧪 Teste de Manutenção' as teste,
  maintain_premium_posts() as resultado;

-- =============================================
-- RESUMO
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ VERIFICAÇÃO COMPLETA!';
  RAISE NOTICE '====================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Se você viu resultados em todas as seções acima,';
  RAISE NOTICE 'o sistema está 100%% instalado e funcionando!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Próximos passos:';
  RAISE NOTICE '1. Criar posts premium no app';
  RAISE NOTICE '2. Configurar cron job para manutenção automática';
  RAISE NOTICE '3. Monitorar com: SELECT * FROM v_expired_premium_posts';
  RAISE NOTICE '';
END $$;
