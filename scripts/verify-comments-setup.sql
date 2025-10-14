-- Verificar se as tabelas de comentários existem
SELECT 
  'TABELAS_COMENTARIOS' as status,
  table_name,
  CASE WHEN table_name = 'post_comments' THEN 'EXISTE' ELSE 'NAO_EXISTE' END as post_comments_status,
  CASE WHEN table_name = 'comment_likes' THEN 'EXISTE' ELSE 'NAO_EXISTE' END as comment_likes_status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('post_comments', 'comment_likes', 'post_likes')
ORDER BY table_name;

-- Verificar se há dados na tabela post_comments
SELECT 
  'DADOS_COMENTARIOS' as status,
  COUNT(*) as total_comentarios,
  COUNT(DISTINCT post_id) as posts_com_comentarios
FROM post_comments;

-- Verificar estrutura da tabela post_comments
SELECT 
  'ESTRUTURA_POST_COMMENTS' as status,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'post_comments'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
  'POLITICAS_RLS' as status,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'post_comments';
