-- Criar tabela para armazenar visualizações dos posts
CREATE TABLE IF NOT EXISTS post_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at);

-- Criar índice único para evitar visualizações duplicadas do mesmo usuário no mesmo post
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_views_unique ON post_views(post_id, user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam suas próprias visualizações
CREATE POLICY "Users can view their own post views" ON post_views
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários registrem suas próprias visualizações
CREATE POLICY "Users can insert their own post views" ON post_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários vejam contagens de visualizações de posts
CREATE POLICY "Users can view post view counts" ON post_views
  FOR SELECT USING (true);

-- Comentário na tabela
COMMENT ON TABLE post_views IS 'Armazena visualizações dos posts do feed social';
COMMENT ON COLUMN post_views.post_id IS 'ID do post visualizado';
COMMENT ON COLUMN post_views.user_id IS 'ID do usuário que visualizou';
COMMENT ON COLUMN post_views.viewed_at IS 'Data e hora da visualização';
