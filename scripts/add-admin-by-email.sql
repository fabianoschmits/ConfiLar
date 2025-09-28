-- =============================================
-- SCRIPT PARA ADICIONAR ADMINISTRADOR POR EMAIL
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- IMPORTANTE: Substitua 'SEU_EMAIL_AQUI' pelo email da conta que será administrador

-- 1. Primeiro, vamos encontrar o user_id pelo email
-- (Execute esta query para encontrar o ID do usuário)
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users 
WHERE email = 'SEU_EMAIL_AQUI';

-- 2. Depois de encontrar o user_id, execute este comando:
-- (Substitua 'USER_ID_ENCONTRADO' pelo ID retornado na query acima)
INSERT INTO admins (user_id, role, permissions, is_active) 
VALUES (
  'USER_ID_ENCONTRADO', 
  'super_admin', 
  '{"view_reports": true, "manage_reports": true, "view_analytics": true, "manage_users": true, "system_settings": true}',
  true
);

-- 3. Verificar se o administrador foi criado
SELECT 
  a.id,
  a.user_id,
  a.role,
  a.is_active,
  a.created_at,
  u.email,
  p.full_name
FROM admins a
JOIN auth.users u ON a.user_id = u.id
LEFT JOIN profiles p ON a.user_id = p.id
WHERE u.email = 'SEU_EMAIL_AQUI';

-- 4. Testar se a função is_admin funciona
SELECT is_admin() as is_current_user_admin;

-- INSTRUÇÕES:
-- 1. Substitua 'SEU_EMAIL_AQUI' pelo seu email em todas as ocorrências
-- 2. Execute a primeira query para encontrar seu user_id
-- 3. Copie o user_id retornado
-- 4. Substitua 'USER_ID_ENCONTRADO' pelo ID copiado
-- 5. Execute o INSERT
-- 6. Execute as queries de verificação
