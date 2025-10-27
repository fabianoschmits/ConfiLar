-- Script para verificar e corrigir o problema de posts normais sendo criados como premium
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a função create_post_normal existe e está correta
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'create_post_normal' 
AND routine_schema = 'public';

-- 2. Verificar se há triggers na tabela feed_posts que podem estar causando o problema
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts' 
AND event_object_schema = 'public';

-- 3. Verificar os defaults da tabela feed_posts
SELECT 
  column_name,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'feed_posts' 
AND table_schema = 'public'
AND column_name IN ('is_premium', 'premium_points_spent', 'premium_expires_at', 'premium_highlight_color');

-- 4. Recriar a função create_post_normal com campos explícitos
DROP FUNCTION IF EXISTS create_post_normal(
  p_professional_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_content TEXT,
  p_images JSONB,
  p_service_category_id UUID,
  p_location_state TEXT,
  p_location_city TEXT
);

CREATE OR REPLACE FUNCTION create_post_normal(
  p_professional_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_content TEXT,
  p_images JSONB DEFAULT '[]'::jsonb,
  p_service_category_id UUID DEFAULT NULL,
  p_location_state TEXT DEFAULT NULL,
  p_location_city TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_id UUID;
  result JSON;
BEGIN
  -- Gerar ID único para o post
  post_id := gen_random_uuid();

  -- Inserir diretamente na tabela feed_posts com campos EXPLÍCITOS para posts normais
  INSERT INTO feed_posts (
    id,
    professional_id,
    user_id,
    title,
    description,
    content,
    images,
    service_category_id,
    location_state,
    location_city,
    likes_count,
    comments_count,
    is_active,
    is_public,
    is_featured,
    tags,
    metadata,
    is_premium,           -- EXPLÍCITO: false para posts normais
    premium_points_spent, -- EXPLÍCITO: 0 para posts normais
    premium_expires_at,   -- EXPLÍCITO: NULL para posts normais
    premium_highlight_color, -- EXPLÍCITO: NULL para posts normais
    created_at,
    updated_at
  ) VALUES (
    post_id,
    p_professional_id,
    p_user_id,
    p_title,
    p_description,
    p_content,
    p_images,
    p_service_category_id,
    p_location_state,
    p_location_city,
    0,
    0,
    true,
    true,
    false,
    '{}'::jsonb,
    '{}'::jsonb,
    false,  -- EXPLÍCITO: post normal
    0,      -- EXPLÍCITO: sem pontos premium
    NULL,   -- EXPLÍCITO: sem expiração
    NULL,   -- EXPLÍCITO: sem cor premium
    NOW(),
    NOW()
  );

  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Post normal criado com sucesso',
    'post_id', post_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Erro ao criar post normal'
    );
END;
$$;

-- 5. Testar a função create_post_normal
SELECT create_post_normal(
  '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'::UUID,
  '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'::UUID,
  'Teste Post Normal Corrigido',
  'Descrição do post normal',
  'Conteúdo do post normal',
  '[]'::jsonb,
  NULL,
  'RS',
  'Venâncio Aires'
);

-- 6. Verificar se o post foi criado corretamente
SELECT 
  id,
  title,
  is_premium,
  premium_points_spent,
  premium_expires_at,
  premium_highlight_color
FROM feed_posts 
WHERE title = 'Teste Post Normal Corrigido'
ORDER BY created_at DESC 
LIMIT 1;
