-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA SISTEMA DE REFERRAL
-- ============================================

-- 1. Verificar políticas existentes
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
WHERE tablename IN ('user_referral_stats', 'referrals', 'referral_points_history', 'referral_badges', 'referral_challenges', 'user_challenge_progress')
ORDER BY tablename, policyname;

-- 2. Remover políticas problemáticas existentes
DROP POLICY IF EXISTS "Users can view their own referral stats" ON user_referral_stats;
DROP POLICY IF EXISTS "Users can update their own referral stats" ON user_referral_stats;
DROP POLICY IF EXISTS "Users can insert their own referral stats" ON user_referral_stats;
DROP POLICY IF EXISTS "Users can view referrals where they are referrer or referred" ON referrals;
DROP POLICY IF EXISTS "Users can insert referrals" ON referrals;
DROP POLICY IF EXISTS "Users can update referrals where they are referrer" ON referrals;
DROP POLICY IF EXISTS "Users can view their own points history" ON referral_points_history;
DROP POLICY IF EXISTS "Users can insert points history" ON referral_points_history;
DROP POLICY IF EXISTS "Anyone can view referral badges" ON referral_badges;
DROP POLICY IF EXISTS "Anyone can view referral challenges" ON referral_challenges;
DROP POLICY IF EXISTS "Users can view their own challenge progress" ON user_challenge_progress;
DROP POLICY IF EXISTS "Users can insert their own challenge progress" ON user_challenge_progress;
DROP POLICY IF EXISTS "Users can update their own challenge progress" ON user_challenge_progress;

-- 3. Criar políticas corretas para user_referral_stats
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

-- 4. Criar políticas corretas para referrals
CREATE POLICY "Users can view referrals where they are referrer or referred" ON referrals
  FOR SELECT TO authenticated
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Users can insert referrals" ON referrals
  FOR INSERT TO authenticated
  WITH CHECK (
    referrer_id = auth.uid() OR 
    referred_id = auth.uid() OR
    -- Permitir inserção por sistema (service role)
    auth.role() = 'service_role'
  );

CREATE POLICY "Users can update referrals where they are referrer" ON referrals
  FOR UPDATE TO authenticated
  USING (referrer_id = auth.uid())
  WITH CHECK (referrer_id = auth.uid());

-- 5. Criar políticas para referral_points_history
CREATE POLICY "Users can view their own points history" ON referral_points_history
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert points history" ON referral_points_history
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 6. Criar políticas para referral_badges (todos podem ver)
CREATE POLICY "Anyone can view referral badges" ON referral_badges
  FOR SELECT TO authenticated
  USING (true);

-- 7. Criar políticas para referral_challenges (todos podem ver)
CREATE POLICY "Anyone can view referral challenges" ON referral_challenges
  FOR SELECT TO authenticated
  USING (true);

-- 8. Criar políticas para user_challenge_progress
CREATE POLICY "Users can view their own challenge progress" ON user_challenge_progress
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own challenge progress" ON user_challenge_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own challenge progress" ON user_challenge_progress
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 9. Verificar se as tabelas existem e têm as colunas corretas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('user_referral_stats', 'referrals', 'referral_points_history')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 10. Testar permissões
-- Este comando deve ser executado como usuário autenticado
-- SELECT * FROM user_referral_stats WHERE user_id = auth.uid();
