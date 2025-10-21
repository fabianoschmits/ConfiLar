-- ============================================
-- BUSCAR TODOS OS IDs DOS USUÁRIOS
-- ============================================

-- Versão 1: Lista simples com IDs e nomes
SELECT 
  p.id as user_id,
  p.full_name,
  p.user_type,
  p.location_city,
  p.location_state,
  p.created_at
FROM profiles p
ORDER BY p.created_at DESC;

-- Versão 2: Apenas IDs (fácil de copiar)
SELECT 
  id as user_id
FROM profiles
ORDER BY created_at DESC;

-- Versão 3: Contar total de usuários
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE user_type = 'professional') as profissionais,
  COUNT(*) FILTER (WHERE user_type = 'client') as clientes
FROM profiles;

-- Versão 4: IDs formatados como array PostgreSQL (pronto para usar em script)
SELECT 
  'ARRAY[' || 
  STRING_AGG('''' || id::TEXT || '''::UUID', ', ') || 
  ']' as users_array
FROM profiles;

-- Versão 5: Mostrar usuários com seus códigos de referral
SELECT 
  p.id,
  p.full_name,
  p.user_type,
  urs.referral_code,
  urs.tier,
  urs.total_referrals
FROM profiles p
LEFT JOIN user_referral_stats urs ON urs.user_id = p.id
ORDER BY p.created_at DESC;

