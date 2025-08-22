-- Script para INVESTIGAR todas as tabelas com RLS ativo
-- Execute este script no SQL Editor do Supabase
-- Objetivo: Encontrar onde está o erro de RLS

-- 1. Verificar TODAS as tabelas com RLS ativo
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS ATIVO'
        ELSE 'RLS INATIVO'
    END as status
FROM pg_tables 
WHERE rowsecurity = true
ORDER BY schemaname, tablename;

-- 2. Verificar políticas de TODAS as tabelas com RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN (
    SELECT tablename 
    FROM pg_tables 
    WHERE rowsecurity = true
)
ORDER BY schemaname, tablename, policyname;

-- 3. Verificar especificamente a tabela storage.objects
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 4. Verificar políticas da tabela storage.objects (se existir)
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 5. Verificar se a tabela storage.objects existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'storage' 
    AND table_name = 'objects'
) as storage_objects_exists;

-- 6. Verificar estrutura da tabela storage.objects (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'storage' 
AND table_name = 'objects'
ORDER BY ordinal_position;

-- 7. Verificar buckets de storage
SELECT 
    id, 
    name, 
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- 8. Verificar se há triggers na tabela profiles
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
ORDER BY trigger_name;

-- 9. Verificar funções relacionadas ao storage
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'storage'
AND routine_name LIKE '%upload%'
ORDER BY routine_name;

-- 10. Verificar permissões do usuário atual
SELECT 
    current_user as usuario_atual,
    session_user as sessao_usuario,
    current_setting('role') as role_atual;
