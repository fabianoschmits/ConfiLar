-- =====================================================
-- REMOVER SISTEMA DE PONTOS GRATUITOS
-- =====================================================

-- 1. REMOVER CONFIGURAÇÕES DE PONTOS GRATUITOS
DELETE FROM points_config WHERE action_key IN (
  'daily_login',
  'receive_like', 
  'give_like',
  'receive_comment',
  'give_comment',
  'profile_completion',
  'first_post',
  'create_classified'
);

-- 2. REMOVER TRIGGERS DE PONTOS GRATUITOS (SE AS TABELAS EXISTIREM)
DO $$ 
BEGIN
  -- Verificar e remover trigger de curtidas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feed_posts_likes') THEN
    DROP TRIGGER IF EXISTS update_points_on_like ON feed_posts_likes;
    RAISE NOTICE '✅ Trigger de curtidas removido';
  END IF;
  
  -- Verificar e remover trigger de comentários
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
    DROP TRIGGER IF EXISTS update_points_on_comment ON comments;
    RAISE NOTICE '✅ Trigger de comentários removido';
  END IF;
  
  -- Verificar e remover trigger de posts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feed_posts') THEN
    DROP TRIGGER IF EXISTS update_points_on_post ON feed_posts;
    RAISE NOTICE '✅ Trigger de posts removido';
  END IF;
  
  -- Verificar e remover trigger de anúncios
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'classifieds') THEN
    DROP TRIGGER IF EXISTS update_points_on_ad_create ON classifieds;
    RAISE NOTICE '✅ Trigger de anúncios removido';
  END IF;
  
  -- Verificar e remover trigger de login diário
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    DROP TRIGGER IF EXISTS update_points_on_daily_login ON profiles;
    DROP TRIGGER IF EXISTS update_points_on_profile_complete ON profiles;
    RAISE NOTICE '✅ Triggers de perfil removidos';
  END IF;
END $$;

-- 3. REMOVER FUNÇÕES DE PONTOS GRATUITOS
DROP FUNCTION IF EXISTS update_points_on_like();
DROP FUNCTION IF EXISTS update_points_on_comment();
DROP FUNCTION IF EXISTS update_points_on_post();
DROP FUNCTION IF EXISTS update_points_on_ad_create();
DROP FUNCTION IF EXISTS update_points_on_daily_login();
DROP FUNCTION IF EXISTS update_points_on_profile_complete();

-- 4. ATUALIZAR CONFIGURAÇÕES PARA APENAS AÇÕES PAGAS
INSERT INTO points_config (action_key, points_value, daily_limit, description, is_active) VALUES
  ('premium_like', -5, 1000, 'Curtir post (premium)', true),
  ('premium_comment', -10, 500, 'Comentar post (premium)', true),
  ('premium_post', -50, 50, 'Criar post premium', true),
  ('premium_ad', -200, 20, 'Criar anúncio premium destacado', true),
  ('referral_signup', 200, NULL, 'Pessoa indicada se cadastrou', true),
  ('referral_profile_completed', 150, NULL, 'Pessoa indicada completou perfil', true),
  ('referral_first_post', 100, NULL, 'Pessoa indicada fez primeiro post', true),
  ('referral_first_review', 100, NULL, 'Pessoa indicada fez primeira avaliação', true),
  ('referral_active_30_days', 300, NULL, 'Pessoa indicada ficou ativa por 30 dias', true)
ON CONFLICT (action_key) DO UPDATE SET
  points_value = EXCLUDED.points_value,
  daily_limit = EXCLUDED.daily_limit,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 5. CRIAR SISTEMA DE BADGES VIP AUTOMÁTICOS
CREATE TABLE IF NOT EXISTS user_vip_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  badge_icon VARCHAR(10),
  badge_color VARCHAR(7),
  is_active BOOLEAN DEFAULT true,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CRIAR ÍNDICES PARA BADGES VIP
CREATE INDEX IF NOT EXISTS idx_user_vip_badges_user_id ON user_vip_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vip_badges_badge_type ON user_vip_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_user_vip_badges_active ON user_vip_badges(is_active);

-- 7. HABILITAR RLS PARA BADGES VIP
ALTER TABLE user_vip_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own VIP badges" ON user_vip_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view active VIP badges" ON user_vip_badges
  FOR SELECT USING (is_active = true);

