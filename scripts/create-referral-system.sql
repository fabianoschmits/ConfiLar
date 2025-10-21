-- ============================================
-- SISTEMA COMPLETO DE INDICAÇÕES/REFERRAL
-- ============================================

-- 1. Tabela principal de referrals (indica\u00e7\u00f5es)
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'inactive')),
  
  -- Tracking de a\u00e7\u00f5es do indicado
  profile_completed BOOLEAN DEFAULT FALSE,
  first_post_made BOOLEAN DEFAULT FALSE,
  first_service_hired BOOLEAN DEFAULT FALSE,
  active_30_days BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  
  -- Metadados
  source TEXT, -- 'whatsapp', 'email', 'link_direto', etc.
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  CONSTRAINT unique_referral UNIQUE (referrer_id, referred_id),
  CONSTRAINT no_self_referral CHECK (referrer_id != referred_id)
);

-- 2. Tabela de estat\u00edsticas e n\u00edvel do usu\u00e1rio
CREATE TABLE IF NOT EXISTS public.user_referral_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- C\u00f3digo \u00fanico do usu\u00e1rio
  referral_code TEXT NOT NULL UNIQUE,
  
  -- Estat\u00edsticas
  total_referrals INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,
  completed_referrals INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  
  -- N\u00edvel/Tier
  tier TEXT DEFAULT 'none' CHECK (tier IN ('none', 'bronze', 'silver', 'gold', 'platinum', 'diamond')),
  tier_updated_at TIMESTAMPTZ,
  
  -- Badges conquistados
  badges JSONB DEFAULT '[]'::jsonb,
  
  -- Ranking
  rank INTEGER,
  rank_updated_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- \u00cdndices
  CONSTRAINT valid_referral_code CHECK (LENGTH(referral_code) >= 6)
);

-- 3. Tabela de hist\u00f3rico de pontos
CREATE TABLE IF NOT EXISTS public.referral_points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES public.referrals(id) ON DELETE SET NULL,
  
  -- Pontos
  points INTEGER NOT NULL,
  action_type TEXT NOT NULL, -- 'referral_signup', 'profile_completed', 'first_post', etc.
  description TEXT,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de conquistas/badges
CREATE TABLE IF NOT EXISTS public.referral_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  tier TEXT NOT NULL,
  required_referrals INTEGER NOT NULL,
  required_points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadados visuais
  color TEXT,
  gradient_from TEXT,
  gradient_to TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de metas/desafios temporários
CREATE TABLE IF NOT EXISTS public.referral_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Requisitos
  target_referrals INTEGER NOT NULL,
  target_points INTEGER,
  
  -- Per\u00edodo
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Recompensas
  reward_badge_code TEXT,
  reward_points INTEGER DEFAULT 0,
  reward_tier_boost BOOLEAN DEFAULT FALSE,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de participa\u00e7\u00e3o em desafios
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.referral_challenges(id) ON DELETE CASCADE,
  
  -- Progresso
  current_referrals INTEGER DEFAULT 0,
  current_points INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT unique_user_challenge UNIQUE (user_id, challenge_id)
);

