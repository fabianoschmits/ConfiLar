-- Corrigir função add_points para usar GREATEST e prevenir saldo negativo
CREATE OR REPLACE FUNCTION public.add_points(
  p_user_id UUID,
  p_points INTEGER,
  p_source VARCHAR(50),
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_type VARCHAR(20);
BEGIN
  v_type := CASE WHEN p_points > 0 THEN 'earn' ELSE 'spend' END;
  
  INSERT INTO public.user_points_balance (user_id, balance, total_earned, total_spent, available_balance)
  VALUES (
    p_user_id, 
    GREATEST(0, p_points), 
    CASE WHEN p_points > 0 THEN p_points ELSE 0 END,
    CASE WHEN p_points < 0 THEN ABS(p_points) ELSE 0 END,
    GREATEST(0, p_points)
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    balance = GREATEST(0, user_points_balance.balance + p_points),
    available_balance = GREATEST(0, user_points_balance.available_balance + p_points),
    total_earned = CASE WHEN p_points > 0 THEN user_points_balance.total_earned + p_points ELSE user_points_balance.total_earned END,
    total_spent = CASE WHEN p_points < 0 THEN user_points_balance.total_spent + ABS(p_points) ELSE user_points_balance.total_spent END,
    updated_at = NOW();
  
  INSERT INTO public.point_transactions (user_id, amount, type, source, description, metadata)
  VALUES (p_user_id, p_points, v_type, p_source, p_description, p_metadata)
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adicionar action 'comment' se não existir
INSERT INTO public.points_config (action_key, points_value, daily_limit, description) 
VALUES ('comment', -1, 200, 'Comentar (alias)')
ON CONFLICT (action_key) DO NOTHING;

