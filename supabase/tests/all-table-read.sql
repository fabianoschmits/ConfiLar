BEGIN;
SET LOCAL statement_timeout='45s';
CREATE TEMP TABLE read_results (role_name text, table_name text, outcome text);
DO $$ DECLARE r record; uid uuid; role_name text; outcome text; BEGIN
 SELECT p.id INTO uid FROM public.profiles p WHERE NOT EXISTS(SELECT 1 FROM public.admins a WHERE a.user_id=p.id) LIMIT 1;
 FOREACH role_name IN ARRAY ARRAY['anon','authenticated'] LOOP
  PERFORM set_config('request.jwt.claim.sub',CASE WHEN role_name='authenticated' THEN uid::text ELSE '' END,true);
  PERFORM set_config('request.jwt.claims',jsonb_build_object('role',role_name,'sub',CASE WHEN role_name='authenticated' THEN uid::text ELSE null END)::text,true);
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname='public' LOOP
    BEGIN
      EXECUTE format('SET LOCAL ROLE %I',role_name);
      EXECUTE format('SELECT 1 FROM public.%I LIMIT 1',r.tablename);
      outcome:='read query valid';
    EXCEPTION WHEN insufficient_privilege THEN outcome:='permission denied';
      WHEN OTHERS THEN outcome:=SQLSTATE || ': ' || SQLERRM;
    END;
    EXECUTE 'RESET ROLE';
    INSERT INTO read_results VALUES(role_name,r.tablename,outcome);
  END LOOP;
 END LOOP;
END $$;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM read_results WHERE outcome<>'read query valid' AND NOT
  (role_name='anon' AND outcome='permission denied' AND table_name IN('notifications','profile_private_details'))) THEN
  RAISE EXCEPTION 'Unexpected table read/RLS failure';
 END IF;
END $$;
SELECT role_name,outcome,count(*) AS tables FROM read_results GROUP BY role_name,outcome ORDER BY role_name,outcome;
ROLLBACK;
