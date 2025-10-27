-- Script para desabilitar triggers problemáticos temporariamente
-- Execute no Supabase SQL Editor

-- 1. Verificar triggers ativos na tabela feed_posts_likes
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts_likes';

-- 2. Desabilitar todos os triggers da tabela feed_posts_likes
ALTER TABLE feed_posts_likes DISABLE TRIGGER ALL;

-- 3. Verificar se foram desabilitados
SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts_likes';

-- 4. Teste de inserção simples
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

-- 5. Verificar se inseriu
SELECT * FROM feed_posts_likes 
WHERE user_id = '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'
ORDER BY created_at DESC 
LIMIT 1;

-- 6. Para reabilitar os triggers depois (se necessário):
-- ALTER TABLE feed_posts_likes ENABLE TRIGGER ALL;
