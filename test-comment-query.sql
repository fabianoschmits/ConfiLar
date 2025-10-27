-- =============================================
-- SCRIPT PARA TESTAR QUERY DE COMENTÁRIOS CORRIGIDA
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. TESTAR QUERY SIMILAR À DA APLICAÇÃO
SELECT 
    id,
    post_id,
    user_id,
    parent_comment_id,
    content,
    mentions,
    hashtags,
    created_at,
    updated_at,
    is_deleted,
    likes_count
FROM post_comments
WHERE post_id = '2c4cd397-8c07-4b6d-aea1-16736e78dc10'
AND is_deleted = false
ORDER BY created_at ASC
LIMIT 50;

-- 2. TESTAR INSERÇÃO DE COMENTÁRIO
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
            'Teste de comentário corrigido - ' || NOW()::text,
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

SELECT 'TESTE CONCLUÍDO!' as status;
