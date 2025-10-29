-- =============================================
-- SCRIPT PARA TESTAR INSERÇÃO DE COMENTÁRIO CORRIGIDA
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. TESTAR INSERÇÃO COM ESTRUTURA CORRETA
DO $$
DECLARE
    test_user_id UUID;
    test_post_id UUID;
    new_comment_id UUID;
BEGIN
    -- Buscar um usuário válido
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    -- Buscar um post válido
    SELECT id INTO test_post_id FROM feed_posts LIMIT 1;
    
    IF test_user_id IS NOT NULL AND test_post_id IS NOT NULL THEN
        -- Tentar inserir um comentário de teste com estrutura correta
        INSERT INTO post_comments (
            post_id,
            user_id,
            content,
            parent_comment_id,
            mentions,
            hashtags
        ) VALUES (
            test_post_id,
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
        RAISE NOTICE '❌ Usuário ou post não encontrado para teste';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro no teste de inserção: %', SQLERRM;
END $$;

-- 2. VERIFICAR COMENTÁRIOS EXISTENTES
SELECT 'COMENTÁRIOS EXISTENTES:' as info;

SELECT COUNT(*) as total_comentarios FROM post_comments;

SELECT 'TESTE CONCLUÍDO!' as status;
