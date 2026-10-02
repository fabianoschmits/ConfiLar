BEGIN READ ONLY;
SELECT p.oid::regprocedure::text AS function, p.prosecdef AS definer, p.proconfig AS config,
 has_function_privilege('anon',p.oid,'execute') AS anon_execute,
 has_function_privilege('authenticated',p.oid,'execute') AS authenticated_execute
FROM pg_proc p JOIN pg_namespace n ON p.pronamespace=n.oid
WHERE n.nspname='public' AND p.prosecdef ORDER BY p.proname;
ROLLBACK;
