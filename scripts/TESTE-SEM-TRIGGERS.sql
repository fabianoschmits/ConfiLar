-- Desabilitar triggers temporariamente para teste
-- (Execute este script no Supabase SQL Editor)

-- Verificar triggers ativos
SELECT 
  schemaname,
  tablename,
  triggername,
  triggerdef
FROM pg_triggers 
WHERE tablename = 'feed_posts_likes';

-- Desabilitar trigger específico (se existir)
-- DROP TRIGGER IF EXISTS nome_do_trigger ON feed_posts_likes;

-- Ou desabilitar todos os triggers da tabela temporariamente
-- ALTER TABLE feed_posts_likes DISABLE TRIGGER ALL;

-- Teste de inserção simples
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

-- Verificar se inseriu
SELECT * FROM feed_posts_likes 
WHERE user_id = '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'
ORDER BY created_at DESC 
LIMIT 1;

-- Reabilitar triggers (se necessário)
-- ALTER TABLE feed_posts_likes ENABLE TRIGGER ALL;
