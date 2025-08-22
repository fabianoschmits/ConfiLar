-- Verificação rápida das tabelas
-- Execute no SQL Editor do Supabase

-- 1. Verificar se as tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'conversation_participants', 'messages', 'profiles');

-- 2. Verificar estrutura básica
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'conversation_participants', 'messages', 'profiles')
ORDER BY table_name, ordinal_position;

-- 3. Verificar se RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'profiles');

-- 4. Verificar políticas existentes
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'profiles');
