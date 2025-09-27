-- CORREÇÃO DO BANCO DE DADOS - CONFILAR
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. LIMPAR DADOS INCOMPATÍVEIS
DELETE FROM public.post_reactions 
WHERE reaction_type NOT IN ('like', 'heart', 'laugh', 'fire');

-- 2. REMOVER CONSTRAINT ANTIGA
ALTER TABLE public.post_reactions DROP CONSTRAINT IF EXISTS post_reactions_reaction_type_check;

-- 3. ADICIONAR CAMPO NAME NA TABELA PROFILES
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name TEXT;

UPDATE public.profiles 
SET name = COALESCE(full_name, 'Usuário')
WHERE name IS NULL OR name = '';

-- 4. ADICIONAR CAMPO USER_ID NA TABELA FEED_POSTS
ALTER TABLE public.feed_posts 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- 5. ATUALIZAR USER_ID COM PROFESSIONAL_ID
UPDATE public.feed_posts 
SET user_id = professional_id 
WHERE user_id IS NULL;

-- 6. ADICIONAR CAMPOS FALTANTES EM FEED_POSTS
ALTER TABLE public.feed_posts 
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 7. ADICIONAR CAMPOS FALTANTES EM POST_COMMENTS
ALTER TABLE public.post_comments 
ADD COLUMN IF NOT EXISTS parent_id UUID,
ADD COLUMN IF NOT EXISTS mentions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 8. ADICIONAR CAMPOS FALTANTES EM NOTIFICATIONS
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'system',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 9. APLICAR NOVA CONSTRAINT DE TIPOS DE REAÇÃO
ALTER TABLE public.post_reactions ADD CONSTRAINT post_reactions_reaction_type_check 
    CHECK (reaction_type IN ('like', 'heart', 'laugh', 'fire'));

-- 10. CRIAR RELACIONAMENTOS
ALTER TABLE public.feed_posts 
ADD CONSTRAINT feed_posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.post_reactions 
ADD CONSTRAINT post_reactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.post_reactions 
ADD CONSTRAINT post_reactions_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES public.feed_posts(id) ON DELETE CASCADE;

ALTER TABLE public.post_comments 
ADD CONSTRAINT post_comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.post_comments 
ADD CONSTRAINT post_comments_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES public.feed_posts(id) ON DELETE CASCADE;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 11. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_feed_posts_user_id ON public.feed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at ON public.feed_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON public.post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- 12. HABILITAR RLS
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 13. CRIAR POLÍTICAS RLS
DROP POLICY IF EXISTS "Users can view all feed posts" ON public.feed_posts;
CREATE POLICY "Users can view all feed posts" ON public.feed_posts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own feed posts" ON public.feed_posts;
CREATE POLICY "Users can insert their own feed posts" ON public.feed_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view all reactions" ON public.post_reactions;
CREATE POLICY "Users can view all reactions" ON public.post_reactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own reactions" ON public.post_reactions;
CREATE POLICY "Users can insert their own reactions" ON public.post_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view all comments" ON public.post_comments;
CREATE POLICY "Users can view all comments" ON public.post_comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own comments" ON public.post_comments;
CREATE POLICY "Users can insert their own comments" ON public.post_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- 14. VERIFICAÇÃO FINAL
SELECT 'Script executado com sucesso!' as status;
