-- Script para criar a tabela user_recommendations se ela não existir
-- Execute este script no SQL Editor do Supabase

-- 1. TABELA DE RECOMENDAÇÕES
CREATE TABLE IF NOT EXISTS user_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommender_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Quem recomendou
    recommended_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Quem foi recomendado
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('client_to_professional', 'professional_to_client')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(recommender_id, recommended_id, recommendation_type) -- Uma recomendação por tipo por usuário
);

-- 2. TABELA DE AVALIAÇÕES (se não existir)
CREATE TABLE IF NOT EXISTS user_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Quem avaliou
    reviewed_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Quem foi avaliado
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- 1-5 estrelas
    comment TEXT, -- Comentário opcional
    review_type TEXT NOT NULL CHECK (review_type IN ('client_to_professional', 'professional_to_client')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reviewer_id, reviewed_id, review_type) -- Uma avaliação por tipo por usuário
);

-- 3. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_recommendations_recommended_id ON user_recommendations(recommended_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_recommender_id ON user_recommendations(recommender_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewed_id ON user_reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewer_id ON user_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_rating ON user_reviews(rating);

-- 4. HABILITAR RLS
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS RLS SIMPLES
CREATE POLICY "Todos podem ver recomendações" ON user_recommendations FOR SELECT USING (true);
CREATE POLICY "Usuários podem criar recomendações" ON user_recommendations FOR INSERT WITH CHECK (auth.uid() = recommender_id);
CREATE POLICY "Usuários podem deletar suas recomendações" ON user_recommendations FOR DELETE USING (auth.uid() = recommender_id);

CREATE POLICY "Todos podem ver avaliações" ON user_reviews FOR SELECT USING (true);
CREATE POLICY "Usuários podem criar avaliações" ON user_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Usuários podem atualizar suas avaliações" ON user_reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- 6. FUNÇÃO PARA CALCULAR RATING MÉDIO
CREATE OR REPLACE FUNCTION get_user_rating(user_id UUID)
RETURNS TABLE (
    average_rating DECIMAL(3,2),
    total_reviews INTEGER,
    total_recommendations INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(AVG(ur.rating), 0)::DECIMAL(3,2) as average_rating,
        COUNT(ur.id)::INTEGER as total_reviews,
        COUNT(rec.id)::INTEGER as total_recommendations
    FROM profiles p
    LEFT JOIN user_reviews ur ON p.id = ur.reviewed_id
    LEFT JOIN user_recommendations rec ON p.id = rec.recommended_id
    WHERE p.id = user_id
    GROUP BY p.id;
END;
$$ LANGUAGE plpgsql;

-- 7. VERIFICAÇÃO FINAL
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('user_recommendations', 'user_reviews');
    
    RAISE NOTICE 'Tabelas de reputação criadas: %', table_count;
END $$;




