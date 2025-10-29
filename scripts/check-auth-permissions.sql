-- =============================================
-- SCRIPT PARA VERIFICAR AUTENTICAÇÃO E PERMISSÕES
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. VERIFICAR USUÁRIO ATUAL AUTENTICADO
SELECT 'USUÁRIO ATUAL:' as info;

SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role;

-- 2. VERIFICAR SE USUÁRIO TEM PERFIL
SELECT 'PERFIL DO USUÁRIO ATUAL:' as info;

SELECT 
    p.id,
    p.full_name,
    p.user_type,
    p.is_available
FROM profiles p
WHERE p.id = auth.uid();

-- 3. TESTAR INSERÇÃO COM USUÁRIO ESPECÍFICO
DO $$
DECLARE
    test_user_id UUID := 'e76226f6-e49c-44c8-9191-042a1cec339d';
    new_comment_id UUID;
BEGIN
    -- Simular contexto de usuário autenticado
    PERFORM set_config('request.jwt.claims', '{"sub":"' || test_user_id || '"}', true);
    
    -- Verificar se o usuário tem perfil
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = test_user_id) THEN
        RAISE NOTICE '❌ Usuário não tem perfil';
        RETURN;
    END IF;
    
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
        'Teste com usuário específico - ' || NOW()::text,
        NULL,
        '{}',
        '{}'
    ) RETURNING id INTO new_comment_id;
    
    RAISE NOTICE '✅ COMENTÁRIO CRIADO! ID: %', new_comment_id;
    
    -- Remover o comentário de teste
    DELETE FROM post_comments WHERE id = new_comment_id;
    RAISE NOTICE '🗑️ Comentário de teste removido';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro no teste: %', SQLERRM;
END $$;

-- 4. VERIFICAR TODOS OS COMENTÁRIOS DO POST
SELECT 'TODOS OS COMENTÁRIOS DO POST:' as info;

SELECT 
    pc.id,
    pc.user_id,
    pc.content,
    pc.created_at,
    p.full_name
FROM post_comments pc
LEFT JOIN profiles p ON pc.user_id = p.id
WHERE pc.post_id = '2c4cd397-8c07-4b6d-aea1-16736e78dc10'
ORDER BY pc.created_at DESC;

-- 5. VERIFICAR STATUS DO RLS
SELECT 'STATUS DO RLS:' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'post_comments';

SELECT 'VERIFICAÇÃO CONCLUÍDA!' as status;
