-- =====================================================
-- ALTERAÇÃO DA COLUNA service_category_id
-- =====================================================
-- 
-- PROBLEMA: A coluna service_category_id está como UUID
-- mas o sistema usa IDs de string (ex: "pintura", "eletrica")
--
-- SOLUÇÃO: Alterar para VARCHAR/TEXT
-- =====================================================

-- 1. Remover constraint de foreign key se existir
ALTER TABLE feed_posts 
DROP CONSTRAINT IF EXISTS feed_posts_service_category_id_fkey;

-- 2. Alterar tipo da coluna de UUID para VARCHAR(100)
ALTER TABLE feed_posts 
ALTER COLUMN service_category_id TYPE VARCHAR(100) 
USING service_category_id::text;

-- 3. Verificar a mudança
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'feed_posts' 
  AND column_name = 'service_category_id';

-- =====================================================
-- RESULTADO ESPERADO:
-- column_name            | data_type      | character_maximum_length | is_nullable
-- service_category_id    | character varying | 100                   | YES
-- =====================================================

