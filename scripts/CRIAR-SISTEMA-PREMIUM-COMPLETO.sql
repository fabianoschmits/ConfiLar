-- =============================================
-- SCRIPT SQL PARA SISTEMA PREMIUM COMPLETO
-- =============================================
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- Este script cria todas as tabelas e estruturas necessárias

BEGIN;

-- =============================================
-- 1. TABELA DE SALDO DE PONTOS
-- =============================================
CREATE TABLE IF NOT EXISTS user_points_balance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =============================================
-- 2. TABELA DE TRANSAÇÕES DE PONTOS
-- =============================================
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  source VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. ATUALIZAR TABELA FEED_POSTS PARA SUPORTE PREMIUM
-- =============================================
-- Adicionar colunas premium se não existirem
DO $$ 
BEGIN
  -- Verificar e adicionar coluna is_premium
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'feed_posts' AND column_name = 'is_premium') THEN
    ALTER TABLE feed_posts ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Verificar e adicionar coluna premium_points_spent
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'feed_posts' AND column_name = 'premium_points_spent') THEN
    ALTER TABLE feed_posts ADD COLUMN premium_points_spent INTEGER DEFAULT 0;
  END IF;
  
  -- Verificar e adicionar coluna premium_expires_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'feed_posts' AND column_name = 'premium_expires_at') THEN
    ALTER TABLE feed_posts ADD COLUMN premium_expires_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Verificar e adicionar coluna premium_highlight_color
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'feed_posts' AND column_name = 'premium_highlight_color') THEN
    ALTER TABLE feed_posts ADD COLUMN premium_highlight_color VARCHAR(7) DEFAULT '#FFD700';
  END IF;
END $$;

-- =============================================
-- 4. ATUALIZAR TABELA FEED_POSTS_LIKES PARA SUPORTE PREMIUM
-- =============================================
DO $$ 
BEGIN
  -- Verificar e adicionar coluna is_premium
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'feed_posts_likes' AND column_name = 'is_premium') THEN
    ALTER TABLE feed_posts_likes ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Verificar e adicionar coluna premium_points_spent
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'feed_posts_likes' AND column_name = 'premium_points_spent') THEN
    ALTER TABLE feed_posts_likes ADD COLUMN premium_points_spent INTEGER DEFAULT 0;
  END IF;
END $$;

-- =============================================
-- 5. ATUALIZAR TABELA CLASSIFIEDS PARA SUPORTE PREMIUM
-- =============================================
DO $$ 
BEGIN
  -- Verificar e adicionar coluna is_premium
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'classifieds' AND column_name = 'is_premium') THEN
    ALTER TABLE classifieds ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Verificar e adicionar coluna premium_points_spent
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'classifieds' AND column_name = 'premium_points_spent') THEN
    ALTER TABLE classifieds ADD COLUMN premium_points_spent INTEGER DEFAULT 0;
  END IF;
  
  -- Verificar e adicionar coluna premium_expires_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'classifieds' AND column_name = 'premium_expires_at') THEN
    ALTER TABLE classifieds ADD COLUMN premium_expires_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Verificar e adicionar coluna premium_highlight_color
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'classifieds' AND column_name = 'premium_highlight_color') THEN
    ALTER TABLE classifieds ADD COLUMN premium_highlight_color VARCHAR(7) DEFAULT '#FFD700';
  END IF;
END $$;

-- =============================================
-- 6. TABELA DE BADGES VIP
-- =============================================
CREATE TABLE IF NOT EXISTS vip_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type VARCHAR(20) NOT NULL CHECK (badge_type IN ('vip_bronze', 'vip_silver', 'vip_gold', 'vip_platinum', 'vip_diamond')),
  badge_name VARCHAR(50) NOT NULL,
  badge_description TEXT NOT NULL,
  badge_icon VARCHAR(10) NOT NULL,
  badge_color VARCHAR(7) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. FUNÇÃO PARA ADICIONAR/SUBTRAIR PONTOS
-- =============================================
CREATE OR REPLACE FUNCTION add_points(
  p_user_id UUID,
  p_points INTEGER,
  p_source VARCHAR(50),
  p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction_id UUID;
  v_result JSONB;
BEGIN
  -- Verificar se o usuário existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não encontrado');
  END IF;
  
  -- Obter saldo atual ou criar registro
  INSERT INTO user_points_balance (user_id, balance)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT balance INTO v_current_balance
  FROM user_points_balance
  WHERE user_id = p_user_id;
  
  -- Calcular novo saldo
  v_new_balance := v_current_balance + p_points;
  
  -- Verificar se não ficará negativo
  IF v_new_balance < 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Saldo insuficiente');
  END IF;
  
  -- Atualizar saldo
  UPDATE user_points_balance
  SET balance = v_new_balance, updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Criar transação
  INSERT INTO points_transactions (user_id, points, source, description)
  VALUES (p_user_id, p_points, p_source, COALESCE(p_description, 'Transação de pontos'))
  RETURNING id INTO v_transaction_id;
  
  -- Retornar resultado
  v_result := jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'old_balance', v_current_balance,
    'new_balance', v_new_balance,
    'points_change', p_points
  );
  
  RETURN v_result;
