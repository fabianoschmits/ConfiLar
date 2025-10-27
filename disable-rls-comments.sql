-- =============================================
-- SCRIPT PARA DESABILITAR RLS TEMPORARIAMENTE
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. DESABILITAR RLS COMPLETAMENTE NA TABELA POST_COMMENTS
ALTER TABLE post_comments DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS RLS
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'post_comments'
    LOOP
        BEGIN
            EXECUTE 'DROP POLICY IF EXISTS ' || policy_record.policyname || ' ON post_comments';
            RAISE NOTICE 'Política % removida', policy_record.policyname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover política %: %', policy_record.policyname, SQLERRM;
        END;
    END LOOP;
END $$;

-- 3. VERIFICAR STATUS DO RLS
SELECT 'STATUS DO RLS:' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'post_comments';

-- 4. VERIFICAR POLÍTICAS RESTANTES
SELECT 'POLÍTICAS RESTANTES:' as info;

SELECT policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'post_comments'
ORDER BY policyname;

-- 5. TESTAR INSERÇÃO SEM RLS
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
            'Teste sem RLS - ' || NOW()::text,
            NULL,
            '{}',
            '{}'
        ) RETURNING id INTO new_comment_id;
        
        RAISE NOTICE '✅ COMENTÁRIO CRIADO SEM RLS! ID: %', new_comment_id;
        
        -- Remover o comentário de teste
        DELETE FROM post_comments WHERE id = new_comment_id;
        RAISE NOTICE '🗑️ Comentário de teste removido';
        
    ELSE
        RAISE NOTICE '❌ Usuário não encontrado para teste';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro no teste sem RLS: %', SQLERRM;
END $$;

-- 6. CONTAR COMENTÁRIOS EXISTENTES
SELECT 'COMENTÁRIOS EXISTENTES:' as info;

SELECT COUNT(*) as total_comentarios FROM post_comments;

SELECT 'RLS DESABILITADO!' as status;
