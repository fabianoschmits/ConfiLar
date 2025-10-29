-- =============================================
-- SCRIPT PARA MOSTRAR TRIGGERS E RULES
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. VERIFICAR TRIGGERS DA TABELA FEED_POSTS
SELECT 'TRIGGERS DA TABELA FEED_POSTS:' as info;

SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts'
ORDER BY trigger_name;

-- 2. VERIFICAR RULES DA TABELA FEED_POSTS
SELECT 'RULES DA TABELA FEED_POSTS:' as info;

SELECT rulename, definition
FROM pg_rules 
WHERE tablename = 'feed_posts'
ORDER BY rulename;
