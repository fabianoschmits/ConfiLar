-- ============================================
-- VERIFICAR TRIGGERS DE CRIAÇÃO DE USUÁRIO
-- ============================================

-- 1. Verificar se há trigger para criar perfil automaticamente
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'auth.users' 
  OR trigger_name LIKE '%profile%'
  OR trigger_name LIKE '%user%'
ORDER BY trigger_name;

-- 2. Verificar se há função que cria perfil
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%profile%' 
  OR routine_name LIKE '%user%'
  OR routine_definition LIKE '%profiles%'
ORDER BY routine_name;

-- 3. Verificar estrutura da tabela profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar se há política RLS que permite inserção
SELECT 
  policyname,
  cmd,
  permissive,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