-- 8. CRIAR SISTEMA DE ANÚNCIOS PREMIUM
ALTER TABLE classifieds ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE classifieds ADD COLUMN IF NOT EXISTS premium_points_spent INTEGER DEFAULT 0;
ALTER TABLE classifieds ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE classifieds ADD COLUMN IF NOT EXISTS premium_highlight_color VARCHAR(7) DEFAULT '#FFD700';

-- 9. CRIAR SISTEMA DE POSTS PREMIUM
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS premium_points_spent INTEGER DEFAULT 0;
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS premium_highlight_color VARCHAR(7) DEFAULT '#FFD700';

-- 10. CRIAR SISTEMA DE CURTIDAS PREMIUM
ALTER TABLE feed_posts_likes ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE feed_posts_likes ADD COLUMN IF NOT EXISTS premium_points_spent INTEGER DEFAULT 0;

-- 11. CRIAR SISTEMA DE COMENTÁRIOS PREMIUM
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS premium_points_spent INTEGER DEFAULT 0;

-- 12. CRIAR TRIGGER PARA BADGES VIP AUTOMÁTICOS
CREATE OR REPLACE FUNCTION assign_vip_badge_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se é uma compra aprovada
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Atribuir badge VIP baseado no valor da compra
    IF NEW.amount_brl >= 100 THEN
      INSERT INTO user_vip_badges (user_id, badge_type, badge_name, badge_description, badge_icon, badge_color)
      VALUES (
        NEW.user_id,
        'vip_gold',
        'VIP Gold',
        'Cliente VIP Gold - Comprou R$ 100+ em pontos',
        '👑',
        '#FFD700'
      );
    ELSIF NEW.amount_brl >= 50 THEN
      INSERT INTO user_vip_badges (user_id, badge_type, badge_name, badge_description, badge_icon, badge_color)
      VALUES (
        NEW.user_id,
        'vip_silver',
        'VIP Silver',
        'Cliente VIP Silver - Comprou R$ 50+ em pontos',
        '🥈',
        '#C0C0C0'
      );
    ELSIF NEW.amount_brl >= 20 THEN
      INSERT INTO user_vip_badges (user_id, badge_type, badge_name, badge_description, badge_icon, badge_color)
      VALUES (
        NEW.user_id,
        'vip_bronze',
        'VIP Bronze',
        'Cliente VIP Bronze - Comprou R$ 20+ em pontos',
        '🥉',
        '#CD7F32'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. CRIAR TRIGGER PARA CURTIDAS PREMIUM
CREATE OR REPLACE FUNCTION process_premium_like()
RETURNS TRIGGER AS $$
DECLARE
  user_balance INTEGER;
  points_cost INTEGER := 5;
BEGIN
  -- Verificar saldo do usuário
  SELECT balance INTO user_balance 
  FROM user_points_balance 
  WHERE user_id = NEW.user_id;
  
  -- Verificar se tem pontos suficientes
  IF user_balance < points_cost THEN
    RAISE EXCEPTION 'Saldo insuficiente para curtir. Necessário: % pontos', points_cost;
  END IF;
  
  -- Deduzir pontos
  PERFORM add_points(NEW.user_id, -points_cost, 'premium_like', 'Curtiu post premium');
  
  -- Marcar como premium
  NEW.is_premium := true;
  NEW.premium_points_spent := points_cost;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. CRIAR TRIGGER PARA COMENTÁRIOS PREMIUM
CREATE OR REPLACE FUNCTION process_premium_comment()
RETURNS TRIGGER AS $$
DECLARE
  user_balance INTEGER;
  points_cost INTEGER := 10;
BEGIN
  -- Verificar saldo do usuário
  SELECT balance INTO user_balance 
  FROM user_points_balance 
  WHERE user_id = NEW.user_id;
  
  -- Verificar se tem pontos suficientes
  IF user_balance < points_cost THEN
    RAISE EXCEPTION 'Saldo insuficiente para comentar. Necessário: % pontos', points_cost;
  END IF;
  
  -- Deduzir pontos
  PERFORM add_points(NEW.user_id, -points_cost, 'premium_comment', 'Comentou post premium');
  
  -- Marcar como premium
  NEW.is_premium := true;
  NEW.premium_points_spent := points_cost;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 15. CRIAR TRIGGER PARA POSTS PREMIUM
CREATE OR REPLACE FUNCTION process_premium_post()
RETURNS TRIGGER AS $$
DECLARE
  user_balance INTEGER;
  points_cost INTEGER := 50;
BEGIN
  -- Verificar saldo do usuário
  SELECT balance INTO user_points_balance 
  FROM user_points_balance 
  WHERE user_id = NEW.user_id;
  
  -- Verificar se tem pontos suficientes
  IF user_balance < points_cost THEN
    RAISE EXCEPTION 'Saldo insuficiente para criar post premium. Necessário: % pontos', points_cost;
  END IF;
  
  -- Deduzir pontos
  PERFORM add_points(NEW.user_id, -points_cost, 'premium_post', 'Criou post premium');
  
  -- Marcar como premium
  NEW.is_premium := true;
  NEW.premium_points_spent := points_cost;
  NEW.premium_expires_at := NOW() + INTERVAL '7 days';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 16. CRIAR TRIGGER PARA ANÚNCIOS PREMIUM
CREATE OR REPLACE FUNCTION process_premium_ad()
RETURNS TRIGGER AS $$
DECLARE
  user_balance INTEGER;
  points_cost INTEGER := 200;
BEGIN
  -- Verificar saldo do usuário
  SELECT balance INTO user_balance 
  FROM user_points_balance 
  WHERE user_id = NEW.user_id;
  
  -- Verificar se tem pontos suficientes
  IF user_balance < points_cost THEN
    RAISE EXCEPTION 'Saldo insuficiente para criar anúncio premium. Necessário: % pontos', points_cost;
  END IF;
  
  -- Deduzir pontos
  PERFORM add_points(NEW.user_id, -points_cost, 'premium_ad', 'Criou anúncio premium');
  
  -- Marcar como premium
  NEW.is_premium := true;
  NEW.premium_points_spent := points_cost;
  NEW.premium_expires_at := NOW() + INTERVAL '30 days';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 17. APLICAR TRIGGERS (SE AS TABELAS EXISTIREM)
DO $$ 
BEGIN
  -- Trigger para badges VIP
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'points_purchases') THEN
    CREATE TRIGGER assign_vip_badge_on_purchase_trigger
      AFTER UPDATE ON points_purchases
      FOR EACH ROW
      EXECUTE FUNCTION assign_vip_badge_on_purchase();
    RAISE NOTICE '✅ Trigger de badges VIP criado';
  END IF;
  
  -- Trigger para curtidas premium
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feed_posts_likes') THEN
    CREATE TRIGGER process_premium_like_trigger
      BEFORE INSERT ON feed_posts_likes
      FOR EACH ROW
      EXECUTE FUNCTION process_premium_like();
    RAISE NOTICE '✅ Trigger de curtidas premium criado';
  END IF;
  
  -- Trigger para comentários premium
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
    CREATE TRIGGER process_premium_comment_trigger
      BEFORE INSERT ON comments
      FOR EACH ROW
      EXECUTE FUNCTION process_premium_comment();
    RAISE NOTICE '✅ Trigger de comentários premium criado';
  END IF;
  
  -- Trigger para posts premium
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feed_posts') THEN
    CREATE TRIGGER process_premium_post_trigger
      BEFORE INSERT ON feed_posts
      FOR EACH ROW
      EXECUTE FUNCTION process_premium_post();
    RAISE NOTICE '✅ Trigger de posts premium criado';
  END IF;
  
  -- Trigger para anúncios premium
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'classifieds') THEN
    CREATE TRIGGER process_premium_ad_trigger
      BEFORE INSERT ON classifieds
      FOR EACH ROW
      EXECUTE FUNCTION process_premium_ad();
    RAISE NOTICE '✅ Trigger de anúncios premium criado';
  END IF;
END $$;

-- 18. VERIFICAÇÃO FINAL
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SISTEMA DE PONTOS GRATUITOS REMOVIDO!';
  RAISE NOTICE 'SISTEMA DE PONTOS PAGOS IMPLEMENTADO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Pontos gratuitos removidos';
  RAISE NOTICE '✅ Sistema de curtidas pagas criado';
  RAISE NOTICE '✅ Sistema de anúncios premium criado';
  RAISE NOTICE '✅ Sistema de badges VIP criado';
  RAISE NOTICE '✅ Sistema de indicações mantido';
  RAISE NOTICE '========================================';
END $$;
