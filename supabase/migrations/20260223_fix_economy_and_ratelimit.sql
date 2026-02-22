-- 1. Persistent Rate Limit Table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key text PRIMARY KEY,
    count integer DEFAULT 0,
    window_start timestamptz DEFAULT now(),
    blocked_until timestamptz DEFAULT now()
);

-- Garantir acesso apenas interno (Service Role / Security Definer)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- 2. Secure add_points function
-- Sobrescreve a função antiga para IGNORAR o valor de pontos enviado pelo frontend
-- e buscar o valor correto da tabela points_config
CREATE OR REPLACE FUNCTION public.add_points(
    p_user_id uuid,
    p_points integer, -- Mantido na assinatura para compatibilidade, mas ignorado
    p_source character varying,
    p_description text DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_actual_points integer;
    v_daily_limit integer;
    v_earned_today integer;
    v_current_total integer;
BEGIN
    -- 1. Obter configuração oficial (Server-side)
    SELECT points_value, daily_limit 
    INTO v_actual_points, v_daily_limit
    FROM points_config
    WHERE action_key = p_source AND is_active = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Action type not configured or inactive');
    END IF;

    -- 2. Verificar limite diário
    IF v_daily_limit IS NOT NULL THEN
        SELECT COALESCE(SUM(amount), 0)
        INTO v_earned_today
        FROM point_transactions
        WHERE user_id = p_user_id 
          AND source = p_source
          AND created_at >= CURRENT_DATE;

        IF v_earned_today + v_actual_points > v_daily_limit THEN
            RETURN jsonb_build_object('success', false, 'error', 'Daily limit reached');
        END IF;
    END IF;

    -- 3. Registrar transação com o valor SEGURO
    INSERT INTO point_transactions (user_id, amount, type, source, description, metadata)
    VALUES (p_user_id, v_actual_points, 'earn', p_source, p_description, p_metadata);

    -- 4. Atualizar saldo (increment_points atualiza a tabela 'users')
    SELECT increment_points(p_user_id, v_actual_points) INTO v_current_total;

    RETURN jsonb_build_object(
        'success', true, 
        'points_added', v_actual_points, 
        'new_balance', v_current_total
    );
END;
$$;

-- 3. Database Function for Serverless Rate Limit
CREATE OR REPLACE FUNCTION public.check_rate_limit_persistent(
    p_key text,
    p_max_requests integer,
    p_window_ms integer,
    p_block_ms integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_entry record;
    v_now timestamptz := now();
    v_window_interval interval := (p_window_ms || ' milliseconds')::interval;
    v_block_interval interval := (p_block_ms || ' milliseconds')::interval;
BEGIN
    -- Bloqueio pessimista para evitar race conditions em escalabilidade massiva
    SELECT * INTO v_entry FROM rate_limits WHERE key = p_key FOR UPDATE;

    IF NOT FOUND THEN
        INSERT INTO rate_limits (key, count, window_start)
        VALUES (p_key, 1, v_now);
        RETURN jsonb_build_object('allowed', true, 'remaining', p_max_requests - 1, 'reset_time', extract(epoch from (v_now + v_window_interval))::integer);
    END IF;

    -- Caso esteja bloqueado
    IF v_entry.blocked_until > v_now THEN
        RETURN jsonb_build_object('allowed', false, 'retry_after', extract(epoch from (v_entry.blocked_until - v_now))::integer);
    END IF;

    -- Caso a janela de tempo tenha expirado, reseta
    IF v_entry.window_start + v_window_interval < v_now THEN
        UPDATE rate_limits 
        SET count = 1, window_start = v_now, blocked_until = v_now 
        WHERE key = p_key;
        RETURN jsonb_build_object('allowed', true, 'remaining', p_max_requests - 1, 'reset_time', extract(epoch from (v_now + v_window_interval))::integer);
    END IF;

    -- Caso tenha excedido o limite nesta janela
    IF v_entry.count >= p_max_requests THEN
        UPDATE rate_limits 
        SET blocked_until = v_now + v_block_interval, count = v_entry.count + 1
        WHERE key = p_key;
        RETURN jsonb_build_object('allowed', false, 'retry_after', p_block_ms / 1000);
    END IF;

    -- Incremento normal
    UPDATE rate_limits SET count = v_entry.count + 1 WHERE key = p_key;
    RETURN jsonb_build_object('allowed', true, 'remaining', p_max_requests - (v_entry.count + 1), 'reset_time', extract(epoch from (v_entry.window_start + v_window_interval))::integer);
END;
$$;
