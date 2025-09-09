-- =====================================================
-- CORREÇÃO: Ajustar campos NOT NULL na tabela user_recommendations
-- =====================================================

-- Corrigir os campos para NOT NULL
ALTER TABLE public.user_recommendations 
ALTER COLUMN recommender_id SET NOT NULL;

ALTER TABLE public.user_recommendations 
ALTER COLUMN recommended_id SET NOT NULL;

ALTER TABLE public.user_recommendations 
ALTER COLUMN created_at SET NOT NULL;

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_recommendations_recommended_id ON public.user_recommendations(recommended_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_recommender_id ON public.user_recommendations(recommender_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_type ON public.user_recommendations(recommendation_type);

-- Habilitar RLS
ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
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

-- Verificar a estrutura corrigida
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_recommendations' 
AND table_schema = 'public'
ORDER BY ordinal_position;
