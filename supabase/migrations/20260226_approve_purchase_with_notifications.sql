-- Fix: approve_points_purchase now sends in-app notifications after approval
-- and activates Pro status for pro_monthly package purchases.
-- This is the FULL function definition (supersedes 20260226_fix_pro_package_purchase.sql)
CREATE OR REPLACE FUNCTION public.approve_points_purchase(p_purchase_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_purchase record;
    v_points_amount integer;
    v_package_slug text;
    v_package_name text;
    v_result jsonb;
BEGIN
    -- Buscar compra e dados do pacote associado
    SELECT pp.*, pkg.slug as package_slug, pkg.name as package_name
    INTO v_purchase
    FROM public.points_purchases pp
    LEFT JOIN public.points_packages pkg ON kg.id = pp.package_id
    WHERE pp.id = p_purchase_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Compra não encontrada');
    END IF;

    IF v_purchase.status = 'approved' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Compra já foi processada/aprovada');
    END IF;

    v_package_slug := v_purchase.package_slug;
    v_package_name := COALESCE(v_purchase.package_name, 'Pacote de pontos');

    -- Verificação server-side: pro_monthly só pode ser comprado enquanto não tiver Pro ativo
    IF v_package_slug = 'pro_monthly' THEN
        IF EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = v_purchase.user_id
              AND is_pro = true
              AND pro_expires_at IS NOT NULL
              AND pro_expires_at > NOW()
        ) THEN
            RETURN jsonb_build_object('success', false, 'error', 'Usuário já possui uma assinatura Pro ativa. Aguarde o vencimento para renovar.');
        END IF;
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

    -- Se for pacote Pro mensal, ativar status Pro no perfil por 30 dias
    IF v_package_slug = 'pro_monthly' THEN
        UPDATE public.profiles
        SET is_pro = true,
            pro_expires_at = NOW() + INTERVAL '30 days',
            updated_at = NOW()
        WHERE id = v_purchase.user_id;

        -- Notificação especial para ativação Pro
        PERFORM public.create_simple_notification(
            v_purchase.user_id,
            '🌟 Você agora é ConfiLar Pro!',
            'Seu status Pro foi ativado com sucesso! Aproveite o badge exclusivo, prioridade nas buscas e todos os seus ' || v_points_amount || ' ConfiPoints creditados. Válido por 30 dias.',
            'achievement',
            '/confipoints/dashboard'
        );
    ELSE
        -- Notificação padrão de compra aprovada
        PERFORM public.create_simple_notification(
            v_purchase.user_id,
            '✅ Compra aprovada!',
            'Seu pagamento do pacote "' || v_package_name || '" foi confirmado e ' || v_points_amount || ' ConfiPoints foram creditados na sua conta.',
            'purchase',
            '/confipoints/dashboard'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Compra aprovada com sucesso',
        'points_credited', v_points_amount,
        'pro_activated', v_package_slug = 'pro_monthly'
    );
END;
$$;
