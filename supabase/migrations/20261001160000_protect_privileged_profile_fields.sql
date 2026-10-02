BEGIN;
CREATE OR REPLACE FUNCTION public.protect_profile_financials() RETURNS trigger
LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
DECLARE key text; old_data jsonb; new_data jsonb;
BEGIN
 -- Trusted functions execute as their owner; normal browser writes do not.
 IF current_user NOT IN ('anon','authenticated') THEN RETURN NEW; END IF;
 IF public.is_admin(auth.uid()) THEN RETURN NEW; END IF;
 new_data := to_jsonb(NEW);
 IF TG_OP='UPDATE' THEN old_data:=to_jsonb(OLD); ELSE old_data:='{}'::jsonb; END IF;
 FOREACH key IN ARRAY ARRAY['points_balance','daily_points_earned','total_points_earned','total_points_spent','credits_ad_premium_1d','credits_ad_premium_7d','is_pro','pro_expires_at','is_verified'] LOOP
   IF NOT new_data ? key THEN CONTINUE; END IF;
   IF TG_OP='UPDATE' AND new_data->key IS DISTINCT FROM old_data->key THEN
     RAISE EXCEPTION 'Protected profile field: %',key USING ERRCODE='42501';
   ELSIF TG_OP='INSERT' AND coalesce(new_data->>key,'') NOT IN ('','0','false') THEN
     RAISE EXCEPTION 'Protected initial profile field: %',key USING ERRCODE='42501';
   END IF;
 END LOOP;
 IF new_data->>'verification_status'='approved' AND (TG_OP='INSERT' OR old_data->>'verification_status' IS DISTINCT FROM 'approved') THEN
   RAISE EXCEPTION 'Verification approval is administrator-only' USING ERRCODE='42501';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS enforce_profile_financials_readonly ON public.profiles;
CREATE TRIGGER enforce_profile_financials_readonly BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_financials();
REVOKE EXECUTE ON FUNCTION public.protect_profile_financials() FROM PUBLIC,anon,authenticated;
-- Help telemetry may be anonymous, but cannot impersonate another account.
DROP POLICY IF EXISTS "Anyone can log help interactions" ON public.help_logs;
DROP POLICY IF EXISTS "Log own or anonymous help interaction" ON public.help_logs;
CREATE POLICY "Log own or anonymous help interaction" ON public.help_logs FOR INSERT TO anon,authenticated
  WITH CHECK ((auth.uid() IS NULL AND user_id IS NULL) OR auth.uid()=user_id);
DROP POLICY IF EXISTS "Users can read their own help logs" ON public.help_logs;
DROP POLICY IF EXISTS "Read own help interactions" ON public.help_logs;
CREATE POLICY "Read own help interactions" ON public.help_logs FOR SELECT TO authenticated USING(auth.uid()=user_id);
NOTIFY pgrst,'reload schema';
COMMIT;
