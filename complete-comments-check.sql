-- =============================================
-- SCRIPT COMPLETO PARA VERIFICAR COMENTÁRIOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. ESTRUTURA DA TABELA POST_COMMENTS
SELECT 'ESTRUTURA DA TABELA POST_COMMENTS:' as info;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'post_comments'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. FOREIGN KEYS
SELECT 'FOREIGN KEYS:' as info;

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

-- 3. POLÍTICAS RLS
SELECT 'POLÍTICAS RLS:' as info;

SELECT policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'post_comments'
ORDER BY policyname;

-- 4. CONTAR COMENTÁRIOS
SELECT 'TOTAL DE COMENTÁRIOS:' as info;

SELECT COUNT(*) as total_comentarios FROM post_comments;

-- 5. COMENTÁRIOS EXISTENTES (SE HOUVER)
SELECT 'COMENTÁRIOS EXISTENTES:' as info;

SELECT 
    id,
    post_id,
    user_id,
    parent_comment_id,
    content,
    created_at,
    is_deleted
FROM post_comments
ORDER BY created_at DESC
LIMIT 10;

-- 6. VERIFICAR SE POST EXISTE
SELECT 'VERIFICANDO POST ESPECÍFICO:' as info;

SELECT id, title, created_at
FROM feed_posts
WHERE id = '2c4cd397-8c07-4b6d-aea1-16736e78dc10';

-- 7. VERIFICAR USUÁRIOS AUTENTICADOS
SELECT 'USUÁRIOS AUTENTICADOS:' as info;

SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 8. TESTAR INSERÇÃO SIMPLES
SELECT 'TESTANDO INSERÇÃO SIMPLES...' as info;

INSERT INTO post_comments (
    post_id,
    user_id,
    content
) 
SELECT 
    '2c4cd397-8c07-4b6d-aea1-16736e78dc10',
    au.id,
    'Teste simples - ' || NOW()::text
FROM auth.users au
LIMIT 1
RETURNING id, post_id, user_id, content, created_at;
