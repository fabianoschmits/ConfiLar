-- =============================================
-- SCRIPT COMPLETO PARA CONFIGURAR SISTEMA DE VISUALIZAÇÕES
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Criar tabela post_views
CREATE TABLE IF NOT EXISTS post_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view their own post views" ON post_views;
DROP POLICY IF EXISTS "Users can insert their own post views" ON post_views;
DROP POLICY IF EXISTS "Users can delete their own post views" ON post_views;
DROP POLICY IF EXISTS "Users can view post view counts" ON post_views;

-- 5. Criar políticas RLS
-- Política para usuários verem suas próprias visualizações
CREATE POLICY "Users can view their own post views" ON post_views
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários inserirem suas próprias visualizações
CREATE POLICY "Users can insert their own post views" ON post_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários deletarem suas próprias visualizações
CREATE POLICY "Users can delete their own post views" ON post_views
  FOR DELETE USING (auth.uid() = user_id);

-- Política para permitir que usuários vejam contadores de visualizações (público)
CREATE POLICY "Users can view post view counts" ON post_views
  FOR SELECT USING (true);

-- 6. Verificar se a tabela foi criada corretamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'post_views' 
ORDER BY ordinal_position;

-- 7. Testar inserção (opcional - remover após teste)
-- INSERT INTO post_views (post_id, user_id) 
-- SELECT id, '00000000-0000-0000-0000-000000000000' 
-- FROM feed_posts 
-- LIMIT 1;

-- 8. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'post_views';

-- =============================================
-- FIM DO SCRIPT
-- =============================================
