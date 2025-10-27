-- Script para remover constraint que impede múltiplas curtidas premium
-- Execute no Supabase SQL Editor

-- 1. Verificar constraints existentes
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'feed_posts_likes'::regclass
  AND contype = 'u';

-- 2. Remover constraint que impede múltiplas curtidas do mesmo usuário no mesmo post
-- (Substitua 'feed_posts_likes_post_id_user_id_key' pelo nome real da constraint)
ALTER TABLE feed_posts_likes 
DROP CONSTRAINT IF EXISTS feed_posts_likes_post_id_user_id_key;

-- 3. Verificar se a constraint foi removida
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'feed_posts_likes'::regclass
  AND contype = 'u';

-- 4. Teste da função após remoção da constraint
SELECT handle_premium_like_transaction_ultimate_fix(
  '16114b80-e21e-4b78-9426-94ca416808a8'::UUID,
  '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'::UUID,
  '3f8f19ed-4903-4ec3-a508-1264878dcfed'::UUID,
  5
);
