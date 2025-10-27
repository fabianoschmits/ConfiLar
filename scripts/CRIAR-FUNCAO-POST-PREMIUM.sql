-- Script para criar função RPC para posts premium (com custo de pontos)
-- Execute no Supabase SQL Editor

-- Função para criar posts premium (com custo de pontos)
CREATE OR REPLACE FUNCTION create_post_premium(
  p_professional_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_content TEXT,
  p_images TEXT[] DEFAULT '{}',
  p_service_category_id UUID DEFAULT NULL,
  p_location_state TEXT DEFAULT NULL,
  p_location_city TEXT DEFAULT NULL,
  p_points_to_spend INTEGER DEFAULT 50
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_id UUID;
  user_balance INTEGER;
  result JSON;
BEGIN
  -- Verificar saldo do usuário
  SELECT balance INTO user_balance
  FROM user_points_balance
  WHERE user_id = p_user_id;

  IF user_balance IS NULL OR user_balance < p_points_to_spend THEN
    RETURN json_build_object('error', 'Saldo insuficiente para criar post premium. Necessário: ' || p_points_to_spend || ' pontos');
  END IF;

  -- Gerar ID único para o post
  post_id := gen_random_uuid();

  -- Deduzir pontos do usuário
  UPDATE user_points_balance
  SET
    balance = balance - p_points_to_spend,
    total_spent = COALESCE(total_spent, 0) + p_points_to_spend,
    available_balance = balance - p_points_to_spend,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Inserir post premium
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
    true,
    p_points_to_spend,
    NOW() + INTERVAL '7 days',
    '#FFD700',
    NOW(),
    NOW()
  );

  -- Registrar transação de pontos
  INSERT INTO points_transactions (
    id,
    user_id,
    points,
    source,
    description,
    metadata,
    created_at
  ) VALUES (
    gen_random_uuid(),
    p_user_id,
    -p_points_to_spend,
    'premium_post',
    'Criação de post premium',
    jsonb_build_object('post_id', post_id, 'points_spent', p_points_to_spend),
    NOW()
  );

  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Post premium criado com sucesso',
    'post_id', post_id,
    'points_spent', p_points_to_spend
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Teste da função
SELECT create_post_premium(
  '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'::UUID,
  '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'::UUID,
  'Teste de Post Premium',
  'Descrição do teste premium',
  'Conteúdo do teste premium',
  '{}',
  NULL,
  'RS',
  'Venâncio Aires',
  50
);
