-- Script SIMPLES para corrigir função create_post_normal
-- Execute este script no Supabase SQL Editor

-- 1. Remover TODAS as versões existentes
DROP FUNCTION IF EXISTS create_post_normal CASCADE;

-- 2. Criar versão única e correta
CREATE FUNCTION create_post_normal(
  p_professional_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_content TEXT,
  p_images TEXT[],
  p_service_category_id UUID,
  p_location_state TEXT,
  p_location_city TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_post_id UUID;
BEGIN
  -- Gerar ID único
  v_post_id := gen_random_uuid();
  
  -- Inserir post como NORMAL (gratuito)
  INSERT INTO feed_posts (
    id, professional_id, user_id, title, description, content, images,
    service_category_id, location_state, location_city,
    is_premium, premium_points_spent, premium_expires_at, premium_highlight_color,
    created_at, updated_at
  ) VALUES (
    v_post_id, p_professional_id, p_user_id, p_title, p_description, p_content, p_images,
    p_service_category_id, p_location_state, p_location_city,
    FALSE, 0, NULL, NULL,
    NOW(), NOW()
  );
  
  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Post normal criado com sucesso',
    'post_id', v_post_id,
    'points_spent', 0
  );
END;
$$;
