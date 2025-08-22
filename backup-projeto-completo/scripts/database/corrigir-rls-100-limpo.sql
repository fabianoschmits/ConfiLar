-- Script 100% LIMPO para corrigir RLS
-- Execute este script no SQL Editor do Supabase
-- SEM referências a storage.objects

-- 1. Verificar status atual das tabelas principais
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS ATIVO'
        ELSE 'RLS INATIVO'
    END as status
FROM pg_tables 
WHERE tablename IN ('profiles', 'conversation_participants', 'conversations', 'messages')
ORDER BY tablename;

-- 2. Verificar políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'conversation_participants', 'conversations', 'messages')
ORDER BY tablename, policyname;

-- 3. HABILITAR RLS nas tabelas que podem ser modificadas
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. Verificar buckets de storage (apenas leitura)
SELECT 
    id, 
    name, 
    public
FROM storage.buckets
ORDER BY name;

-- 5. Tornar bucket 'avatars' público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- 6. Verificar se o bucket foi atualizado
SELECT 
    id, 
    name, 
    public,
    'Bucket atualizado' as status
FROM storage.buckets 
WHERE id = 'avatars';

-- 7. Verificar configuração final das tabelas principais
SELECT 
    'RLS Status' as info,
    CASE 
        WHEN COUNT(*) = COUNT(CASE WHEN rowsecurity THEN 1 END) THEN 'TODAS ATIVAS'
        WHEN COUNT(CASE WHEN rowsecurity THEN 1 END) = 0 THEN 'TODAS INATIVAS'
        ELSE 'MISTO'
    END as status
FROM pg_tables 
WHERE tablename IN ('profiles', 'conversation_participants', 'conversations', 'messages')

UNION ALL

SELECT 
    'Bucket Avatars' as info,
    CASE 
        WHEN EXISTS (
            SELECT FROM storage.buckets 
            WHERE id = 'avatars' AND public = true
        ) THEN 'PÚBLICO'
        ELSE 'PRIVADO'
    END as status;

-- 8. Listar status final de cada tabela
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN 'RLS ATIVO' ELSE 'RLS INATIVO' END as rls_status,
    'Verificado' as observacao
FROM pg_tables 
WHERE tablename IN ('profiles', 'conversation_participants', 'conversations', 'messages')
ORDER BY tablename;
