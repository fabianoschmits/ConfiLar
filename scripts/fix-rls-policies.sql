-- ============================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA FEED_POSTS
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Verificar políticas RLS existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'feed_posts';

-- 2. Remover políticas RLS restritivas existentes (se houver)
DROP POLICY IF EXISTS "Users can insert their own posts" ON feed_posts;
DROP POLICY IF EXISTS "Users can view public posts" ON feed_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON feed_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON feed_posts;

-- 3. Criar políticas RLS mais permissivas para posts automáticos
-- Política para inserção (permitir posts automáticos do sistema)
CREATE POLICY "Allow system posts and user posts" ON feed_posts
FOR INSERT
WITH CHECK (
  -- Permitir posts do sistema (user_id = 'system')
  user_id = 'system' OR
  -- Permitir posts de usuários autenticados
  auth.uid() IS NOT NULL
);

-- Política para visualização (permitir ver todos os posts públicos)
CREATE POLICY "Allow viewing public posts" ON feed_posts
FOR SELECT
USING (
  -- Permitir ver posts públicos
  is_public = true OR
  -- Permitir ver posts do próprio usuário
  user_id = auth.uid() OR
  -- Permitir ver posts onde o usuário é o profissional
  professional_id = auth.uid()
);

-- Política para atualização (permitir atualizar próprios posts)
CREATE POLICY "Allow updating own posts" ON feed_posts
FOR UPDATE
USING (
  user_id = auth.uid() OR
  professional_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid() OR
  professional_id = auth.uid()
);

-- Política para exclusão (permitir deletar próprios posts)
CREATE POLICY "Allow deleting own posts" ON feed_posts
FOR DELETE
USING (
  user_id = auth.uid() OR
  professional_id = auth.uid()
);

-- 4. Verificar se a tabela tem as colunas necessárias
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'feed_posts'
ORDER BY ordinal_position;

-- 5. Adicionar colunas se não existirem
ALTER TABLE feed_posts 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_feed_posts_user_id ON feed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_professional_id ON feed_posts(professional_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at ON feed_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_feed_posts_is_public ON feed_posts(is_public);
CREATE INDEX IF NOT EXISTS idx_feed_posts_metadata_type ON feed_posts USING GIN ((metadata->>'type'));

-- 7. Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'feed_posts'
ORDER BY policyname;

-- ============================================
-- INSTRUÇÕES:
-- 1. Copie e cole este SQL no Supabase SQL Editor
-- 2. Execute passo a passo (comentários 1, 2, 3, 4, 5, 6, 7)
-- 3. Ou execute tudo de uma vez
-- ============================================
