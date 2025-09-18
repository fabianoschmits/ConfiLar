-- ================================
-- SISTEMA COMPLETO DE AVALIAÇÕES - CONFILAR
-- Execute este script no Supabase SQL Editor
-- ================================

-- 1. ATUALIZAR TABELA REVIEWS (se já existe)
-- Primeiro, vamos verificar se a tabela já existe e adicionar os novos campos

DO $$
BEGIN
    -- Verificar se a tabela reviews existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reviews') THEN
        -- Adicionar novos campos se não existirem
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'title') THEN
            ALTER TABLE reviews ADD COLUMN title TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'positive_points') THEN
            ALTER TABLE reviews ADD COLUMN positive_points TEXT[];
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'negative_points') THEN
            ALTER TABLE reviews ADD COLUMN negative_points TEXT[];
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'is_recommended') THEN
            ALTER TABLE reviews ADD COLUMN is_recommended BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'service_date') THEN
            ALTER TABLE reviews ADD COLUMN service_date DATE;
        END IF;
        
        RAISE NOTICE 'Tabela reviews atualizada com novos campos';
    ELSE
        -- Criar tabela reviews completa se não existir
        CREATE TABLE reviews (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            reviewed_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            review_type TEXT NOT NULL CHECK (review_type IN ('client', 'professional')),
            rating_person INTEGER NOT NULL CHECK (rating_person >= 1 AND rating_person <= 5),
            rating_work INTEGER CHECK (rating_work >= 1 AND rating_work <= 5),
            punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5),
            quality INTEGER CHECK (quality >= 1 AND quality <= 5),
            title TEXT,
            comment TEXT,
            positive_points TEXT[],
            negative_points TEXT[],
            is_recommended BOOLEAN DEFAULT false,
            service_date DATE,
            is_verified BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tabela reviews criada com estrutura completa';
    END IF;
END $$;

-- 2. ATUALIZAR VALORES PADRÃO PARA REGISTROS EXISTENTES
UPDATE reviews 
SET is_recommended = CASE 
    WHEN rating_person >= 4 THEN true 
    ELSE false 
END
WHERE is_recommended IS NULL;

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating_person ON reviews(rating_person);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_is_recommended ON reviews(is_recommended);

-- 4. CONFIGURAR ROW LEVEL SECURITY (RLS)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Política para leitura: usuários autenticados podem ver todas as avaliações
DROP POLICY IF EXISTS "Usuários autenticados podem ver avaliações" ON reviews;
CREATE POLICY "Usuários autenticados podem ver avaliações" ON reviews
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para inserção: apenas o próprio usuário pode criar avaliações
DROP POLICY IF EXISTS "Usuários podem criar suas próprias avaliações" ON reviews;
CREATE POLICY "Usuários podem criar suas próprias avaliações" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Política para atualização: apenas o criador pode editar
DROP POLICY IF EXISTS "Usuários podem editar suas próprias avaliações" ON reviews;
CREATE POLICY "Usuários podem editar suas próprias avaliações" ON reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

-- Política para exclusão: apenas o criador pode excluir
DROP POLICY IF EXISTS "Usuários podem excluir suas próprias avaliações" ON reviews;
CREATE POLICY "Usuários podem excluir suas próprias avaliações" ON reviews
    FOR DELETE USING (auth.uid() = reviewer_id);

-- 5. CRIAR TABELA DE RESPOSTAS ÀS AVALIAÇÕES (OPCIONAL)
CREATE TABLE IF NOT EXISTS review_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    responder_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    response_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que apenas o avaliado pode responder
    CONSTRAINT unique_review_response UNIQUE(review_id)
);

-- RLS para review_responses
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver respostas" ON review_responses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem responder avaliações sobre eles" ON review_responses
    FOR INSERT WITH CHECK (
        auth.uid() = responder_id AND 
        EXISTS (
            SELECT 1 FROM reviews 
            WHERE id = review_id AND reviewed_id = auth.uid()
        )
    );

