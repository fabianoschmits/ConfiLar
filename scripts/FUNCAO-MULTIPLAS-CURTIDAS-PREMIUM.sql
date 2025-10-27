-- Função RPC para múltiplas curtidas premium
-- Execute no Supabase SQL Editor

-- Função RPC que permite múltiplas curtidas premium do mesmo usuário
CREATE OR REPLACE FUNCTION handle_premium_like_transaction_multiple(
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
  total_premium_likes INTEGER;
BEGIN
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

  -- Primeiro, deduzir pontos do usuário que curtiu
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

  -- Inserir a curtida premium (permitindo múltiplas do mesmo usuário)
  INSERT INTO feed_posts_likes (
    id,
    post_id,
    user_id,
    is_premium,
    premium_points_spent,
    points_spent,
    points_transferred,
    created_at,
    updated_at
  ) VALUES (
    like_id,
    p_post_id,
    p_user_id,
    true,
    p_points_to_spend,
    p_points_to_spend,
    p_points_to_spend,
    NOW(),
    NOW()
  );

  -- Contar total de curtidas premium do usuário neste post
  SELECT COUNT(*) INTO total_premium_likes
  FROM feed_posts_likes 
  WHERE post_id = p_post_id 
    AND user_id = p_user_id 
    AND is_premium = true;

  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Curtida premium realizada com sucesso',
    'points_spent', p_points_to_spend,
    'points_transferred', p_points_to_spend,
    'like_id', like_id,
    'total_premium_likes', total_premium_likes,
    'total_points_sent', total_premium_likes * p_points_to_spend
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Função para obter estatísticas de curtidas premium de um usuário em um post
CREATE OR REPLACE FUNCTION get_user_premium_likes_stats(
  p_post_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  total_likes INTEGER;
  total_points INTEGER;
BEGIN
  -- Contar curtidas premium do usuário neste post
  SELECT 
    COUNT(*),
    COALESCE(SUM(premium_points_spent), 0)
  INTO total_likes, total_points
  FROM feed_posts_likes 
  WHERE post_id = p_post_id 
    AND user_id = p_user_id 
    AND is_premium = true;

  RETURN json_build_object(
    'total_premium_likes', total_likes,
    'total_points_sent', total_points
  );
END;
$$;

-- Teste da função de múltiplas curtidas
SELECT handle_premium_like_transaction_multiple(
  '8472dedd-e7ff-43d5-b839-ac71175890ec'::UUID,
  '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'::UUID,
  'fc21e6cd-e9f8-4ad5-8d92-76caee3716f2'::UUID,
  5
);

-- Teste da função de estatísticas
SELECT get_user_premium_likes_stats(
  '8472dedd-e7ff-43d5-b839-ac71175890ec'::UUID,
  '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'::UUID
);