-- ============================================
-- \u00cdNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created ON public.referrals(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_stats_code ON public.user_referral_stats(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_stats_tier ON public.user_referral_stats(tier);
CREATE INDEX IF NOT EXISTS idx_user_stats_rank ON public.user_referral_stats(rank) WHERE rank IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_points_history_user ON public.referral_points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created ON public.referral_points_history(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referral_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Policies para referrals
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
CREATE POLICY "Users can view their own referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert referrals" ON public.referrals;
CREATE POLICY "Users can insert referrals" ON public.referrals
  FOR INSERT TO authenticated
  WITH CHECK (referrer_id != auth.uid()); -- N\u00e3o pode se auto-indicar

-- Policies para user_referral_stats
DROP POLICY IF EXISTS "Users can view all stats" ON public.user_referral_stats;
CREATE POLICY "Users can view all stats" ON public.user_referral_stats
  FOR SELECT TO authenticated
  USING (TRUE); -- Todos podem ver stats (para ranking)

DROP POLICY IF EXISTS "Users can update own stats" ON public.user_referral_stats;
CREATE POLICY "Users can update own stats" ON public.user_referral_stats
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_referral_stats;
CREATE POLICY "Users can insert own stats" ON public.user_referral_stats
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policies para referral_points_history
DROP POLICY IF EXISTS "Users can view their points history" ON public.referral_points_history;
CREATE POLICY "Users can view their points history" ON public.referral_points_history
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Policies para badges (todos podem ver)
DROP POLICY IF EXISTS "Anyone can view badges" ON public.referral_badges;
CREATE POLICY "Anyone can view badges" ON public.referral_badges
  FOR SELECT TO authenticated
  USING (is_active = TRUE);

-- Policies para challenges (todos podem ver)
DROP POLICY IF EXISTS "Anyone can view active challenges" ON public.referral_challenges;
CREATE POLICY "Anyone can view active challenges" ON public.referral_challenges
  FOR SELECT TO authenticated
  USING (is_active = TRUE);

-- Policies para user_challenge_progress
DROP POLICY IF EXISTS "Users can view their challenge progress" ON public.user_challenge_progress;
CREATE POLICY "Users can view their challenge progress" ON public.user_challenge_progress
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their challenge progress" ON public.user_challenge_progress;
CREATE POLICY "Users can insert their challenge progress" ON public.user_challenge_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their challenge progress" ON public.user_challenge_progress;
CREATE POLICY "Users can update their challenge progress" ON public.user_challenge_progress
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- FUN\u00c7\u00d5ES AUXILIARES
-- ============================================

-- Fun\u00e7\u00e3o para gerar c\u00f3digo de referral \u00fanico
CREATE OR REPLACE FUNCTION generate_referral_code(user_name TEXT, user_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 0;
BEGIN
  -- Normalizar nome (primeiras letras + sufixo aleat\u00f3rio)
  base_code := UPPER(SUBSTRING(REGEXP_REPLACE(user_name, '[^a-zA-Z0-9]', '', 'g'), 1, 6));
  
  -- Se o nome for muito curto, usar parte do UUID
  IF LENGTH(base_code) < 4 THEN
    base_code := base_code || SUBSTRING(REPLACE(user_id::TEXT, '-', ''), 1, 6 - LENGTH(base_code));
  END IF;
  
  -- Adicionar sufixo num\u00e9rico se necess\u00e1rio
  final_code := base_code || FLOOR(RANDOM() * 9999)::TEXT;
  
  -- Garantir unicidade
  WHILE EXISTS (SELECT 1 FROM public.user_referral_stats WHERE referral_code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || FLOOR(RANDOM() * 9999)::TEXT;
    
    -- Prevenir loop infinito
    IF counter > 100 THEN
      final_code := SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 12);
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- Fun\u00e7\u00e3o para calcular tier baseado em referrals
CREATE OR REPLACE FUNCTION calculate_tier(total_refs INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF total_refs >= 50 THEN
    RETURN 'diamond';
  ELSIF total_refs >= 25 THEN
    RETURN 'platinum';
  ELSIF total_refs >= 10 THEN
    RETURN 'gold';
  ELSIF total_refs >= 5 THEN
    RETURN 'silver';
  ELSIF total_refs >= 1 THEN
    RETURN 'bronze';
  ELSE
    RETURN 'none';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Fun\u00e7\u00e3o para adicionar pontos
CREATE OR REPLACE FUNCTION add_referral_points(
  p_user_id UUID,
  p_points INTEGER,
  p_action_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_referral_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Adicionar ao hist\u00f3rico
  INSERT INTO public.referral_points_history (
    user_id,
    referral_id,
    points,
    action_type,
    description
  ) VALUES (
    p_user_id,
    p_referral_id,
    p_points,
    p_action_type,
    p_description
  );
  
  -- Atualizar total de pontos
  UPDATE public.user_referral_stats
  SET 
    total_points = total_points + p_points,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Fun\u00e7\u00e3o para atualizar estat\u00edsticas do usu\u00e1rio
CREATE OR REPLACE FUNCTION update_referral_stats(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total INTEGER;
  v_active INTEGER;
  v_completed INTEGER;
  v_new_tier TEXT;
  v_old_tier TEXT;
BEGIN
  -- Contar referrals
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'active'),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO v_total, v_active, v_completed
  FROM public.referrals
  WHERE referrer_id = p_user_id;
  
  -- Calcular novo tier
  v_new_tier := calculate_tier(v_total);
  
  -- Obter tier atual
  SELECT tier INTO v_old_tier
  FROM public.user_referral_stats
  WHERE user_id = p_user_id;
  
  -- Atualizar stats
  UPDATE public.user_referral_stats
  SET 
    total_referrals = v_total,
    active_referrals = v_active,
    completed_referrals = v_completed,
    tier = v_new_tier,
    tier_updated_at = CASE WHEN v_new_tier != v_old_tier THEN NOW() ELSE tier_updated_at END,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Se subiu de tier, adicionar badge
  IF v_new_tier != v_old_tier AND v_new_tier != 'none' THEN
    UPDATE public.user_referral_stats
    SET badges = COALESCE(badges, '[]'::jsonb) || jsonb_build_object(
      'tier', v_new_tier,
      'earned_at', NOW(),
      'referrals_at_time', v_total
    )
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Criar stats ao criar perfil de usu\u00e1rio
CREATE OR REPLACE FUNCTION create_user_referral_stats_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_code TEXT;
  v_user_name TEXT;
BEGIN
  -- Obter nome do usu\u00e1rio do perfil
  SELECT COALESCE(full_name, 'USER') INTO v_user_name
  FROM public.profiles
  WHERE id = NEW.id;
  
  -- Gerar c\u00f3digo de referral
  v_referral_code := generate_referral_code(v_user_name, NEW.id);
  
  -- Criar stats
  INSERT INTO public.user_referral_stats (
    user_id,
    referral_code
  ) VALUES (
    NEW.id,
    v_referral_code
  ) ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_user_created_create_referral_stats ON public.profiles;
CREATE TRIGGER on_user_created_create_referral_stats
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_referral_stats_trigger();

-- Trigger: Atualizar stats quando referral muda
CREATE OR REPLACE FUNCTION update_referral_stats_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar stats do indicador
  PERFORM update_referral_stats(NEW.referrer_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_referral_changed ON public.referrals;
CREATE TRIGGER on_referral_changed
  AFTER INSERT OR UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_stats_trigger();

-- Trigger: Adicionar pontos quando a\u00e7\u00f5es s\u00e3o completadas
CREATE OR REPLACE FUNCTION award_referral_points_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Novo cadastro via referral
  IF TG_OP = 'INSERT' THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      50,
      'referral_signup',
      'Nova indica\u00e7\u00e3o se cadastrou',
      NEW.id
    );
  END IF;
  
  -- Perfil completado
  IF TG_OP = 'UPDATE' AND NEW.profile_completed = TRUE AND OLD.profile_completed = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      50,
      'profile_completed',
      'Indica\u00e7\u00e3o completou o perfil',
      NEW.id
    );
  END IF;
  
  -- Primeiro post
  IF TG_OP = 'UPDATE' AND NEW.first_post_made = TRUE AND OLD.first_post_made = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      30,
      'first_post',
      'Indica\u00e7\u00e3o fez o primeiro post',
      NEW.id
    );
  END IF;
  
  -- Primeiro servi\u00e7o contratado
  IF TG_OP = 'UPDATE' AND NEW.first_service_hired = TRUE AND OLD.first_service_hired = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      100,
      'service_hired',
      'Indica\u00e7\u00e3o contratou um servi\u00e7o',
      NEW.id
    );
  END IF;
  
  -- 30 dias ativo
  IF TG_OP = 'UPDATE' AND NEW.active_30_days = TRUE AND OLD.active_30_days = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      150,
      'active_30_days',
      'Indica\u00e7\u00e3o ativa por 30 dias',
      NEW.id
    );
    
    -- Marcar como completed
    UPDATE public.referrals
    SET 
      status = 'completed',
      completed_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_referral_milestones ON public.referrals;
CREATE TRIGGER on_referral_milestones
  AFTER INSERT OR UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION award_referral_points_trigger();

-- ============================================
-- POPULAR BADGES PADR\u00c3O
-- ============================================

INSERT INTO public.referral_badges (code, name, description, tier, required_referrals, icon, color, gradient_from, gradient_to) VALUES
  ('bronze_ambassador', 'Embaixador Iniciante', 'Indicou de 1 a 4 pessoas', 'bronze', 1, 'shield', '#CD7F32', '#CD7F32', '#B87333'),
  ('silver_ambassador', 'Embaixador ConfiLar', 'Indicou de 5 a 9 pessoas', 'silver', 5, 'award', '#C0C0C0', '#C0C0C0', '#A8A8A8'),
  ('gold_ambassador', 'Embaixador Gold', 'Indicou de 10 a 24 pessoas', 'gold', 10, 'crown', '#FFD700', '#FFD700', '#FFA500'),
  ('platinum_ambassador', 'Embaixador Premium', 'Indicou de 25 a 49 pessoas', 'platinum', 25, 'gem', '#E5E4E2', '#E5E4E2', '#BCC6CC'),
  ('diamond_ambassador', 'Super Embaixador', 'Indicou 50 ou mais pessoas', 'diamond', 50, 'sparkles', '#B9F2FF', '#00CED1', '#4169E1')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- FUN\u00c7\u00d5ES PARA RANKING
-- ============================================

-- Atualizar ranking (executar periodicamente via cron job)
CREATE OR REPLACE FUNCTION update_referral_rankings()
RETURNS VOID AS $$
BEGIN
  WITH ranked_users AS (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY total_referrals DESC, total_points DESC, created_at ASC) as new_rank
    FROM public.user_referral_stats
    WHERE total_referrals > 0
  )
  UPDATE public.user_referral_stats urs
  SET 
    rank = ru.new_rank,
    rank_updated_at = NOW()
  FROM ranked_users ru
  WHERE urs.user_id = ru.user_id;
END;
$$ LANGUAGE plpgsql;

-- Fun\u00e7\u00e3o para obter top referrers
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

-- ============================================
-- VIEW PARA DASHBOARD
-- ============================================

CREATE OR REPLACE VIEW referral_dashboard_stats AS
SELECT 
  r.referrer_id,
  COUNT(r.id) as total_referrals,
  COUNT(r.id) FILTER (WHERE r.status = 'active') as active_referrals,
  COUNT(r.id) FILTER (WHERE r.status = 'completed') as completed_referrals,
  COUNT(r.id) FILTER (WHERE r.profile_completed = TRUE) as profiles_completed,
  COUNT(r.id) FILTER (WHERE r.first_post_made = TRUE) as first_posts_made,
  SUM(CASE WHEN r.created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as referrals_last_30_days,
  SUM(CASE WHEN r.created_at >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) as referrals_last_7_days,
  MAX(r.created_at) as last_referral_date
FROM public.referrals r
GROUP BY r.referrer_id;

COMMENT ON TABLE public.referrals IS 'Tabela principal de indica\u00e7\u00f5es/referrals entre usu\u00e1rios';
COMMENT ON TABLE public.user_referral_stats IS 'Estat\u00edsticas e n\u00edvel de cada usu\u00e1rio no programa de indica\u00e7\u00f5es';
COMMENT ON TABLE public.referral_points_history IS 'Hist\u00f3rico de pontos ganhos por indica\u00e7\u00f5es';
COMMENT ON TABLE public.referral_badges IS 'Badges/conquistas dispon\u00edveis no programa';
COMMENT ON TABLE public.referral_challenges IS 'Desafios temporários para gamifica\u00e7\u00e3o';

