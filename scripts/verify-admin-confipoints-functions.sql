-- ============================================
-- VERIFICAR SE AS FUNÇÕES RPC DE ADMIN EXISTEM
-- ============================================

-- Verificar se as funções existem
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_admin_confipoints_stats',
    'get_admin_confipoints_users',
    'get_admin_confipoints_transactions',
    'get_admin_confipoints_by_source'
  )
ORDER BY routine_name;

-- Verificar permissões das funções
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  r.rolname as granted_to
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
LEFT JOIN pg_proc_acl pca ON p.oid = pca.prooid
LEFT JOIN pg_roles r ON pca.prorole = r.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'get_admin_confipoints_stats',
    'get_admin_confipoints_users',
    'get_admin_confipoints_transactions',
    'get_admin_confipoints_by_source'
  )
ORDER BY p.proname;