-- 6. CRIAR FUNÇÃO PARA ATUALIZAR ESTATÍSTICAS DO USUÁRIO
CREATE OR REPLACE FUNCTION update_user_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estatísticas na tabela profiles
    UPDATE profiles SET
        rating = (
            SELECT COALESCE(AVG(rating_person), 0)
            FROM reviews 
            WHERE reviewed_id = COALESCE(NEW.reviewed_id, OLD.reviewed_id)
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews 
            WHERE reviewed_id = COALESCE(NEW.reviewed_id, OLD.reviewed_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.reviewed_id, OLD.reviewed_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 7. CRIAR TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
DROP TRIGGER IF EXISTS trigger_update_user_stats ON reviews;
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_user_rating_stats();

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reviews_updated_at ON reviews;
CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. CRIAR VIEW PARA ESTATÍSTICAS DE AVALIAÇÕES
CREATE OR REPLACE VIEW review_statistics AS
SELECT 
    reviewed_id,
    COUNT(*) as total_reviews,
    AVG(rating_person) as average_rating,
    COUNT(CASE WHEN rating_person = 5 THEN 1 END) as five_star_count,
    COUNT(CASE WHEN rating_person = 4 THEN 1 END) as four_star_count,
    COUNT(CASE WHEN rating_person = 3 THEN 1 END) as three_star_count,
    COUNT(CASE WHEN rating_person = 2 THEN 1 END) as two_star_count,
    COUNT(CASE WHEN rating_person = 1 THEN 1 END) as one_star_count,
    COUNT(CASE WHEN is_recommended = true THEN 1 END) as recommendations_count,
    ROUND((COUNT(CASE WHEN is_recommended = true THEN 1 END) * 100.0 / COUNT(*)), 2) as recommendation_percentage
FROM reviews 
GROUP BY reviewed_id;

-- 9. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE reviews IS 'Tabela principal de avaliações entre usuários';
COMMENT ON COLUMN reviews.title IS 'Título resumido da avaliação';
COMMENT ON COLUMN reviews.positive_points IS 'Array de pontos positivos destacados';
COMMENT ON COLUMN reviews.negative_points IS 'Array de pontos negativos ou melhorias';
COMMENT ON COLUMN reviews.is_recommended IS 'Se o avaliador recomenda este profissional';
COMMENT ON COLUMN reviews.service_date IS 'Data em que o serviço foi realizado';
COMMENT ON COLUMN reviews.rating_person IS 'Avaliação geral da pessoa (1-5 estrelas)';
COMMENT ON COLUMN reviews.rating_work IS 'Avaliação específica do trabalho (1-5 estrelas)';
COMMENT ON COLUMN reviews.punctuality IS 'Avaliação da pontualidade (1-5 estrelas)';
COMMENT ON COLUMN reviews.quality IS 'Avaliação da qualidade (1-5 estrelas)';

-- 10. INSERIR DADOS DE EXEMPLO (OPCIONAL - REMOVA SE NÃO QUISER)
-- INSERT INTO reviews (reviewer_id, reviewed_id, review_type, rating_person, title, comment, positive_points, negative_points, is_recommended, service_date) 
-- VALUES (
--     '00000000-0000-0000-0000-000000000001', -- substitua por IDs reais
--     '00000000-0000-0000-0000-000000000002',
--     'professional',
--     5,
--     'Excelente profissional!',
--     'Trabalho impecável, muito pontual e comunicativo.',
--     ARRAY['Pontualidade', 'Qualidade do trabalho', 'Comunicação'],
--     ARRAY[],
--     true,
--     '2024-01-15'
-- );

-- 11. VERIFICAR ESTRUTURA FINAL
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('reviews', 'review_responses')
ORDER BY table_name, ordinal_position;

-- 12. MOSTRAR ESTATÍSTICAS
SELECT 
    'reviews' as tabela,
    COUNT(*) as total_registros
FROM reviews
UNION ALL
SELECT 
    'review_responses' as tabela,
    COUNT(*) as total_registros
FROM review_responses;

-- ================================
-- SCRIPT CONCLUÍDO!
-- ================================
-- Execute este script e depois atualize o código da aplicação
-- descomentando os campos no ReviewForm e nos tipos TypeScript
-- ================================

