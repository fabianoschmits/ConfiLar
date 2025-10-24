-- ============================================
-- SISTEMA DE PONTOS - FASE 1 (MVP BÁSICO)
-- ============================================
-- Este script expande o sistema de referral existente
-- para incluir um sistema completo de pontos

-- ============================================
-- 1. EXPANDIR TABELA PROFILES COM PONTOS
-- ============================================

-- Adicionar campos de pontos à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS points_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS user_level VARCHAR(20) DEFAULT 'bronze',
ADD COLUMN IF NOT EXISTS daily_points_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_daily_reset DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS total_points_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_points_spent INTEGER DEFAULT 0;

-- Comentários para documentação
COMMENT ON COLUMN public.profiles.points_balance IS 'Saldo atual de pontos do usuário';
COMMENT ON COLUMN public.profiles.user_level IS 'Nível do usuário baseado em pontos (bronze, silver, gold, platinum, diamond)';
COMMENT ON COLUMN public.profiles.daily_points_earned IS 'Pontos ganhos hoje (reset diário)';
COMMENT ON COLUMN public.profiles.last_daily_reset IS 'Última data de reset diário';
COMMENT ON COLUMN public.profiles.total_points_earned IS 'Total de pontos ganhos na vida';
COMMENT ON COLUMN public.profiles.total_points_spent IS 'Total de pontos gastos na vida';

