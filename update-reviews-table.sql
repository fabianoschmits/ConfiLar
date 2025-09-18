-- Atualizar tabela reviews para incluir campos completos de avaliação
-- Execute este script no Supabase SQL Editor

-- Adicionar novos campos à tabela reviews
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS positive_points TEXT[],
ADD COLUMN IF NOT EXISTS negative_points TEXT[],
ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS service_date DATE;

-- Atualizar registros existentes para ter valores padrão
UPDATE reviews 
SET 
  is_recommended = CASE 
    WHEN rating_person >= 4 THEN true 
    ELSE false 
  END
WHERE is_recommended IS NULL;

-- Comentários para documentação
COMMENT ON COLUMN reviews.title IS 'Título da avaliação fornecido pelo usuário';
COMMENT ON COLUMN reviews.positive_points IS 'Array de pontos positivos destacados na avaliação';
COMMENT ON COLUMN reviews.negative_points IS 'Array de pontos negativos ou a melhorar';
COMMENT ON COLUMN reviews.is_recommended IS 'Se o usuário recomenda este profissional';
COMMENT ON COLUMN reviews.service_date IS 'Data em que o serviço foi realizado';

-- Verificar a estrutura atualizada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'reviews' 
ORDER BY ordinal_position;

