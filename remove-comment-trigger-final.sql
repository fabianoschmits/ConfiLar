-- =============================================
-- SCRIPT PARA REMOVER TRIGGER DE PONTOS POR COMENTÁRIOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. REMOVER TRIGGER PROBLEMÁTICO
DO $$
BEGIN
    BEGIN
        DROP TRIGGER IF EXISTS award_comment_points_trigger ON post_comments;
        RAISE NOTICE '✅ Trigger award_comment_points_trigger removido';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro ao remover trigger: %', SQLERRM;
    END;
END $$;

-- 2. REMOVER FUNÇÃO ASSOCIADA
DO $$
BEGIN
    BEGIN
        DROP FUNCTION IF EXISTS award_comment_points_trigger() CASCADE;
        RAISE NOTICE '✅ Função award_comment_points_trigger removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro ao remover função: %', SQLERRM;
    END;
END $$;

-- 3. VERIFICAR TRIGGERS RESTANTES
SELECT 'TRIGGERS RESTANTES:' as info;

SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'post_comments'
ORDER BY trigger_name;

-- 4. TESTAR INSERÇÃO DE COMENTÁRIO
DO $$
DECLARE
    test_user_id UUID;
    new_comment_id UUID;
BEGIN
    -- Buscar um usuário válido
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Tentar inserir um comentário de teste
        INSERT INTO post_comments (
            post_id,
            user_id,
            content,
            parent_comment_id,
            mentions,
            hashtags
        ) VALUES (
            '2c4cd397-8c07-4b6d-aea1-16736e78dc10',
            test_user_id,
            'Teste após remoção do trigger - ' || NOW()::text,
            NULL,
            '{}',
            '{}'
        ) RETURNING id INTO new_comment_id;
        
        RAISE NOTICE '✅ COMENTÁRIO CRIADO COM SUCESSO! ID: %', new_comment_id;
        
        -- Remover o comentário de teste
        DELETE FROM post_comments WHERE id = new_comment_id;
        RAISE NOTICE '🗑️ Comentário de teste removido';
        
    ELSE
        RAISE NOTICE '❌ Usuário não encontrado para teste';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro no teste de inserção: %', SQLERRM;
END $$;

SELECT 'TRIGGER REMOVIDO COM SUCESSO!' as status;
