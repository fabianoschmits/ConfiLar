-- =============================================
-- SCRIPT SIMPLES PARA TESTAR O SISTEMA
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. VERIFICAR SE AS TABELAS FORAM CRIADAS
SELECT 
  'Verificando tabelas...' as status,
  (SELECT COUNT(*) FROM admins) as total_admins,
  (SELECT COUNT(*) FROM reports) as total_reports;

-- 2. VERIFICAR SE AS FUNÇÕES EXISTEM
SELECT 
  'Verificando funções...' as status,
  is_admin() as is_current_user_admin,
  is_super_admin() as is_current_user_super_admin;

-- 3. VERIFICAR POLÍTICAS RLS
SELECT 
  'Políticas RLS ativas:' as status,
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE tablename IN ('admins', 'reports')
ORDER BY tablename, policyname;

-- 4. VERIFICAR ÍNDICES
SELECT 
  'Índices criados:' as status,
  indexname,
  tablename
FROM pg_indexes 
WHERE tablename IN ('admins', 'reports')
ORDER BY tablename, indexname;

-- 5. TESTAR INSERÇÃO DE DENÚNCIA (se houver usuários)
-- Descomente para testar:
/*
INSERT INTO reports (type, reason, description, reporter_id, priority) 
VALUES (
  'user', 
  'Teste de sistema', 
  'Esta é uma denúncia de teste para verificar o sistema', 
  (SELECT id FROM auth.users LIMIT 1),
  'low'
);
*/

-- 6. VERIFICAR DENÚNCIAS
SELECT 
  'Denúncias encontradas:' as status,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'pending') as pending
FROM reports;

-- RESULTADO ESPERADO:
-- ✅ Todas as tabelas devem existir
-- ✅ Funções devem retornar false (se você não for admin ainda)
-- ✅ Políticas RLS devem estar ativas
-- ✅ Índices devem estar criados
