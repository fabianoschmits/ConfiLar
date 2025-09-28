-- =============================================
-- ADICIONAR ADMIN DIRETAMENTE PELO ID DO USUÁRIO
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. VERIFICAR USUÁRIOS EXISTENTES
SELECT 
  'Usuários existentes:' as info,
  id,
  email,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. ADICIONAR ADMIN DIRETAMENTE (substitua o ID pelo seu usuário)
-- Pegue o ID do usuário da consulta acima e use aqui:
INSERT INTO admins (user_id, role, is_active, created_at)
VALUES (
  'F7444305-A3BD-4D71-874A-BB95FD27F96A', -- Substitua pelo ID do seu usuário
  'super_admin',
  true,
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin',
  is_active = true,
  created_at = NOW();

-- 3. VERIFICAR SE FOI ADICIONADO
SELECT 
  'Admin adicionado!' as status,
  a.id,
  a.user_id,
  a.role,
  a.is_active,
  u.email
FROM admins a
LEFT JOIN auth.users u ON a.user_id = u.id
WHERE a.user_id = 'F7444305-A3BD-4D71-874A-BB95FD27F96A';

-- 4. TESTAR FUNÇÕES
SELECT 
  'Teste final:' as info,
  is_admin('F7444305-A3BD-4D71-874A-BB95FD27F96A') as is_admin,
  is_super_admin('F7444305-A3BD-4D71-874A-BB95FD27F96A') as is_super_admin;
