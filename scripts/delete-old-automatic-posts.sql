-- ============================================
-- SCRIPT PARA DELETAR POSTS AUTOMÁTICOS ANTIGOS
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Ver quantos posts automáticos existem atualmente
SELECT 
  metadata->>'type' as tipo,
  COUNT(*) as quantidade
FROM feed_posts 
WHERE metadata->>'type' IN ('favorite', 'recommendation', 'review', 'welcome')
GROUP BY metadata->>'type'
ORDER BY quantidade DESC;

-- 2. Ver alguns exemplos dos posts que serão deletados
SELECT 
  id, 
  title, 
  created_at, 
  metadata->>'type' as tipo,
  metadata
FROM feed_posts
WHERE metadata->>'type' IN ('favorite', 'recommendation', 'review', 'welcome')
ORDER BY created_at DESC
LIMIT 10;

-- 3. DELETAR TODOS OS POSTS AUTOMÁTICOS ANTIGOS
-- ⚠️ ATENÇÃO: Este comando irá deletar TODOS os posts automáticos
DELETE FROM feed_posts
WHERE metadata->>'type' IN ('favorite', 'recommendation', 'review', 'welcome');

-- 4. Verificar se foram deletados
SELECT 
  metadata->>'type' as tipo,
  COUNT(*) as quantidade_restante
FROM feed_posts 
WHERE metadata->>'type' IN ('favorite', 'recommendation', 'review', 'welcome')
GROUP BY metadata->>'type';

-- 5. Verificar total de posts no feed
SELECT COUNT(*) as total_posts_no_feed
FROM feed_posts;

-- 6. Verificar posts por tipo (deve mostrar apenas posts de usuários normais)
SELECT 
  CASE 
    WHEN metadata->>'type' IS NULL THEN 'post_usuario'
    ELSE metadata->>'type'
  END as tipo,
  COUNT(*) as quantidade
FROM feed_posts 
GROUP BY 
  CASE 
    WHEN metadata->>'type' IS NULL THEN 'post_usuario'
    ELSE metadata->>'type'
  END
ORDER BY quantidade DESC;

-- ============================================
-- INSTRUÇÕES:
-- 1. Copie e cole este SQL no Supabase SQL Editor
-- 2. Execute passo a passo (comentários 1, 2, 3, 4, 5, 6)
-- 3. Ou execute tudo de uma vez
-- 4. Após a execução, teste o novo sistema adicionando favoritos/recomendações
-- ============================================
