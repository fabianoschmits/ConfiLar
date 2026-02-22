-- Migration: Revoke and Lock Economy RPCs
-- Descrição: 
-- 1. Remove permissão EXECUTE de roles public/authenticated para RPCs financeiras.
-- 2. Adiciona FOR UPDATE no 'deduct_points' para bloqueio contra Race Conditions.
-- 3. Adiciona FOR UPDATE no 'transfer_points' para bloqueio contra Race Conditions.
-- 4. Adiciona validações estritas de valores positivos (> 0).

-- =========================================================================
-- PARTE 1: ATUALIZAÇÃO DAS FUNÇÕES COM BLOQUEIOS DE CONCORRÊNCIA (FOR UPDATE) E VALIDAÇÕES
-- =========================================================================

-- Função reescrita: deduct_points
CREATE OR REPLACE FUNCTION public.deduct_points(
    p_user_id uuid,
    p_points integer,
    p_source character varying,
    p_description text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_balance integer;
BEGIN
    -- Defesa primária contra injeção de pontos negativos:
    IF p_points <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'A quantidade de pontos a deduzir deve ser maior que zero');
    END IF;

    -- Travar a linha (FOR UPDATE) previne Race Conditions de múltiplas requisições assíncronas concorrentes
    SELECT points_balance INTO v_balance FROM public.profiles WHERE id = p_user_id FOR UPDATE;
    
    IF COALESCE(v_balance, 0) < p_points THEN
        RETURN jsonb_build_object('success', false, 'error', 'Saldo insuficiente', 'current_balance', v_balance);
    END IF;

    -- Como garantimos que p_points > 0, -p_points será genuinamente um desconto (negativo)
    RETURN public.add_points(p_user_id, -p_points, p_source, p_description);
END;
$$;

