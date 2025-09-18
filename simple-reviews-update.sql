-- ================================
-- SCRIPT SIMPLES - ATUALIZAR TABELA REVIEWS
-- Execute este script no Supabase SQL Editor
-- ================================

-- 1. Adicionar novos campos à tabela reviews existente
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS positive_points TEXT[],
ADD COLUMN IF NOT EXISTS negative_points TEXT[],
ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS service_date DATE;

-- 2. Atualizar registros existentes com valores padrão
UPDATE reviews 
SET is_recommended = CASE 
    WHEN rating_person >= 4 THEN true 
    ELSE false 
END
WHERE is_recommended IS NULL;

-- 3. Verificar se os campos foram adicionados
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reviews' 
ORDER BY ordinal_position;

-- ================================
-- PRONTO! Agora você pode usar todos os campos no formulário
-- ================================

