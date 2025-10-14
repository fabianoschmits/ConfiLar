-- ==================================================================================
-- CRIAR TABELAS PARA SISTEMA DE NOTIFICAÇÕES DO FEED
-- Execute no Supabase SQL Editor
-- ==================================================================================

BEGIN;

-- 1) Tabela de curtidas em posts (se não existir)
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 2) Tabela de curtidas em comentários (se não existir)
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- 3) Tabela de comentários em posts (se não existir)
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mentions TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4) Índices para performance
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON public.post_comments(parent_id);

-- 5) Habilitar RLS nas novas tabelas
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- 6) Políticas RLS para post_likes
CREATE POLICY post_likes_select_all ON public.post_likes
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY post_likes_insert_own ON public.post_likes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY post_likes_delete_own ON public.post_likes
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 7) Políticas RLS para comment_likes
CREATE POLICY comment_likes_select_all ON public.comment_likes
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY comment_likes_insert_own ON public.comment_likes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY comment_likes_delete_own ON public.comment_likes
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 8) Políticas RLS para post_comments
CREATE POLICY post_comments_select_all ON public.post_comments
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY post_comments_insert_own ON public.post_comments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY post_comments_update_own ON public.post_comments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY post_comments_delete_own ON public.post_comments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 9) Função para atualizar contadores automaticamente
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feed_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feed_posts 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 10) Triggers para atualizar contadores
DROP TRIGGER IF EXISTS trigger_update_post_likes_count_insert ON public.post_likes;
CREATE TRIGGER trigger_update_post_likes_count_insert
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

DROP TRIGGER IF EXISTS trigger_update_post_likes_count_delete ON public.post_likes;
CREATE TRIGGER trigger_update_post_likes_count_delete
  AFTER DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- 11) Função para atualizar contador de comentários
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feed_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feed_posts 
    SET comments_count = GREATEST(comments_count - 1, 0) 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 12) Triggers para comentários
DROP TRIGGER IF EXISTS trigger_update_post_comments_count_insert ON public.post_comments;
CREATE TRIGGER trigger_update_post_comments_count_insert
  AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

DROP TRIGGER IF EXISTS trigger_update_post_comments_count_delete ON public.post_comments;
CREATE TRIGGER trigger_update_post_comments_count_delete
  AFTER DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

COMMIT;

-- Verificação: listar tabelas criadas
SELECT 
  'TABELAS CRIADAS:' as status,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('post_likes', 'comment_likes', 'post_comments')
ORDER BY tablename;
