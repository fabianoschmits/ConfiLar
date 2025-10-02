-- =====================================================
-- CORRIGIR RLS DA TABELA USER_ACTIVITY
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- O erro 406 geralmente indica problema com RLS ou Accept header

-- 1. Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_activity'
) as table_exists;

-- 2. Verificar RLS atual
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_activity';

-- 3. Remover políticas antigas que podem estar causando problema
DROP POLICY IF EXISTS "Users can view their own activity" ON user_activity;
DROP POLICY IF EXISTS "Users can update their own activity" ON user_activity;
DROP POLICY IF EXISTS "Users can insert their own activity" ON user_activity;
DROP POLICY IF EXISTS "Users can delete their own activity" ON user_activity;
DROP POLICY IF EXISTS "Anyone can view user activity" ON user_activity;

-- 4. Criar políticas corretas
-- Política para leitura pública (necessário para status online de outros usuários)
CREATE POLICY "Enable read access for all users" ON user_activity
  FOR SELECT 
  USING (true);

-- Política para inserção (apenas próprio usuário)
CREATE POLICY "Enable insert for authenticated users only" ON user_activity
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para atualização (apenas próprio usuário)
CREATE POLICY "Enable update for users based on user_id" ON user_activity
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para deleção (apenas próprio usuário)
CREATE POLICY "Enable delete for users based on user_id" ON user_activity
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 5. Garantir que RLS está habilitado
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- 6. Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_activity'
ORDER BY cmd;

-- 7. Teste de consulta
-- Isso deve funcionar agora:
SELECT user_id, status, is_online, last_activity 
FROM user_activity 
LIMIT 5;