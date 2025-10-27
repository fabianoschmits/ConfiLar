-- =============================================
-- SCRIPT 2: FUNÇÕES E RULES RELACIONADAS A POSTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. FUNÇÕES RELACIONADAS A POSTS (APENAS NOMES)
SELECT 'FUNÇÕES RELACIONADAS A POSTS' as info;

SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE (
    p.proname ILIKE '%post%' 
    OR p.proname ILIKE '%feed%'
    OR p.proname ILIKE '%points%'
    OR p.proname ILIKE '%premium%'
    OR p.proname ILIKE '%saldo%'
)
AND n.nspname = 'public'
ORDER BY p.proname;

-- 2. RULES RELACIONADAS A POSTS
SELECT 'RULES RELACIONADAS A POSTS' as info;

SELECT 
    schemaname,
    tablename,
    rulename,
    definition
FROM pg_rules 
WHERE tablename = 'feed_posts'
   OR rulename ILIKE '%post%'
   OR rulename ILIKE '%feed%'
ORDER BY tablename, rulename;

-- 3. VERIFICAR COLUNAS PREMIUM RESTANTES
SELECT 'COLUNAS PREMIUM RESTANTES' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'feed_posts' 
AND table_schema = 'public'
AND (
    column_name ILIKE '%premium%'
    OR column_name ILIKE '%points%'
    OR column_name ILIKE '%saldo%'
)
ORDER BY column_name;

-- 4. CONTAGEM DE POSTS EXISTENTES
SELECT 'CONTAGEM DE POSTS EXISTENTES' as info;

SELECT 
    COUNT(*) as total_posts,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_posts,
    COUNT(CASE WHEN is_public = true THEN 1 END) as public_posts,
    COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_posts
FROM feed_posts;

SELECT 'SCRIPT 2 CONCLUÍDO' as status;
