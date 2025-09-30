-- =============================================
-- TESTAR SISTEMA DE RESPOSTAS NOS COMENTÁRIOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar se a coluna parent_id existe
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'post_comments' 
    AND column_name = 'parent_id'
) as parent_id_exists;

-- 2. Se não existir, criar a coluna
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'post_comments' 
        AND column_name = 'parent_id'
    ) THEN
        ALTER TABLE post_comments 
        ADD COLUMN parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Coluna parent_id criada com sucesso.';
    ELSE
        RAISE NOTICE 'Coluna parent_id já existe.';
    END IF;
END $$;

-- 3. Verificar estrutura da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'post_comments'
AND column_name IN ('id', 'parent_id', 'post_id', 'user_id', 'content')
ORDER BY ordinal_position;

-- 4. Limpar dados de teste antigos
DELETE FROM post_comments WHERE content LIKE '%teste%';

-- 5. Inserir comentário principal de teste
INSERT INTO post_comments (
    post_id,
    user_id,
    content,
    parent_id,
    likes_count
) VALUES (
    (SELECT id FROM feed_posts LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Comentário principal de teste',
    NULL,
    0
) RETURNING id as main_comment_id;

-- 6. Inserir resposta ao comentário principal
INSERT INTO post_comments (
    post_id,
    user_id,
    content,
    parent_id,
    likes_count
) VALUES (
    (SELECT id FROM feed_posts LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Resposta ao comentário principal',
    (SELECT id FROM post_comments WHERE content = 'Comentário principal de teste' LIMIT 1),
    0
) RETURNING id as reply_comment_id;

-- 7. Inserir segunda resposta ao mesmo comentário
INSERT INTO post_comments (
    post_id,
    user_id,
    content,
    parent_id,
    likes_count
) VALUES (
    (SELECT id FROM feed_posts LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Segunda resposta ao comentário principal',
    (SELECT id FROM post_comments WHERE content = 'Comentário principal de teste' LIMIT 1),
    0
) RETURNING id as second_reply_id;

-- 8. Verificar se as respostas foram criadas corretamente
SELECT 
    c.id,
    c.content,
    c.parent_id,
    CASE 
        WHEN c.parent_id IS NULL THEN 'Comentário Principal'
        ELSE 'Resposta'
    END as comment_type,
    p.full_name as user_name,
    c.created_at
FROM post_comments c
LEFT JOIN profiles p ON p.id = c.user_id
WHERE c.content LIKE '%teste%' OR c.content LIKE '%resposta%'
ORDER BY c.created_at ASC;

-- 9. Testar consulta hierárquica (como o frontend faz)
WITH RECURSIVE comment_tree AS (
    -- Comentários principais (sem parent_id)
    SELECT 
        c.id,
        c.content,
        c.parent_id,
        c.created_at,
        p.full_name,
        0 as level
    FROM post_comments c
    LEFT JOIN profiles p ON p.id = c.user_id
    WHERE c.parent_id IS NULL
    AND c.is_deleted = false
    AND c.post_id = (SELECT id FROM feed_posts LIMIT 1)
    
    UNION ALL
    
    -- Respostas (com parent_id)
    SELECT 
        c.id,
        c.content,
        c.parent_id,
        c.created_at,
        p.full_name,
        ct.level + 1
    FROM post_comments c
    LEFT JOIN profiles p ON p.id = c.user_id
    INNER JOIN comment_tree ct ON ct.id = c.parent_id
    WHERE c.is_deleted = false
)
SELECT 
    id,
    content,
    parent_id,
    full_name,
    level,
    created_at
FROM comment_tree
ORDER BY 
    CASE WHEN parent_id IS NULL THEN id ELSE parent_id END,
    level,
    created_at;

-- 10. Verificar se a função organizeComments funcionaria
-- (Simulação da lógica do frontend)
SELECT 
    c.id,
    c.content,
    c.parent_id,
    c.created_at,
    p.full_name,
    COUNT(r.id) as replies_count
FROM post_comments c
LEFT JOIN profiles p ON p.id = c.user_id
LEFT JOIN post_comments r ON r.parent_id = c.id AND r.is_deleted = false
WHERE c.parent_id IS NULL 
AND c.is_deleted = false
AND c.post_id = (SELECT id FROM feed_posts LIMIT 1)
GROUP BY c.id, c.content, c.parent_id, c.created_at, p.full_name
ORDER BY c.created_at;

-- 11. Verificar respostas específicas
SELECT 
    r.id,
    r.content,
    r.parent_id,
    r.created_at,
    p.full_name as reply_author,
    parent.content as parent_content,
    parent_author.full_name as parent_author
FROM post_comments r
LEFT JOIN profiles p ON p.id = r.user_id
LEFT JOIN post_comments parent ON parent.id = r.parent_id
LEFT JOIN profiles parent_author ON parent_author.id = parent.user_id
WHERE r.parent_id IS NOT NULL
AND r.is_deleted = false
ORDER BY r.created_at;

-- 12. Testar inserção de nova resposta via RPC (simulação do frontend)
-- Este seria o equivalente ao que o frontend faz quando chama addComment
SELECT 
    'Teste de inserção de resposta' as test_description,
    (SELECT id FROM post_comments WHERE content = 'Comentário principal de teste' LIMIT 1) as target_comment_id,
    'Nova resposta via teste' as reply_content;

-- 13. Verificar contadores
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
