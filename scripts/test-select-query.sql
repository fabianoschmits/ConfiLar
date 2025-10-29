-- =============================================
-- SCRIPT 1: TESTAR QUERY SELECT
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

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
