BEGIN;
-- Debit/add_points use profiles.points_balance. Legacy prechecks must read the same wallet.
-- Preserve historical balances and transaction records; do not reconcile money silently.
DO $$
DECLARE definition text;
BEGIN
 definition := pg_get_functiondef('public.transfer_points(uuid,uuid,integer,text)'::regprocedure);
 definition := replace(definition,
  'SELECT balance INTO v_from_balance FROM public.user_points_balance WHERE user_id = p_from_user_id FOR UPDATE;',
  'SELECT points_balance INTO v_from_balance FROM public.profiles WHERE id = p_from_user_id FOR UPDATE;');
 definition := replace(definition,
  'SELECT points_balance INTO v_from_balance FROM public.profiles WHERE id = p_from_user_id FOR UPDATE;',
  E'PERFORM id FROM public.profiles WHERE id IN (p_from_user_id,p_to_user_id) ORDER BY id FOR UPDATE;\n    SELECT points_balance INTO v_from_balance FROM public.profiles WHERE id = p_from_user_id;');
 EXECUTE definition;
 definition := pg_get_functiondef('public.purchase_store_item(uuid,uuid)'::regprocedure);
 definition := replace(definition,
  'SELECT balance INTO v_balance FROM public.user_points_balance WHERE user_id = p_user_id;',
  'SELECT points_balance INTO v_balance FROM public.profiles WHERE id = p_user_id FOR UPDATE;');
 definition := replace(definition, E'        created_at,\n        expires_at', E'        purchased_at,\n        expires_at');
 EXECUTE definition;
END;
$$;
ALTER FUNCTION public.transfer_points(uuid,uuid,integer,text) SET search_path=public,pg_temp;
ALTER FUNCTION public.purchase_store_item(uuid,uuid) SET search_path=public,pg_temp;
REVOKE ALL ON FUNCTION public.transfer_points(uuid,uuid,integer,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.purchase_store_item(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.transfer_points(uuid,uuid,integer,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.purchase_store_item(uuid,uuid) TO service_role;
COMMIT;
