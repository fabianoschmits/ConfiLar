-- Verificar se a tabela post_comments existe e tem dados
SELECT 
  'TABELA_EXISTE' as status,
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'post_comments';

-- Verificar estrutura da tabela
SELECT 
  'ESTRUTURA' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'post_comments'
ORDER BY ordinal_position;

-- Contar comentários
SELECT 
  'TOTAL_COMENTARIOS' as status,
  COUNT(*) as total 
FROM post_comments;

-- Ver alguns comentários de exemplo
SELECT 
  'EXEMPLO_COMENTARIOS' as status,
  id,
  post_id,
  user_id,
  content,
  created_at
FROM post_comments 
ORDER BY created_at DESC 
LIMIT 5;
