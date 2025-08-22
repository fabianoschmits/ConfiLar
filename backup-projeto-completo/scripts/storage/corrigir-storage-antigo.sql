-- Script para CORRIGIR Storage em versões ANTIGAS do Supabase
-- Execute este script no SQL Editor do Supabase
-- Para projetos que NÃO têm a tabela storage.policies

-- 1. Verificar se a tabela storage.objects existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'storage' 
    AND table_name = 'objects'
) as storage_objects_exists;

-- 2. Se storage.objects existir, verificar suas políticas
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'storage' 
        AND table_name = 'objects'
    ) THEN
        RAISE NOTICE 'Tabela storage.objects existe - verificando políticas...';
        
        -- Verificar políticas existentes
        PERFORM * FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage';
        
    ELSE
        RAISE NOTICE 'Tabela storage.objects não existe - usando sistema de storage antigo';
    END IF;
END $$;

-- 3. Verificar buckets de storage
SELECT 
    id, 
    name, 
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- 4. Verificar se o bucket 'avatars' está público
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

-- 5. Tornar o bucket 'avatars' público (CRÍTICO!)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- 6. Verificar se a tabela storage.objects tem RLS ativo
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 7. Se storage.objects existir e tiver RLS, desabilitar temporariamente
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

-- 8. Verificar configuração final
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
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'storage' 
            AND table_name = 'policies'
        ) THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as status;

-- 9. Teste de inserção direta na tabela profiles (para verificar se o problema é realmente RLS)
-- Descomente a linha abaixo para testar (quando estiver logado como usuário)
-- INSERT INTO profiles (id, email, full_name, user_type, avatar_url, created_at, updated_at)
-- VALUES (auth.uid(), 'teste@storage.com', 'Teste Storage', 'client', 'https://exemplo.com/avatar.jpg', NOW(), NOW())
-- ON CONFLICT (id) DO UPDATE SET 
--     avatar_url = EXCLUDED.avatar_url,
--     updated_at = NOW();
