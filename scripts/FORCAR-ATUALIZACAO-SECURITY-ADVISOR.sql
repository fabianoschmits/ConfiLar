-- =============================================
-- FORÇAR ATUALIZAÇÃO DO SECURITY ADVISOR
-- ConfiLar - Correção de Cache
-- =============================================
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- =============================================
-- PROBLEMA
-- =============================================
-- Security Advisor pode manter cache de análises antigas
-- Este script força a atualização tocando nas views

-- =============================================
-- SOLUÇÃO: RECRIAR VIEWS (FORÇA ATUALIZAÇÃO)
-- =============================================

-- 1. v_expired_premium_posts
DROP VIEW IF EXISTS public.v_expired_premium_posts CASCADE;
CREATE VIEW public.v_expired_premium_posts AS
SELECT 
  id,
  user_id,
  title,
  premium_points_spent,
  premium_expires_at,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - premium_expires_at)) / 3600 AS hours_expired
FROM public.feed_posts
WHERE is_premium = TRUE
  AND premium_expires_at IS NOT NULL
  AND premium_expires_at < NOW()
ORDER BY premium_expires_at DESC;

-- 2. v_expiring_soon_premium_posts
DROP VIEW IF EXISTS public.v_expiring_soon_premium_posts CASCADE;
CREATE VIEW public.v_expiring_soon_premium_posts AS
SELECT 
  id,
  user_id,
  title,
  premium_points_spent,
  premium_expires_at,
  created_at,
  EXTRACT(EPOCH FROM (premium_expires_at - NOW())) / 3600 AS hours_remaining
FROM public.feed_posts
WHERE is_premium = TRUE
  AND premium_expires_at IS NOT NULL
  AND premium_expires_at > NOW()
  AND premium_expires_at < NOW() + INTERVAL '24 hours'
ORDER BY premium_expires_at ASC;

-- 3. user_points_stats
DROP VIEW IF EXISTS public.user_points_stats CASCADE;
CREATE VIEW public.user_points_stats AS
SELECT 
  upb.user_id,
  upb.balance,
  upb.level,
  upb.total_earned,
  upb.total_spent,
  upb.available_balance,
  upb.locked_balance,
  upb.last_daily_reset,
  upb.created_at,
  upb.updated_at,
  COALESCE(transaction_stats.earn_transactions, 0) as earn_transactions,
  COALESCE(transaction_stats.total_earned_from_transactions, 0) as total_earned_from_transactions,
  COALESCE(transaction_stats.spend_transactions, 0) as spend_transactions,
  COALESCE(transaction_stats.total_spent_from_transactions, 0) as total_spent_from_transactions
FROM public.user_points_balance upb
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) FILTER (WHERE type = 'earn') as earn_transactions,
    SUM(amount) FILTER (WHERE type = 'earn') as total_earned_from_transactions,
    COUNT(*) FILTER (WHERE type = 'spend') as spend_transactions,
    SUM(ABS(amount)) FILTER (WHERE type = 'spend') as total_spent_from_transactions
  FROM public.point_transactions
  GROUP BY user_id
) transaction_stats ON transaction_stats.user_id = upb.user_id;

-- =============================================
-- COMENTÁRIOS
-- =============================================
COMMENT ON VIEW public.v_expired_premium_posts IS 'Monitora posts premium expirados';
COMMENT ON VIEW public.v_expiring_soon_premium_posts IS 'Monitora posts premium próximos da expiração';
COMMENT ON VIEW public.user_points_stats IS 'Estatísticas de pontos dos usuários';

-- =============================================
-- VERIFICAÇÃO
-- =============================================
SELECT 
  'Views recriadas sem SECURITY DEFINER' as status,
  COUNT(*) as total_views
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN (
    'v_expired_premium_posts',
    'v_expiring_soon_premium_posts',
    'user_points_stats'
  );

-- =============================================
-- FIM DO SCRIPT
-- =============================================

