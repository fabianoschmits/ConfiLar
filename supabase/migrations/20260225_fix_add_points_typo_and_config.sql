-- Fix typo in add_points and add missing configs
-- 1. Fix typo: CASE missing THEN at line 213 (in previous migration 20260225_revoke_and_lock_economy_rpcs.sql)
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

    IF v_config.daily_limit IS NOT NULL AND v_actual_points > 0 AND p_source NOT IN ('purchase', 'transfer_received', 'bonus', 'admin_add_points') THEN
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
        total_spent = public.user_points_balance.total_spent + (CASE WHEN v_actual_points < 0 THEN ABS(v_actual_points) ELSE 0 END),
        updated_at = NOW();

    RETURN jsonb_build_object(
        'success', true, 
        'points_added', v_actual_points, 
        'new_balance', v_current_total
    );
END;
$$;

-- 2. Add missing configs to points_config
INSERT INTO public.points_config (action_key, points_value, daily_limit, description, is_active)
VALUES 
    ('admin_add_points', 0, NULL, 'Adição manual por administrador', true),
    ('admin_remove_points', 0, NULL, 'Remoção manual por administrador', true)
ON CONFLICT (action_key) DO UPDATE SET
    points_value = EXCLUDED.points_value,
    is_active = EXCLUDED.is_active,
    description = EXCLUDED.description;
