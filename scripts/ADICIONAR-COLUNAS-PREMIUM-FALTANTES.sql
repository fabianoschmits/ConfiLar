-- =============================================
-- SCRIPT PARA ADICIONAR COLUNAS PREMIUM FALTANTES
-- =============================================
-- Execute este SQL no Supabase Dashboard > SQL Editor

BEGIN;

-- =============================================
-- 1. ADICIONAR COLUNAS PREMIUM NA TABELA FEED_POSTS_LIKES
-- =============================================
DO $$ 
BEGIN
  -- Verificar e adicionar coluna is_premium
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'feed_posts_likes' AND column_name = 'is_premium') THEN
    ALTER TABLE feed_posts_likes ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Coluna is_premium adicionada à tabela feed_posts_likes';
  ELSE
    RAISE NOTICE 'Coluna is_premium já existe na tabela feed_posts_likes';
  END IF;
  
  -- Verificar e adicionar coluna premium_points_spent
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'feed_posts_likes' AND column_name = 'premium_points_spent') THEN
    ALTER TABLE feed_posts_likes ADD COLUMN premium_points_spent INTEGER DEFAULT 0;
    RAISE NOTICE 'Coluna premium_points_spent adicionada à tabela feed_posts_likes';
  ELSE
    RAISE NOTICE 'Coluna premium_points_spent já existe na tabela feed_posts_likes';
  END IF;
END $$;

-- =============================================
-- 2. CRIAR TABELA POINTS_TRANSACTIONS SE NÃO EXISTIR
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
-- 3. CRIAR TABELA CLASSIFIEDS SE NÃO EXISTIR
-- =============================================
CREATE TABLE IF NOT EXISTS classifieds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  service_type VARCHAR(50) NOT NULL,
  location_city VARCHAR(100),
  location_state VARCHAR(2),
  price_range VARCHAR(50),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_points_spent INTEGER DEFAULT 0,
  premium_expires_at TIMESTAMP WITH TIME ZONE,
  premium_highlight_color VARCHAR(7) DEFAULT '#FFD700',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. CRIAR TABELA VIP_BADGES SE NÃO EXISTIR
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
-- 5. CRIAR ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_classifieds_user_id ON classifieds(user_id);
CREATE INDEX IF NOT EXISTS idx_classifieds_is_premium ON classifieds(is_premium);
CREATE INDEX IF NOT EXISTS idx_classifieds_premium_expires_at ON classifieds(premium_expires_at);
CREATE INDEX IF NOT EXISTS idx_vip_badges_user_id ON vip_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_badges_badge_type ON vip_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_vip_badges_is_active ON vip_badges(is_active);

-- =============================================
-- 6. HABILITAR RLS E CRIAR POLÍTICAS
-- =============================================

-- Habilitar RLS
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE classifieds ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_badges ENABLE ROW LEVEL SECURITY;

-- Políticas para points_transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON points_transactions;
CREATE POLICY "Users can view own transactions" ON points_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para classifieds
DROP POLICY IF EXISTS "Users can view all classifieds" ON classifieds;
CREATE POLICY "Users can view all classifieds" ON classifieds
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own classifieds" ON classifieds;
CREATE POLICY "Users can insert own classifieds" ON classifieds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own classifieds" ON classifieds;
CREATE POLICY "Users can update own classifieds" ON classifieds
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own classifieds" ON classifieds;
CREATE POLICY "Users can delete own classifieds" ON classifieds
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para vip_badges
DROP POLICY IF EXISTS "Users can view own badges" ON vip_badges;
CREATE POLICY "Users can view own badges" ON vip_badges
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own badges" ON vip_badges;
CREATE POLICY "Users can insert own badges" ON vip_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own badges" ON vip_badges;
CREATE POLICY "Users can update own badges" ON vip_badges
  FOR UPDATE USING (auth.uid() = user_id);

COMMIT;

-- =============================================
-- MENSAGEM DE SUCESSO
-- =============================================
DO $$
BEGIN
  RAISE NOTICE 'Colunas premium adicionadas com sucesso!';
  RAISE NOTICE 'Tabelas criadas/atualizadas:';
  RAISE NOTICE '- feed_posts_likes (colunas premium adicionadas)';
  RAISE NOTICE '- points_transactions (criada)';
  RAISE NOTICE '- classifieds (criada)';
  RAISE NOTICE '- vip_badges (criada)';
  RAISE NOTICE 'Índices e políticas RLS configurados';
END $$;
