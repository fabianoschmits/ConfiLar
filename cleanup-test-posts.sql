-- =============================================
-- SCRIPT PARA LIMPAR POST DE TESTE
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. REMOVER POSTS DE TESTE
SELECT 'REMOVENDO POSTS DE TESTE...' as info;

DELETE FROM feed_posts 
WHERE title LIKE 'Teste Final -%' 
   OR title LIKE 'Teste%'
RETURNING id, title;

-- 2. VERIFICAR POSTS RESTANTES
SELECT 'POSTS RESTANTES:' as info;

SELECT COUNT(*) as total_posts FROM feed_posts;
