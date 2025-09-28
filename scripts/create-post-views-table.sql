-- Criar tabela post_views se não existir
CREATE TABLE IF NOT EXISTS post_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at);

-- Configurar RLS
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view their own post views" ON post_views;
DROP POLICY IF EXISTS "Users can insert their own post views" ON post_views;
DROP POLICY IF EXISTS "Users can delete their own post views" ON post_views;

-- Criar políticas RLS
CREATE POLICY "Users can view their own post views" ON post_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own post views" ON post_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own post views" ON post_views
  FOR DELETE USING (auth.uid() = user_id);

-- Política para permitir que usuários vejam contadores de visualizações
CREATE POLICY "Users can view post view counts" ON post_views
  FOR SELECT USING (true);