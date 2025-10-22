-- ============================================
-- CORRIGIR SISTEMA DE REFERRAL COMPLETO
-- ============================================

-- 1. Verificar usuários sem dados de referral
SELECT 
    COUNT(p.id) as profiles_without_referral_data,
    MIN(p.created_at) as oldest_profile,
    MAX(p.created_at) as newest_profile
FROM profiles p
LEFT JOIN user_referral_stats urs ON p.id = urs.user_id
WHERE urs.user_id IS NULL;

-- 2. Criar dados de referral para TODOS os usuários que não têm
-- (Incluindo usuários antigos)
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
    UPPER(SUBSTRING(COALESCE(p.full_name, 'USER'), 1, 6)) || 
    LPAD(EXTRACT(EPOCH FROM p.created_at)::text, 4, '0') as referral_code,
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

-- 3. Verificar se agora todos os usuários têm dados de referral
SELECT 
    COUNT(p.id) as total_profiles,
    COUNT(urs.user_id) as profiles_with_referral_data,
    COUNT(p.id) - COUNT(urs.user_id) as still_missing
FROM profiles p
LEFT JOIN user_referral_stats urs ON p.id = urs.user_id;

-- 4. Atualizar políticas RLS para permitir visualização de badges de outros usuários
-- (Mantendo privacidade dos dados pessoais, mas permitindo ver tier/badges)

-- Remover TODAS as políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Users can view their own referral stats" ON public.user_referral_stats;
DROP POLICY IF EXISTS "Users can view all referral stats" ON public.user_referral_stats;
DROP POLICY IF EXISTS "Users can view all referral stats for badges" ON public.user_referral_stats;
DROP POLICY IF EXISTS "Users can update their own referral stats" ON public.user_referral_stats;
DROP POLICY IF EXISTS "Users can insert their own referral stats" ON public.user_referral_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_referral_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON public.user_referral_stats;
DROP POLICY IF EXISTS "Users can view all stats" ON public.user_referral_stats;

-- Criar nova política que permite ver stats de todos os usuários (para badges)
CREATE POLICY "Users can view all referral stats for badges" ON public.user_referral_stats
  FOR SELECT TO authenticated
  USING (true);

-- Manter políticas de inserção/atualização restritivas
CREATE POLICY "Users can update their own referral stats" ON public.user_referral_stats
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own referral stats" ON public.user_referral_stats
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 5. Verificar se as políticas foram aplicadas corretamente
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_referral_stats'
ORDER BY policyname;

-- 6. Testar se agora é possível buscar dados de referral de qualquer usuário
-- (Execute este comando para verificar se funciona)
SELECT 
    urs.user_id,
    urs.tier,
    urs.total_referrals,
    p.full_name
FROM user_referral_stats urs
JOIN profiles p ON urs.user_id = p.id
WHERE urs.tier != 'none'
LIMIT 5;
