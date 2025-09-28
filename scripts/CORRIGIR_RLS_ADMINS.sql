-- =============================================
-- CORRIGIR POLÍTICAS RLS PARA TABELA ADMINS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Admins can view admins table" ON admins;
DROP POLICY IF EXISTS "Admins can insert admins" ON admins;
DROP POLICY IF EXISTS "Admins can update admins" ON admins;
DROP POLICY IF EXISTS "Admins can delete admins" ON admins;

-- 2. CRIAR POLÍTICAS MAIS PERMISSIVAS (TEMPORÁRIAS)
-- Política para permitir que usuários vejam se são admin
CREATE POLICY "Users can check if they are admin" ON admins
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir inserção de admins (temporária)
CREATE POLICY "Allow admin creation" ON admins
  FOR INSERT WITH CHECK (true);

-- Política para permitir atualização de admins
CREATE POLICY "Allow admin updates" ON admins
  FOR UPDATE USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.user_id = auth.uid() 
    AND admins.is_active = true
  ));

-- 3. VERIFICAR POLÍTICAS CRIADAS
SELECT 
  'Políticas RLS corrigidas!' as status,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'admins'
ORDER BY policyname;

-- 4. TESTAR ACESSO
SELECT 
  'Teste de acesso:' as info,
  auth.uid() as current_user,
  (SELECT COUNT(*) FROM admins WHERE user_id = auth.uid()) as user_admin_count,
  (SELECT COUNT(*) FROM admins) as total_admins;
