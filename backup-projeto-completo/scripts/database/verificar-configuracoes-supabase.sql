-- =====================================================
-- VERIFICAÇÃO DAS CONFIGURAÇÕES DO SUPABASE PARA PRODUÇÃO
-- =====================================================
-- Script para verificar configurações que afetam o site da Vercel

-- 1. VERIFICAR CONFIGURAÇÕES DE AUTENTICAÇÃO
SELECT 
    'CONFIGURAÇÕES AUTH' as secao,
    'Verificando configurações de autenticação' as info;

-- Verificar se o auth está ativo
SELECT 
    'AUTH STATUS' as config,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN '✅ AUTH ATIVO'
        ELSE '❌ AUTH NÃO ATIVO'
    END as status;

-- Verificar usuários existentes
SELECT 
    'USUÁRIOS EXISTENTES' as config,
    COUNT(*) as total_usuarios
FROM auth.users;

-- 2. VERIFICAR CONFIGURAÇÕES DE RLS (ROW LEVEL SECURITY)
SELECT 
    'CONFIGURAÇÕES RLS' as secao,
    'Verificando Row Level Security' as info;

-- Verificar status RLS nas tabelas principais
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '🔒 RLS ATIVO - PODE CAUSAR ERRO 406'
        ELSE '🔓 RLS DESATIVADO - OK'
    END as status_rls,
    CASE 
        WHEN rowsecurity THEN '⚠️ DESABILITAR PARA PRODUÇÃO'
        ELSE '✅ OK PARA PRODUÇÃO'
    END as recomendacao
FROM pg_tables 
WHERE tablename IN ('profiles', 'conversations', 'messages', 'conversation_participants', 'notifications')
AND schemaname = 'public'
ORDER BY tablename;

-- 3. VERIFICAR POLÍTICAS RLS EXISTENTES
SELECT 
    'POLÍTICAS RLS' as secao,
    'Verificando políticas de segurança' as info;

SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'POLÍTICA ATIVA'
        ELSE 'POLÍTICA INATIVA'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'conversations', 'messages', 'conversation_participants', 'notifications')
ORDER BY tablename, policyname;

-- 4. VERIFICAR CONFIGURAÇÕES DE CORS
SELECT 
    'CONFIGURAÇÕES CORS' as secao,
    'Verificando configurações de CORS' as info;

-- Verificar se há configurações de CORS no banco
SELECT 
    'CORS CHECK' as config,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'cors_config' 
            AND table_schema = 'public'
        ) THEN '✅ TABELA CORS EXISTE'
        ELSE 'ℹ️ CORS CONFIGURADO VIA SUPABASE DASHBOARD'
    END as status;

-- 5. VERIFICAR CONFIGURAÇÕES DE API
SELECT 
    'CONFIGURAÇÕES API' as secao,
    'Verificando configurações da API' as info;

-- Verificar se a API está acessível
SELECT 
    'API STATUS' as config,
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN '✅ API FUNCIONANDO'
        ELSE '❌ API COM PROBLEMAS'
    END as status;

-- 6. VERIFICAR CONFIGURAÇÕES DE STORAGE
SELECT 
    'CONFIGURAÇÕES STORAGE' as secao,
    'Verificando configurações de storage' as info;

-- Verificar se storage está configurado
SELECT 
    'STORAGE CHECK' as config,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM storage.buckets LIMIT 1
        ) THEN '✅ STORAGE CONFIGURADO'
        ELSE 'ℹ️ STORAGE NÃO CONFIGURADO'
    END as status;

-- 7. VERIFICAR CONFIGURAÇÕES DE FUNÇÕES
SELECT 
    'CONFIGURAÇÕES FUNÇÕES' as secao,
    'Verificando funções do banco' as info;

-- Verificar funções existentes
SELECT 
    routine_name,
    routine_type,
    data_type,
    CASE 
        WHEN routine_type = 'FUNCTION' THEN 'FUNÇÃO'
        WHEN routine_type = 'PROCEDURE' THEN 'PROCEDIMENTO'
        ELSE 'OUTRO'
    END as tipo
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 8. VERIFICAR CONFIGURAÇÕES DE TRIGGERS
SELECT 
    'CONFIGURAÇÕES TRIGGERS' as secao,
    'Verificando triggers do banco' as info;

-- Verificar triggers existentes
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    CASE 
        WHEN action_timing = 'BEFORE' THEN 'ANTES'
        WHEN action_timing = 'AFTER' THEN 'DEPOIS'
        ELSE 'INSTEAD OF'
    END as momento
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 9. VERIFICAR CONFIGURAÇÕES DE ÍNDICES
SELECT 
    'CONFIGURAÇÕES ÍNDICES' as secao,
    'Verificando índices para performance' as info;

-- Verificar índices nas tabelas principais
SELECT 
    tablename,
    indexname,
    CASE 
        WHEN indexname LIKE '%_pkey' THEN 'CHAVE PRIMÁRIA'
        WHEN indexname LIKE '%_fkey%' THEN 'CHAVE ESTRANGEIRA'
        WHEN indexname LIKE 'idx_%' THEN 'ÍNDICE CUSTOMIZADO'
        ELSE 'ÍNDICE PADRÃO'
    END as tipo_indice
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'conversations', 'messages', 'conversation_participants', 'notifications')
ORDER BY tablename, indexname;

-- 10. VERIFICAR CONFIGURAÇÕES DE CONEXÃO
SELECT 
    'CONFIGURAÇÕES CONEXÃO' as secao,
    'Verificando configurações de conexão' as info;

-- Verificar conexões ativas
SELECT 
    'CONEXÕES ATIVAS' as config,
    COUNT(*) as total_conexoes
FROM pg_stat_activity 
WHERE state = 'active';

-- 11. VERIFICAR CONFIGURAÇÕES DE PERFORMANCE
SELECT 
    'CONFIGURAÇÕES PERFORMANCE' as secao,
    'Verificando configurações de performance' as info;

-- Verificar configurações de memória e cache
SELECT 
    'MEMORY CONFIG' as config,
    setting as valor,
    unit as unidade
FROM pg_settings 
WHERE name IN ('shared_buffers', 'effective_cache_size', 'work_mem')
ORDER BY name;

-- 12. RECOMENDAÇÕES PARA PRODUÇÃO
SELECT 
    'RECOMENDAÇÕES PRODUÇÃO' as secao,
    'Recomendações para o site da Vercel' as info;

-- Verificar se RLS está desabilitado (recomendado para produção)
SELECT 
    'RLS PARA PRODUÇÃO' as config,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = 'profiles' 
            AND rowsecurity = true 
            AND schemaname = 'public'
        ) THEN '⚠️ DESABILITAR RLS EM PROFILES PARA EVITAR ERRO 406'
        ELSE '✅ RLS DESABILITADO EM PROFILES - OK'
    END as recomendacao;

-- Verificar se há políticas RLS que podem causar problemas
SELECT 
    'POLÍTICAS PROBLEMÁTICAS' as config,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public'
            AND tablename = 'profiles'
        ) THEN '⚠️ REMOVER POLÍTICAS RLS DE PROFILES'
        ELSE '✅ SEM POLÍTICAS RLS EM PROFILES - OK'
    END as recomendacao;

-- 13. RESUMO FINAL
SELECT 
    'RESUMO FINAL' as secao,
    'Configurações verificadas' as status,
    'Verifique as recomendações acima para resolver o erro 406' as acao;