-- ============================================
-- 2. TABELA DE TRANSAÇÕES DE PONTOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transação
  amount INTEGER NOT NULL, -- Positivo = ganhou, Negativo = gastou
  type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'spend', 'transfer', 'purchase', 'refund')),
  source VARCHAR(50) NOT NULL, -- 'referral', 'post', 'like', 'daily', 'purchase', 'transfer'
  
  -- Detalhes
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Referências
  referral_id UUID REFERENCES public.referrals(id) ON DELETE SET NULL,
  post_id UUID REFERENCES public.feed_posts(id) ON DELETE SET NULL,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON public.point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON public.point_transactions(type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_source ON public.point_transactions(source);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created ON public.point_transactions(created_at DESC);

-- ============================================
-- 3. TABELA DE CONFIGURAÇÕES DE PONTOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.points_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type VARCHAR(50) NOT NULL UNIQUE,
  points_value INTEGER NOT NULL,
  daily_limit INTEGER DEFAULT NULL, -- NULL = sem limite
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO public.points_config (action_type, points_value, daily_limit, description) VALUES
  -- Sistema de Referral (já existente)
  ('referral_signup', 200, NULL, 'Pessoa indicada se cadastrou'),
  ('referral_profile_completed', 150, NULL, 'Pessoa indicada completou perfil'),
  ('referral_first_post', 100, NULL, 'Pessoa indicada fez primeiro post'),
  ('referral_first_review', 100, NULL, 'Pessoa indicada fez primeira avaliação'),
  ('referral_active_30_days', 300, NULL, 'Pessoa indicada ficou ativa por 30 dias'),
  
  -- Sistema de Curtidas (NOVO)
  ('receive_like', 2, 500, 'Recebeu curtida em post'),
  ('give_like', -2, 500, 'Curtiu um post'),
  ('receive_comment', 5, 200, 'Recebeu comentário em post'),
  ('give_comment', -1, 200, 'Comentou um post'),
  
  -- Sistema de Atividade (NOVO)
  ('daily_login', 10, 1, 'Login diário'),
  ('profile_completion', 150, 1, 'Completou perfil 100%'),
  ('first_post', 50, 1, 'Primeiro post no feed'),
  ('create_classified', 100, 10, 'Criou anúncio de serviço'),
  
  -- Sistema de Níveis (NOVO)
  ('level_up', 0, NULL, 'Subiu de nível'),
  ('milestone_reached', 0, NULL, 'Alcançou marco')
ON CONFLICT (action_type) DO UPDATE SET
  points_value = EXCLUDED.points_value,
  daily_limit = EXCLUDED.daily_limit,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ============================================
-- 4. FUNÇÕES PARA SISTEMA DE PONTOS
-- ============================================

-- Função para adicionar pontos
CREATE OR REPLACE FUNCTION add_points(
  p_user_id UUID,
  p_action_type VARCHAR(50),
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_referral_id UUID DEFAULT NULL,
  p_post_id UUID DEFAULT NULL,
  p_related_user_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_points INTEGER;
  v_daily_limit INTEGER;
  v_daily_earned INTEGER;
  v_config RECORD;
BEGIN
  -- Buscar configuração da ação
  SELECT * INTO v_config
  FROM public.points_config
  WHERE action_type = p_action_type AND is_active = TRUE;
  
  -- Verificar se ação existe
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ação de pontos não encontrada: %', p_action_type;
  END IF;
  
  v_points := v_config.points_value;
  
  -- Verificar limite diário se aplicável
  IF v_config.daily_limit IS NOT NULL THEN
    -- Calcular pontos ganhos hoje
    SELECT COALESCE(SUM(amount), 0) INTO v_daily_earned
    FROM public.point_transactions
    WHERE user_id = p_user_id
      AND source = p_action_type
      AND created_at >= CURRENT_DATE;
    
    -- Verificar se excedeu limite
    IF v_daily_earned >= v_config.daily_limit THEN
      RETURN 0; -- Não adiciona pontos se excedeu limite
    END IF;
    
    -- Ajustar pontos se necessário
    IF v_daily_earned + v_points > v_config.daily_limit THEN
      v_points := v_config.daily_limit - v_daily_earned;
    END IF;
  END IF;
  
  -- Não adicionar se pontos = 0
  IF v_points = 0 THEN
    RETURN 0;
  END IF;
  
  -- Criar transação
  INSERT INTO public.point_transactions (
    user_id,
    amount,
    type,
    source,
    description,
    metadata,
    referral_id,
    post_id,
    related_user_id
  ) VALUES (
    p_user_id,
    v_points,
    CASE WHEN v_points > 0 THEN 'earn' ELSE 'spend' END,
    p_action_type,
    COALESCE(p_description, v_config.description),
    p_metadata,
    p_referral_id,
    p_post_id,
    p_related_user_id
  );
  
  -- Atualizar saldo do usuário
  UPDATE public.profiles
  SET 
    points_balance = points_balance + v_points,
    total_points_earned = total_points_earned + CASE WHEN v_points > 0 THEN v_points ELSE 0 END,
    total_points_spent = total_points_spent + CASE WHEN v_points < 0 THEN ABS(v_points) ELSE 0 END,
    daily_points_earned = daily_points_earned + CASE WHEN v_points > 0 THEN v_points ELSE 0 END,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Verificar se subiu de nível
  PERFORM check_user_level(p_user_id);
  
  RETURN v_points;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar e atualizar nível do usuário
CREATE OR REPLACE FUNCTION check_user_level(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_current_level TEXT;
  v_new_level TEXT;
  v_total_points INTEGER;
BEGIN
  -- Obter nível atual e pontos totais
  SELECT user_level, total_points_earned
  INTO v_current_level, v_total_points
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Calcular novo nível baseado em pontos
  IF v_total_points >= 10000 THEN
    v_new_level := 'diamond';
  ELSIF v_total_points >= 5000 THEN
    v_new_level := 'platinum';
  ELSIF v_total_points >= 2000 THEN
    v_new_level := 'gold';
  ELSIF v_total_points >= 500 THEN
    v_new_level := 'silver';
  ELSE
    v_new_level := 'bronze';
  END IF;
  
  -- Atualizar nível se mudou
  IF v_new_level != v_current_level THEN
    UPDATE public.profiles
    SET 
      user_level = v_new_level,
      updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Adicionar pontos por subir de nível (se configurado)
    PERFORM add_points(
      p_user_id,
      'level_up',
      'Subiu para nível ' || v_new_level,
      jsonb_build_object('old_level', v_current_level, 'new_level', v_new_level)
    );
  END IF;
  
  RETURN v_new_level;
END;
$$ LANGUAGE plpgsql;

-- Função para reset diário de pontos
CREATE OR REPLACE FUNCTION reset_daily_points()
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET 
    daily_points_earned = 0,
    last_daily_reset = CURRENT_DATE,
    updated_at = NOW()
  WHERE last_daily_reset < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Função para obter saldo de pontos
CREATE OR REPLACE FUNCTION get_user_points_balance(p_user_id UUID)
RETURNS TABLE (
  balance INTEGER,
  level TEXT,
  daily_earned INTEGER,
  total_earned INTEGER,
  total_spent INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.points_balance,
    p.user_level,
    p.daily_points_earned,
    p.total_points_earned,
    p.total_points_spent
  FROM public.profiles p
  WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. TRIGGERS PARA AUTOMAÇÃO
-- ============================================

-- Trigger: Adicionar pontos quando recebe curtida
CREATE OR REPLACE FUNCTION award_like_points_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_post_owner_id UUID;
BEGIN
  -- Obter dono do post
  SELECT user_id INTO v_post_owner_id
  FROM public.feed_posts
  WHERE id = NEW.post_id;
  
  -- Adicionar pontos para quem recebeu a curtida
  PERFORM add_points(
    v_post_owner_id,
    'receive_like',
    'Recebeu curtida em post',
    jsonb_build_object('post_id', NEW.post_id, 'liker_id', NEW.user_id),
    NULL,
    NEW.post_id,
    NEW.user_id
  );
  
  -- Subtrair pontos de quem curtiu
  PERFORM add_points(
    NEW.user_id,
    'give_like',
    'Curtiu um post',
    jsonb_build_object('post_id', NEW.post_id, 'post_owner_id', v_post_owner_id),
    NULL,
    NEW.post_id,
    v_post_owner_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas curtidas
DROP TRIGGER IF EXISTS on_post_like_points ON public.post_likes;
CREATE TRIGGER on_post_like_points
  AFTER INSERT ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION award_like_points_trigger();

-- Trigger: Adicionar pontos quando recebe comentário
CREATE OR REPLACE FUNCTION award_comment_points_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_post_owner_id UUID;
BEGIN
  -- Obter dono do post
  SELECT user_id INTO v_post_owner_id
  FROM public.feed_posts
  WHERE id = NEW.post_id;
  
  -- Adicionar pontos para quem recebeu o comentário
  PERFORM add_points(
    v_post_owner_id,
    'receive_comment',
    'Recebeu comentário em post',
    jsonb_build_object('post_id', NEW.post_id, 'commenter_id', NEW.user_id),
    NULL,
    NEW.post_id,
    NEW.user_id
  );
  
  -- Subtrair pontos de quem comentou
  PERFORM add_points(
    NEW.user_id,
    'give_comment',
    'Comentou um post',
    jsonb_build_object('post_id', NEW.post_id, 'post_owner_id', v_post_owner_id),
    NULL,
    NEW.post_id,
    v_post_owner_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nos comentários
DROP TRIGGER IF EXISTS on_post_comment_points ON public.post_comments;
CREATE TRIGGER on_post_comment_points
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION award_comment_points_trigger();

-- ============================================
-- 6. ROW LEVEL SECURITY
-- ============================================

-- Habilitar RLS
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_config ENABLE ROW LEVEL SECURITY;

-- Policies para point_transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.point_transactions;
CREATE POLICY "Users can view their own transactions" ON public.point_transactions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Policies para points_config (todos podem ver)
DROP POLICY IF EXISTS "Anyone can view points config" ON public.points_config;
CREATE POLICY "Anyone can view points config" ON public.points_config
  FOR SELECT TO authenticated
  USING (is_active = TRUE);

-- ============================================
-- 7. VIEWS PARA DASHBOARD
-- ============================================

-- View para estatísticas de pontos do usuário
CREATE OR REPLACE VIEW user_points_stats AS
SELECT 
  p.id as user_id,
  p.full_name,
  p.points_balance,
  p.user_level,
  p.daily_points_earned,
  p.total_points_earned,
  p.total_points_spent,
  p.last_daily_reset,
  -- Estatísticas do mês
  COALESCE(month_stats.monthly_earned, 0) as monthly_earned,
  COALESCE(month_stats.monthly_spent, 0) as monthly_spent,
  -- Ranking
  ROW_NUMBER() OVER (ORDER BY p.total_points_earned DESC) as global_rank
FROM public.profiles p
LEFT JOIN (
  SELECT 
    user_id,
    SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as monthly_earned,
    SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as monthly_spent
  FROM public.point_transactions
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY user_id
) month_stats ON month_stats.user_id = p.id;

-- ============================================
-- 8. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE public.point_transactions IS 'Histórico de todas as transações de pontos';
COMMENT ON TABLE public.points_config IS 'Configurações de pontos por ação';
COMMENT ON FUNCTION add_points IS 'Adiciona pontos para um usuário baseado em uma ação';
COMMENT ON FUNCTION check_user_level IS 'Verifica e atualiza o nível do usuário baseado nos pontos';
COMMENT ON FUNCTION reset_daily_points IS 'Reseta os pontos diários de todos os usuários';

-- ============================================
-- 9. DADOS INICIAIS
-- ============================================

-- Atualizar usuários existentes com campos de pontos
UPDATE public.profiles
SET 
  points_balance = COALESCE(points_balance, 0),
  user_level = COALESCE(user_level, 'bronze'),
  daily_points_earned = COALESCE(daily_points_earned, 0),
  last_daily_reset = COALESCE(last_daily_reset, CURRENT_DATE),
  total_points_earned = COALESCE(total_points_earned, 0),
  total_points_spent = COALESCE(total_points_spent, 0)
WHERE points_balance IS NULL;

-- ============================================
-- SISTEMA DE PONTOS FASE 1 - IMPLEMENTADO! 🎉
-- ============================================
