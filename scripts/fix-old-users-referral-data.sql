-- ============================================
-- CORRIGIR DADOS DE REFERRAL PARA USUÁRIOS ANTIGOS
-- ============================================

-- 1. Verificar usuários que não têm dados na tabela user_referral_stats
SELECT 
    p.id,
    p.full_name,
    p.created_at,
    urs.user_id as has_referral_data
FROM profiles p
LEFT JOIN user_referral_stats urs ON p.id = urs.user_id
WHERE urs.user_id IS NULL
ORDER BY p.created_at ASC;

-- 2. Criar dados de referral para usuários antigos que não têm
INSERT INTO user_referral_stats (
    user_id,
    referral_code,
    total_referrals,
    active_referrals,
    completed_referrals,
    total_points,
    tier,
    tier_updated_at,
    badges,
    rank,
    created_at,
    updated_at
)
SELECT 
    p.id as user_id,
    UPPER(SUBSTRING(p.full_name, 1, 6)) || LPAD(EXTRACT(EPOCH FROM p.created_at)::text, 4, '0') as referral_code,
    0 as total_referrals,
    0 as active_referrals,
    0 as completed_referrals,
    0 as total_points,
    'none' as tier,
    NOW() as tier_updated_at,
    '[]'::jsonb as badges,
    NULL as rank,
    NOW() as created_at,
    NOW() as updated_at
FROM profiles p
LEFT JOIN user_referral_stats urs ON p.id = urs.user_id
WHERE urs.user_id IS NULL
AND p.id IS NOT NULL;

-- 3. Verificar se todos os usuários agora têm dados de referral
SELECT 
    COUNT(*) as total_profiles,
    COUNT(urs.user_id) as profiles_with_referral_data,
    COUNT(*) - COUNT(urs.user_id) as missing_referral_data
FROM profiles p
LEFT JOIN user_referral_stats urs ON p.id = urs.user_id;

-- 4. Verificar políticas RLS para user_referral_stats
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_referral_stats'
ORDER BY policyname;

-- 5. Verificar se há problemas de permissão específicos
-- Testar se um usuário específico pode acessar dados de referral de outros usuários
-- (Execute este comando para um usuário específico que está relatando o problema)
-- SELECT * FROM user_referral_stats WHERE user_id = 'ID_DO_USUARIO_PROBLEMA';
