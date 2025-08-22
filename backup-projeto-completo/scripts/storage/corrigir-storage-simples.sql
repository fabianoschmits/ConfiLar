-- Script para CORRIGIR Storage em versões ANTIGAS do Supabase
-- Execute este script no SQL Editor do Supabase
-- SEM referências a storage.policies (versões antigas)

-- 1. Verificar se a tabela storage.objects existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'storage' 
    AND table_name = 'objects'
) as storage_objects_exists;

-- 2. Verificar buckets de storage
SELECT 
    id, 
    name, 
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- 3. Verificar se o bucket 'avatars' está público
SELECT 
    CASE 
        WHEN public THEN 'BUCKET PÚBLICO - OK'
        ELSE 'BUCKET PRIVADO - PROBLEMA!'
    END as status_bucket,
    id,
    name,
    public
FROM storage.buckets 
WHERE id = 'avatars';

-- 4. Tornar o bucket 'avatars' público (CRÍTICO!)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- 5. Verificar se a tabela storage.objects tem RLS ativo
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 6. Se storage.objects existir e tiver RLS, desabilitar temporariamente
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM pg_tables 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE 'Desabilitando RLS da tabela storage.objects...';
        ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS da tabela storage.objects desabilitado';
    ELSE
        RAISE NOTICE 'Tabela storage.objects não tem RLS ativo';
    END IF;
END $$;

-- 7. Verificar configuração final
SELECT 
    'Bucket Status' as info,
    CASE 
        WHEN public THEN 'PÚBLICO - OK'
        ELSE 'PRIVADO - PROBLEMA'
    END as status
FROM storage.buckets 
WHERE id = 'avatars'

UNION ALL

SELECT 
    'Storage Objects RLS' as info,
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_tables 
            WHERE tablename = 'objects' 
            AND schemaname = 'storage' 
            AND rowsecurity = true
        ) THEN 'ATIVO'
        ELSE 'INATIVO'
    END as status

UNION ALL

SELECT 
    'Storage Policies Table' as info,
    'NÃO EXISTE' as status;

-- 8. Verificar se o bucket foi atualizado
SELECT 
    id, 
    name, 
    public,
    'Bucket atualizado' as status
FROM storage.buckets 
WHERE id = 'avatars';
