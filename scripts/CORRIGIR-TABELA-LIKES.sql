-- Script para corrigir a tabela feed_posts_likes
-- Execute no Supabase SQL Editor

-- 1. Verificar estrutura atual
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'feed_posts_likes'
ORDER BY ordinal_position;

-- 2. Verificar constraints
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'feed_posts_likes';

-- 3. Verificar triggers
SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts_likes';

-- 4. Se necessário, recriar a tabela sem triggers problemáticos
-- (Descomente as linhas abaixo se necessário)

/*
-- Fazer backup dos dados existentes
CREATE TABLE feed_posts_likes_backup AS 
SELECT * FROM feed_posts_likes;

-- Dropar a tabela atual
DROP TABLE IF EXISTS feed_posts_likes CASCADE;

-- Recriar a tabela com estrutura correta
CREATE TABLE feed_posts_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_premium BOOLEAN DEFAULT false NOT NULL,
  premium_points_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  UNIQUE(post_id, user_id) -- Um usuário só pode curtir um post uma vez
);

-- Restaurar dados do backup
INSERT INTO feed_posts_likes 
SELECT * FROM feed_posts_likes_backup;

-- Dropar tabela de backup
DROP TABLE feed_posts_likes_backup;

-- Criar índices
CREATE INDEX idx_feed_posts_likes_post_id ON feed_posts_likes(post_id);
CREATE INDEX idx_feed_posts_likes_user_id ON feed_posts_likes(user_id);
CREATE INDEX idx_feed_posts_likes_is_premium ON feed_posts_likes(is_premium);
CREATE INDEX idx_feed_posts_likes_created_at ON feed_posts_likes(created_at);

-- Habilitar RLS
ALTER TABLE feed_posts_likes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view all likes" ON feed_posts_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON feed_posts_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON feed_posts_likes
  FOR DELETE USING (auth.uid() = user_id);
*/
