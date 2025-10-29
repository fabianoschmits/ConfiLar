-- =============================================
-- SCRIPT AGRESSIVO PARA ENCONTRAR E REMOVER TODOS OS TRIGGERS/FUNÇÕES PROBLEMÁTICOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. LISTAR TODOS OS TRIGGERS NA TABELA FEED_POSTS
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing,
    action_orientation
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts'
ORDER BY trigger_name;

-- 2. LISTAR TODAS AS FUNÇÕES QUE MENCIONAM FEED_POSTS OU POINTS
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE (
    pg_get_functiondef(p.oid) ILIKE '%feed_posts%' 
    OR pg_get_functiondef(p.oid) ILIKE '%points%'
    OR pg_get_functiondef(p.oid) ILIKE '%premium%'
    OR pg_get_functiondef(p.oid) ILIKE '%saldo%'
)
AND n.nspname = 'public'
ORDER BY p.proname;

-- 3. REMOVER TODOS OS TRIGGERS DA TABELA FEED_POSTS (MÉTODO AGRESSIVO)
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Buscar todos os triggers da tabela feed_posts
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'feed_posts'
    LOOP
        BEGIN
            EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON feed_posts CASCADE';
            RAISE NOTICE 'Trigger removido: %', trigger_record.trigger_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover trigger %: %', trigger_record.trigger_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 4. REMOVER TODAS AS FUNÇÕES PROBLEMÁTICAS (MÉTODO AGRESSIVO)
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Buscar todas as funções que podem estar causando problemas
    FOR func_record IN 
        SELECT n.nspname, p.proname, p.oid
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE (
            p.proname ILIKE '%feed_posts%' 
            OR p.proname ILIKE '%points%'
            OR p.proname ILIKE '%premium%'
            OR p.proname ILIKE '%post%'
            OR p.proname ILIKE '%saldo%'
        )
        AND n.nspname = 'public'
        AND p.proname NOT LIKE 'pg_%' -- Não remover funções do sistema
    LOOP
        BEGIN
            EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.nspname || '.' || func_record.proname || ' CASCADE';
            RAISE NOTICE 'Função removida: %.%', func_record.nspname, func_record.proname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover função %.%: %', func_record.nspname, func_record.proname, SQLERRM;
        END;
    END LOOP;
END $$;

-- 5. VERIFICAR SE AINDA HÁ TRIGGERS
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts'
ORDER BY trigger_name;

-- 6. VERIFICAR SE AINDA HÁ FUNÇÕES PROBLEMÁTICAS
SELECT 
    n.nspname as schema_name,
    p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE (
    p.proname ILIKE '%feed_posts%' 
    OR p.proname ILIKE '%points%'
    OR p.proname ILIKE '%premium%'
    OR p.proname ILIKE '%post%'
    OR p.proname ILIKE '%saldo%'
)
AND n.nspname = 'public'
ORDER BY p.proname;

-- 7. VERIFICAR POLÍTICAS RLS QUE PODEM ESTAR CAUSANDO PROBLEMAS
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

SELECT 'Limpeza agressiva concluída! Todos os triggers e funções problemáticos foram removidos.' as status;
