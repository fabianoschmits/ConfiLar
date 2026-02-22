-- 1. Garantir que os tipos de transferência existam na configuração (com valor 0 indicando dinâmico)
INSERT INTO public.points_config (action_key, points_value, daily_limit, description, is_active)
VALUES 
    ('transfer_sent', 0, NULL, 'Transferência enviada', true),
    ('transfer_received', 0, NULL, 'Transferência recebida', true),
    ('purchase', 0, NULL, 'Compra de pontos', true),
    ('refund', 0, NULL, 'Estorno de pontos', true)
ON CONFLICT (action_key) DO UPDATE SET is_active = true;

-- 2. Atualizar add_points para permitir valores dinâmicos quando points_value = 0
CREATE OR REPLACE FUNCTION public.add_points(
    p_user_id uuid,
    p_points integer,
    p_source character varying,
    p_description text DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_config record;
    v_actual_points integer;
    v_daily_limit integer;
    v_earned_today integer;
    v_current_total integer;
    v_type text;
BEGIN
    -- 1. Obter configuração oficial
    SELECT * INTO v_config
    FROM points_config
    WHERE action_key = p_source AND is_active = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Action type not configured: ' || p_source);
    END IF;

    -- 2. Determinar valor (se config for 0, usa o valor passado)
    IF v_config.points_value = 0 THEN
        v_actual_points := p_points;
    ELSE
        v_actual_points := v_config.points_value;
    END IF;

    -- 3. Verificar limite diário (apenas para ganhos positivos que não sejam compras/transferências)
    IF v_config.daily_limit IS NOT NULL AND v_actual_points > 0 AND p_source NOT IN ('purchase', 'transfer_received') THEN
        SELECT COALESCE(SUM(amount), 0)
        INTO v_earned_today
        FROM point_transactions
        WHERE user_id = p_user_id 
          AND source = p_source
          AND amount > 0
          AND created_at >= CURRENT_DATE;

        IF v_earned_today + v_actual_points > v_config.daily_limit THEN
            RETURN jsonb_build_object('success', false, 'error', 'Daily limit reached');
        END IF;
    END IF;

    -- 4. Determinar tipo da transação
    v_type := CASE 
        WHEN v_actual_points > 0 THEN 'earn' 
        WHEN v_actual_points < 0 THEN 'spend'
        ELSE 'info'
    END;
    
    -- Ajuste específico para compras e estornos
    IF p_source = 'purchase' THEN v_type := 'purchase'; END IF;
    IF p_source = 'refund' THEN v_type := 'refund'; END IF;

    -- 5. Registrar transação
    INSERT INTO point_transactions (user_id, amount, type, source, description, metadata)
    VALUES (p_user_id, v_actual_points, v_type, p_source, COALESCE(p_description, v_config.description), p_metadata);

    -- 6. Atualizar saldo
    SELECT increment_points(p_user_id, v_actual_points) INTO v_current_total;

    RETURN jsonb_build_object(
        'success', true, 
        'points_added', v_actual_points, 
        'new_balance', v_current_total
    );
END;
$$;

-- 3. Atualizar deduct_points para usar a lógica correta
CREATE OR REPLACE FUNCTION public.deduct_points(
    p_user_id uuid,
    p_points integer,
    p_source character varying,
    p_description text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_balance integer;
BEGIN
    -- Verificar saldo
    SELECT points_balance INTO v_balance FROM public.profiles WHERE id = p_user_id;
    
    IF v_balance < p_points THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
    END IF;

    -- Chamar add_points com valor negativo
    RETURN public.add_points(p_user_id, -p_points, p_source, p_description);
END;
$$;
