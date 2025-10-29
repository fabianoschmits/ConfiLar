-- =============================================
-- SCRIPT SIMPLES PARA BUSCAR A FONTE DO ERRO
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. LISTAR TODOS OS TRIGGERS DA TABELA FEED_POSTS
SELECT 'TRIGGERS DA TABELA FEED_POSTS' as info;

SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts'
ORDER BY trigger_name;

-- 2. LISTAR TODAS AS FUNÇÕES QUE PODEM ESTAR CAUSANDO PROBLEMA
SELECT 'FUNÇÕES SUSPEITAS' as info;

SELECT 
    proname as function_name
FROM pg_proc 
WHERE proname ILIKE '%post%' 
   OR proname ILIKE '%points%'
   OR proname ILIKE '%premium%'
   OR proname ILIKE '%saldo%'
   OR proname ILIKE '%check%'
   OR proname ILIKE '%validate%'
ORDER BY proname;

-- 3. VERIFICAR SE HÁ COLUNAS PREMIUM RESTANTES
SELECT 'COLUNAS PREMIUM RESTANTES' as info;

SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'feed_posts' 
AND table_schema = 'public'
AND (
    column_name ILIKE '%premium%'
    OR column_name ILIKE '%points%'
    OR column_name ILIKE '%saldo%'
)
ORDER BY column_name;

-- 4. CONTAR POSTS EXISTENTES
SELECT 'CONTAGEM DE POSTS' as info;

SELECT COUNT(*) as total_posts FROM feed_posts;

-- 5. VERIFICAR POLÍTICAS RLS
SELECT 'POLÍTICAS RLS' as info;

SELECT 
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'feed_posts'
ORDER BY policyname;

SELECT 'SCRIPT SIMPLES CONCLUÍDO' as status;
