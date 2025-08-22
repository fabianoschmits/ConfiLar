-- Script para LIMPAR COMPLETAMENTE todas as políticas da tabela profiles
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar TODAS as políticas existentes
SELECT 
    policyname, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 2. Desabilitar RLS temporariamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Remover TODAS as políticas (incluindo as que não sabemos o nome)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Loop através de todas as políticas da tabela profiles
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON profiles';
        RAISE NOTICE 'Política removida: %', policy_record.policyname;
    END LOOP;
END $$;

-- 4. Verificar se todas as políticas foram removidas
SELECT 
    'Políticas restantes' as info,
    COUNT(*)::text as count
FROM pg_policies 
WHERE tablename = 'profiles';

-- 5. Criar APENAS as 4 políticas essenciais
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

-- 6. Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Verificar configuração final
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

-- 8. Listar políticas criadas
SELECT 
    policyname, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
