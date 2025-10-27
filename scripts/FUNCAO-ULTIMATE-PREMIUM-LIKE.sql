-- Script para identificar e resolver definitivamente o trigger problemático
-- Execute no Supabase SQL Editor

-- 1. Identificar todos os triggers na tabela feed_posts_likes
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts_likes'
  AND trigger_name NOT LIKE 'RI_ConstraintTrigger%'
ORDER BY trigger_name;

-- 2. Verificar se há funções que podem estar sendo chamadas
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_definition LIKE '%user_points_balance%'
  AND routine_definition LIKE '%INSERT%';

-- 3. Tentar desabilitar triggers específicos (substitua 'nome_do_trigger' pelo nome real)
-- DROP TRIGGER IF EXISTS nome_do_trigger ON feed_posts_likes;

-- 4. Solução alternativa: Criar uma função que usa uma abordagem completamente diferente
CREATE OR REPLACE FUNCTION handle_premium_like_transaction_ultimate(
  p_post_id UUID,
  p_user_id UUID,
  p_post_creator_id UUID,
  p_points_to_spend INTEGER DEFAULT 5
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  user_balance INTEGER;
  creator_balance INTEGER;
  creator_total_earned INTEGER;
  like_id UUID;
BEGIN
  -- Verificar se o usuário já curtiu este post
  IF EXISTS (
    SELECT 1 FROM feed_posts_likes 
    WHERE post_id = p_post_id AND user_id = p_user_id
  ) THEN
    RETURN json_build_object('error', 'Usuário já curtiu este post');
  END IF;

  -- Verificar se o usuário não está curtindo seu próprio post
  IF p_post_creator_id = p_user_id THEN
    RETURN json_build_object('error', 'Não é possível curtir seu próprio post');
  END IF;

  -- Verificar saldo do usuário
  SELECT balance INTO user_balance 
  FROM user_points_balance 
  WHERE user_id = p_user_id;
  
  IF user_balance IS NULL OR user_balance < p_points_to_spend THEN
    RETURN json_build_object('error', 'Saldo insuficiente para curtida premium');
  END IF;

  -- Gerar ID único
  like_id := gen_random_uuid();

  -- Usar uma abordagem diferente: inserir dados mínimos primeiro
  INSERT INTO feed_posts_likes (
    id,
    post_id,
    user_id,
    is_premium,
    created_at
  ) VALUES (
    like_id,
    p_post_id,
    p_user_id,
    true,
    NOW()
  );

  -- Depois atualizar os campos adicionais
  UPDATE feed_posts_likes 
  SET 
    premium_points_spent = p_points_to_spend,
    points_spent = p_points_to_spend,
    points_transferred = p_points_to_spend,
    updated_at = NOW()
  WHERE id = like_id;

  -- Deduzir pontos do usuário que curtiu
  UPDATE user_points_balance 
  SET 
    balance = balance - p_points_to_spend,
    total_spent = COALESCE(total_spent, 0) + p_points_to_spend,
    available_balance = balance - p_points_to_spend,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Adicionar pontos ao criador do post
  SELECT balance, COALESCE(total_earned, 0) INTO creator_balance, creator_total_earned
  FROM user_points_balance 
  WHERE user_id = p_post_creator_id;
  
  IF creator_balance IS NOT NULL THEN
    UPDATE user_points_balance 
    SET 
      balance = balance + p_points_to_spend,
      total_earned = creator_total_earned + p_points_to_spend,
      available_balance = balance + p_points_to_spend,
      updated_at = NOW()
    WHERE user_id = p_post_creator_id;
  ELSE
    -- Criar registro para o criador se não existir
    INSERT INTO user_points_balance (
      user_id,
      balance,
      level,
      total_earned,
      total_spent,
      available_balance,
      created_at,
      updated_at
    ) VALUES (
      p_post_creator_id,
      p_points_to_spend,
      1,
      p_points_to_spend,
      0,
      p_points_to_spend,
      NOW(),
      NOW()
    );
  END IF;

  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Curtida premium realizada com sucesso',
    'points_spent', p_points_to_spend,
    'points_transferred', p_points_to_spend,
    'like_id', like_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Teste da função ultimate
SELECT handle_premium_like_transaction_ultimate(
  'bc435acf-25b2-470f-ad35-78f0e168b470'::UUID,
  '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'::UUID,
  '3f8f19ed-4903-4ec3-a508-1264878dcfed'::UUID,
  5
);