-- Função reescrita: transfer_points
CREATE OR REPLACE FUNCTION public.transfer_points(
    p_from_user_id uuid,
    p_to_user_id uuid,
    p_points_amount integer,
    p_message text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_transfer_id uuid;
    v_from_balance integer;
    v_fee_percentage integer := 25; 
    v_minimum_fee integer := 0;
    v_calculated_fee integer;
    v_fee_amount integer;
    v_net_amount integer;
    v_deduct_result jsonb;
    v_add_result jsonb;
BEGIN
    IF p_from_user_id = p_to_user_id THEN
        RAISE EXCEPTION 'Não é permitido transferir para si mesmo';
    END IF;

    IF p_points_amount < 100 THEN
        RAISE EXCEPTION 'Valor mínimo de transferência é de 100 pontos';
    END IF;

    -- Travar o saldo do remetente previne gasto duplo concorrente
    SELECT balance INTO v_from_balance FROM public.user_points_balance WHERE user_id = p_from_user_id FOR UPDATE;
    IF v_from_balance IS NULL OR v_from_balance < p_points_amount THEN
        RAISE EXCEPTION 'Saldo insuficiente para realizar a transferência';
    END IF;

    v_calculated_fee := FLOOR(p_points_amount * (v_fee_percentage::numeric / 100));
    v_fee_amount := GREATEST(v_calculated_fee, v_minimum_fee);
    v_net_amount := p_points_amount - v_fee_amount;

    IF v_net_amount <= 0 THEN
        RAISE EXCEPTION 'O valor líquido da transferência é inválido após as taxas';
    END IF;

    v_deduct_result := public.deduct_points(
        p_from_user_id,
        p_points_amount,
        'transfer_sent',
        'Transferência enviada para usuário'
    );
    
    IF NOT (v_deduct_result->>'success')::boolean THEN
        RAISE EXCEPTION 'Erro ao deduzir pontos: %', v_deduct_result->>'error';
    END IF;

    INSERT INTO public.points_transfers (
        from_user_id,
        to_user_id,
        points_amount,
        fee_percentage,
        fee_amount,
        net_amount,
        message,
        status,
        created_at
    ) VALUES (
        p_from_user_id,
        p_to_user_id,
        p_points_amount,
        v_fee_percentage,
        v_fee_amount,
        v_net_amount,
        p_message,
        'completed',
        NOW()
    ) RETURNING id INTO v_transfer_id;

    v_add_result := public.add_points(
        p_to_user_id,
        v_net_amount,
        'transfer_received',
        'Transferência recebida',
        jsonb_build_object('transfer_id', v_transfer_id, 'from_user_id', p_from_user_id)
    );
    
    IF NOT (v_add_result->>'success')::boolean THEN
        RAISE EXCEPTION 'Erro ao creditar pontos no destinatário: %', v_add_result->>'error';
    END IF;

    RETURN v_transfer_id;
END;
$$;

-- Função auxiliar: add_points (só pra não deixar sem validação prévia em endpoints fechados)
CREATE OR REPLACE FUNCTION public.add_points(
    p_user_id uuid,
    p_points integer,
    p_source character varying,
    p_description text DEFAULT NULL::text,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_config record;
    v_actual_points integer;
    v_earned_today integer;
    v_current_total integer;
    v_type text;
BEGIN
    SELECT * INTO v_config
    FROM public.points_config
    WHERE action_key = p_source AND is_active = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Action type not configured: ' || p_source);
    END IF;

    IF v_config.points_value = 0 THEN
        v_actual_points := p_points;
    ELSE
        v_actual_points := v_config.points_value;
    END IF;

    IF v_config.daily_limit IS NOT NULL AND v_actual_points > 0 AND p_source NOT IN ('purchase', 'transfer_received', 'bonus') THEN
        SELECT COALESCE(SUM(amount), 0) INTO v_earned_today
        FROM public.point_transactions
        WHERE user_id = p_user_id AND source = p_source AND amount > 0 AND created_at >= CURRENT_DATE;

        IF v_earned_today + v_actual_points > v_config.daily_limit THEN
            RETURN jsonb_build_object('success', false, 'error', 'Daily limit reached');
        END IF;
    END IF;

    v_type := CASE 
        WHEN p_source = 'purchase' THEN 'purchase'
        WHEN p_source = 'refund' THEN 'refund'
        WHEN v_actual_points > 0 THEN 'earn' 
        WHEN v_actual_points < 0 THEN 'spend'
        ELSE 'info'
    END;

    INSERT INTO public.point_transactions (user_id, amount, type, source, description, metadata)
    VALUES (p_user_id, v_actual_points, v_type, p_source, COALESCE(p_description, v_config.description), p_metadata);

    UPDATE public.profiles
    SET 
        points_balance = GREATEST(COALESCE(points_balance, 0) + v_actual_points, 0),
        total_points_earned = total_points_earned + (CASE WHEN v_actual_points > 0 THEN v_actual_points ELSE 0 END),
        total_points_spent = total_points_spent + (CASE WHEN v_actual_points < 0 THEN ABS(v_actual_points) ELSE 0 END),
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING points_balance INTO v_current_total;

    INSERT INTO public.user_points_balance (user_id, balance, total_earned, total_spent, updated_at)
    VALUES (
        p_user_id, 
        GREATEST(v_actual_points, 0),
        CASE WHEN v_actual_points > 0 THEN v_actual_points ELSE 0 END,
        CASE WHEN v_actual_points < 0 THEN ABS(v_actual_points) ELSE 0 END,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        balance = GREATEST(public.user_points_balance.balance + v_actual_points, 0),
        total_earned = public.user_points_balance.total_earned + (CASE WHEN v_actual_points > 0 THEN v_actual_points ELSE 0 END),
        total_spent = public.user_points_balance.total_spent + (CASE WHEN v_actual_points < 0 ABS(v_actual_points) ELSE 0 END),
        updated_at = NOW();

    RETURN jsonb_build_object(
        'success', true, 
        'points_added', v_actual_points, 
        'new_balance', v_current_total
    );
END;
$$;


-- =========================================================================
-- PARTE 2: REVOGAÇÃO DO ACESSO PÚBLICO
-- =========================================================================

-- Revogar EXECUTE da ROLE PUBLIC e AUTHENTICATED (Clientes Web normais)
REVOKE EXECUTE ON FUNCTION public.add_points(uuid, integer, character varying, text, jsonb) FROM public, authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.deduct_points(uuid, integer, character varying, text) FROM public, authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.transfer_points(uuid, uuid, integer, text) FROM public, authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.create_points_purchase(uuid, uuid, character varying) FROM public, authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.approve_points_purchase(uuid) FROM public, authenticated, anon;

-- Garantir que Service Role tem acesso para o backend prosseguir
GRANT EXECUTE ON FUNCTION public.add_points(uuid, integer, character varying, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.deduct_points(uuid, integer, character varying, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.transfer_points(uuid, uuid, integer, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_points_purchase(uuid, uuid, character varying) TO service_role;
GRANT EXECUTE ON FUNCTION public.approve_points_purchase(uuid) TO service_role;
