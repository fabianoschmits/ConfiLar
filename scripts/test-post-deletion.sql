-- =============================================
-- TESTAR EXCLUSÃO DE POSTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar posts do usuário atual
SELECT 
  id,
  title,
  user_id,
  created_at,
  metadata->>'type' as post_type
FROM feed_posts 
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;

-- 2. Verificar se há posts automáticos
SELECT 
  id,
  title,
  user_id,
  metadata->>'type' as post_type,
  created_at
FROM feed_posts 
WHERE user_id = auth.uid()
  AND metadata->>'type' IS NOT NULL
ORDER BY created_at DESC;

-- 3. Testar exclusão de um post específico (substitua 'POST_ID_AQUI' pelo ID do post)
-- DELETE FROM feed_posts 
-- WHERE id = 'POST_ID_AQUI' 
--   AND user_id = auth.uid();

-- 4. Verificar permissões do usuário atual
SELECT 
  auth.uid() as current_user_id,
  'Usuário autenticado' as status;

-- 5. Verificar se RLS está funcionando
SELECT 
  'RLS Test' as test_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM feed_posts 
      WHERE user_id = auth.uid() 
      LIMIT 1
    ) THEN 'Pode ver seus próprios posts'
    ELSE 'Não pode ver seus posts'
  END as rls_result;
