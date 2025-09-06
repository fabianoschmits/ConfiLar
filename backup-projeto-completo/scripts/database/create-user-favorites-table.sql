-- =====================================================
-- SCRIPT PARA CRIAR TABELA DE FAVORITOS DE USUÁRIOS
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de favoritos de usuários
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    favorite_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Evitar que um usuário se favorite
    CONSTRAINT no_self_favorite CHECK (user_id != favorite_user_id),
    
    -- Evitar duplicatas
    UNIQUE(user_id, favorite_user_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_favorite_user_id ON public.user_favorites(favorite_user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON public.user_favorites(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Política para usuários poderem ver apenas seus próprios favoritos
CREATE POLICY "Users can view their own favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários poderem adicionar favoritos
CREATE POLICY "Users can add favorites" ON public.user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários poderem remover seus próprios favoritos
CREATE POLICY "Users can remove their own favorites" ON public.user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Comentários na tabela
COMMENT ON TABLE public.user_favorites IS 'Tabela para armazenar favoritos de usuários (profissionais e clientes)';
COMMENT ON COLUMN public.user_favorites.user_id IS 'ID do usuário que está favoritando';
COMMENT ON COLUMN public.user_favorites.favorite_user_id IS 'ID do usuário que está sendo favoritado';
COMMENT ON COLUMN public.user_favorites.created_at IS 'Data e hora em que o favorito foi adicionado';

-- Verificar se a tabela foi criada corretamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_favorites'
ORDER BY ordinal_position;
