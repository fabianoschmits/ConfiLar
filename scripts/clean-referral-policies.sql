-- ============================================
-- LIMPAR E CORRIGIR POLÍTICAS RLS DUPLICADAS
-- ============================================

-- 1. Remover TODAS as políticas existentes para recriar do zero
DROP POLICY IF EXISTS "Users can insert points history" ON referral_points_history;
DROP POLICY IF EXISTS "Users can view their own points history" ON referral_points_history;
DROP POLICY IF EXISTS "Users can view their points history" ON referral_points_history;

DROP POLICY IF EXISTS "Users can insert referrals" ON referrals;
DROP POLICY IF EXISTS "Users can update referrals where they are referrer" ON referrals;
DROP POLICY IF EXISTS "Users can view referrals where they are referrer or referred" ON referrals;
DROP POLICY IF EXISTS "Users can view their own referrals" ON referrals;

DROP POLICY IF EXISTS "Users can insert own stats" ON user_referral_stats;
DROP POLICY IF EXISTS "Users can insert their own referral stats" ON user_referral_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_referral_stats;
DROP POLICY IF EXISTS "Users can update their own referral stats" ON user_referral_stats;
DROP POLICY IF EXISTS "Users can view all stats" ON user_referral_stats;
DROP POLICY IF EXISTS "Users can view their own referral stats" ON user_referral_stats;

-- 2. Criar políticas corretas e únicas

-- user_referral_stats
CREATE POLICY "Users can view their own referral stats" ON user_referral_stats
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own referral stats" ON user_referral_stats
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own referral stats" ON user_referral_stats
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- referrals
CREATE POLICY "Users can view referrals where they are referrer or referred" ON referrals
  FOR SELECT TO authenticated
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Users can insert referrals" ON referrals
  FOR INSERT TO authenticated
  WITH CHECK (
    referrer_id = auth.uid() OR 
    referred_id = auth.uid() OR
    auth.role() = 'service_role'
  );

CREATE POLICY "Users can update referrals where they are referrer" ON referrals
  FOR UPDATE TO authenticated
  USING (referrer_id = auth.uid())
  WITH CHECK (referrer_id = auth.uid());

-- referral_points_history
CREATE POLICY "Users can view their own points history" ON referral_points_history
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert points history" ON referral_points_history
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 3. Verificar políticas finais
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('user_referral_stats', 'referrals', 'referral_points_history')
ORDER BY tablename, policyname;
