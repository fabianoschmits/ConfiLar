BEGIN READ ONLY;
SELECT jsonb_build_object(
  'tables', (SELECT jsonb_agg(jsonb_build_object('name', tablename, 'rls', rowsecurity)) FROM pg_tables WHERE schemaname = 'public'),
  'unrestricted_write_policies', (SELECT jsonb_agg(jsonb_build_object('table', tablename, 'name', policyname, 'roles', roles, 'command', cmd, 'using', qual, 'check', with_check)) FROM pg_policies WHERE schemaname IN ('public','storage') AND cmd <> 'SELECT' AND (qual = 'true' OR with_check = 'true')),
  'views', (SELECT jsonb_agg(jsonb_build_object('name', c.relname, 'options', c.reloptions)) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'v'),
  'definer_functions_without_search_path', (SELECT jsonb_agg(p.proname) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.prosecdef AND NOT EXISTS (SELECT 1 FROM unnest(p.proconfig) v WHERE v LIKE 'search_path=%')),
  'policies', (SELECT jsonb_agg(jsonb_build_object('table', tablename, 'name', policyname, 'roles', roles, 'command', cmd, 'using', qual, 'check', with_check)) FROM pg_policies WHERE schemaname='public')
) AS audit;
ROLLBACK;
