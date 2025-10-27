-- =============================================
-- SCRIPT PARA TESTAR QUERY EXATA DA APLICAÇÃO
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. TESTAR QUERY SELECT SIMPLES
SELECT 'TESTANDO QUERY SELECT:' as info;

SELECT 
    pc.id,
    pc.post_id,
    pc.user_id,
    pc.parent_comment_id,
    pc.content,
    pc.mentions,
    pc.hashtags,
    pc.created_at,
    pc.updated_at,
    pc.is_deleted,
    pc.likes_count,
    p.id as user_profile_id,
    p.full_name,
    p.avatar_url,
    p.user_type
FROM post_comments pc
LEFT JOIN profiles p ON pc.user_id = p.id
WHERE pc.post_id = '2c4cd397-8c07-4b6d-aea1-16736e78dc10'
AND pc.is_deleted = false
ORDER BY pc.created_at ASC
LIMIT 50;

-- 2. TESTAR INSERÇÃO SIMPLES
SELECT 'TESTANDO INSERÇÃO SIMPLES:' as info;

INSERT INTO post_comments (
    post_id,
    user_id,
    content,
    parent_comment_id,
    mentions,
    hashtags
) 
SELECT 
    '2c4cd397-8c07-4b6d-aea1-16736e78dc10',
    au.id,
    'Teste direto - ' || NOW()::text,
    NULL,
    '{}',
    '{}'
FROM auth.users au
LIMIT 1
RETURNING id, post_id, user_id, content, created_at;

-- 3. VERIFICAR SE POST EXISTE
SELECT 'VERIFICANDO POST:' as info;

SELECT id, title, created_at
FROM feed_posts
WHERE id = '2c4cd397-8c07-4b6d-aea1-16736e78dc10';

-- 4. VERIFICAR USUÁRIOS
SELECT 'VERIFICANDO USUÁRIOS:' as info;

SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 3;

-- 5. VERIFICAR PERFIS
SELECT 'VERIFICANDO PERFIS:' as info;

SELECT id, full_name, user_type
FROM profiles
ORDER BY created_at DESC
LIMIT 3;
