-- ============================================
-- SISTEMA ANTI-FRAUDE CONFIPOINTS
-- ============================================
-- Protege contra múltiplas contas e farming
-- Implementa carência de pontos
-- Pontos comprados são instantâneos
-- ============================================

-- 1. TABELA DE VERIFICAÇÃO DE USUÁRIOS
-- ============================================

CREATE TABLE IF NOT EXISTS user_verification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Níveis de verificação
  email_verified BOOLEAN DEFAULT false,
  cpf_verified BOOLEAN DEFAULT false,
  selfie_verified BOOLEAN DEFAULT false,
  premium_verified BOOLEAN DEFAULT false,
  
  -- Dados de verificação
  cpf TEXT,
  selfie_url TEXT,
  verification_date TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  
  -- Limites baseados em verificação (calculados automaticamente)
  verification_level INTEGER DEFAULT 0, -- 0-4
  daily_points_limit INTEGER DEFAULT 1000,
  monthly_withdrawal_limit DECIMAL(10,2) DEFAULT 0.00,
  max_referrals_per_month INTEGER DEFAULT 0,
  unlock_days INTEGER DEFAULT 30,
  
  -- Dados de segurança
  last_ip TEXT,
  last_device_fingerprint TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_user_verification_user_id ON user_verification(user_id);
