BEGIN;
CREATE OR REPLACE FUNCTION public.purge_mobile_telemetry() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE removed integer;
BEGIN
 DELETE FROM public.mobile_telemetry WHERE created_at < now()-interval '30 days';
 GET DIAGNOSTICS removed=ROW_COUNT;
 RETURN removed;
END;
$$;
REVOKE ALL ON FUNCTION public.purge_mobile_telemetry() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.purge_mobile_telemetry() TO service_role;
DO $$
BEGIN
 IF EXISTS(SELECT 1 FROM pg_extension WHERE extname='pg_cron') THEN
  PERFORM cron.schedule('confilar-mobile-metrics-retention','17 3 * * *','select public.purge_mobile_telemetry();');
 END IF;
END;
$$;
COMMIT;
