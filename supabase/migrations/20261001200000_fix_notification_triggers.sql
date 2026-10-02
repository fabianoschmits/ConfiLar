BEGIN;
-- Triggers are reached after the original write's ownership policy has passed.
ALTER FUNCTION public.send_notification_email() SECURITY DEFINER;
ALTER FUNCTION public.send_notification_email() SET search_path=public,pg_temp;
ALTER FUNCTION public.notify_new_classified_ad() SECURITY DEFINER;
ALTER FUNCTION public.notify_new_classified_ad() SET search_path=public,pg_temp;
DO $$ DECLARE ddl text; BEGIN
 ddl:=pg_get_functiondef('public.notify_new_classified_ad()'::regprocedure);
 ddl:=replace(ddl,'''/classificados/'' || NEW.id','''/classificados?ad='' || NEW.id');
 ddl:=replace(ddl,'AND up.preference_value = NEW.category','AND up.preference_value = NEW.category AND up.is_enabled = true');
 EXECUTE ddl;
END $$;
REVOKE EXECUTE ON FUNCTION public.send_notification_email(),public.notify_new_classified_ad() FROM PUBLIC,anon,authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
