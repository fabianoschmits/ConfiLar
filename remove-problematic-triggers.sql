-- =============================================
-- SCRIPT PARA REMOVER TRIGGERS E FUNÇÕES PROBLEMÁTICOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar triggers existentes na tabela feed_posts
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts'
ORDER BY trigger_name;

-- 2. Remover triggers problemáticos (com tratamento de erro)
DO $$
BEGIN
    -- Remover triggers específicos
    BEGIN
        DROP TRIGGER IF EXISTS check_points_before_insert ON feed_posts;
        RAISE NOTICE 'Trigger check_points_before_insert removido (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover trigger check_points_before_insert: %', SQLERRM;
    END;

    BEGIN
        DROP TRIGGER IF EXISTS validate_premium_post ON feed_posts;
        RAISE NOTICE 'Trigger validate_premium_post removido (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover trigger validate_premium_post: %', SQLERRM;
    END;

    BEGIN
        DROP TRIGGER IF EXISTS check_user_points ON feed_posts;
        RAISE NOTICE 'Trigger check_user_points removido (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover trigger check_user_points: %', SQLERRM;
    END;

    BEGIN
        DROP TRIGGER IF EXISTS feed_posts_insert_trigger ON feed_posts;
        RAISE NOTICE 'Trigger feed_posts_insert_trigger removido (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover trigger feed_posts_insert_trigger: %', SQLERRM;
    END;

    BEGIN
        DROP TRIGGER IF EXISTS before_insert_feed_posts ON feed_posts;
        RAISE NOTICE 'Trigger before_insert_feed_posts removido (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover trigger before_insert_feed_posts: %', SQLERRM;
    END;
END $$;

-- 3. Remover funções problemáticas (com tratamento de erro)
DO $$
BEGIN
    -- Remover funções específicas
    BEGIN
        DROP FUNCTION IF EXISTS check_points_before_insert() CASCADE;
        RAISE NOTICE 'Função check_points_before_insert removida (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover função check_points_before_insert: %', SQLERRM;
    END;

    BEGIN
        DROP FUNCTION IF EXISTS validate_premium_post() CASCADE;
        RAISE NOTICE 'Função validate_premium_post removida (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover função validate_premium_post: %', SQLERRM;
    END;

    BEGIN
        DROP FUNCTION IF EXISTS check_user_points() CASCADE;
        RAISE NOTICE 'Função check_user_points removida (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover função check_user_points: %', SQLERRM;
    END;

    BEGIN
        DROP FUNCTION IF EXISTS create_post_normal CASCADE;
        RAISE NOTICE 'Função create_post_normal removida (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover função create_post_normal: %', SQLERRM;
    END;

    BEGIN
        DROP FUNCTION IF EXISTS create_post_premium CASCADE;
        RAISE NOTICE 'Função create_post_premium removida (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover função create_post_premium: %', SQLERRM;
    END;

    BEGIN
        DROP FUNCTION IF EXISTS create_post_safe CASCADE;
        RAISE NOTICE 'Função create_post_safe removida (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover função create_post_safe: %', SQLERRM;
    END;
END $$;

-- 4. Verificar triggers restantes
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts'
ORDER BY trigger_name;

-- 5. Verificar funções restantes relacionadas a feed_posts
SELECT 
    n.nspname as schema_name,
    p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname LIKE '%feed_posts%' 
   OR p.proname LIKE '%post%'
   OR p.proname LIKE '%premium%'
ORDER BY p.proname;

SELECT 'Script executado com sucesso! Triggers e funções problemáticas removidos.' as status;
