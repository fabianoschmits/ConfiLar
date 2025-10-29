-- =============================================
-- SCRIPT 1: ESTRUTURA E TRIGGERS DA TABELA FEED_POSTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. ESTRUTURA DA TABELA FEED_POSTS
SELECT 'ESTRUTURA DA TABELA FEED_POSTS' as info;

SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'feed_posts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. TRIGGERS DA TABELA FEED_POSTS
SELECT 'TRIGGERS DA TABELA FEED_POSTS' as info;

SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts'
ORDER BY trigger_name;

-- 3. CONSTRAINTS DA TABELA FEED_POSTS
SELECT 'CONSTRAINTS DA TABELA FEED_POSTS' as info;

SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'feed_posts'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 4. POLÍTICAS RLS DA TABELA FEED_POSTS
SELECT 'POLÍTICAS RLS DA TABELA FEED_POSTS' as info;

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

SELECT 'SCRIPT 1 CONCLUÍDO' as status;
