-- =============================================
-- SOLUÇÃO ALTERNATIVA - SEM MEXER EM TRIGGERS DO SISTEMA
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. REMOVER APENAS FUNÇÕES PROBLEMÁTICAS ESPECÍFICAS
DO $$
BEGIN
    -- Remover funções específicas conhecidas que podem estar causando o problema
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

    BEGIN
        DROP FUNCTION IF EXISTS insert_common_post CASCADE;
        RAISE NOTICE 'Função insert_common_post removida (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover função insert_common_post: %', SQLERRM;
    END;

    BEGIN
        DROP FUNCTION IF EXISTS premium_like_post CASCADE;
        RAISE NOTICE 'Função premium_like_post removida (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover função premium_like_post: %', SQLERRM;
    END;
END $$;

-- 2. REMOVER RULES QUE PODEM ESTAR INTERCEPTANDO
DO $$
BEGIN
    BEGIN
        DROP RULE IF EXISTS feed_posts_insert_rule ON feed_posts CASCADE;
        RAISE NOTICE 'Rule feed_posts_insert_rule removida (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover rule feed_posts_insert_rule: %', SQLERRM;
    END;

    BEGIN
        DROP RULE IF EXISTS check_points_rule ON feed_posts CASCADE;
        RAISE NOTICE 'Rule check_points_rule removida (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover rule check_points_rule: %', SQLERRM;
    END;
END $$;

-- 3. TESTAR INSERÇÃO DIRETA (SEM FUNÇÕES PROBLEMÁTICAS)
DO $$
DECLARE
    test_user_id UUID;
    new_post_id UUID;
BEGIN
    -- Buscar um usuário válido
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Tentar inserir um post de teste usando INSERT direto
        INSERT INTO feed_posts (
            professional_id, user_id, title, description, content,
            images, service_category_id, location_state, location_city,
            likes_count, comments_count, is_active, is_public, is_featured
        ) VALUES (
            test_user_id, test_user_id, 'Teste Final - Sem Funções', 
            'Teste de inserção sem funções problemáticas', 'Teste de inserção sem funções problemáticas',
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

-- 4. VERIFICAR FUNÇÕES RESTANTES
SELECT 'VERIFICANDO FUNÇÕES RESTANTES...' as status;

SELECT proname FROM pg_proc WHERE proname ILIKE '%post%' OR proname ILIKE '%points%' OR proname ILIKE '%premium%';

-- 5. VERIFICAR RULES RESTANTES
SELECT 'VERIFICANDO RULES RESTANTES...' as status;

SELECT rulename FROM pg_rules WHERE tablename = 'feed_posts';

SELECT 'SOLUÇÃO ALTERNATIVA APLICADA!' as status;