CREATE INDEX idx_user_verification_cpf ON user_verification(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_user_verification_level ON user_verification(verification_level);

-- RLS
ALTER TABLE user_verification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification"
  ON user_verification FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own verification"
  ON user_verification FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 2. TABELA DE BLOQUEIO DE PONTOS
-- ============================================

CREATE TABLE IF NOT EXISTS point_locks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID REFERENCES point_transactions(id) ON DELETE SET NULL,
  
  -- Pontos bloqueados
  locked_points INTEGER NOT NULL CHECK (locked_points > 0),
  original_unlock_date TIMESTAMPTZ NOT NULL,
  current_unlock_date TIMESTAMPTZ NOT NULL,
  unlock_percentage DECIMAL(5,2) DEFAULT 100.00,
  
  -- Razão do bloqueio
  lock_reason TEXT NOT NULL,
  lock_type TEXT DEFAULT 'time_based', -- 'time_based', 'verification_required', 'fraud_investigation'
  
  -- Desbloqueio progressivo
  unlocked_25_at TIMESTAMPTZ,
  unlocked_50_at TIMESTAMPTZ,
  unlocked_75_at TIMESTAMPTZ,
  unlocked_100_at TIMESTAMPTZ,
  
  -- Status
  is_fully_unlocked BOOLEAN DEFAULT false,
  remaining_locked INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_point_locks_user_id ON point_locks(user_id);
CREATE INDEX idx_point_locks_unlock_date ON point_locks(current_unlock_date) WHERE is_fully_unlocked = false;
CREATE INDEX idx_point_locks_transaction ON point_locks(transaction_id);

-- RLS
ALTER TABLE point_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own locks"
  ON point_locks FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 3. TABELA DE DETECÇÃO DE FRAUDES
-- ============================================

CREATE TABLE IF NOT EXISTS fraud_detection (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Padrões detectados
  same_ip_users UUID[] DEFAULT ARRAY[]::UUID[],
  same_device_users UUID[] DEFAULT ARRAY[]::UUID[],
  same_cpf_users UUID[] DEFAULT ARRAY[]::UUID[],
  same_pix_users UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Scores de risco (0-100)
  fraud_score INTEGER DEFAULT 0 CHECK (fraud_score >= 0 AND fraud_score <= 100),
  risk_level TEXT DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  
  -- Flags específicas
  multiple_accounts_detected BOOLEAN DEFAULT false,
  suspicious_referrals BOOLEAN DEFAULT false,
  rapid_account_creation BOOLEAN DEFAULT false,
  farming_pattern_detected BOOLEAN DEFAULT false,
  withdrawal_abuse_detected BOOLEAN DEFAULT false,
  circular_referrals_detected BOOLEAN DEFAULT false,
  
  -- Contadores
  total_accounts_same_ip INTEGER DEFAULT 0,
  total_referrals_7days INTEGER DEFAULT 0,
  total_transactions_24h INTEGER DEFAULT 0,
  
  -- Ações tomadas
  account_flagged BOOLEAN DEFAULT false,
  account_frozen BOOLEAN DEFAULT false,
  points_locked BOOLEAN DEFAULT false,
  withdrawals_blocked BOOLEAN DEFAULT false,
  referrals_blocked BOOLEAN DEFAULT false,
  
  -- Notas e investigação
  admin_notes TEXT,
  investigation_status TEXT DEFAULT 'none', -- 'none', 'pending', 'investigating', 'cleared', 'confirmed_fraud'
  investigated_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  first_flag_date TIMESTAMPTZ,
  last_check TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_fraud_detection_user_id ON fraud_detection(user_id);
CREATE INDEX idx_fraud_detection_score ON fraud_detection(fraud_score);
CREATE INDEX idx_fraud_detection_risk_level ON fraud_detection(risk_level);
CREATE INDEX idx_fraud_detection_flagged ON fraud_detection(account_flagged) WHERE account_flagged = true;

-- RLS
ALTER TABLE fraud_detection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fraud status"
  ON fraud_detection FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 4. ATUALIZAR TABELA DE PONTOS
-- ============================================

-- Adicionar colunas para separar tipos de pontos
ALTER TABLE user_points_balance 
ADD COLUMN IF NOT EXISTS locked_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchased_balance INTEGER DEFAULT 0;

-- Atualizar balances existentes
UPDATE user_points_balance
SET available_balance = balance,
    locked_balance = 0,
    purchased_balance = 0
WHERE available_balance IS NULL;

-- ============================================
-- 5. FUNÇÃO PARA CALCULAR SALDOS
-- ============================================

CREATE OR REPLACE FUNCTION calculate_point_balances(p_user_id UUID)
RETURNS TABLE (
  total_balance INTEGER,
  locked_balance INTEGER,
  available_balance INTEGER,
  purchased_balance INTEGER,
  can_withdraw INTEGER
) AS $$
DECLARE
  v_total INTEGER;
  v_locked INTEGER;
  v_purchased INTEGER;
BEGIN
  -- Buscar saldo total
  SELECT balance, COALESCE(purchased_balance, 0)
  INTO v_total, v_purchased
  FROM user_points_balance
  WHERE user_id = p_user_id;
  
  -- Calcular pontos bloqueados
  SELECT COALESCE(SUM(
    CASE 
      WHEN is_fully_unlocked = false 
        AND current_unlock_date > NOW()
      THEN locked_points
      ELSE 0
    END
  ), 0)::INTEGER
  INTO v_locked
  FROM point_locks
  WHERE user_id = p_user_id;
  
  -- Retornar resultados
  RETURN QUERY SELECT 
    v_total as total_balance,
    v_locked as locked_balance,
    (v_total - v_locked) as available_balance,
    v_purchased as purchased_balance,
    (v_total - v_locked + v_purchased) as can_withdraw; -- Pode sacar: disponível + comprado
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. FUNÇÃO PARA ADICIONAR PONTOS COM BLOQUEIO
-- ============================================

CREATE OR REPLACE FUNCTION add_points_with_lock(
  p_user_id UUID,
  p_points INTEGER,
  p_action_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_verification RECORD;
  v_unlock_days INTEGER;
  v_is_purchased BOOLEAN;
BEGIN
  -- Verificar se são pontos comprados
  v_is_purchased := (p_action_type = 'purchase' OR p_action_type = 'package_purchase');
  
  -- Buscar nível de verificação
  SELECT 
    verification_level,
    unlock_days,
    premium_verified
  INTO v_verification
  FROM user_verification
  WHERE user_id = p_user_id;
  
  -- Se não existir verificação, criar com padrões
  IF NOT FOUND THEN
    INSERT INTO user_verification (user_id, verification_level, unlock_days)
    VALUES (p_user_id, 0, 30)
    RETURNING verification_level, unlock_days INTO v_verification;
  END IF;
  
  -- Adicionar pontos normalmente
  v_transaction_id := add_points(p_user_id, p_points, p_action_type, p_description, p_metadata);
  
  -- Se são pontos comprados, NÃO bloquear
  IF v_is_purchased THEN
    -- Atualizar purchased_balance
    UPDATE user_points_balance
    SET purchased_balance = COALESCE(purchased_balance, 0) + p_points
    WHERE user_id = p_user_id;
    
    RETURN v_transaction_id;
  END IF;
  
  -- Se usuário é premium verificado, NÃO bloquear
  IF v_verification.premium_verified THEN
    RETURN v_transaction_id;
  END IF;
  
  -- Criar bloqueio de pontos
  v_unlock_days := v_verification.unlock_days;
  
  INSERT INTO point_locks (
    user_id,
    transaction_id,
    locked_points,
    original_unlock_date,
    current_unlock_date,
    lock_reason,
    lock_type,
    remaining_locked
  ) VALUES (
    p_user_id,
    v_transaction_id,
    p_points,
    NOW() + (v_unlock_days || ' days')::INTERVAL,
    NOW() + (v_unlock_days || ' days')::INTERVAL,
    'verification_level_' || v_verification.verification_level,
    'time_based',
    p_points
  );
  
  -- Atualizar locked_balance
  UPDATE user_points_balance
  SET locked_balance = COALESCE(locked_balance, 0) + p_points
  WHERE user_id = p_user_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. FUNÇÃO PARA DESBLOQUEAR PONTOS PROGRESSIVAMENTE
-- ============================================

CREATE OR REPLACE FUNCTION unlock_points_progressively()
RETURNS INTEGER AS $$
DECLARE
  v_lock RECORD;
  v_days_passed INTEGER;
  v_total_days INTEGER;
  v_unlock_percentage DECIMAL;
  v_points_to_unlock INTEGER;
  v_unlocked_count INTEGER := 0;
BEGIN
  -- Processar cada bloqueio ativo
  FOR v_lock IN 
    SELECT * FROM point_locks
    WHERE is_fully_unlocked = false
    AND lock_type = 'time_based'
  LOOP
    -- Calcular dias passados
    v_days_passed := EXTRACT(DAY FROM (NOW() - v_lock.created_at));
    v_total_days := EXTRACT(DAY FROM (v_lock.original_unlock_date - v_lock.created_at));
    
    -- Calcular porcentagem de desbloqueio
    IF v_days_passed >= v_total_days THEN
      v_unlock_percentage := 100;
    ELSIF v_days_passed >= (v_total_days * 0.75) THEN
      v_unlock_percentage := 75;
    ELSIF v_days_passed >= (v_total_days * 0.50) THEN
      v_unlock_percentage := 50;
    ELSIF v_days_passed >= (v_total_days * 0.25) THEN
      v_unlock_percentage := 25;
    ELSE
      v_unlock_percentage := 0;
    END IF;
    
    -- Se houver desbloqueio
    IF v_unlock_percentage > 0 THEN
      v_points_to_unlock := FLOOR(v_lock.locked_points * v_unlock_percentage / 100);
      
      -- Atualizar lock
      UPDATE point_locks
      SET 
        unlock_percentage = v_unlock_percentage,
        remaining_locked = v_lock.locked_points - v_points_to_unlock,
        is_fully_unlocked = (v_unlock_percentage >= 100),
        unlocked_25_at = CASE WHEN v_unlock_percentage >= 25 AND unlocked_25_at IS NULL THEN NOW() ELSE unlocked_25_at END,
        unlocked_50_at = CASE WHEN v_unlock_percentage >= 50 AND unlocked_50_at IS NULL THEN NOW() ELSE unlocked_50_at END,
        unlocked_75_at = CASE WHEN v_unlock_percentage >= 75 AND unlocked_75_at IS NULL THEN NOW() ELSE unlocked_75_at END,
        unlocked_100_at = CASE WHEN v_unlock_percentage >= 100 AND unlocked_100_at IS NULL THEN NOW() ELSE unlocked_100_at END,
        updated_at = NOW()
      WHERE id = v_lock.id;
      
      -- Atualizar balances
      IF v_unlock_percentage >= 100 THEN
        UPDATE user_points_balance
        SET 
          locked_balance = GREATEST(0, COALESCE(locked_balance, 0) - v_lock.locked_points),
          available_balance = COALESCE(available_balance, 0) + v_lock.locked_points
        WHERE user_id = v_lock.user_id;
      END IF;
      
      v_unlocked_count := v_unlocked_count + 1;
    END IF;
  END LOOP;
  
  RETURN v_unlocked_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. FUNÇÃO PARA ATUALIZAR NÍVEL DE VERIFICAÇÃO
-- ============================================

CREATE OR REPLACE FUNCTION update_verification_level(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_verification RECORD;
  v_new_level INTEGER;
  v_unlock_days INTEGER;
  v_daily_limit INTEGER;
  v_monthly_limit DECIMAL;
  v_max_referrals INTEGER;
BEGIN
  SELECT * INTO v_verification
  FROM user_verification
  WHERE user_id = p_user_id;
  
  -- Calcular novo nível
  IF v_verification.premium_verified THEN
    v_new_level := 4;
    v_unlock_days := 0;
    v_daily_limit := 999999;
    v_monthly_limit := 999999.99;
    v_max_referrals := 999999;
  ELSIF v_verification.selfie_verified AND v_verification.cpf_verified THEN
    v_new_level := 3;
    v_unlock_days := 7;
    v_daily_limit := 10000;
    v_monthly_limit := 500.00;
    v_max_referrals := 999999;
  ELSIF v_verification.cpf_verified THEN
    v_new_level := 2;
    v_unlock_days := 15;
    v_daily_limit := 5000;
    v_monthly_limit := 200.00;
    v_max_referrals := 20;
  ELSIF v_verification.email_verified THEN
    v_new_level := 1;
    v_unlock_days := 30;
    v_daily_limit := 2000;
    v_monthly_limit := 50.00;
    v_max_referrals := 5;
  ELSE
    v_new_level := 0;
    v_unlock_days := 30;
    v_daily_limit := 1000;
    v_monthly_limit := 0.00;
    v_max_referrals := 0;
  END IF;
  
  -- Atualizar verificação
  UPDATE user_verification
  SET 
    verification_level = v_new_level,
    unlock_days = v_unlock_days,
    daily_points_limit = v_daily_limit,
    monthly_withdrawal_limit = v_monthly_limit,
    max_referrals_per_month = v_max_referrals,
    verification_date = CASE WHEN v_new_level > verification_level THEN NOW() ELSE verification_date END,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN v_new_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. TRIGGER PARA CRIAR VERIFICAÇÃO AUTOMÁTICA
-- ============================================

CREATE OR REPLACE FUNCTION create_user_verification_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_verification (user_id, email_verified)
  VALUES (NEW.id, NEW.email_confirmed_at IS NOT NULL)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO fraud_detection (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_create_verification_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_verification_on_signup();

-- ============================================
-- 10. FUNÇÃO PARA DETECTAR FRAUDES (Executar Diariamente)
-- ============================================

CREATE OR REPLACE FUNCTION detect_fraudulent_patterns()
RETURNS INTEGER AS $$
DECLARE
  v_flagged_count INTEGER := 0;
BEGIN
  -- Detectar múltiplas contas do mesmo IP
  UPDATE fraud_detection fd
  SET 
    same_ip_users = (
      SELECT ARRAY_AGG(DISTINCT p2.id)
      FROM profiles p1
      JOIN profiles p2 ON p1.last_login_ip = p2.last_login_ip AND p1.id != p2.id
      WHERE p1.id = fd.user_id
      AND p1.last_login_ip IS NOT NULL
    ),
    total_accounts_same_ip = (
      SELECT COUNT(DISTINCT p2.id)
      FROM profiles p1
      JOIN profiles p2 ON p1.last_login_ip = p2.last_login_ip AND p1.id != p2.id
      WHERE p1.id = fd.user_id
    ),
    multiple_accounts_detected = (
      SELECT COUNT(DISTINCT p2.id) > 2
      FROM profiles p1
      JOIN profiles p2 ON p1.last_login_ip = p2.last_login_ip AND p1.id != p2.id
      WHERE p1.id = fd.user_id
    ),
    fraud_score = LEAST(100, fraud_score + CASE 
      WHEN (SELECT COUNT(*) FROM profiles p WHERE p.last_login_ip = (SELECT last_login_ip FROM profiles WHERE id = fd.user_id)) > 5 THEN 50
      WHEN (SELECT COUNT(*) FROM profiles p WHERE p.last_login_ip = (SELECT last_login_ip FROM profiles WHERE id = fd.user_id)) > 3 THEN 30
      WHEN (SELECT COUNT(*) FROM profiles p WHERE p.last_login_ip = (SELECT last_login_ip FROM profiles WHERE id = fd.user_id)) > 1 THEN 15
      ELSE 0
    END),
    last_check = NOW();
  
  -- Detectar padrão de farming (muitas transações em pouco tempo)
  UPDATE fraud_detection fd
  SET 
    farming_pattern_detected = true,
    fraud_score = LEAST(100, fraud_score + 40),
    total_transactions_24h = (
      SELECT COUNT(*)
      FROM point_transactions pt
      WHERE pt.user_id = fd.user_id
      AND pt.created_at > NOW() - INTERVAL '24 hours'
    )
  WHERE user_id IN (
    SELECT user_id
    FROM point_transactions
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY user_id
    HAVING COUNT(*) > 100
  );
  
  -- Detectar indicações suspeitas
  UPDATE fraud_detection fd
  SET 
    suspicious_referrals = true,
    fraud_score = LEAST(100, fraud_score + 35),
    total_referrals_7days = (
      SELECT COUNT(*)
      FROM referrals r
      WHERE r.referrer_id = fd.user_id
      AND r.created_at > NOW() - INTERVAL '7 days'
    )
  WHERE user_id IN (
    SELECT referrer_id
    FROM referrals
    WHERE created_at > NOW() - INTERVAL '7 days'
    GROUP BY referrer_id
    HAVING COUNT(*) > 20
  );
  
  -- Atualizar risk level baseado no score
  UPDATE fraud_detection
  SET risk_level = CASE 
    WHEN fraud_score >= 80 THEN 'critical'
    WHEN fraud_score >= 60 THEN 'high'
    WHEN fraud_score >= 40 THEN 'medium'
    ELSE 'low'
  END;
  
  -- Contar contas sinalizadas
  SELECT COUNT(*) INTO v_flagged_count
  FROM fraud_detection
  WHERE fraud_score >= 60;
  
  RETURN v_flagged_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 11. CRIAR DADOS INICIAIS
-- ============================================

-- Criar verificação para usuários existentes
INSERT INTO user_verification (user_id, email_verified, verification_level, unlock_days)
SELECT 
  id,
  email_confirmed_at IS NOT NULL,
  CASE WHEN email_confirmed_at IS NOT NULL THEN 1 ELSE 0 END,
  30
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Criar fraud_detection para usuários existentes
INSERT INTO fraud_detection (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Comentários finais
COMMENT ON TABLE user_verification IS 'Armazena níveis de verificação e limites de usuários';
COMMENT ON TABLE point_locks IS 'Gerencia bloqueios temporários de pontos para prevenir fraudes';
COMMENT ON TABLE fraud_detection IS 'Sistema de detecção automática de padrões fraudulentos';
COMMENT ON FUNCTION add_points_with_lock IS 'Adiciona pontos com bloqueio automático baseado em verificação (pontos comprados são instantâneos)';
COMMENT ON FUNCTION calculate_point_balances IS 'Calcula saldos separados: total, bloqueado, disponível, comprado';
COMMENT ON FUNCTION unlock_points_progressively IS 'Desbloqueia pontos progressivamente (25%, 50%, 75%, 100%)';
COMMENT ON FUNCTION detect_fraudulent_patterns IS 'Detecta padrões fraudulentos e calcula score de risco';
