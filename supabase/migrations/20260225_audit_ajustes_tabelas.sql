-- Migration: Auditoria e Ajustes na Tabela de Transferências e Saques

-- 1. Adicionar as colunas esperadas na tabela points_transfers
ALTER TABLE public.points_transfers
    ADD COLUMN IF NOT EXISTS fee_percentage integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS fee_amount integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS net_amount integer,
    ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed';

-- Garantir que transferências antigas tenham um valor coerente de líquido
UPDATE public.points_transfers 
SET net_amount = points_amount 
WHERE net_amount IS NULL;

-- 2. Consertar a RPC create_withdrawal para usar as colunas antigas corretas (amount_brl, fee_brl, net_amount_brl)
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

    v_brl_amount := (p_points_amount * 0.01)::numeric;
    v_fee_amount := (v_brl_amount * (v_fee_percentage::numeric / 100))::numeric;
    v_net_amount := (v_brl_amount - v_fee_amount)::numeric;

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
        amount_brl,       -- CORRIGIDO AQUI
        fee_brl,          -- CORRIGIDO AQUI
        net_amount_brl,   -- CORRIGIDO AQUI
        pix_key,
        pix_key_type,
        status,
        created_at
    ) VALUES (
        p_user_id,
        p_points_amount,
        v_brl_amount,
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
