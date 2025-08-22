-- Script para CORRIGIR RLS das tabelas principais
-- SEM modificar storage.objects (tabela protegida do sistema)
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar status atual de todas as tabelas problemáticas
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

-- 3. HABILITAR RLS em todas as tabelas problemáticas
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. Verificar se storage.objects tem RLS (apenas para informação)
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    'TABELA PROTEGIDA - NÃO PODE SER MODIFICADA' as observacao
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 5. Tornar bucket 'avatars' público (esta operação é permitida)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- 6. Verificar configuração final das tabelas principais
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
    'Storage Objects RLS' as info,
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_tables 
            WHERE tablename = 'objects' 
            AND schemaname = 'storage' 
            AND rowsecurity = true
        ) THEN 'ATIVO (PROTEGIDO)'
        ELSE 'INATIVO'
    END as status

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

-- 7. Listar status final de cada tabela
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN 'RLS ATIVO' ELSE 'RLS INATIVO' END as rls_status,
    CASE 
        WHEN tablename = 'profiles' THEN 'CORRIGIDO'
        WHEN tablename = 'storage.objects' THEN 'PROTEGIDA - NÃO MODIFICÁVEL'
        ELSE 'VERIFICAR POLÍTICAS'
    END as observacao
FROM pg_tables 
WHERE tablename IN ('profiles', 'conversation_participants', 'conversations', 'messages')
   OR (tablename = 'objects' AND schemaname = 'storage')
ORDER BY tablename;

-- 8. Verificar se o bucket foi atualizado
SELECT 
    id, 
    name, 
    public,
    'Bucket atualizado' as status
FROM storage.buckets 
WHERE id = 'avatars';
