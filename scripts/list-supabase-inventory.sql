-- ==================================================================================
-- INVENTÁRIO COMPLETO DO SCHEMA PUBLIC (TABELAS, VIEWS, RLS, POLÍTICAS, COLUNAS)
-- Execute no Supabase Dashboard > SQL Editor e compartilhe o resultado.
-- Nenhuma alteração é feita; apenas leitura do catálogo.
-- ==================================================================================

-- 1) Tabelas públicas + flag de RLS e contagem de políticas
WITH tbl AS (
  SELECT c.oid,
         n.nspname AS schema,
         c.relname AS table_name,
         c.relrowsecurity AS rls_enabled
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r'
)
SELECT 
  'TABLES' AS section,
  t.schema,
  t.table_name,
  t.rls_enabled,
  COALESCE(p.policy_count, 0) AS policy_count
FROM tbl t
LEFT JOIN (
  SELECT schemaname, tablename, COUNT(*) AS policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  GROUP BY schemaname, tablename
) p
ON p.schemaname = t.schema AND p.tablename = t.table_name
ORDER BY t.table_name;

-- 2) Políticas detalhadas
SELECT 
  'POLICIES' AS section,
  schemaname AS schema,
  tablename AS table_name,
  policyname,
  cmd AS command,
  roles,
  permissive,
  qual AS using_expr,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3) Views públicas (definição)
SELECT 
  'VIEWS' AS section,
  n.nspname AS schema,
  c.relname AS view_name,
  pg_get_viewdef(c.oid, true) AS definition
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('v','m')
ORDER BY view_name;

-- 4) Sinalizar SECURITY DEFINER na definição (heurística)
SELECT 
  'VIEW_SECURITY_SCAN' AS section,
  viewname,
  CASE 
    WHEN definition ILIKE '%SECURITY DEFINER%' THEN 'security_definer_detected'
    ELSE 'no_security_definer_detected'
  END AS security_flag
FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;

-- 5) Colunas das tabelas relevantes (ajuda a validar colunas de dono/relacionamento)
SELECT 
  'COLUMNS' AS section,
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'conversations','messages','classified_ads','reviews',
    'appointments','portfolio_projects','notification_templates',
    'notification_logs','user_recommendations','conversation_participants'
  )
ORDER BY table_name, ordinal_position;


