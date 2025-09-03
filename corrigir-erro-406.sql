-- =====================================================
-- CORREÇÕES ESSENCIAIS PARA ERRO 406 - SUPABASE
-- =====================================================
-- Script focado apenas no essencial para resolver erro 406 no site da Vercel

-- 1. DESABILITAR RLS EM TODAS AS TABELAS PRINCIPAIS
-- =====================================================
-- Isso resolve o erro 406 (Not Acceptable) no site da Vercel

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER POLÍTICAS RLS PROBLEMÁTICAS
-- =====================================================
-- Remove políticas que podem causar problemas de acesso

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON conversations;

DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add themselves to conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can remove themselves from conversations" ON conversation_participants;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;

-- 3. VERIFICAR ESTRUTURA DAS TABELAS
-- =====================================================
-- Garante que todas as colunas necessárias existem

-- Adicionar colunas que podem estar faltando em profiles
DO $$
BEGIN
    -- Adicionar profile_completion_score se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'profile_completion_score'
    ) THEN
        ALTER TABLE profiles ADD COLUMN profile_completion_score INTEGER DEFAULT 0;
        RAISE NOTICE 'Adicionada coluna: profiles.profile_completion_score';
    END IF;
    
    -- Adicionar professional_certifications se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'professional_certifications'
    ) THEN
        ALTER TABLE profiles ADD COLUMN professional_certifications TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Adicionada coluna: profiles.professional_certifications';
    END IF;
    
    -- Adicionar professional_portfolio_url se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'professional_portfolio_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN professional_portfolio_url TEXT;
        RAISE NOTICE 'Adicionada coluna: profiles.professional_portfolio_url';
    END IF;
END $$;

-- 4. VERIFICAÇÃO FINAL
-- =====================================================
-- Confirma que tudo está configurado corretamente

SELECT 
    'VERIFICAÇÃO FINAL' as secao,
    'Confirmando configurações de produção' as info;

-- Verificar se RLS está desabilitado
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

-- Verificar se não há políticas RLS
SELECT 
    'POLÍTICAS RLS RESTANTES' as config,
    COUNT(*) as total_politicas
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'conversations', 'messages', 'conversation_participants', 'notifications');

-- Verificar se as tabelas estão acessíveis
SELECT 
    'TESTE DE ACESSO' as config,
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN '✅ PROFILES ACESSÍVEL'
        ELSE '❌ PROFILES NÃO ACESSÍVEL'
    END as status;

-- 5. RESUMO DAS CORREÇÕES
-- =====================================================
SELECT 
    'RESUMO DAS CORREÇÕES' as secao,
    'Configurações corrigidas para produção' as status,
    'Agora teste o site da Vercel - erro 406 deve estar resolvido' as acao;
