-- Função RPC para curtida premium sem triggers problemáticos
CREATE OR REPLACE FUNCTION premium_like_post(
  post_id_param UUID,
  user_id_param UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  post_creator_id UUID;
  user_balance INTEGER;
  creator_balance INTEGER;
  creator_total_earned INTEGER;
BEGIN
  -- Verificar se o usuário já curtiu este post
  IF EXISTS (
    SELECT 1 FROM feed_posts_likes 
    WHERE post_id = post_id_param AND user_id = user_id_param
  ) THEN
    RETURN json_build_object('error', 'Usuário já curtiu este post');
  END IF;

  -- Verificar se o usuário não está curtindo seu próprio post
  SELECT user_id INTO post_creator_id 
  FROM feed_posts 
  WHERE id = post_id_param;
  
  IF post_creator_id = user_id_param THEN
    RETURN json_build_object('error', 'Não é possível curtir seu próprio post');
  END IF;

  -- Verificar saldo do usuário
  SELECT balance INTO user_balance 
  FROM user_points_balance 
  WHERE user_id = user_id_param;
  
  IF user_balance IS NULL OR user_balance < 5 THEN
    RETURN json_build_object('error', 'Saldo insuficiente para curtida premium');
  END IF;

  -- Inserir curtida premium
  INSERT INTO feed_posts_likes (
    post_id,
    user_id,
    is_premium,
    premium_points_spent,
    created_at
  ) VALUES (
    post_id_param,
    user_id_param,
    true,
    5,
    NOW()
  );

  -- Deduzir pontos do usuário que curtiu
  UPDATE user_points_balance 
  SET 
    balance = balance - 5,
    total_spent = COALESCE(total_spent, 0) + 5,
    available_balance = balance - 5,
    updated_at = NOW()
  WHERE user_id = user_id_param;

  -- Adicionar pontos ao criador do post
  SELECT balance, COALESCE(total_earned, 0) INTO creator_balance, creator_total_earned
  FROM user_points_balance 
  WHERE user_id = post_creator_id;
  
  IF creator_balance IS NOT NULL THEN
    UPDATE user_points_balance 
    SET 
      balance = balance + 5,
      total_earned = creator_total_earned + 5,
      available_balance = balance + 5,
      updated_at = NOW()
    WHERE user_id = post_creator_id;
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
      post_creator_id,
      5,
      1,
      5,
      0,
      5,
      NOW(),
      NOW()
    );
  END IF;

  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Curtida premium realizada com sucesso',
    'points_spent', 5,
    'points_transferred', 5
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;
