-- =============================================
-- CORRIGIR FUNÇÃO is_admin - RESOLVER AMBIGUIDADE
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. REMOVER FUNÇÃO PROBLEMÁTICA
DROP FUNCTION IF EXISTS is_admin(UUID);

-- 2. CRIAR FUNÇÃO CORRIGIDA
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.user_id = check_user_id 
    AND admins.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CRIAR FUNÇÃO is_super_admin TAMBÉM
CREATE OR REPLACE FUNCTION is_super_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.user_id = check_user_id 
    AND admins.role = 'super_admin'
    AND admins.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. TESTAR FUNÇÕES
SELECT 
  'Funções corrigidas!' as status,
  is_admin() as is_current_user_admin,
  is_super_admin() as is_current_user_super_admin;
