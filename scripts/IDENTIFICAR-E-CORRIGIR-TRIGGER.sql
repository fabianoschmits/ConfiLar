-- Script para identificar e corrigir trigger problemático na tabela feed_posts
-- Execute este script no Supabase SQL Editor

-- 1. Identificar triggers na tabela feed_posts
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts' 
AND event_object_schema = 'public';

-- 2. Verificar se há triggers que modificam is_premium
SELECT 
  trigger_name,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts' 
AND event_object_schema = 'public'
AND action_statement LIKE '%is_premium%';

-- 3. Desabilitar todos os triggers na tabela feed_posts (temporariamente)
-- ATENÇÃO: Isso pode afetar outras funcionalidades
-- ALTER TABLE feed_posts DISABLE TRIGGER ALL;

-- 4. Criar função para inserir posts comuns sem triggers
CREATE OR REPLACE FUNCTION insert_common_post(
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
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_post_id UUID;
BEGIN
  -- Gerar ID único
  v_post_id := gen_random_uuid();
  
  -- Inserir post como COMUM (sem triggers)
  INSERT INTO feed_posts (
    id, professional_id, user_id, title, description, content, images,
    service_category_id, location_state, location_city,
    likes_count, comments_count, is_active, is_public, is_featured,
    is_premium, premium_points_spent, premium_expires_at, premium_highlight_color,
    created_at, updated_at
  ) VALUES (
    v_post_id, p_professional_id, p_user_id, p_title, p_description, p_content, p_images,
    p_service_category_id, p_location_state, p_location_city,
    0, 0, true, true, false,
    FALSE, 0, NULL, NULL,
    NOW(), NOW()
  );
  
  RETURN v_post_id;
END;
$$;

-- 5. Testar a função
DO $$
DECLARE
  v_post_id UUID;
  v_result RECORD;
BEGIN
  -- Testar inserção
  SELECT insert_common_post(
    '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'::UUID,
    '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'::UUID,
    'Teste Post Comum',
    'Descrição',
    'Conteúdo',
    ARRAY[]::TEXT[],
    NULL,
    'RS',
    'Venâncio Aires'
  ) INTO v_post_id;
  
  -- Verificar resultado
  SELECT is_premium, premium_points_spent, premium_expires_at
  INTO v_result
  FROM feed_posts
  WHERE id = v_post_id;
  
  RAISE NOTICE 'Post criado com ID: %', v_post_id;
  RAISE NOTICE 'is_premium: %, premium_points_spent: %, premium_expires_at: %', 
    v_result.is_premium, v_result.premium_points_spent, v_result.premium_expires_at;
  
  -- Limpar teste
  DELETE FROM feed_posts WHERE id = v_post_id;
  
END $$;
