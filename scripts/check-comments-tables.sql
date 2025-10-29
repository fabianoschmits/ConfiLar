-- =============================================
-- SCRIPT PARA VERIFICAR TABELAS DE COMENTÁRIOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. VERIFICAR SE EXISTE TABELA POST_COMMENTS
SELECT 'VERIFICANDO TABELA POST_COMMENTS:' as info;

SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'post_comments'
ORDER BY ordinal_position;

-- 2. VERIFICAR SE EXISTE TABELA COMMENTS
SELECT 'VERIFICANDO TABELA COMMENTS:' as info;

SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'comments'
ORDER BY ordinal_position;

-- 3. VERIFICAR TODAS AS TABELAS QUE CONTÊM 'COMMENT'
SELECT 'TABELAS COM COMMENT:' as info;

SELECT table_name
FROM information_schema.tables 
WHERE table_name ILIKE '%comment%'
AND table_schema = 'public'
ORDER BY table_name;

-- 4. CONTAR REGISTROS EM CADA TABELA
SELECT 'CONTAGEM DE REGISTROS:' as info;

SELECT 
  'post_comments' as tabela,
  COUNT(*) as total_registros
FROM post_comments
UNION ALL
SELECT 
  'comments' as tabela,
  COUNT(*) as total_registros
FROM comments;

SELECT 'VERIFICAÇÃO CONCLUÍDA!' as status;
