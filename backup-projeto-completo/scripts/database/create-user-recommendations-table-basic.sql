-- =====================================================
-- MIGRAÇÃO BÁSICA: Criar tabela user_recommendations
-- =====================================================
-- Execute APENAS este comando primeiro para testar

CREATE TABLE IF NOT EXISTS public.user_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recommended_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('client_to_professional', 'professional_to_client')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(recommender_id, recommended_id, recommendation_type)
);
