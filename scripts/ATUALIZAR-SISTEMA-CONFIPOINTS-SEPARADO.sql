-- =====================================================
-- ATUALIZAR SISTEMA CONFIPOINTS - SEPARAÇÃO DE PONTOS
-- =====================================================

-- 1. REMOVER CONFIGURAÇÕES DE COMENTÁRIOS PREMIUM
DELETE FROM points_config WHERE action_key = 'premium_comment';

-- 2. ATUALIZAR CONFIGURAÇÕES DE REFERRAL (APENAS RANKING - SEM PONTOS)
UPDATE points_config SET 
  points_value = 0,
  description = 'Pessoa indicada se cadastrou (apenas ranking)',
  is_active = true
WHERE action_key = 'referral_signup';

UPDATE points_config SET 
  points_value = 0,
  description = 'Pessoa indicada completou perfil (apenas ranking)',
  is_active = true
WHERE action_key = 'referral_profile_completed';

UPDATE points_config SET 
  points_value = 0,
  description = 'Pessoa indicada fez primeiro post (apenas ranking)',
  is_active = true
WHERE action_key = 'referral_first_post';

UPDATE points_config SET 
  points_value = 0,
  description = 'Pessoa indicada fez primeira avaliação (apenas ranking)',
  is_active = true
WHERE action_key = 'referral_first_review';

UPDATE points_config SET 
  points_value = 0,
  description = 'Pessoa indicada ficou ativa por 30 dias (apenas ranking)',
  is_active = true
WHERE action_key = 'referral_active_30_days';

-- 3. ATUALIZAR CONFIGURAÇÕES PREMIUM (APENAS PONTOS PAGOS)
UPDATE points_config SET 
  points_value = -5,
  daily_limit = 1000,
  description = 'Curtir post premium (5 pontos)',
  is_active = true
WHERE action_key = 'premium_like';

UPDATE points_config SET 
  points_value = -50,
  daily_limit = 50,
  description = 'Criar post premium (50 pontos)',
  is_active = true
WHERE action_key = 'premium_post';

UPDATE points_config SET 
  points_value = -200,
  daily_limit = 20,
  description = 'Criar anúncio premium (200 pontos)',
  is_active = true
WHERE action_key = 'premium_ad';

-- 4. REMOVER FUNÇÕES DE COMENTÁRIOS PREMIUM
DROP FUNCTION IF EXISTS process_premium_comment();
DROP TRIGGER IF EXISTS process_premium_comment_trigger ON comments;

-- 5. CRIAR TABELA PARA SEPARAR PONTOS DE REFERRAL DOS PONTOS PAGOS
CREATE TABLE IF NOT EXISTS referral_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  points_value INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices para performance
  INDEX idx_referral_points_user_id (user_id),
  INDEX idx_referral_points_action_type (action_type),
  INDEX idx_referral_points_created_at (created_at)
);

-- 6. HABILITAR RLS PARA REFERRAL POINTS
ALTER TABLE referral_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral points" ON referral_points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view referral leaderboard" ON referral_points
  FOR SELECT USING (true);

-- 7. CRIAR VIEW PARA RANKING DE REFERRAL (SEM PONTOS CONFIPOINTS)
CREATE OR REPLACE VIEW referral_leaderboard AS
SELECT 
  p.user_id,
  p.full_name,
  p.avatar_url,
  COUNT(rp.id) as total_referrals,
  SUM(CASE WHEN rp.action_type = 'referral_signup' THEN 1 ELSE 0 END) as signups,
  SUM(CASE WHEN rp.action_type = 'referral_profile_completed' THEN 1 ELSE 0 END) as profiles_completed,
  SUM(CASE WHEN rp.action_type = 'referral_first_post' THEN 1 ELSE 0 END) as first_posts,
  SUM(CASE WHEN rp.action_type = 'referral_first_review' THEN 1 ELSE 0 END) as first_reviews,
  SUM(CASE WHEN rp.action_type = 'referral_active_30_days' THEN 1 ELSE 0 END) as active_30_days,
  MAX(rp.created_at) as last_referral_activity
FROM profiles p
LEFT JOIN referral_points rp ON p.user_id = rp.user_id
GROUP BY p.user_id, p.full_name, p.avatar_url
ORDER BY total_referrals DESC, last_referral_activity DESC;

-- 8. CRIAR FUNÇÃO PARA ADICIONAR PONTOS DE REFERRAL (SEM CONFIPOINTS)
CREATE OR REPLACE FUNCTION add_referral_points(
  p_user_id UUID,
  p_action_type VARCHAR(50),
  p_description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Adicionar pontos de referral (apenas para ranking)
  INSERT INTO referral_points (user_id, action_type, points_value, description)
  VALUES (p_user_id, p_action_type, 0, p_description);
  
  -- Não adicionar pontos ao ConfiPoints (sistema separado)
  RAISE NOTICE 'Pontos de referral adicionados para ranking: %', p_action_type;
END;
$$ LANGUAGE plpgsql;

-- 9. CRIAR FUNÇÃO PARA ADICIONAR APENAS PONTOS PREMIUM (PAGOS)
CREATE OR REPLACE FUNCTION add_premium_points(
  p_user_id UUID,
  p_action_type VARCHAR(50),
  p_points INTEGER,
  p_description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  user_balance INTEGER;
BEGIN
  -- Verificar saldo do usuário
  SELECT balance INTO user_balance 
  FROM user_points_balance 
  WHERE user_id = p_user_id;
  
  -- Verificar se tem pontos suficientes (para ações que gastam pontos)
  IF p_points < 0 AND user_balance < ABS(p_points) THEN
    RAISE EXCEPTION 'Saldo insuficiente para ação premium. Necessário: % pontos', ABS(p_points);
  END IF;
  
  -- Adicionar transação de pontos premium
  INSERT INTO point_transactions (
    user_id, 
    amount, 
    type, 
    source, 
    description, 
    metadata
  ) VALUES (
    p_user_id, 
    p_points, 
    CASE WHEN p_points > 0 THEN 'earn' ELSE 'spend' END,
    p_action_type,
    COALESCE(p_description, 'Ação premium'),
    jsonb_build_object('is_premium', true)
  );
  
  -- Atualizar saldo do usuário
  UPDATE user_points_balance 
  SET balance = balance + p_points,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RAISE NOTICE 'Pontos premium processados: % pontos para %', p_points, p_action_type;
END;
$$ LANGUAGE plpgsql;

-- 10. VERIFICAÇÃO FINAL
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SISTEMA CONFIPOINTS ATUALIZADO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Comentários premium removidos';
  RAISE NOTICE '✅ Pontos de referral separados (apenas ranking)';
  RAISE NOTICE '✅ Pontos premium mantidos (pagos)';
  RAISE NOTICE '✅ Sistema de ranking de referral criado';
  RAISE NOTICE '✅ Funções separadas para cada sistema';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SISTEMAS SEPARADOS:';
  RAISE NOTICE '• Referral: Apenas ranking (sem pontos ConfiPoints)';
  RAISE NOTICE '• Premium: Apenas pontos pagos (curtidas, posts, anúncios)';
  RAISE NOTICE '========================================';
END $$;

