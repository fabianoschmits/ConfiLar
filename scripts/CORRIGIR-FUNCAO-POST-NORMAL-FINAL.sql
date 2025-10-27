-- Script para corrigir definitivamente a função create_post_normal
-- Execute este script no Supabase SQL Editor

-- 1. Remover todas as versões existentes da função
DROP FUNCTION IF EXISTS create_post_normal(uuid, uuid, text, text, text, jsonb, uuid, text, text);
DROP FUNCTION IF EXISTS create_post_normal(uuid, uuid, text, text, text, text[], uuid, text, text);

-- 2. Criar nova versão limpa e correta
CREATE OR REPLACE FUNCTION create_post_normal(
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
  v_result JSON;
BEGIN
  -- Gerar ID único para o post
  v_post_id := gen_random_uuid();
  
  -- Inserir post como NORMAL (gratuito) - EXPLICITAMENTE
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
    is_premium,
    premium_points_spent,
    premium_expires_at,
    premium_highlight_color,
    created_at,
    updated_at
  ) VALUES (
    v_post_id,
    p_professional_id,
    p_user_id,
    p_title,
    p_description,
    p_content,
    p_images,
    p_service_category_id,
    p_location_state,
    p_location_city,
    FALSE,  -- is_premium = FALSE (EXPLICITAMENTE)
    0,      -- premium_points_spent = 0 (EXPLICITAMENTE)
    NULL,   -- premium_expires_at = NULL
    NULL,   -- premium_highlight_color = NULL
    NOW(),
    NOW()
  );
  
  -- Retornar resultado
  v_result := json_build_object(
    'success', true,
    'message', 'Post normal criado com sucesso',
    'post_id', v_post_id,
    'points_spent', 0
  );
  
  RETURN v_result;
END;
$$;

-- 3. Testar a função
DO $$
DECLARE
  v_test_result JSON;
  v_created_post RECORD;
BEGIN
  -- Testar a função
  SELECT create_post_normal(
    '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'::UUID,
    '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'::UUID,
    'Teste Post Normal Final',
    'Descrição do post normal',
    'Conteúdo do post normal',
    ARRAY[]::TEXT[],
    NULL,
    'RS',
    'Venâncio Aires'
  ) INTO v_test_result;
  
  -- Verificar resultado
  RAISE NOTICE 'Resultado da função: %', v_test_result;
  
  -- Verificar como o post foi criado
  SELECT is_premium, premium_points_spent, title
  INTO v_created_post
  FROM feed_posts
  WHERE id = (v_test_result->>'post_id')::UUID;
  
  RAISE NOTICE 'Post criado - is_premium: %, premium_points_spent: %, title: %', 
    v_created_post.is_premium, 
    v_created_post.premium_points_spent, 
    v_created_post.title;
  
  -- Verificar se está correto
  IF v_created_post.is_premium = FALSE AND v_created_post.premium_points_spent = 0 THEN
    RAISE NOTICE '✅ SUCESSO! Post criado como normal';
  ELSE
    RAISE NOTICE '❌ PROBLEMA! Post criado como premium';
  END IF;
  
  -- Limpar post de teste
  DELETE FROM feed_posts WHERE id = (v_test_result->>'post_id')::UUID;
  
END $$;

-- 4. Verificar se a função foi criada corretamente
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'create_post_normal' 
AND routine_schema = 'public';
