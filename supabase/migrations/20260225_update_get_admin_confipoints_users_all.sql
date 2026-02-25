-- =====================================================
-- Atualização do RPC get_admin_confipoints_users
-- Objetivo: Retornar TODOS os usuários registrados,
-- incluindo os que não têm pontos, com suporte a
-- busca no servidor (backend search).
-- 
-- Segurança:
-- - SECURITY DEFINER: necessário para leitura de dados
-- - Verificação de admin via is_admin(auth.uid())
-- - search_path = public fixado para evitar attacks
-- - Parâmetros de busca sanitizados via ILIKE (sem SQL injection)
-- =====================================================

-- Remover versões anteriores para evitar PGRST203 (ambiguidade)
DROP FUNCTION IF EXISTS public.get_admin_confipoints_users(integer, integer, text);
DROP FUNCTION IF EXISTS public.get_admin_confipoints_users(integer, integer, text, text);

-- Criar nova versão com suporte a busca
CREATE OR REPLACE FUNCTION public.get_admin_confipoints_users(
    p_limit    integer DEFAULT 20,
    p_offset   integer DEFAULT 0,
    p_order_by text    DEFAULT 'balance_desc',
    p_search   text    DEFAULT NULL
)
RETURNS TABLE (
    user_id              uuid,
    full_name            text,
    email                text,
    avatar_url           text,
    balance              integer,
    total_earned         integer,
    total_spent          integer,
    available_balance    integer,
    last_transaction_date timestamp with time zone,
    transaction_count    bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Somente admins podem chamar esta função
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Acesso negado: apenas administradores podem ver estes dados';
    END IF;

    -- Validar order_by para prevenir SQL injection
    IF p_order_by NOT IN ('balance_desc','balance_asc','earned_desc','spent_desc','name_asc','recent') THEN
        p_order_by := 'balance_desc';
    END IF;

    RETURN QUERY
    WITH UserStats AS (
        -- Agrega ganhos, gastos e contagem de transações por usuário
        SELECT
            t.user_id,
            COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount  ELSE 0 END), 0)          AS total_earned,
            COALESCE(SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END), 0)      AS total_spent,
            MAX(t.created_at)                                                             AS last_transaction_date,
            COUNT(t.id)                                                                   AS transaction_count
        FROM public.point_transactions t
        GROUP BY t.user_id
    )
    SELECT
        p.id                                        AS user_id,
        p.full_name,
        p.email,
        p.avatar_url,
        COALESCE(b.balance, 0)                      AS balance,
        COALESCE(us.total_earned, 0)::integer       AS total_earned,
        COALESCE(us.total_spent,  0)::integer       AS total_spent,
        COALESCE(b.available_balance, b.balance, 0) AS available_balance,
        us.last_transaction_date,
        COALESCE(us.transaction_count, 0)           AS transaction_count
    FROM public.profiles p
    LEFT JOIN public.user_points_balance b  ON b.user_id = p.id
    LEFT JOIN UserStats                 us  ON us.user_id = p.id
    WHERE
        -- Busca opcional (segura contra injection pois usa parâmetro)
        (p_search IS NULL
         OR p.full_name ILIKE '%' || p_search || '%'
         OR p.email     ILIKE '%' || p_search || '%')
    ORDER BY
        CASE p_order_by
            WHEN 'balance_desc' THEN COALESCE(b.balance, 0)         END DESC NULLS LAST,
        CASE p_order_by
            WHEN 'balance_asc'  THEN COALESCE(b.balance, 0)         END ASC  NULLS LAST,
        CASE p_order_by
            WHEN 'earned_desc'  THEN COALESCE(us.total_earned, 0)   END DESC NULLS LAST,
        CASE p_order_by
            WHEN 'spent_desc'   THEN COALESCE(us.total_spent,  0)   END DESC NULLS LAST,
        CASE p_order_by
            WHEN 'name_asc'     THEN p.full_name                    END ASC  NULLS LAST,
        p.created_at DESC  -- fallback
    LIMIT  p_limit
    OFFSET p_offset;
END;
$$;

-- Revogar acesso público e dar apenas a usuários autenticados
REVOKE ALL ON FUNCTION public.get_admin_confipoints_users(integer, integer, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_confipoints_users(integer, integer, text, text) TO authenticated;
