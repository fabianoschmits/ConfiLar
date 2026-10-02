BEGIN;
DO $$ DECLARE ddl text; BEGIN
 ddl:=pg_get_functiondef('public.approve_points_purchase(uuid)'::regprocedure);
 ddl:=replace(ddl,'WHERE pp.id = p_purchase_id;','WHERE pp.id = p_purchase_id FOR UPDATE OF pp;');
 EXECUTE ddl;
 ddl:=pg_get_functiondef('public.admin_refund_purchase(uuid,text,boolean)'::regprocedure);
 ddl:=replace(ddl,'WHERE id = p_purchase_id AND status = ''approved'';','WHERE id = p_purchase_id AND status = ''approved'' FOR UPDATE;');
 EXECUTE ddl;
 ddl:=pg_get_functiondef('public.get_admin_confipoints_stats()'::regprocedure);
 ddl:=replace(ddl,'v_current_user IS NULL OR v_current_user != v_admin_id','v_current_user IS NULL OR NOT public.is_admin(v_current_user)');
 ddl:=replace(ddl,'type = ''earn''','amount > 0');
 ddl:=replace(ddl,'type = ''spend''','amount < 0');
 EXECUTE ddl;
END $$;
CREATE OR REPLACE FUNCTION public.decrement_credit_count(p_user_id uuid,p_field text,p_amount integer DEFAULT 1)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE affected integer;
BEGIN
 IF p_field NOT IN ('credits_ad_premium_1d','credits_ad_premium_7d') OR p_amount IS NULL OR p_amount<=0 THEN
  RETURN jsonb_build_object('success',false,'error','Crédito ou quantidade inválida');
 END IF;
 EXECUTE format('UPDATE public.profiles SET %I=coalesce(%I,0)-$1 WHERE id=$2 AND coalesce(%I,0)>=$1',p_field,p_field,p_field) USING p_amount,p_user_id;
 GET DIAGNOSTICS affected=ROW_COUNT;
 RETURN jsonb_build_object('success',affected=1,'error',CASE WHEN affected=0 THEN 'Créditos insuficientes' ELSE null END);
END $$;
REVOKE EXECUTE ON FUNCTION public.decrement_credit_count(uuid,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_credit_count(uuid,text,integer) TO service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
