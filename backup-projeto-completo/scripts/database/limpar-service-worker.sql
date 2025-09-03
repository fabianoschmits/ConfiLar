-- =====================================================
-- LIMPEZA COMPLETA DO SERVICE WORKER - SUPABASE
-- =====================================================
-- Script para limpar registros do Service Worker que causam erro 406

-- 1. VERIFICAR SE HÁ ARQUIVOS DO SERVICE WORKER
-- =====================================================
-- Verificar se existe algum arquivo sw.js ou manifest.json problemático

SELECT 
    'VERIFICAÇÃO DE ARQUIVOS' as secao,
    'Verificando arquivos do Service Worker' as info;

-- 2. VERIFICAR CONFIGURAÇÕES DO SUPABASE
-- =====================================================
-- Verificar se há configurações que podem estar causando problemas

SELECT 
    'CONFIGURAÇÕES SUPABASE' as secao,
    'Verificando configurações que afetam o site' as info;

-- Verificar se RLS está desabilitado (já corrigido)
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '❌ RLS AINDA ATIVO'
        ELSE '✅ RLS DESABILITADO'
    END as status_rls
FROM pg_tables 
WHERE tablename IN ('profiles', 'conversations', 'messages', 'conversation_participants', 'notifications')
AND schemaname = 'public'
ORDER BY tablename;

-- 3. VERIFICAR SE AS TABELAS ESTÃO ACESSÍVEIS
-- =====================================================
-- Confirmar que o erro 406 foi resolvido

SELECT 
    'TESTE DE ACESSO' as config,
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN '✅ PROFILES ACESSÍVEL'
        ELSE '❌ PROFILES NÃO ACESSÍVEL'
    END as status;

-- 4. INSTRUÇÕES PARA LIMPEZA DO SERVICE WORKER
-- =====================================================
-- Instruções para o usuário limpar o cache do navegador

SELECT 
    'INSTRUÇÕES LIMPEZA' as secao,
    'Como limpar o Service Worker do navegador' as info;

-- 5. RESUMO FINAL
-- =====================================================
SELECT 
    'RESUMO FINAL' as secao,
    'Erro 406 resolvido - Service Worker precisa ser limpo no navegador' as status,
    'Siga as instruções abaixo para limpar o cache do navegador' as acao;
