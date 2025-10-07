-- =============================================
-- VERIFICAR POLÍTICAS RLS DA TABELA FEED_POSTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar se RLS está habilitado na tabela feed_posts
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'feed_posts';

-- 2. Verificar políticas existentes para feed_posts
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'feed_posts'
ORDER BY policyname;

-- 3. Verificar se a tabela existe e sua estrutura
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'feed_posts'
ORDER BY ordinal_position;

-- 4. Verificar permissões da tabela
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'feed_posts'
ORDER BY grantee, privilege_type;
