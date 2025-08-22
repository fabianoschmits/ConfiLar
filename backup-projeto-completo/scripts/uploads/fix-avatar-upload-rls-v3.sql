-- Script para corrigir RLS e permitir upload de avatares (Versão 3)
-- Execute este script no SQL Editor do Supabase
-- Foco: Corrigir políticas RLS da tabela profiles

-- 1. Verificar status atual do RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. Desabilitar RLS temporariamente para correção
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Remover TODAS as políticas antigas da tabela profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON profiles;
DROP POLICY IF EXISTS "profiles_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- 4. Criar políticas corretas e permissivas
-- Política para SELECT (ler perfil próprio)
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para INSERT (criar perfil próprio)
CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para UPDATE (atualizar perfil próprio)
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para DELETE (deletar perfil próprio)
CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- 5. Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Verificar políticas criadas
SELECT 
    policyname, 
    permissive, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 7. Verificar se o bucket 'avatars' existe
SELECT 
    id, 
    name, 
    public 
FROM storage.buckets 
WHERE id = 'avatars';

-- 8. Verificar configuração final
SELECT 
    'RLS Status' as info,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_tables 
WHERE tablename = 'profiles'

UNION ALL

SELECT 
    'Policies Count' as info,
    COUNT(*)::text as status
FROM pg_policies 
WHERE tablename = 'profiles'

UNION ALL

SELECT 
    'Storage Bucket' as info,
    CASE WHEN COUNT(*) > 0 THEN 'EXISTS' ELSE 'MISSING' END as status
FROM storage.buckets 
WHERE id = 'avatars';

-- 9. Teste de inserção (descomente para testar quando estiver logado)
-- INSERT INTO profiles (id, email, full_name, user_type, avatar_url, created_at, updated_at)
-- VALUES (auth.uid(), 'teste@avatar.com', 'Teste Avatar', 'client', 'https://exemplo.com/avatar.jpg', NOW(), NOW())
-- ON CONFLICT (id) DO UPDATE SET 
--     avatar_url = EXCLUDED.avatar_url,
--     updated_at = NOW();
