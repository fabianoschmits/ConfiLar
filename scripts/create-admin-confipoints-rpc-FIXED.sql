-- ============================================
-- FUNÇÃO RPC PARA ADMIN DASHBOARD DE CONFIPOINTS - VERSÃO CORRIGIDA
-- ============================================
-- Esta função permite que o admin acesse dados agregados
-- de ConfiPoints respeitando RLS através de SECURITY DEFINER
-- 
-- IMPORTANTE: A função verifica se o usuário é admin antes de retornar dados
-- ============================================

-- Dropar funções existentes se houver
DROP FUNCTION IF EXISTS public.get_admin_confipoints_stats();
DROP FUNCTION IF EXISTS public.get_admin_confipoints_users(INTEGER, INTEGER, TEXT);
DROP FUNCTION IF EXISTS public.get_admin_confipoints_transactions(INTEGER, INTEGER, UUID, TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS public.get_admin_confipoints_by_source();

-- Função para obter estatísticas gerais de ConfiPoints (apenas admin)
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
  -- Verificar se o usuário é admin
  IF v_current_user IS NULL OR v_current_user != v_admin_id THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem acessar esta função.';
  END IF;

  -- Calcular estatísticas gerais
  SELECT json_build_object(
    'total_users_with_points', COALESCE((
      SELECT COUNT(DISTINCT user_id) 
      FROM user_points_balance 
      WHERE balance > 0
    ), 0),
    'total_points_in_circulation', COALESCE((
      SELECT SUM(balance)
      FROM user_points_balance
    ), 0),
    'total_points_earned_all_time', COALESCE((
      SELECT SUM(total_earned)
      FROM user_points_balance
    ), 0),
    'total_points_spent_all_time', COALESCE((
      SELECT SUM(total_spent)
      FROM user_points_balance
    ), 0),
    'total_transactions', COALESCE((
      SELECT COUNT(*) 
      FROM point_transactions
    ), 0),
    'transactions_today', COALESCE((
      SELECT COUNT(*) 
      FROM point_transactions
      WHERE DATE(created_at) = CURRENT_DATE
    ), 0),
    'points_earned_today', COALESCE((
      SELECT SUM(amount)
      FROM point_transactions
      WHERE type = 'earn' AND DATE(created_at) = CURRENT_DATE
    ), 0),
    'points_spent_today', COALESCE((
      SELECT SUM(ABS(amount))
      FROM point_transactions
      WHERE type = 'spend' AND DATE(created_at) = CURRENT_DATE
    ), 0),
    'transactions_this_month', COALESCE((
      SELECT COUNT(*) 
      FROM point_transactions
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    ), 0),
    'points_earned_this_month', COALESCE((
      SELECT SUM(amount)
      FROM point_transactions
      WHERE type = 'earn' AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    ), 0),
    'points_spent_this_month', COALESCE((
      SELECT SUM(ABS(amount))
      FROM point_transactions
      WHERE type = 'spend' AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    ), 0)
  ) INTO v_result;

  RETURN COALESCE(v_result, '{}'::json);
END;
$$;

-- Função para obter lista de usuários com suas estatísticas de ConfiPoints (apenas admin)
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
BEGIN
  -- Verificar se o usuário é admin
  IF v_current_user IS NULL OR v_current_user != v_admin_id THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem acessar esta função.';
  END IF;

  -- Buscar usuários com estatísticas (sem usar EXECUTE format para evitar problemas)
  SELECT json_agg(
    json_build_object(
      'user_id', upb.user_id,
      'full_name', COALESCE(p.full_name, 'Usuário sem nome'),
      'email', COALESCE((SELECT email FROM auth.users WHERE id = upb.user_id), 'N/A'),
      'avatar_url', p.avatar_url,
      'balance', COALESCE(upb.balance, 0),
      'total_earned', COALESCE(upb.total_earned, 0),
      'total_spent', COALESCE(upb.total_spent, 0),
      'available_balance', COALESCE(upb.available_balance, 0),
      'last_transaction_date', (
        SELECT MAX(created_at)
        FROM point_transactions
        WHERE user_id = upb.user_id
      ),
      'transaction_count', (
        SELECT COUNT(*)
        FROM point_transactions
        WHERE user_id = upb.user_id
      )
    )
    ORDER BY 
      CASE 
        WHEN p_order_by = 'balance_desc' THEN upb.balance 
        WHEN p_order_by = 'balance_asc' THEN upb.balance 
        WHEN p_order_by = 'earned_desc' THEN upb.total_earned 
        WHEN p_order_by = 'spent_desc' THEN upb.total_spent 
        ELSE upb.balance 
      END DESC NULLS LAST,
      CASE 
        WHEN p_order_by = 'balance_asc' THEN upb.balance 
        WHEN p_order_by = 'name_asc' THEN p.full_name 
        ELSE NULL 
      END ASC NULLS LAST
  )
  INTO v_result
  FROM user_points_balance upb
  LEFT JOIN profiles p ON p.id = upb.user_id
  ORDER BY 
    CASE 
      WHEN p_order_by = 'balance_desc' THEN upb.balance 
      WHEN p_order_by = 'balance_asc' THEN upb.balance 
      WHEN p_order_by = 'earned_desc' THEN upb.total_earned 
      WHEN p_order_by = 'spent_desc' THEN upb.total_spent 
      ELSE upb.balance 
    END DESC NULLS LAST,
    CASE 
      WHEN p_order_by = 'balance_asc' THEN upb.balance 
      WHEN p_order_by = 'name_asc' THEN p.full_name 
      ELSE NULL 
    END ASC NULLS LAST
  LIMIT p_limit OFFSET p_offset;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- Função para obter transações recentes (apenas admin)
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
  -- Verificar se o usuário é admin
  IF v_current_user IS NULL OR v_current_user != v_admin_id THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem acessar esta função.';
  END IF;

  -- Buscar transações com filtros
  SELECT json_agg(
    json_build_object(
      'id', pt.id,
      'user_id', pt.user_id,
      'user_name', COALESCE(p.full_name, 'Usuário sem nome'),
      'user_email', COALESCE((SELECT email FROM auth.users WHERE id = pt.user_id), 'N/A'),
      'user_avatar_url', p.avatar_url,
      'amount', pt.amount,
      'type', pt.type,
      'source', pt.source,
      'description', pt.description,
      'metadata', pt.metadata,
      'related_user_id', pt.related_user_id,
      'related_user_name', COALESCE(rp.full_name, NULL),
      'created_at', pt.created_at
    )
  )
  INTO v_result
  FROM point_transactions pt
  LEFT JOIN profiles p ON p.id = pt.user_id
  LEFT JOIN profiles rp ON rp.id = pt.related_user_id
  WHERE 
    (p_user_id IS NULL OR pt.user_id = p_user_id)
    AND (p_type IS NULL OR pt.type = p_type)
    AND (p_start_date IS NULL OR pt.created_at >= p_start_date)
    AND (p_end_date IS NULL OR pt.created_at <= p_end_date)
  ORDER BY pt.created_at DESC
  LIMIT p_limit OFFSET p_offset;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- Função para obter estatísticas por fonte (apenas admin)
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
  -- Verificar se o usuário é admin
  IF v_current_user IS NULL OR v_current_user != v_admin_id THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem acessar esta função.';
  END IF;

  -- Estatísticas por fonte
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

-- Garantir permissões de execução
GRANT EXECUTE ON FUNCTION public.get_admin_confipoints_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_confipoints_users(INTEGER, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_confipoints_transactions(INTEGER, INTEGER, UUID, TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_confipoints_by_source() TO authenticated;

-- Comentários explicativos
COMMENT ON FUNCTION public.get_admin_confipoints_stats() IS 
'Retorna estatísticas gerais do sistema de ConfiPoints. Acesso restrito ao admin.';

COMMENT ON FUNCTION public.get_admin_confipoints_users(INTEGER, INTEGER, TEXT) IS 
'Retorna lista de usuários com suas estatísticas de ConfiPoints. Acesso restrito ao admin.';

COMMENT ON FUNCTION public.get_admin_confipoints_transactions(INTEGER, INTEGER, UUID, TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) IS 
'Retorna transações de ConfiPoints com filtros. Acesso restrito ao admin.';

COMMENT ON FUNCTION public.get_admin_confipoints_by_source() IS 
'Retorna estatísticas de ConfiPoints agrupadas por fonte. Acesso restrito ao admin.';

-- Verificação
DO $$
BEGIN
  RAISE NOTICE '✅ Funções RPC de admin ConfiPoints criadas com sucesso!';
  RAISE NOTICE '✅ Acesso restrito ao admin: f7444305-a3bd-4d71-874a-bb95fd27f96a';
END $$;

