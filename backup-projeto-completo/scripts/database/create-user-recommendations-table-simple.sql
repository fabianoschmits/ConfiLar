-- =====================================================
-- MIGRAÇÃO: Criar tabela user_recommendations (VERSÃO SIMPLIFICADA)
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- PASSO 1: Criar a tabela
CREATE TABLE IF NOT EXISTS public.user_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recommended_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('client_to_professional', 'professional_to_client')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(recommender_id, recommended_id, recommendation_type)
);

-- PASSO 2: Criar índices
CREATE INDEX IF NOT EXISTS idx_user_recommendations_recommended_id ON public.user_recommendations(recommended_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_recommender_id ON public.user_recommendations(recommender_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_type ON public.user_recommendations(recommendation_type);

-- PASSO 3: Habilitar RLS
ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;

-- PASSO 4: Criar políticas RLS
CREATE POLICY "Users can view their own recommendations" ON public.user_recommendations
    FOR SELECT USING (
        auth.uid() = recommender_id OR 
        auth.uid() = recommended_id
    );

CREATE POLICY "Users can create recommendations" ON public.user_recommendations
    FOR INSERT WITH CHECK (
        auth.uid() = recommender_id AND
        auth.uid() != recommended_id
    );

CREATE POLICY "Users can delete their own recommendations" ON public.user_recommendations
    FOR DELETE USING (auth.uid() = recommender_id);

-- PASSO 5: Verificar se a tabela foi criada
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_recommendations' 
AND table_schema = 'public'
ORDER BY ordinal_position;
