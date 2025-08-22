-- Script para adicionar a coluna 'likes' na tabela classified_ads
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a coluna 'likes' existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'classified_ads' 
AND column_name = 'likes';

-- 2. Se a coluna não existir, adicionar
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classified_ads' 
    AND column_name = 'likes'
  ) THEN
    ALTER TABLE classified_ads ADD COLUMN likes INTEGER DEFAULT 0;
    RAISE NOTICE 'Coluna "likes" adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna "likes" já existe!';
  END IF;
END $$;

-- 3. Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'classified_ads' 
ORDER BY ordinal_position;




