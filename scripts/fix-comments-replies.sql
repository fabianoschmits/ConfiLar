-- =============================================
-- CORRIGIR SISTEMA DE RESPOSTAS NOS COMENTÁRIOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar se a tabela post_comments existe e tem a estrutura correta
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'post_comments'
ORDER BY ordinal_position;

-- 2. Verificar se a coluna parent_id existe
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'post_comments' 
    AND column_name = 'parent_id'
) as parent_id_exists;

-- 3. Se a coluna parent_id não existir, criar
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

-- 4. Verificar se existem índices para parent_id
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'post_comments' 
AND indexdef LIKE '%parent_id%';

-- 5. Criar índice para parent_id se não existir
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON post_comments(parent_id);

-- 6. Verificar se a tabela comment_likes existe
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'comment_likes'
) as comment_likes_exists;

-- 7. Se a tabela comment_likes não existir, criar
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- 8. Habilitar RLS na tabela comment_likes
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- 9. Criar políticas RLS para comment_likes
DROP POLICY IF EXISTS "Users can view comment likes" ON comment_likes;
DROP POLICY IF EXISTS "Users can insert their own comment likes" ON comment_likes;
DROP POLICY IF EXISTS "Users can delete their own comment likes" ON comment_likes;

CREATE POLICY "Users can view comment likes" ON comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comment likes" ON comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes" ON comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 10. Criar função para atualizar contador de likes
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE post_comments 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE post_comments 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 11. Criar trigger para atualizar contador de likes
DROP TRIGGER IF EXISTS trigger_update_comment_likes_count ON comment_likes;
CREATE TRIGGER trigger_update_comment_likes_count
    AFTER INSERT OR DELETE ON comment_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_likes_count();

-- 12. Verificar se existem comentários de teste
SELECT COUNT(*) as total_comments FROM post_comments;

-- 13. Inserir comentário de teste se não existir nenhum
INSERT INTO post_comments (
    post_id,
    user_id,
    content,
    parent_id,
    likes_count
) VALUES (
    (SELECT id FROM feed_posts LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Este é um comentário de teste',
    NULL,
    0
) ON CONFLICT DO NOTHING;

-- 14. Inserir resposta de teste
INSERT INTO post_comments (
    post_id,
    user_id,
    content,
    parent_id,
    likes_count
) VALUES (
    (SELECT id FROM feed_posts LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Esta é uma resposta de teste',
    (SELECT id FROM post_comments WHERE parent_id IS NULL LIMIT 1),
    0
) ON CONFLICT DO NOTHING;

-- 15. Verificar estrutura final
SELECT 
    'post_comments' as table_name,
    COUNT(*) as total_records
FROM post_comments
UNION ALL
SELECT 
    'comment_likes' as table_name,
    COUNT(*) as total_records
FROM comment_likes;

-- 16. Testar consulta de comentários com respostas
SELECT 
    c.id,
    c.content,
    c.parent_id,
    c.likes_count,
    p.full_name as user_name,
    CASE 
        WHEN c.parent_id IS NULL THEN 'Comentário Principal'
        ELSE 'Resposta'
    END as comment_type
FROM post_comments c
LEFT JOIN profiles p ON p.id = c.user_id
WHERE c.is_deleted = false
ORDER BY c.created_at ASC;
