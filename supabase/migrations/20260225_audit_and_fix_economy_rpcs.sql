-- Migration: Auditoria e Fix de Segurança nos RPCs de Economia (PIX, Loja, Saques, Transferências)

-- 1. Garantir que as configurações de pontos existam para as novas ações
INSERT INTO public.points_config (action_key, points_value, daily_limit, description, is_active)
VALUES 
    ('withdrawal_request', 0, NULL, 'Solicitação de saque', true),
    ('store_purchase', 0, NULL, 'Compra na loja de pontos', true)
ON CONFLICT (action_key) DO UPDATE SET is_active = true;

-- 2. Criação da Compra (PIX)
DROP FUNCTION IF EXISTS public.create_points_purchase(uuid, uuid, character varying);
CREATE OR REPLACE FUNCTION public.create_points_purchase(
    p_user_id uuid,
    p_package_id uuid,
    p_payment_method character varying
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_package record;
    v_purchase_id uuid;
    v_amount_brl numeric;
    v_points_received integer;
BEGIN
    SELECT * INTO v_package FROM public.points_packages WHERE id = p_package_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pacote não encontrado';
    END IF;

    v_amount_brl := v_package.price_brl;
    v_points_received := COALESCE(v_package.total_points, v_package.points);

    INSERT INTO public.points_purchases (
        user_id,
        package_id,
        amount_brl,
        points_received,
        payment_method,
        status,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_package_id,
        v_amount_brl,
        v_points_received,
        p_payment_method,
        'pending',
        NOW(),
        NOW()
    ) RETURNING id INTO v_purchase_id;

    RETURN v_purchase_id;
END;
$$;

-- 3. Aprovação da Compra (Chamado pelo Webhook do PIX / PagHiper)
DROP FUNCTION IF EXISTS public.approve_points_purchase(uuid);
CREATE OR REPLACE FUNCTION public.approve_points_purchase(p_purchase_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_purchase record;
    v_points_amount integer;
    v_result jsonb;
BEGIN
    SELECT * INTO v_purchase FROM public.points_purchases WHERE id = p_purchase_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Compra não encontrada');
    END IF;

    IF v_purchase.status = 'approved' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Compra já foi processada/aprovada');
    END IF;

    v_points_amount := v_purchase.points_received;

    IF v_points_amount IS NULL OR v_points_amount <= 0 THEN
         RETURN jsonb_build_object('success', false, 'error', 'Quantidade de pontos inválida');
    END IF;

    -- Atualizar o status da compra
    UPDATE public.points_purchases
    SET status = 'approved',
        approved_at = NOW(),
        updated_at = NOW()
    WHERE id = p_purchase_id;

    -- Creditar os pontos usando a função add_points unificada
    v_result := public.add_points(
        v_purchase.user_id,
        v_points_amount,
        'purchase',
        'Compra de pacote de pontos',
        jsonb_build_object('purchase_id', p_purchase_id, 'payment_method', v_purchase.payment_method)
    );

    IF NOT (v_result->>'success')::boolean THEN
        RAISE EXCEPTION 'Falha ao creditar pontos: %', v_result->>'error';
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Compra aprovada com sucesso', 'points_credited', v_points_amount);
END;
$$;

-- 4. Transferência de Pontos Peer-to-Peer
DROP FUNCTION IF EXISTS public.transfer_points(uuid, uuid, integer, text);
CREATE OR REPLACE FUNCTION public.transfer_points(
    p_from_user_id uuid,
    p_to_user_id uuid,
    p_points_amount integer,
    p_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_transfer_id uuid;
    v_from_balance integer;
    v_fee_percentage integer := 5; 
    v_minimum_fee integer := 10;
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

    SELECT balance INTO v_from_balance FROM public.user_points_balance WHERE user_id = p_from_user_id;
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

-- 5. Criação de Saque
DROP FUNCTION IF EXISTS public.create_withdrawal(uuid, integer, character varying, character varying);
CREATE OR REPLACE FUNCTION public.create_withdrawal(
    p_user_id uuid,
    p_points_amount integer,
    p_pix_key character varying,
    p_pix_key_type character varying
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_withdrawal_id uuid;
    v_balance integer;
    v_brl_amount numeric;
    v_fee_percentage integer := 10;
    v_fee_amount numeric;
    v_net_amount numeric;
    v_deduct_result jsonb;
BEGIN
    IF p_points_amount < 10000 THEN
        RAISE EXCEPTION 'Valor mínimo de saque é 10.000 pontos';
    END IF;

    SELECT balance INTO v_balance FROM public.user_points_balance WHERE user_id = p_user_id;
    IF v_balance IS NULL OR v_balance < p_points_amount THEN
        RAISE EXCEPTION 'Saldo insuficiente';
    END IF;

    v_brl_amount := p_points_amount * 0.01;
    v_fee_amount := v_brl_amount * (v_fee_percentage::numeric / 100);
    v_net_amount := v_brl_amount - v_fee_amount;

    v_deduct_result := public.deduct_points(
        p_user_id,
        p_points_amount,
        'withdrawal_request',
        'Solicitação de saque'
    );
    
    IF NOT (v_deduct_result->>'success')::boolean THEN
        RAISE EXCEPTION 'Erro ao deduzir pontos do saldo: %', v_deduct_result->>'error';
    END IF;

    INSERT INTO public.points_withdrawals (
        user_id,
        points_amount,
        brl_amount,
        fee_percentage,
        fee_amount,
        net_amount,
        pix_key,
        pix_key_type,
        status,
        created_at
    ) VALUES (
        p_user_id,
        p_points_amount,
        v_brl_amount,
        v_fee_percentage,
        v_fee_amount,
        v_net_amount,
        p_pix_key,
        p_pix_key_type,
        'pending',
        NOW()
    ) RETURNING id INTO v_withdrawal_id;

    RETURN v_withdrawal_id;
END;
$$;

-- 6. Compra na Loja (Segurança Anti-Race-Condition)
DROP FUNCTION IF EXISTS public.purchase_store_item(uuid, uuid);
CREATE OR REPLACE FUNCTION public.purchase_store_item(
    p_user_id uuid,
    p_item_id uuid
) 
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_item record;
    v_purchase_id uuid;
    v_balance integer;
    v_deduct_result jsonb;
BEGIN
    SELECT * INTO v_item FROM public.points_store_items WHERE id = p_item_id AND is_active = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item não encontrado ou inativo';
    END IF;

    SELECT balance INTO v_balance FROM public.user_points_balance WHERE user_id = p_user_id;
    IF v_balance IS NULL OR v_balance < v_item.points_price THEN
        RAISE EXCEPTION 'Saldo insuficiente para comprar este item';
    END IF;

    v_deduct_result := public.deduct_points(
        p_user_id,
        v_item.points_price,
        'store_purchase',
        'Compra na loja de pontos: ' || v_item.name
    );

    IF NOT (v_deduct_result->>'success')::boolean THEN
        RAISE EXCEPTION 'Erro ao deduzir pontos: %', v_deduct_result->>'error';
    END IF;

    INSERT INTO public.points_store_purchases (
        user_id,
        item_id,
        points_spent,
        is_active,
        created_at,
        expires_at
    ) VALUES (
        p_user_id,
        p_item_id,
        v_item.points_price,
        true,
        NOW(),
        CASE WHEN v_item.duration_days IS NOT NULL THEN NOW() + (v_item.duration_days || ' days')::interval ELSE NULL END
    ) RETURNING id INTO v_purchase_id;

    RETURN v_purchase_id;
END;
$$;
