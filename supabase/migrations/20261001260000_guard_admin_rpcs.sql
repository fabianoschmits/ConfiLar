BEGIN;
-- SECURITY DEFINER bypasses table RLS: authorization is required inside each RPC.
DO $$ DECLARE f record; definition text; BEGIN
 FOR f IN SELECT oid,oid::regprocedure signature,proname FROM pg_proc
 WHERE pronamespace='public'::regnamespace AND proname IN(
  'ban_user','unban_user','approve_pending_ban','reject_pending_ban','create_pending_ban_from_report',
  'get_admin_confipoints_by_source','get_admin_confipoints_transactions') LOOP
  definition := pg_get_functiondef(f.oid);
  definition := replace(definition,'v_current_user IS NULL OR v_current_user != v_admin_id','NOT coalesce(public.is_admin(auth.uid()),false)');
  definition := replace(definition, 'type = ''earn''', 'amount > 0');
  definition := replace(definition, 'type = ''spend''', 'amount < 0');
  IF position('Admin RPC requires administrator' IN definition)=0 THEN
   definition := regexp_replace(definition,'BEGIN', E'BEGIN\n IF coalesce(auth.role(),'''') <> ''service_role'' AND NOT coalesce(public.is_admin(auth.uid()),false) THEN\n RAISE EXCEPTION ''Admin RPC requires administrator'' USING ERRCODE=''42501'';\n END IF;');
  END IF;
  EXECUTE definition;
  EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC,anon',f.signature);
  EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated,service_role',f.signature);
 END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.get_database_size() RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$ BEGIN
 IF NOT coalesce(public.is_admin(auth.uid()),false) AND coalesce(auth.role(),'')<>'service_role' THEN
  RAISE EXCEPTION 'Admin RPC requires administrator' USING ERRCODE='42501';
 END IF;
 RETURN pg_size_pretty(pg_database_size(current_database()));
END $$;
REVOKE ALL ON FUNCTION public.get_database_size() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_database_size() TO authenticated,service_role;

DO $$ DECLARE definition text; BEGIN
 definition := pg_get_functiondef('public.create_system_log(character varying,character varying,character varying,text,jsonb,uuid,inet,text,character varying,integer)'::regprocedure);
 IF position('client_reported' IN definition)=0 THEN
  definition := regexp_replace(definition,'BEGIN', E'BEGIN\n IF coalesce(auth.role(),'''') <> ''service_role'' AND NOT coalesce(public.is_admin(auth.uid()),false) THEN\n p_user_id := auth.uid();\n p_category := CASE WHEN p_category=''auth'' THEN ''auth'' ELSE ''users'' END;\n p_message := left(p_message,2000); p_action := left(p_action,120);\n p_details := coalesce(p_details,''{}''::jsonb) || jsonb_build_object(''client_reported'',true);\n IF octet_length(p_details::text)>8192 THEN RAISE EXCEPTION ''Log details too large''; END IF;\n PERFORM pg_advisory_xact_lock(hashtextextended(''logs:''||coalesce(auth.uid()::text,''anonymous''),0));\n IF (SELECT count(*) FROM public.system_logs WHERE user_id IS NOT DISTINCT FROM auth.uid() AND created_at>now()-interval ''1 minute'')>=60 THEN RAISE EXCEPTION ''Log rate limit exceeded''; END IF;\n END IF;');
  EXECUTE definition;
 END IF;
END $$;
COMMIT;
