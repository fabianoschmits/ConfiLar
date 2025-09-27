-- =====================================================
-- CORRIGIR TABELAS E REAÇÕES - FEED SOCIAL
-- =====================================================
-- Este script corrige as tabelas existentes e adiciona as faltantes

-- =====================================================
-- 1. ATUALIZAR TIPOS DE REAÇÃO NA TABELA POST_REACTIONS
-- =====================================================

-- Primeiro, remover a constraint antiga se existir
ALTER TABLE public.post_reactions DROP CONSTRAINT IF EXISTS post_reactions_reaction_type_check;

-- Adicionar nova constraint com os tipos corretos
ALTER TABLE public.post_reactions ADD CONSTRAINT post_reactions_reaction_type_check 
    CHECK (reaction_type IN ('like', 'heart', 'laugh', 'fire'));

-- =====================================================
-- 2. CRIAR TABELA FEED_POSTS SE NÃO EXISTIR
-- =====================================================
CREATE TABLE IF NOT EXISTS public.feed_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    location_city TEXT,
    location_state TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CRIAR TABELA NOTIFICATIONS SE NÃO EXISTIR
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    action_label TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. ATUALIZAR TABELA POST_COMMENTS COM CAMPOS FALTANTES
-- =====================================================

-- Adicionar campos que estão faltando
ALTER TABLE public.post_comments 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS mentions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================
-- 5. HABILITAR RLS NAS TABELAS
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. POLÍTICAS RLS PARA FEED_POSTS
-- =====================================================

-- Políticas para feed_posts
CREATE POLICY "Users can view all feed posts" ON public.feed_posts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own feed posts" ON public.feed_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feed posts" ON public.feed_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feed posts" ON public.feed_posts
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 7. POLÍTICAS RLS PARA NOTIFICATIONS
-- =====================================================

-- Políticas para notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 8. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para feed_posts
CREATE INDEX IF NOT EXISTS idx_feed_posts_user_id ON public.feed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at ON public.feed_posts(created_at DESC);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Índices para post_comments
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON public.post_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_is_deleted ON public.post_comments(is_deleted);

-- =====================================================
-- 9. FUNÇÕES PARA ATUALIZAR CONTADORES
-- =====================================================

-- Função para atualizar contador de likes nos posts
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

-- Função para atualizar contador de comentários nos posts
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

-- =====================================================
-- 10. TRIGGERS PARA CONTADORES AUTOMÁTICOS
-- =====================================================

-- Trigger para atualizar contador de likes
DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON public.post_reactions;
CREATE TRIGGER trigger_update_post_likes_count
    AFTER INSERT OR DELETE ON public.post_reactions
    FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Trigger para atualizar contador de comentários
DROP TRIGGER IF EXISTS trigger_update_post_comments_count ON public.post_comments;
CREATE TRIGGER trigger_update_post_comments_count
    AFTER INSERT OR DELETE ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- =====================================================
-- 11. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'feed_posts', 'post_reactions', 'post_comments', 'notifications'
        ) THEN '✅ CRIADA'
        ELSE '❌ FALTANDO'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('feed_posts', 'post_reactions', 'post_comments', 'notifications')
ORDER BY table_name;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
