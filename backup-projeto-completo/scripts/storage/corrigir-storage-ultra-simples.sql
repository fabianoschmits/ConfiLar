-- Script ULTRA SIMPLES para corrigir storage
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar buckets
SELECT 
    id, 
    name, 
    public
FROM storage.buckets
ORDER BY name;

-- 2. Tornar bucket 'avatars' público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- 3. Verificar se foi atualizado
SELECT 
    id, 
    name, 
    public,
    'Bucket atualizado' as status
FROM storage.buckets 
WHERE id = 'avatars';

-- 4. Verificar se storage.objects existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'storage' 
    AND table_name = 'objects'
) as storage_objects_exists;

-- 5. Se storage.objects existir, verificar RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 6. Desabilitar RLS de storage.objects se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM pg_tables 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS da tabela storage.objects desabilitado';
    ELSE
        RAISE NOTICE 'Tabela storage.objects não tem RLS ativo';
    END IF;
END $$;
