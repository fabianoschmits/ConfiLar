-- =============================================
-- SCRIPT PARA CRIAR O PRIMEIRO ADMINISTRADOR
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- PASSO 1: Encontrar seu user_id pelo email
-- Substitua 'seu-email@exemplo.com' pelo seu email real
SELECT 
  'Encontrado user_id:' as status,
  id as user_id,
  email,
  created_at
FROM auth.users 
WHERE email = 'seu-email@exemplo.com';

-- PASSO 2: Após encontrar o user_id, execute este comando:
-- (Substitua 'SEU_USER_ID_AQUI' pelo ID retornado acima)
/*
INSERT INTO admins (user_id, role, permissions, is_active) 
VALUES (
  'SEU_USER_ID_AQUI', 
  'super_admin', 
  '{"view_reports": true, "manage_reports": true, "view_analytics": true, "manage_users": true, "system_settings": true}',
  true
);
*/

-- PASSO 3: Verificar se foi criado corretamente
/*
SELECT 
  'Administrador criado com sucesso!' as status,
  a.id as admin_id,
  a.user_id,
  a.role,
  a.is_active,
  u.email,
  p.full_name
FROM admins a
JOIN auth.users u ON a.user_id = u.id
LEFT JOIN profiles p ON a.user_id = p.id
WHERE u.email = 'seu-email@exemplo.com';
*/

-- PASSO 4: Testar se você tem acesso de admin
/*
SELECT 
  'Teste de acesso:' as status,
  is_admin() as is_admin,
  is_super_admin() as is_super_admin;
*/
