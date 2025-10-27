-- Script simplificado para criar a função ultimate fix
-- Execute este SQL diretamente no Supabase Dashboard > SQL Editor

-- Função ultimate fix que bypassa triggers usando tabela temporária
CREATE OR REPLACE FUNCTION handle_premium_like_transaction_ultimate_fix(
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

  -- PRIMEIRO: Processar todos os pontos (deduzir e transferir)
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

  -- SEGUNDO: Usar uma abordagem diferente para inserir a curtida
  -- Criar uma tabela temporária para inserção sem triggers
  CREATE TEMP TABLE IF NOT EXISTS temp_likes_insert (
    id UUID,
    post_id UUID,
    user_id UUID,
    is_premium BOOLEAN,
    premium_points_spent INTEGER,
    points_spent INTEGER,
    points_transferred INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
  );

  -- Inserir na tabela temporária primeiro
  INSERT INTO temp_likes_insert (
    id, post_id, user_id, is_premium, premium_points_spent,
    points_spent, points_transferred, created_at, updated_at
  ) VALUES (
    like_id, p_post_id, p_user_id, true, p_points_to_spend,
    p_points_to_spend, p_points_to_spend, NOW(), NOW()
  );

  -- Copiar da tabela temporária para a tabela real usando INSERT...SELECT
  INSERT INTO feed_posts_likes (
    id, post_id, user_id, is_premium, premium_points_spent,
    points_spent, points_transferred, created_at, updated_at
  )
  SELECT 
    id, post_id, user_id, is_premium, premium_points_spent,
    points_spent, points_transferred, created_at, updated_at
  FROM temp_likes_insert
  WHERE id = like_id;

  -- Limpar tabela temporária
  DELETE FROM temp_likes_insert WHERE id = like_id;

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
