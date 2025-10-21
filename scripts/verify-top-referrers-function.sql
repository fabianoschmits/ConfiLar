-- ============================================
-- VERIFICAR E CORRIGIR FUNÇÃO get_top_referrers
-- ============================================

-- Verificar se a função existe
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'get_top_referrers';

-- Se não existir, criar a função
CREATE OR REPLACE FUNCTION get_top_referrers(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  referral_code TEXT,
  total_referrals INTEGER,
  total_points INTEGER,
  tier TEXT,
  rank INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    urs.user_id,
    p.full_name,
    p.avatar_url,
    urs.referral_code,
    urs.total_referrals,
    urs.total_points,
    urs.tier,
    urs.rank
  FROM public.user_referral_stats urs
  JOIN public.profiles p ON p.id = urs.user_id
  WHERE urs.total_referrals > 0
  ORDER BY urs.total_referrals DESC, urs.total_points DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Testar a função
SELECT * FROM get_top_referrers(10);

-- Ver todos os usuários com indicações
SELECT 
  p.full_name,
  urs.tier,
  urs.total_referrals,
  urs.total_points,
  urs.rank,
  urs.referral_code
FROM user_referral_stats urs
JOIN profiles p ON p.id = urs.user_id
WHERE urs.total_referrals > 0
ORDER BY urs.total_referrals DESC;

-- Atualizar rankings
SELECT update_referral_rankings();

-- Ver resultado após atualização
SELECT 
  p.full_name,
  urs.tier,
  urs.total_referrals,
  urs.rank
FROM user_referral_stats urs
JOIN profiles p ON p.id = urs.user_id
WHERE urs.total_referrals > 0
ORDER BY urs.rank;

