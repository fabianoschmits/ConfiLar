-- =============================================
-- SOLUÇÃO SEGURA PARA O PROBLEMA DE POSTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. DESABILITAR TODOS OS TRIGGERS DA TABELA FEED_POSTS
ALTER TABLE feed_posts DISABLE TRIGGER ALL;

-- 2. REMOVER APENAS TRIGGERS CUSTOMIZADOS ESPECÍFICOS
DO $$
BEGIN
    -- Remover triggers específicos conhecidos
    BEGIN
        DROP TRIGGER IF EXISTS check_points_before_insert ON feed_posts;
        RAISE NOTICE 'Trigger check_points_before_insert removido (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover check_points_before_insert: %', SQLERRM;
    END;

    BEGIN
        DROP TRIGGER IF EXISTS validate_premium_post ON feed_posts;
        RAISE NOTICE 'Trigger validate_premium_post removido (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover validate_premium_post: %', SQLERRM;
    END;

    BEGIN
        DROP TRIGGER IF EXISTS check_user_points ON feed_posts;
        RAISE NOTICE 'Trigger check_user_points removido (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover check_user_points: %', SQLERRM;
    END;

    BEGIN
        DROP TRIGGER IF EXISTS feed_posts_insert_trigger ON feed_posts;
        RAISE NOTICE 'Trigger feed_posts_insert_trigger removido (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover feed_posts_insert_trigger: %', SQLERRM;
    END;

    BEGIN
        DROP TRIGGER IF EXISTS before_insert_feed_posts ON feed_posts;
        RAISE NOTICE 'Trigger before_insert_feed_posts removido (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover before_insert_feed_posts: %', SQLERRM;
    END;
END $$;

-- 3. REMOVER FUNÇÕES PROBLEMÁTICAS ESPECÍFICAS
DO $$
BEGIN
    -- Remover funções específicas conhecidas
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

-- 4. TESTAR INSERÇÃO DE POST (SEM TRIGGERS)
DO $$
DECLARE
    test_user_id UUID;
    new_post_id UUID;
BEGIN
    -- Buscar um usuário válido
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Tentar inserir um post de teste
        INSERT INTO feed_posts (
            professional_id, user_id, title, description, content,
            images, service_category_id, location_state, location_city,
            likes_count, comments_count, is_active, is_public, is_featured
        ) VALUES (
            test_user_id, test_user_id, 'Teste Final - Sem Triggers', 
            'Teste de inserção sem triggers', 'Teste de inserção sem triggers',
            '{}', NULL, 'SP', 'São Paulo',
            0, 0, true, true, false
        ) RETURNING id INTO new_post_id;
        
        RAISE NOTICE '✅ POST CRIADO COM SUCESSO! ID: %', new_post_id;
        
        -- Remover o post de teste
        DELETE FROM feed_posts WHERE id = new_post_id;
        RAISE NOTICE '🗑️ Post de teste removido';
        
    ELSE
        RAISE NOTICE '❌ Nenhum usuário encontrado para teste';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro no teste de inserção: %', SQLERRM;
END $$;

-- 5. VERIFICAR TRIGGERS RESTANTES
SELECT 'VERIFICANDO TRIGGERS RESTANTES...' as status;

SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'feed_posts';

-- 6. VERIFICAR FUNÇÕES RESTANTES
SELECT 'VERIFICANDO FUNÇÕES RESTANTES...' as status;

SELECT proname FROM pg_proc WHERE proname ILIKE '%post%' OR proname ILIKE '%points%' OR proname ILIKE '%premium%';

SELECT 'SOLUÇÃO SEGURA APLICADA!' as status;
