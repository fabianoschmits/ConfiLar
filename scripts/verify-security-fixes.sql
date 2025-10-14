-- =====================================================
-- VERIFICAÇÃO COMPLETA DOS PROBLEMAS DE SEGURANÇA
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

-- =====================================================
-- PARTE 1: VERIFICAR RLS HABILITADO
-- =====================================================

SELECT 
  'TABELAS COM RLS HABILITADO:' as status,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'conversations', 'messages', 'notification_templates', 
  'conversation_participants', 'classified_ads', 'notification_logs',
  'user_recommendations', 'appointments', 'reviews', 'portfolio_projects'
)
ORDER BY tablename;

-- =====================================================
-- PARTE 2: VERIFICAR POLÍTICAS RLS CRIADAS
-- =====================================================

SELECT 
  'POLÍTICAS RLS CRIADAS:' as status,
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  permissive,
  roles
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
  'conversations', 'messages', 'notification_templates', 
  'conversation_participants', 'classified_ads', 'notification_logs',
  'user_recommendations', 'appointments', 'reviews', 'portfolio_projects'
)
ORDER BY tablename, policyname;

-- =====================================================
-- PARTE 3: VERIFICAR VIEWS SECURITY DEFINER
-- =====================================================

SELECT 
  'VIEWS SEM SECURITY DEFINER:' as status,
  schemaname,
  viewname,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN '❌ AINDA TEM SECURITY DEFINER'
    ELSE '✅ SEM SECURITY DEFINER'
  END as security_status
FROM pg_views 
WHERE schemaname = 'public'
AND viewname IN ('active_bans_view', 'profile_view_statistics');

-- =====================================================
-- PARTE 4: CONTAR PROBLEMAS RESTANTES
-- =====================================================

-- Contar tabelas sem RLS
SELECT 
  'TABELAS SEM RLS:' as status,
  COUNT(*) as count
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'conversations', 'messages', 'notification_templates', 
  'conversation_participants', 'classified_ads', 'notification_logs',
  'user_recommendations', 'appointments', 'reviews', 'portfolio_projects'
)
AND rowsecurity = false;

-- Contar views com SECURITY DEFINER
SELECT 
  'VIEWS COM SECURITY DEFINER:' as status,
  COUNT(*) as count
FROM pg_views 
WHERE schemaname = 'public'
AND definition LIKE '%SECURITY DEFINER%';

-- =====================================================
-- PARTE 5: RESUMO FINAL
-- =====================================================

SELECT 
  'RESUMO DA CORREÇÃO:' as status,
  'Execute os scripts fix-all-rls-security-issues.sql e fix-security-definer-views.sql' as instrucao,
  'Verifique se todos os problemas foram resolvidos' as proximo_passo;

-- =====================================================
-- VERIFICAÇÃO COMPLETA REALIZADA!
-- =====================================================