END;
$$;

-- =============================================
-- 8. TRIGGER PARA ATUALIZAR UPDATED_AT
-- =============================================
-- Trigger para user_points_balance
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_points_balance_updated_at') THEN
    CREATE TRIGGER update_user_points_balance_updated_at
      BEFORE UPDATE ON user_points_balance
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =============================================
-- 9. ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_user_points_balance_user_id ON user_points_balance(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_feed_posts_is_premium ON feed_posts(is_premium);
CREATE INDEX IF NOT EXISTS idx_feed_posts_premium_expires_at ON feed_posts(premium_expires_at);
CREATE INDEX IF NOT EXISTS idx_feed_posts_likes_is_premium ON feed_posts_likes(is_premium);
CREATE INDEX IF NOT EXISTS idx_classifieds_is_premium ON classifieds(is_premium);
CREATE INDEX IF NOT EXISTS idx_classifieds_premium_expires_at ON classifieds(premium_expires_at);
CREATE INDEX IF NOT EXISTS idx_vip_badges_user_id ON vip_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_badges_badge_type ON vip_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_vip_badges_is_active ON vip_badges(is_active);

-- =============================================
-- 10. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =============================================

-- Habilitar RLS nas tabelas
ALTER TABLE user_points_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_badges ENABLE ROW LEVEL SECURITY;

-- Política para user_points_balance
DROP POLICY IF EXISTS "Users can view own balance" ON user_points_balance;
CREATE POLICY "Users can view own balance" ON user_points_balance
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own balance" ON user_points_balance;
CREATE POLICY "Users can update own balance" ON user_points_balance
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para points_transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON points_transactions;
CREATE POLICY "Users can view own transactions" ON points_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Política para vip_badges
DROP POLICY IF EXISTS "Users can view own badges" ON vip_badges;
CREATE POLICY "Users can view own badges" ON vip_badges
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own badges" ON vip_badges;
CREATE POLICY "Users can insert own badges" ON vip_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own badges" ON vip_badges;
CREATE POLICY "Users can update own badges" ON vip_badges
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 11. COMENTÁRIOS NAS TABELAS E COLUNAS
-- =============================================
COMMENT ON TABLE user_points_balance IS 'Saldo de pontos dos usuários';
COMMENT ON COLUMN user_points_balance.balance IS 'Saldo atual de pontos do usuário';

COMMENT ON TABLE points_transactions IS 'Histórico de transações de pontos';
COMMENT ON COLUMN points_transactions.points IS 'Quantidade de pontos (positivo para adição, negativo para subtração)';
COMMENT ON COLUMN points_transactions.source IS 'Origem da transação (ex: premium_like, premium_post, purchase)';

COMMENT ON TABLE vip_badges IS 'Badges VIP dos usuários';
COMMENT ON COLUMN vip_badges.badge_type IS 'Tipo do badge VIP (bronze, silver, gold, platinum, diamond)';
COMMENT ON COLUMN vip_badges.is_active IS 'Se o badge está ativo';

COMMENT ON COLUMN feed_posts.is_premium IS 'Se o post é premium/destacado';
COMMENT ON COLUMN feed_posts.premium_points_spent IS 'Pontos gastos para tornar o post premium';
COMMENT ON COLUMN feed_posts.premium_expires_at IS 'Data de expiração do status premium';

COMMENT ON COLUMN feed_posts_likes.is_premium IS 'Se a curtida é premium (custa pontos)';
COMMENT ON COLUMN feed_posts_likes.premium_points_spent IS 'Pontos gastos para curtir';

COMMENT ON COLUMN classifieds.is_premium IS 'Se o anúncio é premium/destacado';
COMMENT ON COLUMN classifieds.premium_points_spent IS 'Pontos gastos para tornar o anúncio premium';
COMMENT ON COLUMN classifieds.premium_expires_at IS 'Data de expiração do status premium';

COMMIT;

-- =============================================
-- MENSAGEM DE SUCESSO
-- =============================================
DO $$
BEGIN
  RAISE NOTICE 'Sistema Premium configurado com sucesso!';
  RAISE NOTICE 'Tabelas criadas/atualizadas:';
  RAISE NOTICE '- user_points_balance';
  RAISE NOTICE '- points_transactions';
  RAISE NOTICE '- vip_badges';
  RAISE NOTICE '- feed_posts (colunas premium adicionadas)';
  RAISE NOTICE '- feed_posts_likes (colunas premium adicionadas)';
  RAISE NOTICE '- classifieds (colunas premium adicionadas)';
  RAISE NOTICE 'Função add_points criada';
  RAISE NOTICE 'Índices e políticas RLS configurados';
END $$;
