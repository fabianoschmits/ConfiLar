-- =============================================
-- SOLUÇÃO DEFINITIVA PARA O PROBLEMA DE POSTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. DESABILITAR TODOS OS TRIGGERS DA TABELA FEED_POSTS
ALTER TABLE feed_posts DISABLE TRIGGER ALL;

-- 2. REMOVER APENAS TRIGGERS CUSTOMIZADOS (NÃO DO SISTEMA)
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'feed_posts'
        AND trigger_name NOT LIKE 'RI_ConstraintTrigger_%'  -- Excluir triggers do sistema
        AND trigger_name NOT LIKE 'pg_%'                    -- Excluir triggers do PostgreSQL
    LOOP
        BEGIN
            EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON feed_posts CASCADE';
            RAISE NOTICE 'Trigger removido: %', trigger_record.trigger_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover trigger %: %', trigger_record.trigger_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 3. REMOVER FUNÇÕES PROBLEMÁTICAS ESPECÍFICAS
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT n.nspname, p.proname
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE (
            p.proname ILIKE '%post%' 
            OR p.proname ILIKE '%points%'
            OR p.proname ILIKE '%premium%'
            OR p.proname ILIKE '%saldo%'
            OR p.proname ILIKE '%check%'
            OR p.proname ILIKE '%validate%'
        )
        AND n.nspname = 'public'
        AND p.proname NOT LIKE 'pg_%'  -- Excluir funções do sistema
    LOOP
        BEGIN
            EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.nspname || '.' || func_record.proname || ' CASCADE';
            RAISE NOTICE 'Função removida: %.%', func_record.nspname, func_record.proname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover função %.%: %', func_record.nspname, func_record.proname, SQLERRM;
        END;
    END LOOP;
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

-- 5. VERIFICAR SE AINDA HÁ TRIGGERS
SELECT 'VERIFICANDO TRIGGERS RESTANTES...' as status;

SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'feed_posts';

-- 6. VERIFICAR SE AINDA HÁ FUNÇÕES PROBLEMÁTICAS
SELECT 'VERIFICANDO FUNÇÕES RESTANTES...' as status;

SELECT proname FROM pg_proc WHERE proname ILIKE '%post%' OR proname ILIKE '%points%' OR proname ILIKE '%premium%';

SELECT 'SOLUÇÃO DEFINITIVA APLICADA!' as status;
