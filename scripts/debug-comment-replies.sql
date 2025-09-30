-- =============================================
-- DEBUG: SISTEMA DE RESPOSTAS NOS COMENTÁRIOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar se a tabela post_comments existe
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'post_comments'
) as table_exists;

-- 2. Verificar estrutura da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'post_comments'
ORDER BY ordinal_position;

-- 3. Verificar se existem comentários
SELECT COUNT(*) as total_comments FROM post_comments;

-- 4. Verificar se existem posts
SELECT COUNT(*) as total_posts FROM feed_posts;

-- 5. Verificar se existem usuários
SELECT COUNT(*) as total_users FROM auth.users;

-- 6. Limpar dados de teste antigos
DELETE FROM post_comments WHERE content LIKE '%teste%' OR content LIKE '%debug%';

-- 7. Inserir comentário principal de teste
INSERT INTO post_comments (
    post_id,
    user_id,
    content,
    parent_id,
    likes_count,
    mentions,
    hashtags
) VALUES (
    (SELECT id FROM feed_posts LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Comentário principal para teste de respostas',
    NULL,
    0,
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[]
) RETURNING id as main_comment_id;

-- 8. Obter o ID do comentário principal
WITH main_comment AS (
    SELECT id FROM post_comments 
    WHERE content = 'Comentário principal para teste de respostas'
    LIMIT 1
)
INSERT INTO post_comments (
    post_id,
    user_id,
    content,
    parent_id,
    likes_count,
    mentions,
    hashtags
) VALUES (
    (SELECT id FROM feed_posts LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Resposta ao comentário principal',
    (SELECT id FROM main_comment),
    0,
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[]
) RETURNING id as reply_comment_id;

-- 9. Verificar se as respostas foram criadas
SELECT 
    c.id,
    c.content,
    c.parent_id,
    c.post_id,
    c.user_id,
    c.created_at,
    CASE 
        WHEN c.parent_id IS NULL THEN 'Comentário Principal'
        ELSE 'Resposta'
    END as comment_type,
    p.full_name as user_name
FROM post_comments c
LEFT JOIN profiles p ON p.id = c.user_id
WHERE c.content LIKE '%teste%' OR c.content LIKE '%resposta%'
ORDER BY c.created_at ASC;

-- 10. Testar consulta como o frontend faz (com threads)
WITH RECURSIVE comment_threads AS (
    -- Comentários principais
    SELECT 
        c.id,
        c.content,
        c.parent_id,
        c.post_id,
        c.user_id,
        c.created_at,
        p.full_name,
        0 as level,
        c.id as thread_root
    FROM post_comments c
    LEFT JOIN profiles p ON p.id = c.user_id
    WHERE c.parent_id IS NULL
    AND c.is_deleted = false
    AND c.post_id = (SELECT id FROM feed_posts LIMIT 1)
    
    UNION ALL
    
    -- Respostas
    SELECT 
        c.id,
        c.content,
        c.parent_id,
        c.post_id,
        c.user_id,
        c.created_at,
        p.full_name,
        ct.level + 1,
        ct.thread_root
    FROM post_comments c
    LEFT JOIN profiles p ON p.id = c.user_id
    INNER JOIN comment_threads ct ON ct.id = c.parent_id
    WHERE c.is_deleted = false
)
SELECT 
    id,
    content,
    parent_id,
    full_name,
    level,
    thread_root,
    created_at
FROM comment_threads
ORDER BY 
    thread_root,
    level,
    created_at;

-- 11. Verificar se a função organizeComments funcionaria
-- Simular a lógica do frontend
SELECT 
    c.id,
    c.content,
    c.parent_id,
    c.created_at,
    p.full_name,
    c.likes_count,
    c.is_deleted,
    COUNT(r.id) as replies_count
FROM post_comments c
LEFT JOIN profiles p ON p.id = c.user_id
LEFT JOIN post_comments r ON r.parent_id = c.id AND r.is_deleted = false
WHERE c.parent_id IS NULL 
AND c.is_deleted = false
AND c.post_id = (SELECT id FROM feed_posts LIMIT 1)
GROUP BY c.id, c.content, c.parent_id, c.created_at, p.full_name, c.likes_count, c.is_deleted
ORDER BY c.created_at;

-- 12. Verificar respostas específicas
SELECT 
    r.id as reply_id,
    r.content as reply_content,
    r.parent_id,
    r.created_at as reply_created,
    p.full_name as reply_author,
    parent.content as parent_content,
    parent_author.full_name as parent_author,
    parent.created_at as parent_created
FROM post_comments r
LEFT JOIN profiles p ON p.id = r.user_id
LEFT JOIN post_comments parent ON parent.id = r.parent_id
LEFT JOIN profiles parent_author ON parent_author.id = parent.user_id
WHERE r.parent_id IS NOT NULL
AND r.is_deleted = false
ORDER BY r.created_at;

-- 13. Testar inserção de nova resposta (simulação do frontend)
-- Simular o que acontece quando o usuário clica em "Responder"
SELECT 
    'Simulação de resposta' as test_type,
    (SELECT id FROM post_comments WHERE content = 'Comentário principal para teste de respostas' LIMIT 1) as target_comment_id,
    'Nova resposta via frontend' as reply_content,
    (SELECT id FROM feed_posts LIMIT 1) as post_id,
    (SELECT id FROM auth.users LIMIT 1) as user_id;

-- 14. Verificar RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'post_comments';

-- 15. Verificar se há problemas de permissão
SELECT 
    'Verificação de permissões' as test,
    EXISTS (
        SELECT 1 FROM post_comments 
        WHERE is_deleted = false
    ) as has_comments,
    EXISTS (
        SELECT 1 FROM feed_posts
    ) as has_posts,
    EXISTS (
        SELECT 1 FROM auth.users
    ) as has_users;

-- 16. Testar inserção manual de resposta
INSERT INTO post_comments (
    post_id,
    user_id,
    content,
    parent_id,
    likes_count,
    mentions,
    hashtags
) VALUES (
    (SELECT id FROM feed_posts LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Resposta de teste via SQL',
    (SELECT id FROM post_comments WHERE content = 'Comentário principal para teste de respostas' LIMIT 1),
    0,
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[]
) ON CONFLICT DO NOTHING;

-- 17. Verificar resultado final
SELECT 
    'Comentários principais' as type,
    COUNT(*) as count
FROM post_comments 
WHERE parent_id IS NULL 
AND is_deleted = false
UNION ALL
SELECT 
    'Respostas' as type,
    COUNT(*) as count
FROM post_comments 
WHERE parent_id IS NOT NULL 
AND is_deleted = false;
