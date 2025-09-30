-- =============================================
-- TESTAR E CORRIGIR SISTEMA DE CURTIDAS DOS COMENTÁRIOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar se a tabela comment_likes existe
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'comment_likes'
) as table_exists;

-- 2. Se não existir, criar a tabela
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- 3. Habilitar RLS
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view comment likes" ON comment_likes;
DROP POLICY IF EXISTS "Users can insert their own comment likes" ON comment_likes;
DROP POLICY IF EXISTS "Users can delete their own comment likes" ON comment_likes;

-- 5. Criar políticas RLS
CREATE POLICY "Users can view comment likes" ON comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comment likes" ON comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes" ON comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Criar função para atualizar contador de likes
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE post_comments 
        SET likes_count = COALESCE(likes_count, 0) + 1 
        WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE post_comments 
        SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar trigger para atualizar contador
DROP TRIGGER IF EXISTS trigger_update_comment_likes_count ON comment_likes;
CREATE TRIGGER trigger_update_comment_likes_count
    AFTER INSERT OR DELETE ON comment_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_likes_count();

-- 8. Verificar se existem comentários
SELECT COUNT(*) as total_comments FROM post_comments;

-- 9. Inserir comentário de teste se não existir
INSERT INTO post_comments (
    post_id,
    user_id,
    content,
    parent_id,
    likes_count
) VALUES (
    (SELECT id FROM feed_posts LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Comentário de teste para curtidas',
    NULL,
    0
) ON CONFLICT DO NOTHING;

-- 10. Testar inserção de like
INSERT INTO comment_likes (
    comment_id,
    user_id
) VALUES (
    (SELECT id FROM post_comments WHERE content LIKE '%teste%' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT (comment_id, user_id) DO NOTHING;

-- 11. Verificar se o contador foi atualizado
SELECT 
    c.id,
    c.content,
    c.likes_count,
    COUNT(cl.id) as actual_likes
FROM post_comments c
LEFT JOIN comment_likes cl ON cl.comment_id = c.id
WHERE c.content LIKE '%teste%'
GROUP BY c.id, c.content, c.likes_count;

-- 12. Testar remoção de like
DELETE FROM comment_likes 
WHERE comment_id = (SELECT id FROM post_comments WHERE content LIKE '%teste%' LIMIT 1)
AND user_id = (SELECT id FROM auth.users LIMIT 1);

-- 13. Verificar se o contador foi atualizado após remoção
SELECT 
    c.id,
    c.content,
    c.likes_count,
    COUNT(cl.id) as actual_likes
FROM post_comments c
LEFT JOIN comment_likes cl ON cl.comment_id = c.id
WHERE c.content LIKE '%teste%'
GROUP BY c.id, c.content, c.likes_count;

-- 14. Verificar estrutura da tabela post_comments
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'post_comments'
AND column_name IN ('id', 'likes_count', 'parent_id')
ORDER BY ordinal_position;

-- 15. Atualizar contadores existentes se necessário
UPDATE post_comments 
SET likes_count = (
    SELECT COUNT(*) 
    FROM comment_likes 
    WHERE comment_likes.comment_id = post_comments.id
)
WHERE likes_count IS NULL OR likes_count != (
    SELECT COUNT(*) 
    FROM comment_likes 
    WHERE comment_likes.comment_id = post_comments.id
);

-- 16. Verificar resultado final
SELECT 
    'Comentários' as table_name,
    COUNT(*) as total_records,
    SUM(likes_count) as total_likes
FROM post_comments
UNION ALL
SELECT 
    'Curtidas' as table_name,
    COUNT(*) as total_records,
    0 as total_likes
FROM comment_likes;
