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
