-- =============================================
-- SCRIPT PARA CRIAR SISTEMA DE ADMINISTRADORES
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Criar tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions JSONB DEFAULT '{"view_reports": true, "manage_reports": true, "view_analytics": true, "manage_users": true}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Admins can view admins table" ON admins;
DROP POLICY IF EXISTS "Admins can insert admins" ON admins;
DROP POLICY IF EXISTS "Admins can update admins" ON admins;

-- 5. Criar políticas RLS para administradores
-- Política para administradores verem a tabela de admins
CREATE POLICY "Admins can view admins table" ON admins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- Política para super admins inserirem novos administradores
CREATE POLICY "Super admins can insert admins" ON admins
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.role = 'super_admin'
      AND admins.is_active = true
    )
  );

-- Política para super admins atualizarem administradores
CREATE POLICY "Super admins can update admins" ON admins
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.role = 'super_admin'
      AND admins.is_active = true
    )
  );

-- 6. Função para verificar se usuário é administrador
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.user_id = user_id 
    AND admins.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Função para verificar se usuário é super administrador
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.user_id = user_id 
    AND admins.role = 'super_admin'
    AND admins.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para adicionar administrador (apenas super admins)
CREATE OR REPLACE FUNCTION add_admin(admin_user_id UUID, admin_role VARCHAR DEFAULT 'admin')
RETURNS UUID AS $$
DECLARE
  new_admin_id UUID;
BEGIN
  -- Verificar se quem está chamando é super admin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Apenas super administradores podem adicionar novos administradores';
  END IF;
  
  -- Verificar se o usuário já é administrador
  IF is_admin(admin_user_id) THEN
    RAISE EXCEPTION 'Usuário já é administrador';
  END IF;
  
  INSERT INTO admins (user_id, role, created_by)
  VALUES (admin_user_id, admin_role, auth.uid())
  RETURNING id INTO new_admin_id;
  
  RETURN new_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Função para remover administrador (apenas super admins)
CREATE OR REPLACE FUNCTION remove_admin(admin_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se quem está chamando é super admin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Apenas super administradores podem remover administradores';
  END IF;
  
  -- Não permitir remover a si mesmo
  IF admin_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Não é possível remover a si mesmo';
  END IF;
  
  UPDATE admins 
  SET is_active = false 
  WHERE user_id = admin_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Comentários para documentação
COMMENT ON TABLE admins IS 'Tabela para armazenar administradores do sistema';
COMMENT ON COLUMN admins.user_id IS 'ID do usuário que é administrador';
COMMENT ON COLUMN admins.role IS 'Papel do administrador: admin, super_admin';
COMMENT ON COLUMN admins.permissions IS 'Permissões específicas do administrador em formato JSON';
COMMENT ON COLUMN admins.is_active IS 'Se o administrador está ativo';
COMMENT ON COLUMN admins.created_by IS 'Quem criou este administrador';

-- 11. Verificar se tudo foi criado corretamente
SELECT 
  'Sistema de administradores criado com sucesso!' as status,
  COUNT(*) as total_admins
FROM admins;

-- 12. Instruções para uso:
-- 
-- Para adicionar o primeiro super administrador (execute como superuser):
-- INSERT INTO admins (user_id, role, permissions, is_active) 
-- VALUES ('SEU_USER_ID_AQUI', 'super_admin', '{"view_reports": true, "manage_reports": true, "view_analytics": true, "manage_users": true}', true);
--
-- Para adicionar outros administradores (execute como super admin):
-- SELECT add_admin('USER_ID_AQUI', 'admin');
--
-- Para verificar se um usuário é administrador:
-- SELECT is_admin('USER_ID_AQUI');
--
-- Para verificar se um usuário é super administrador:
-- SELECT is_super_admin('USER_ID_AQUI');
