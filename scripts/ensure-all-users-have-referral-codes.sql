-- ============================================
-- GARANTIR QUE TODOS OS USUÁRIOS TENHAM CÓDIGOS DE REFERÊNCIA
-- ============================================

-- 1. Inserir códigos de referência para usuários que não possuem
INSERT INTO public.user_referral_stats (
  user_id,
  referral_code,
  total_referrals,
  total_points,
  tier,
  created_at,
  updated_at
)
SELECT 
  p.id as user_id,
  -- Gerar código baseado no nome + números aleatórios
  UPPER(SUBSTRING(REGEXP_REPLACE(p.full_name, '[^A-Za-z]', '', 'g'), 1, 6)) || 
  LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') as referral_code,
  0 as total_referrals,
  0 as total_points,
  'bronze' as tier,
  NOW() as created_at,
  NOW() as updated_at
FROM public.profiles p
LEFT JOIN public.user_referral_stats urs ON p.id = urs.user_id
WHERE urs.user_id IS NULL
AND p.full_name IS NOT NULL
AND p.full_name != '';

-- 2. Verificar quantos usuários agora têm códigos
SELECT 
  COUNT(*) as total_users_with_referral_codes,
  COUNT(DISTINCT p.id) as total_profiles
FROM public.profiles p
LEFT JOIN public.user_referral_stats urs ON p.id = urs.user_id
WHERE urs.user_id IS NOT NULL;

-- 3. Mostrar alguns exemplos de códigos criados
SELECT 
  p.full_name,
  urs.referral_code,
  urs.tier,
  urs.total_referrals
FROM public.profiles p
JOIN public.user_referral_stats urs ON p.id = urs.user_id
ORDER BY urs.created_at DESC
LIMIT 10;
