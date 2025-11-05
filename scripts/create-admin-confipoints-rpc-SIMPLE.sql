DROP FUNCTION IF EXISTS public.get_admin_confipoints_stats();
DROP FUNCTION IF EXISTS public.get_admin_confipoints_users(INTEGER, INTEGER, TEXT);
DROP FUNCTION IF EXISTS public.get_admin_confipoints_transactions(INTEGER, INTEGER, UUID, TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS public.get_admin_confipoints_by_source();

CREATE OR REPLACE FUNCTION public.get_admin_confipoints_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID := 'f7444305-a3bd-4d71-874a-bb95fd27f96a';
  v_current_user UUID := auth.uid();
  v_result JSON;
BEGIN
  IF v_current_user IS NULL OR v_current_user != v_admin_id THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem acessar esta função.';
  END IF;

  SELECT json_build_object(
    'total_users_with_points', COALESCE((SELECT COUNT(DISTINCT user_id) FROM user_points_balance WHERE balance > 0), 0),
    'total_points_in_circulation', COALESCE((SELECT SUM(balance) FROM user_points_balance), 0),
    'total_points_earned_all_time', COALESCE((SELECT SUM(total_earned) FROM user_points_balance), 0),
    'total_points_spent_all_time', COALESCE((SELECT SUM(total_spent) FROM user_points_balance), 0),
    'total_transactions', COALESCE((SELECT COUNT(*) FROM point_transactions), 0),
    'transactions_today', COALESCE((SELECT COUNT(*) FROM point_transactions WHERE DATE(created_at) = CURRENT_DATE), 0),
    'points_earned_today', COALESCE((SELECT SUM(amount) FROM point_transactions WHERE type = 'earn' AND DATE(created_at) = CURRENT_DATE), 0),
    'points_spent_today', COALESCE((SELECT SUM(ABS(amount)) FROM point_transactions WHERE type = 'spend' AND DATE(created_at) = CURRENT_DATE), 0),
    'transactions_this_month', COALESCE((SELECT COUNT(*) FROM point_transactions WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)), 0),
    'points_earned_this_month', COALESCE((SELECT SUM(amount) FROM point_transactions WHERE type = 'earn' AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)), 0),
    'points_spent_this_month', COALESCE((SELECT SUM(ABS(amount)) FROM point_transactions WHERE type = 'spend' AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)), 0)
  ) INTO v_result;

  RETURN COALESCE(v_result, '{}'::json);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_confipoints_users(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_order_by TEXT DEFAULT 'balance_desc'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID := 'f7444305-a3bd-4d71-874a-bb95fd27f96a';
  v_current_user UUID := auth.uid();
  v_result JSON;
  v_validated_order_by TEXT;
BEGIN
  IF v_current_user IS NULL OR v_current_user != v_admin_id THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem acessar esta função.';
  END IF;

  -- Validar p_order_by (whitelist)
  IF p_order_by IN ('balance_desc', 'balance_asc', 'earned_desc', 'spent_desc', 'name_asc') THEN
    v_validated_order_by := p_order_by;
  ELSE
    v_validated_order_by := 'balance_desc';
  END IF;

  WITH ordered_users AS (
    SELECT 
      upb.user_id,
      COALESCE(p.full_name, 'Usuário sem nome') as full_name,
      COALESCE((SELECT email FROM auth.users WHERE id = upb.user_id), 'N/A') as email,
      p.avatar_url,
      COALESCE(upb.balance, 0) as balance,
      COALESCE(upb.total_earned, 0) as total_earned,
      COALESCE(upb.total_spent, 0) as total_spent,
      COALESCE(upb.available_balance, 0) as available_balance,
      (SELECT MAX(created_at) FROM point_transactions WHERE user_id = upb.user_id) as last_transaction_date,
      (SELECT COUNT(*) FROM point_transactions WHERE user_id = upb.user_id) as transaction_count
    FROM user_points_balance upb
    LEFT JOIN profiles p ON p.id = upb.user_id
    ORDER BY 
      CASE 
        WHEN v_validated_order_by = 'balance_desc' THEN upb.balance::TEXT
        WHEN v_validated_order_by = 'earned_desc' THEN upb.total_earned::TEXT
        WHEN v_validated_order_by = 'spent_desc' THEN upb.total_spent::TEXT
        ELSE upb.balance::TEXT
      END DESC NULLS LAST,
      CASE 
        WHEN v_validated_order_by = 'balance_asc' THEN upb.balance::TEXT
        WHEN v_validated_order_by = 'name_asc' THEN COALESCE(p.full_name, '')
        ELSE upb.balance::TEXT
      END ASC NULLS LAST
    LIMIT p_limit OFFSET p_offset
  )
  SELECT json_agg(
    json_build_object(
      'user_id', user_id,
      'full_name', full_name,
      'email', email,
      'avatar_url', avatar_url,
      'balance', balance,
      'total_earned', total_earned,
      'total_spent', total_spent,
      'available_balance', available_balance,
      'last_transaction_date', last_transaction_date,
      'transaction_count', transaction_count
    )
  )
  INTO v_result
  FROM ordered_users;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_confipoints_transactions(
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0,
  p_user_id UUID DEFAULT NULL,
  p_type TEXT DEFAULT NULL,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID := 'f7444305-a3bd-4d71-874a-bb95fd27f96a';
  v_current_user UUID := auth.uid();
  v_result JSON;
BEGIN
  IF v_current_user IS NULL OR v_current_user != v_admin_id THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem acessar esta função.';
  END IF;

  WITH filtered_transactions AS (
    SELECT 
      pt.id,
      pt.user_id,
      COALESCE(p.full_name, 'Usuário sem nome') as user_name,
      COALESCE((SELECT email FROM auth.users WHERE id = pt.user_id), 'N/A') as user_email,
      p.avatar_url as user_avatar_url,
      pt.amount,
      pt.type,
      pt.source,
      pt.description,
      pt.metadata,
      pt.related_user_id,
      COALESCE(rp.full_name, NULL) as related_user_name,
      pt.created_at
    FROM point_transactions pt
    LEFT JOIN profiles p ON p.id = pt.user_id
    LEFT JOIN profiles rp ON rp.id = pt.related_user_id
    WHERE 
      (p_user_id IS NULL OR pt.user_id = p_user_id)
      AND (p_type IS NULL OR pt.type = p_type)
      AND (p_start_date IS NULL OR pt.created_at >= p_start_date)
      AND (p_end_date IS NULL OR pt.created_at <= p_end_date)
    ORDER BY pt.created_at DESC
    LIMIT p_limit OFFSET p_offset
  )
  SELECT json_agg(
    json_build_object(
      'id', id,
      'user_id', user_id,
      'user_name', user_name,
      'user_email', user_email,
      'user_avatar_url', user_avatar_url,
      'amount', amount,
      'type', type,
      'source', source,
      'description', description,
      'metadata', metadata,
      'related_user_id', related_user_id,
      'related_user_name', related_user_name,
      'created_at', created_at
    )
  )
  INTO v_result
  FROM filtered_transactions;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_confipoints_by_source()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID := 'f7444305-a3bd-4d71-874a-bb95fd27f96a';
  v_current_user UUID := auth.uid();
  v_result JSON;
BEGIN
  IF v_current_user IS NULL OR v_current_user != v_admin_id THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem acessar esta função.';
  END IF;

  SELECT json_agg(
    json_build_object(
      'source', source,
      'total_earned', total_earned,
      'total_spent', total_spent,
      'net_points', total_earned - total_spent,
      'transaction_count', transaction_count,
      'unique_users', unique_users
    )
  )
  INTO v_result
  FROM (
    SELECT 
      source,
      COALESCE(SUM(CASE WHEN type = 'earn' THEN amount ELSE 0 END), 0) as total_earned,
      COALESCE(SUM(CASE WHEN type = 'spend' THEN ABS(amount) ELSE 0 END), 0) as total_spent,
      COUNT(*) as transaction_count,
      COUNT(DISTINCT user_id) as unique_users
    FROM point_transactions
    GROUP BY source
    ORDER BY (COALESCE(SUM(CASE WHEN type = 'earn' THEN amount ELSE 0 END), 0) - 
              COALESCE(SUM(CASE WHEN type = 'spend' THEN ABS(amount) ELSE 0 END), 0)) DESC
  ) stats;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_confipoints_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_confipoints_users(INTEGER, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_confipoints_transactions(INTEGER, INTEGER, UUID, TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_confipoints_by_source() TO authenticated;

