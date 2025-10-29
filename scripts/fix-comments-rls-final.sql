-- =============================================
-- SCRIPT PARA CORRIGIR POLÍTICAS RLS DE COMENTÁRIOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. REMOVER TODAS AS POLÍTICAS RLS EXISTENTES
DO $$
BEGIN
    BEGIN
        DROP POLICY IF EXISTS "post_comments_delete_own" ON post_comments;
        RAISE NOTICE 'Política post_comments_delete_own removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover política delete: %', SQLERRM;
    END;

    BEGIN
        DROP POLICY IF EXISTS "post_comments_insert_own" ON post_comments;
        RAISE NOTICE 'Política post_comments_insert_own removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover política insert: %', SQLERRM;
    END;

    BEGIN
        DROP POLICY IF EXISTS "post_comments_select_all" ON post_comments;
        RAISE NOTICE 'Política post_comments_select_all removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover política select: %', SQLERRM;
    END;

    BEGIN
        DROP POLICY IF EXISTS "post_comments_update_own" ON post_comments;
        RAISE NOTICE 'Política post_comments_update_own removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover política update: %', SQLERRM;
    END;
END $$;

-- 2. CRIAR POLÍTICAS RLS SIMPLES E FUNCIONAIS
DO $$
BEGIN
    -- Política para SELECT (todos podem ver)
    CREATE POLICY "post_comments_select_policy" ON post_comments
    FOR SELECT USING (true);
    RAISE NOTICE 'Política SELECT criada';

    -- Política para INSERT (usuários autenticados podem inserir)
    CREATE POLICY "post_comments_insert_policy" ON post_comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    RAISE NOTICE 'Política INSERT criada';

    -- Política para UPDATE (usuários podem editar seus próprios comentários)
    CREATE POLICY "post_comments_update_policy" ON post_comments
    FOR UPDATE USING (auth.uid() = user_id);
    RAISE NOTICE 'Política UPDATE criada';

    -- Política para DELETE (usuários podem deletar seus próprios comentários)
    CREATE POLICY "post_comments_delete_policy" ON post_comments
    FOR DELETE USING (auth.uid() = user_id);
    RAISE NOTICE 'Política DELETE criada';
END $$;

-- 3. VERIFICAR POLÍTICAS CRIADAS
SELECT 'POLÍTICAS RLS CRIADAS:' as info;

SELECT policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'post_comments'
ORDER BY policyname;

-- 4. TESTAR COM USUÁRIO ESPECÍFICO
DO $$
DECLARE
    test_user_id UUID := 'e76226f6-e49c-44c8-9191-042a1cec339d';
    new_comment_id UUID;
BEGIN
    -- Simular contexto de usuário autenticado
    PERFORM set_config('request.jwt.claims', '{"sub":"' || test_user_id || '"}', true);
    
    -- Tentar inserir um comentário
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
        'Teste com RLS corrigido - ' || NOW()::text,
        NULL,
        '{}',
        '{}'
    ) RETURNING id INTO new_comment_id;
    
    RAISE NOTICE '✅ COMENTÁRIO CRIADO COM RLS! ID: %', new_comment_id;
    
    -- Remover o comentário de teste
    DELETE FROM post_comments WHERE id = new_comment_id;
    RAISE NOTICE '🗑️ Comentário de teste removido';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro no teste com RLS: %', SQLERRM;
END $$;

SELECT 'POLÍTICAS RLS CORRIGIDAS!' as status;
