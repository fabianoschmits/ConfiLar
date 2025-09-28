-- =============================================
-- TESTE BÁSICO DO SISTEMA DE ADMIN E DENÚNCIAS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. VERIFICAR TABELAS CRIADAS
SELECT 
  'Tabelas criadas:' as info,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'admins') as admins_table,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'reports') as reports_table;

-- 2. VERIFICAR ESTRUTURA DAS TABELAS
SELECT 
  'Estrutura da tabela admins:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'admins'
ORDER BY ordinal_position;

SELECT 
  'Estrutura da tabela reports:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'reports'
ORDER BY ordinal_position;

-- 3. VERIFICAR POLÍTICAS RLS
SELECT 
  'Políticas RLS ativas:' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('admins', 'reports')
ORDER BY tablename, policyname;

-- 4. VERIFICAR FUNÇÕES CRIADAS
SELECT 
  'Funções criadas:' as info,
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name IN ('is_admin', 'is_super_admin')
ORDER BY routine_name;

-- 5. TESTAR FUNÇÃO is_admin (se existir)
SELECT 
  'Teste da função is_admin:' as info,
  is_admin() as is_current_user_admin;

-- 6. VERIFICAR DADOS ATUAIS
SELECT 
  'Dados atuais:' as info,
  (SELECT COUNT(*) FROM admins) as total_admins,
  (SELECT COUNT(*) FROM reports) as total_reports;

-- 7. VERIFICAR SE USUÁRIO ATUAL EXISTE
SELECT 
  'Usuário atual:' as info,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'Usuário logado'
    ELSE 'Usuário não logado'
  END as login_status;

-- 8. TESTE FINAL
SELECT 
  '🎉 Sistema básico funcionando!' as status,
  'Execute ADICIONAR_SEU_ADMIN.sql para adicionar um administrador' as proximo_passo;
