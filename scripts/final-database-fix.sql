-- =====================================================
-- CORREÇÃO FINAL DO BANCO DE DADOS
-- =====================================================
-- Este script resolve todos os problemas identificados

-- =====================================================
-- 1. ADICIONAR CAMPO NAME NA TABELA PROFILES
-- =====================================================

-- Adicionar campo 'name' se não existir
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Atualizar campo name com full_name se name estiver vazio
UPDATE public.profiles 
SET name = COALESCE(full_name, 'Usuário')
WHERE name IS NULL OR name = '';

-- =====================================================
-- 2. ADICIONAR CAMPOS FALTANTES EM FEED_POSTS
-- =====================================================

-- Adicionar campos faltantes
ALTER TABLE public.feed_posts 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS service_category TEXT,
ADD COLUMN IF NOT EXISTS price_range TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- =====================================================
-- 3. ADICIONAR CAMPOS FALTANTES EM POST_COMMENTS
-- =====================================================

-- Adicionar campos faltantes
ALTER TABLE public.post_comments 
ADD COLUMN IF NOT EXISTS parent_id UUID,
ADD COLUMN IF NOT EXISTS mentions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================
-- 4. ADICIONAR CAMPOS FALTANTES EM NOTIFICATIONS
-- =====================================================

-- Adicionar campos faltantes
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'system',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- =====================================================
-- 5. ATUALIZAR TIPOS DE REAÇÃO
-- =====================================================

-- Remover constraint antiga se existir
ALTER TABLE public.post_reactions DROP CONSTRAINT IF EXISTS post_reactions_reaction_type_check;

-- Adicionar nova constraint com os tipos corretos
ALTER TABLE public.post_reactions ADD CONSTRAINT post_reactions_reaction_type_check 
    CHECK (reaction_type IN ('like', 'heart', 'laugh', 'fire'));

-- =====================================================
-- 6. CRIAR RELACIONAMENTOS (FOREIGN KEYS) - VERSÃO SEGURA
-- =====================================================

-- Verificar e criar relacionamento feed_posts -> profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'feed_posts_user_id_fkey'
    ) THEN
        ALTER TABLE public.feed_posts 
        ADD CONSTRAINT feed_posts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Verificar e criar relacionamento post_reactions -> profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'post_reactions_user_id_fkey'
    ) THEN
        ALTER TABLE public.post_reactions 
        ADD CONSTRAINT post_reactions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Verificar e criar relacionamento post_reactions -> feed_posts
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'post_reactions_post_id_fkey'
    ) THEN
        ALTER TABLE public.post_reactions 
        ADD CONSTRAINT post_reactions_post_id_fkey 
        FOREIGN KEY (post_id) REFERENCES public.feed_posts(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Verificar e criar relacionamento post_comments -> profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'post_comments_user_id_fkey'
    ) THEN
        ALTER TABLE public.post_comments 
        ADD CONSTRAINT post_comments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Verificar e criar relacionamento post_comments -> feed_posts
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'post_comments_post_id_fkey'
    ) THEN
        ALTER TABLE public.post_comments 
        ADD CONSTRAINT post_comments_post_id_fkey 
        FOREIGN KEY (post_id) REFERENCES public.feed_posts(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Verificar e criar relacionamento notifications -> profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_user_id_fkey'
    ) THEN
        ALTER TABLE public.notifications 
        ADD CONSTRAINT notifications_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================================
-- 7. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para feed_posts
CREATE INDEX IF NOT EXISTS idx_feed_posts_user_id ON public.feed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at ON public.feed_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_posts_is_public ON public.feed_posts(is_public);

-- Índices para post_reactions
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON public.post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_type ON public.post_reactions(reaction_type);

-- Índices para post_comments
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON public.post_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_is_deleted ON public.post_comments(is_deleted);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON public.notifications(category);

-- =====================================================
-- 8. HABILITAR RLS
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. CRIAR POLÍTICAS RLS
-- =====================================================

-- Políticas para feed_posts
DROP POLICY IF EXISTS "Users can view all feed posts" ON public.feed_posts;
CREATE POLICY "Users can view all feed posts" ON public.feed_posts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own feed posts" ON public.feed_posts;
CREATE POLICY "Users can insert their own feed posts" ON public.feed_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own feed posts" ON public.feed_posts;
CREATE POLICY "Users can update their own feed posts" ON public.feed_posts
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own feed posts" ON public.feed_posts;
CREATE POLICY "Users can delete their own feed posts" ON public.feed_posts
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para post_reactions
DROP POLICY IF EXISTS "Users can view all reactions" ON public.post_reactions;
CREATE POLICY "Users can view all reactions" ON public.post_reactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own reactions" ON public.post_reactions;
CREATE POLICY "Users can insert their own reactions" ON public.post_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reactions" ON public.post_reactions;
CREATE POLICY "Users can update their own reactions" ON public.post_reactions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.post_reactions;
CREATE POLICY "Users can delete their own reactions" ON public.post_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para post_comments
DROP POLICY IF EXISTS "Users can view all comments" ON public.post_comments;
CREATE POLICY "Users can view all comments" ON public.post_comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own comments" ON public.post_comments;
CREATE POLICY "Users can insert their own comments" ON public.post_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.post_comments;
CREATE POLICY "Users can update their own comments" ON public.post_comments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.post_comments;
CREATE POLICY "Users can delete their own comments" ON public.post_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 10. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se o campo name foi adicionado
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'name'
    ) THEN '✅ Campo name adicionado' ELSE '❌ Campo name não encontrado' END as status;

-- Verificar se os tipos de reação foram atualizados
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'post_reactions_reaction_type_check'
    ) THEN '✅ Tipos de reação atualizados' ELSE '❌ Tipos de reação não atualizados' END as status;

-- Verificar relacionamentos criados
SELECT 
    constraint_name,
    table_name,
    column_name,
    foreign_table_name,
    foreign_column_name
FROM information_schema.key_column_usage 
WHERE constraint_name LIKE '%_fkey'
AND table_schema = 'public'
ORDER BY table_name, constraint_name;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
