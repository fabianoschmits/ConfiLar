-- =====================================================
-- CORRIGIR SCHEMA DO BANCO - VERSÃO SIMPLES
-- =====================================================
-- Este script corrige os problemas de forma segura

-- =====================================================
-- 1. ADICIONAR CAMPO NAME NA TABELA PROFILES
-- =====================================================

-- Adicionar campo 'name' se não existir
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Atualizar campo name com full_name se name estiver vazio
UPDATE public.profiles 
SET name = full_name 
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
-- 6. CRIAR ÍNDICES PARA PERFORMANCE
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
-- 7. HABILITAR RLS
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. CRIAR POLÍTICAS RLS BÁSICAS
-- =====================================================

-- Políticas para feed_posts
DROP POLICY IF EXISTS "Users can view all feed posts" ON public.feed_posts;
CREATE POLICY "Users can view all feed posts" ON public.feed_posts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own feed posts" ON public.feed_posts;
CREATE POLICY "Users can insert their own feed posts" ON public.feed_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para post_reactions
DROP POLICY IF EXISTS "Users can view all reactions" ON public.post_reactions;
CREATE POLICY "Users can view all reactions" ON public.post_reactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own reactions" ON public.post_reactions;
CREATE POLICY "Users can insert their own reactions" ON public.post_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para post_comments
DROP POLICY IF EXISTS "Users can view all comments" ON public.post_comments;
CREATE POLICY "Users can view all comments" ON public.post_comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own comments" ON public.post_comments;
CREATE POLICY "Users can insert their own comments" ON public.post_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- 9. VERIFICAÇÃO FINAL
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

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
