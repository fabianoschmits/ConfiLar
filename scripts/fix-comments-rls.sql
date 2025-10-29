-- =============================================
-- SCRIPT PARA CORRIGIR POLÍTICAS RLS DUPLICADAS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. REMOVER POLÍTICAS DUPLICADAS/CONFLITANTES
DO $$
BEGIN
    -- Remover políticas antigas/duplicadas
    BEGIN
        DROP POLICY IF EXISTS "Anyone can view post comments" ON post_comments;
        RAISE NOTICE 'Política "Anyone can view post comments" removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover política: %', SQLERRM;
    END;

    BEGIN
        DROP POLICY IF EXISTS "Users can create post comments" ON post_comments;
        RAISE NOTICE 'Política "Users can create post comments" removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover política: %', SQLERRM;
    END;

    BEGIN
        DROP POLICY IF EXISTS "Users can delete own post comments" ON post_comments;
        RAISE NOTICE 'Política "Users can delete own post comments" removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover política: %', SQLERRM;
    END;

    BEGIN
        DROP POLICY IF EXISTS "Users can delete their own comments" ON post_comments;
        RAISE NOTICE 'Política "Users can delete their own comments" removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover política: %', SQLERRM;
    END;

    BEGIN
        DROP POLICY IF EXISTS "Users can insert their own comments" ON post_comments;
        RAISE NOTICE 'Política "Users can insert their own comments" removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover política: %', SQLERRM;
    END;

    BEGIN
        DROP POLICY IF EXISTS "Users can update own post comments" ON post_comments;
        RAISE NOTICE 'Política "Users can update own post comments" removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover política: %', SQLERRM;
    END;

    BEGIN
        DROP POLICY IF EXISTS "Users can update their own comments" ON post_comments;
        RAISE NOTICE 'Política "Users can update their own comments" removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover política: %', SQLERRM;
    END;

    BEGIN
        DROP POLICY IF EXISTS "Users can view all comments" ON post_comments;
        RAISE NOTICE 'Política "Users can view all comments" removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover política: %', SQLERRM;
    END;
END $$;

-- 2. VERIFICAR POLÍTICAS RESTANTES
SELECT 'POLÍTICAS RESTANTES:' as info;

SELECT policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'post_comments'
ORDER BY policyname;

-- 3. TESTAR INSERÇÃO DE COMENTÁRIO
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
        -- Tentar inserir um comentário de teste
        INSERT INTO post_comments (
            post_id,
            user_id,
            content,
            parent_id,
            mentions,
            hashtags
        ) VALUES (
            test_post_id,
            test_user_id,
            'Teste de comentário - ' || NOW()::text,
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

SELECT 'POLÍTICAS RLS CORRIGIDAS!' as status;
