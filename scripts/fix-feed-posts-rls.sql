-- =============================================
-- CORRIGIR POLÍTICAS RLS DA TABELA FEED_POSTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Habilitar RLS na tabela feed_posts (se não estiver habilitado)
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view all feed posts" ON feed_posts;
DROP POLICY IF EXISTS "Users can insert their own feed posts" ON feed_posts;
DROP POLICY IF EXISTS "Users can update their own feed posts" ON feed_posts;
DROP POLICY IF EXISTS "Users can delete their own feed posts" ON feed_posts;
DROP POLICY IF EXISTS "Enable read access for all users" ON feed_posts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON feed_posts;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON feed_posts;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON feed_posts;

-- 3. Criar políticas RLS corretas para feed_posts

-- Política para SELECT: Todos podem ver posts públicos
CREATE POLICY "Enable read access for all users" ON feed_posts
  FOR SELECT 
  USING (is_public = true OR auth.uid() = user_id);

-- Política para INSERT: Usuários autenticados podem criar posts
CREATE POLICY "Enable insert for authenticated users only" ON feed_posts
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: Usuários podem editar apenas seus próprios posts
CREATE POLICY "Enable update for users based on user_id" ON feed_posts
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para DELETE: Usuários podem deletar apenas seus próprios posts
CREATE POLICY "Enable delete for users based on user_id" ON feed_posts
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 4. Verificar se as políticas foram criadas corretamente
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

-- 5. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'feed_posts';
