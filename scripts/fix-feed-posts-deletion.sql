-- =============================================
-- CORRIGIR PROBLEMAS DE EXCLUSÃO NA TABELA FEED_POSTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'feed_posts';

-- 2. Verificar políticas existentes
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

-- 3. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view all feed posts" ON feed_posts;
DROP POLICY IF EXISTS "Users can insert their own feed posts" ON feed_posts;
DROP POLICY IF EXISTS "Users can update their own feed posts" ON feed_posts;
DROP POLICY IF EXISTS "Users can delete their own feed posts" ON feed_posts;
DROP POLICY IF EXISTS "Enable read access for all users" ON feed_posts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON feed_posts;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON feed_posts;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON feed_posts;

-- 4. Habilitar RLS se não estiver habilitado
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS corretas

-- Política para SELECT: Todos podem ver posts públicos ou seus próprios posts
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

-- 6. Verificar se as políticas foram criadas corretamente
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

-- 7. Testar se a exclusão funciona (substitua 'USER_ID_AQUI' pelo ID do usuário)
-- SELECT id, title, user_id FROM feed_posts WHERE user_id = 'USER_ID_AQUI' LIMIT 5;

-- 8. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'feed_posts';
