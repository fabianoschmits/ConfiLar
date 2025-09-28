-- =============================================
-- CORRIGIR CONSTRAINT UNIQUE NA TABELA ADMINS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. ADICIONAR CONSTRAINT UNIQUE NO user_id
ALTER TABLE admins 
ADD CONSTRAINT unique_admin_user_id UNIQUE (user_id);

-- 2. VERIFICAR CONSTRAINT CRIADA
SELECT 
  'Constraint criada!' as status,
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'admins' 
AND constraint_type = 'UNIQUE';

-- 3. AGORA ADICIONAR ADMIN (substitua pelo ID do seu usuário)
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

-- 4. VERIFICAR SE FOI ADICIONADO
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

-- 5. TESTAR FUNÇÕES
SELECT 
  'Teste final:' as info,
  is_admin('F7444305-A3BD-4D71-874A-BB95FD27F96A') as is_admin,
  is_super_admin('F7444305-A3BD-4D71-874A-BB95FD27F96A') as is_super_admin;
