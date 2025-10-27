-- Script para criar função RPC simples para posts normais (sem verificação de saldo)
-- Execute no Supabase SQL Editor

-- Função simples para criar posts normais (gratuitos)
CREATE OR REPLACE FUNCTION create_post_normal(
  p_professional_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_content TEXT,
  p_images TEXT[] DEFAULT '{}',
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

  -- Inserir diretamente na tabela feed_posts (sem triggers problemáticos)
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
    is_premium,
    premium_points_spent,
    premium_expires_at,
    premium_highlight_color,
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
    '{}',
    '{}',
    false, -- Explícito: post normal
    0, -- Explícito: sem pontos premium
    NULL, -- Explícito: sem expiração
    NULL, -- Explícito: sem cor premium
    NOW(),
    NOW()
  );

  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Post criado com sucesso',
    'post_id', post_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Teste da função
SELECT create_post_normal(
  '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'::UUID,
  '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'::UUID,
  'Teste de Post Normal',
  'Descrição do teste',
  'Conteúdo do teste',
  '{}',
  NULL,
  'RS',
  'Venâncio Aires'
);
