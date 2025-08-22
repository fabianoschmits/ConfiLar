-- Script para corrigir RLS e permitir upload de avatares
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar status atual do RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. Desabilitar RLS temporariamente para correção
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON profiles;

-- 4. Criar políticas corretas e permissivas
-- Política para SELECT (ler perfil próprio)
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para INSERT (criar perfil próprio)
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para UPDATE (atualizar perfil próprio)
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para DELETE (deletar perfil próprio)
CREATE POLICY "Users can delete own profile" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- 5. Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Verificar políticas criadas
SELECT 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 7. Testar inserção com usuário autenticado
-- (Execute este comando quando estiver logado como usuário)
-- INSERT INTO profiles (id, email, full_name, user_type, avatar_url, created_at, updated_at)
-- VALUES (auth.uid(), 'teste@avatar.com', 'Teste Avatar', 'client', 'https://exemplo.com/avatar.jpg', NOW(), NOW())
-- ON CONFLICT (id) DO UPDATE SET 
--     avatar_url = EXCLUDED.avatar_url,
--     updated_at = NOW();

-- 8. Verificar se o bucket 'avatars' existe e está configurado
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- 9. Verificar políticas do bucket 'avatars'
SELECT * FROM storage.policies WHERE bucket_id = 'avatars';

-- 10. Criar política para o bucket 'avatars' se não existir
-- Política para permitir upload de arquivos para usuários autenticados
INSERT INTO storage.policies (name, bucket_id, operation, definition, check_definition)
VALUES (
    'Allow authenticated users to upload avatars',
    'avatars',
    'INSERT',
    '(bucket_id = ''avatars''::text)',
    '(bucket_id = ''avatars''::text) AND (auth.role() = ''authenticated''::text)'
) ON CONFLICT DO NOTHING;

-- Política para permitir visualização de arquivos públicos
INSERT INTO storage.policies (name, bucket_id, operation, definition, check_definition)
VALUES (
    'Allow public access to avatars',
    'avatars',
    'SELECT',
    '(bucket_id = ''avatars''::text)',
    '(bucket_id = ''avatars''::text)'
) ON CONFLICT DO NOTHING;

-- 11. Verificar configuração final
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
