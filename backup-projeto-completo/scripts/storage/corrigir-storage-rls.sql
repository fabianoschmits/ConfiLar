-- Script para CORRIGIR RLS do Storage
-- Execute este script no SQL Editor do Supabase
-- Objetivo: Corrigir políticas de storage que podem estar bloqueando uploads

-- 1. Verificar se a tabela storage.objects existe e tem RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

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

-- 5. Se o bucket não estiver público, torná-lo público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- 6. Verificar se há políticas específicas para o bucket 'avatars'
-- (Para versões mais novas do Supabase)
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'storage' 
        AND table_name = 'policies'
    ) THEN
        RAISE NOTICE 'Tabela storage.policies existe - configurando políticas...';
        
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
        
        RAISE NOTICE 'Políticas de storage criadas/atualizadas';
        
    ELSE
        RAISE NOTICE 'Tabela storage.policies não existe - usando configuração de bucket';
    END IF;
END $$;

-- 7. Verificar configuração final do bucket
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
    'Storage Policies' as info,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'storage' 
            AND table_name = 'policies'
        ) THEN 'EXISTEM'
        ELSE 'NÃO EXISTEM'
    END as status;

-- 8. Teste de inserção direta na tabela profiles (para verificar se o problema é realmente RLS)
-- Descomente a linha abaixo para testar (quando estiver logado como usuário)
-- INSERT INTO profiles (id, email, full_name, user_type, avatar_url, created_at, updated_at)
-- VALUES (auth.uid(), 'teste@storage.com', 'Teste Storage', 'client', 'https://exemplo.com/avatar.jpg', NOW(), NOW())
-- ON CONFLICT (id) DO UPDATE SET 
--     avatar_url = EXCLUDED.avatar_url,
--     updated_at = NOW();
