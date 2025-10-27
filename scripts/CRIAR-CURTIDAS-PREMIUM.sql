-- =====================================================
-- CRIAR SISTEMA DE CURTIDAS PREMIUM
-- =====================================================

-- 1. CRIAR TABELA DE CURTIDAS
CREATE TABLE IF NOT EXISTS feed_posts_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_premium BOOLEAN DEFAULT false,
  points_spent INTEGER DEFAULT 0,
  points_transferred INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar curtidas duplicadas
  UNIQUE(post_id, user_id)
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_feed_posts_likes_post_id ON feed_posts_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_likes_user_id ON feed_posts_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_likes_premium ON feed_posts_likes(is_premium);
CREATE INDEX IF NOT EXISTS idx_feed_posts_likes_created_at ON feed_posts_likes(created_at);

-- 3. HABILITAR RLS
ALTER TABLE feed_posts_likes ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS RLS
CREATE POLICY "Users can view all likes" ON feed_posts_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can create own likes" ON feed_posts_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own likes" ON feed_posts_likes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON feed_posts_likes
  FOR DELETE USING (auth.uid() = user_id);

-- 5. CRIAR FUNÇÃO PARA PROCESSAR CURTIDA PREMIUM
CREATE OR REPLACE FUNCTION process_premium_like()
RETURNS TRIGGER AS $$
DECLARE
  user_balance INTEGER;
  points_cost INTEGER := 5;
  post_creator_id UUID;
BEGIN
  -- Verificar se é uma curtida premium
  IF NEW.is_premium = true THEN
    -- Verificar saldo do usuário
    SELECT balance INTO user_balance 
    FROM user_points_balance 
    WHERE user_id = NEW.user_id;
    
    -- Verificar se tem pontos suficientes
    IF user_balance < points_cost THEN
      RAISE EXCEPTION 'Saldo insuficiente para curtida premium. Necessário: % pontos', points_cost;
    END IF;
    
    -- Obter ID do criador do post
    SELECT user_id INTO post_creator_id
    FROM feed_posts
    WHERE id = NEW.post_id;
    
    -- Verificar se não está curtindo próprio post
    IF NEW.user_id = post_creator_id THEN
      RAISE EXCEPTION 'Não é possível curtir seu próprio post com pontos premium';
    END IF;
    
    -- Deduzir pontos do usuário que curtiu
    PERFORM add_points(NEW.user_id, -points_cost, 'premium_like', 'Curtiu post premium');
    
    -- Transferir pontos para o criador do post
    PERFORM add_points(post_creator_id, points_cost, 'receive_premium_like', 'Recebeu curtida premium');
    
    -- Definir valores da curtida premium
    NEW.points_spent := points_cost;
    NEW.points_transferred := points_cost;
    
    RAISE NOTICE 'Curtida premium processada: % pontos transferidos para o criador', points_cost;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. CRIAR TRIGGER PARA CURTIDAS PREMIUM
DROP TRIGGER IF EXISTS process_premium_like_trigger ON feed_posts_likes;
CREATE TRIGGER process_premium_like_trigger
  BEFORE INSERT ON feed_posts_likes
  FOR EACH ROW
  EXECUTE FUNCTION process_premium_like();

-- 7. CRIAR FUNÇÃO PARA CONTAR CURTIDAS PREMIUM
CREATE OR REPLACE FUNCTION get_premium_likes_count(post_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM feed_posts_likes
    WHERE post_id = post_id_param AND is_premium = true
  );
END;
$$ LANGUAGE plpgsql;

-- 8. CRIAR FUNÇÃO PARA VERIFICAR SE USUÁRIO CURTIU PREMIUM
CREATE OR REPLACE FUNCTION user_premium_liked_post(post_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS(
      SELECT 1 FROM feed_posts_likes
      WHERE post_id = post_id_param 
      AND user_id = user_id_param 
      AND is_premium = true
    )
  );
END;
$$ LANGUAGE plpgsql;

-- 9. CRIAR VIEW PARA ESTATÍSTICAS DE CURTIDAS PREMIUM
CREATE OR REPLACE VIEW premium_likes_stats AS
SELECT 
  fp.id as post_id,
  fp.user_id as post_creator_id,
  fp.content,
  fp.created_at as post_created_at,
  COUNT(fl.id) as total_likes,
  COUNT(CASE WHEN fl.is_premium = true THEN 1 END) as premium_likes,
  COALESCE(SUM(fl.points_transferred), 0) as total_points_received,
  COALESCE(AVG(fl.points_transferred), 0) as avg_points_per_premium_like
FROM feed_posts fp
LEFT JOIN feed_posts_likes fl ON fp.id = fl.post_id
GROUP BY fp.id, fp.user_id, fp.content, fp.created_at
ORDER BY premium_likes DESC, total_points_received DESC;

-- 10. HABILITAR RLS PARA A VIEW
ALTER VIEW premium_likes_stats SET (security_invoker = true);

-- 11. VERIFICAÇÃO FINAL
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SISTEMA DE CURTIDAS PREMIUM CRIADO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Tabela feed_posts_likes criada';
  RAISE NOTICE '✅ Sistema de curtidas premium implementado';
  RAISE NOTICE '✅ Transferência automática de pontos';
  RAISE NOTICE '✅ Triggers e funções criados';
  RAISE NOTICE '✅ View de estatísticas criada';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'FUNCIONALIDADES:';
  RAISE NOTICE '• Curtir post: 5 pontos';
  RAISE NOTICE '• Pontos transferidos automaticamente';
  RAISE NOTICE '• Estatísticas de curtidas premium';
  RAISE NOTICE '• Prevenção de curtidas próprias';
  RAISE NOTICE '========================================';
END $$;

