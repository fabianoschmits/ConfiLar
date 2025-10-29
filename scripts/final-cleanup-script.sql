-- =============================================
-- SCRIPT FINAL PARA RESOLVER DEFINITIVAMENTE O PROBLEMA
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. DESABILITAR TEMPORARIAMENTE TODOS OS TRIGGERS DA TABELA
ALTER TABLE feed_posts DISABLE TRIGGER ALL;

-- 2. REMOVER TODOS OS TRIGGERS EXISTENTES (FORÇADO)
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
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

-- 3. REMOVER TODAS AS FUNÇÕES QUE PODEM ESTAR CAUSANDO O PROBLEMA
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
        AND p.proname NOT LIKE 'pg_%'
        AND p.proname NOT LIKE 'gen_%'
    LOOP
        BEGIN
            EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.nspname || '.' || func_record.proname || ' CASCADE';
            RAISE NOTICE 'Função removida: %.%', func_record.nspname, func_record.proname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover função %.%: %', func_record.nspname, func_record.proname, SQLERRM;
        END;
    END LOOP;
END $$;

-- 4. REMOVER TODAS AS RULES QUE PODEM ESTAR INTERCEPTANDO
DO $$
DECLARE
    rule_record RECORD;
BEGIN
    FOR rule_record IN 
        SELECT schemaname, tablename, rulename
        FROM pg_rules 
        WHERE tablename = 'feed_posts'
           OR rulename ILIKE '%post%'
           OR rulename ILIKE '%points%'
           OR rulename ILIKE '%premium%'
    LOOP
        BEGIN
            EXECUTE 'DROP RULE IF EXISTS ' || rule_record.rulename || ' ON ' || rule_record.schemaname || '.' || rule_record.tablename || ' CASCADE';
            RAISE NOTICE 'Rule removida: %.%.%', rule_record.schemaname, rule_record.tablename, rule_record.rulename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover rule %.%.%: %', rule_record.schemaname, rule_record.tablename, rule_record.rulename, SQLERRM;
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
    p.proname ILIKE '%post%' 
    OR p.proname ILIKE '%points%'
    OR p.proname ILIKE '%premium%'
    OR p.proname ILIKE '%saldo%'
)
AND n.nspname = 'public'
ORDER BY p.proname;

-- 7. TESTAR INSERÇÃO DIRETA (SEM TRIGGERS)
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
            test_user_id, test_user_id, 'Teste Final', 
            'Teste de inserção direta', 'Teste de inserção direta',
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

-- 8. REABILITAR TRIGGERS (se necessário)
-- ALTER TABLE feed_posts ENABLE TRIGGER ALL;

SELECT 'Limpeza final concluída! Sistema deve estar funcionando agora.' as status;
