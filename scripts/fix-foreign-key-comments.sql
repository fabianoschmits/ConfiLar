-- =============================================
-- SCRIPT PARA CRIAR FOREIGN KEY CORRETA
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. REMOVER FOREIGN KEY PROBLEMÁTICA (SE EXISTIR)
DO $$
BEGIN
    BEGIN
        ALTER TABLE post_comments DROP CONSTRAINT IF EXISTS post_comments_user_id_fkey;
        RAISE NOTICE 'Foreign key post_comments_user_id_fkey removida (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover foreign key: %', SQLERRM;
    END;
END $$;

-- 2. CRIAR FOREIGN KEY CORRETA
DO $$
BEGIN
    BEGIN
        ALTER TABLE post_comments 
        ADD CONSTRAINT post_comments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key post_comments_user_id_fkey criada com sucesso';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar foreign key: %', SQLERRM;
    END;
END $$;

-- 3. VERIFICAR FOREIGN KEYS CRIADAS
SELECT 'FOREIGN KEYS CRIADAS:' as info;

SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'post_comments';

-- 4. TESTAR INSERÇÃO APÓS CORREÇÃO
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
            parent_comment_id,
            mentions,
            hashtags
        ) VALUES (
            test_post_id,
            test_user_id,
            'Teste após correção FK - ' || NOW()::text,
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

SELECT 'FOREIGN KEY CORRIGIDA!' as status;
