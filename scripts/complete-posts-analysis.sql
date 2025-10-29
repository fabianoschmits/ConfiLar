-- =============================================
-- SCRIPT COMPLETO PARA ANALISAR TUDO SOBRE POSTS NO BANCO
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. ESTRUTURA DA TABELA FEED_POSTS
SELECT '=== ESTRUTURA DA TABELA FEED_POSTS ===' as secao;

SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'feed_posts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. CONSTRAINTS DA TABELA FEED_POSTS
SELECT '=== CONSTRAINTS DA TABELA FEED_POSTS ===' as secao;

SELECT 
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'feed_posts'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 3. TRIGGERS DA TABELA FEED_POSTS
SELECT '=== TRIGGERS DA TABELA FEED_POSTS ===' as secao;

SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_orientation,
    action_statement,
    action_condition
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts'
ORDER BY trigger_name;

-- 4. POLÍTICAS RLS DA TABELA FEED_POSTS
SELECT '=== POLÍTICAS RLS DA TABELA FEED_POSTS ===' as secao;

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'feed_posts'
ORDER BY policyname;

-- 5. FUNÇÕES RELACIONADAS A POSTS
SELECT '=== FUNÇÕES RELACIONADAS A POSTS ===' as secao;

SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    CASE 
        WHEN p.prokind = 'f' THEN 'FUNCTION'
        WHEN p.prokind = 'p' THEN 'PROCEDURE'
        WHEN p.prokind = 'a' THEN 'AGGREGATE'
        WHEN p.prokind = 'w' THEN 'WINDOW'
        ELSE 'OTHER'
    END as function_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE (
    p.proname ILIKE '%post%' 
    OR p.proname ILIKE '%feed%'
    OR p.proname ILIKE '%points%'
    OR p.proname ILIKE '%premium%'
    OR p.proname ILIKE '%saldo%'
    OR p.proname ILIKE '%check%'
    OR p.proname ILIKE '%validate%'
    OR p.proname ILIKE '%create%'
    OR p.proname ILIKE '%insert%'
)
AND n.nspname = 'public'
ORDER BY p.proname;

-- 6. DEFINIÇÕES COMPLETAS DAS FUNÇÕES PROBLEMÁTICAS
SELECT '=== DEFINIÇÕES DAS FUNÇÕES PROBLEMÁTICAS ===' as secao;

SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
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

-- 7. RULES RELACIONADAS A POSTS
SELECT '=== RULES RELACIONADAS A POSTS ===' as secao;

SELECT 
    schemaname,
    tablename,
    rulename,
    definition
FROM pg_rules 
WHERE tablename = 'feed_posts'
   OR rulename ILIKE '%post%'
   OR rulename ILIKE '%feed%'
   OR rulename ILIKE '%points%'
   OR rulename ILIKE '%premium%'
ORDER BY tablename, rulename;

-- 8. VIEWS RELACIONADAS A POSTS
SELECT '=== VIEWS RELACIONADAS A POSTS ===' as secao;

SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE definition ILIKE '%feed_posts%'
   OR viewname ILIKE '%post%'
   OR viewname ILIKE '%feed%'
ORDER BY viewname;

-- 9. ÍNDICES DA TABELA FEED_POSTS
SELECT '=== ÍNDICES DA TABELA FEED_POSTS ===' as secao;

SELECT 
    indexname,
    indexdef,
    tablename
FROM pg_indexes 
WHERE tablename = 'feed_posts'
ORDER BY indexname;

-- 10. ESTATÍSTICAS DA TABELA FEED_POSTS
SELECT '=== ESTATÍSTICAS DA TABELA FEED_POSTS ===' as secao;

SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs
FROM pg_stats 
WHERE tablename = 'feed_posts'
ORDER BY attname;

-- 11. TABELAS RELACIONADAS A POSTS
SELECT '=== TABELAS RELACIONADAS A POSTS ===' as secao;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name ILIKE '%post%'
   OR table_name ILIKE '%feed%'
   OR table_name ILIKE '%points%'
   OR table_name ILIKE '%premium%'
ORDER BY table_name;

-- 12. COLUNAS QUE REFERENCIAM FEED_POSTS
SELECT '=== COLUNAS QUE REFERENCIAM FEED_POSTS ===' as secao;

SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE ccu.table_name = 'feed_posts'
ORDER BY tc.table_name, kcu.column_name;

-- 13. SAMPLE DE POSTS EXISTENTES
SELECT '=== SAMPLE DE POSTS EXISTENTES ===' as secao;

SELECT 
    id,
    professional_id,
    user_id,
    title,
    LEFT(description, 50) as description_preview,
    location_state,
    location_city,
    likes_count,
    comments_count,
    is_active,
    is_public,
    is_featured,
    created_at
FROM feed_posts 
ORDER BY created_at DESC 
LIMIT 10;

-- 14. CONTAGEM DE POSTS POR STATUS
SELECT '=== CONTAGEM DE POSTS POR STATUS ===' as secao;

SELECT 
    is_active,
    is_public,
    is_featured,
    COUNT(*) as quantidade
FROM feed_posts 
GROUP BY is_active, is_public, is_featured
ORDER BY is_active, is_public, is_featured;

-- 15. VERIFICAR SE HÁ COLUNAS PREMIUM RESTANTES
SELECT '=== VERIFICAÇÃO DE COLUNAS PREMIUM RESTANTES ===' as secao;

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

SELECT '=== ANÁLISE COMPLETA CONCLUÍDA ===' as secao;
