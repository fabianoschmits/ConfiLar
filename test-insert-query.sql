-- =============================================
-- SCRIPT 2: TESTAR INSERÇÃO
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

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
