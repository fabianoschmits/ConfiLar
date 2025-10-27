-- Script para identificar e desabilitar apenas triggers personalizados problemáticos
-- Execute no Supabase SQL Editor

-- 1. Verificar todos os triggers na tabela feed_posts_likes
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement,
  trigger_schema
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts_likes'
ORDER BY trigger_name;

-- 2. Verificar triggers personalizados (não do sistema)
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts_likes'
  AND trigger_name NOT LIKE 'RI_ConstraintTrigger%'
  AND trigger_name NOT LIKE 'pg_%'
ORDER BY trigger_name;

-- 3. Desabilitar apenas triggers personalizados (se existirem)
-- Substitua 'nome_do_trigger' pelo nome real do trigger problemático
-- DROP TRIGGER IF EXISTS nome_do_trigger ON feed_posts_likes;

-- 4. Alternativa: Criar uma view temporária para inserção sem triggers
CREATE OR REPLACE VIEW feed_posts_likes_insert AS
SELECT * FROM feed_posts_likes;

-- 5. Teste de inserção usando a view
INSERT INTO feed_posts_likes (
  post_id,
  user_id,
  is_premium,
  premium_points_spent,
  created_at
) VALUES (
  'bc435acf-25b2-470f-ad35-78f0e168b470',
  '5f3a507a-6ab2-430c-b20e-1bd322a85c3b',
  true,
  5,
  NOW()
);

-- 6. Verificar se inseriu
SELECT * FROM feed_posts_likes 
WHERE user_id = '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'
ORDER BY created_at DESC 
LIMIT 1;

-- 7. Limpar dados de teste se necessário
-- DELETE FROM feed_posts_likes 
-- WHERE user_id = '5f3a507a-6ab2-430c-b20e-1bd322a85c3b' 
-- AND post_id = 'bc435acf-25b2-470f-ad35-78f0e168b470';
