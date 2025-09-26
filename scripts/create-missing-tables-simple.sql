-- =====================================================
-- CRIAR TABELAS FALTANTES PARA FEED SOCIAL - VERSÃO SIMPLIFICADA
-- =====================================================
-- Este script cria as tabelas necessárias para o feed social funcionar
-- sem erros 404/400

-- =====================================================
-- 1. TABELA POST_REACTIONS (Reações dos Posts)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.post_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'haha', 'wow', 'sad', 'angry', 'star')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- =====================================================
-- 2. TABELA POST_COMMENTS (Comentários dos Posts)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mentions TEXT[] DEFAULT '{}',
    hashtags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    likes_count INTEGER DEFAULT 0
);

-- =====================================================
-- 3. TABELA USER_REACTIONS (Reações dos Usuários)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'haha', 'wow', 'sad', 'angry', 'star')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- =====================================================
-- 4. TABELA COMMENT_LIKES (Curtidas dos Comentários)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- =====================================================
-- 5. POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Políticas para post_reactions
CREATE POLICY "Users can view all reactions" ON public.post_reactions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reactions" ON public.post_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions" ON public.post_reactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON public.post_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para post_comments
CREATE POLICY "Users can view all comments" ON public.post_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments" ON public.post_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.post_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.post_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para user_reactions
CREATE POLICY "Users can view all user reactions" ON public.user_reactions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reactions" ON public.user_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions" ON public.user_reactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON public.user_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para comment_likes
CREATE POLICY "Users can view all comment likes" ON public.comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON public.comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 6. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para post_reactions
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON public.post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_type ON public.post_reactions(reaction_type);

-- Índices para post_comments
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON public.post_comments(created_at);

-- Índices para user_reactions
CREATE INDEX IF NOT EXISTS idx_user_reactions_post_id ON public.user_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_user_reactions_user_id ON public.user_reactions(user_id);

-- Índices para comment_likes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);

-- =====================================================
-- 7. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'post_reactions', 'post_comments', 'user_reactions', 'comment_likes'
        ) THEN '✅ CRIADA'
        ELSE '❌ FALTANDO'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('post_reactions', 'post_comments', 'user_reactions', 'comment_likes')
ORDER BY table_name;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
