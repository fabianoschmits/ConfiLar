-- =====================================================
-- CORRIGIR POLÍTICAS RLS DA TABELA USER_ACTIVITY
-- Execute este script no Supabase Dashboard > SQL Editor
-- =====================================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view their own activity" ON user_activity;
DROP POLICY IF EXISTS "Users can update their own activity" ON user_activity;
DROP POLICY IF EXISTS "Users can insert their own activity" ON user_activity;

-- Criar nova política para permitir leitura pública (necessário para status online)
CREATE POLICY "Anyone can view user activity" ON user_activity
  FOR SELECT USING (true);

-- Política para usuários atualizarem apenas sua própria atividade
CREATE POLICY "Users can update their own activity" ON user_activity
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários inserirem apenas sua própria atividade
CREATE POLICY "Users can insert their own activity" ON user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários deletarem apenas sua própria atividade
CREATE POLICY "Users can delete their own activity" ON user_activity
  FOR DELETE USING (auth.uid() = user_id);

-- Verificar se as políticas foram criadas
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'user_activity';

-- Testar consulta pública
SELECT 
  user_id,
  status,
  is_online,
  last_activity,
  created_at
FROM user_activity 
LIMIT 5;
