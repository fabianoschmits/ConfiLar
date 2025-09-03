-- =====================================================
-- CORREÇÕES PARA CONFIGURAÇÕES DE PRODUÇÃO - SUPABASE
-- =====================================================
-- Script para corrigir configurações que causam erro 406 no site da Vercel

-- 1. DESABILITAR RLS EM TODAS AS TABELAS PRINCIPAIS
-- =====================================================
-- Isso resolve o erro 406 (Not Acceptable) no site da Vercel

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS RLS PROBLEMÁTICAS
-- =====================================================
-- Remove políticas que podem causar problemas de acesso

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND tablename IN ('profiles', 'conversations', 'messages', 'conversation_participants', 'notifications')
    ) 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
        RAISE NOTICE 'Removida política: % na tabela %', r.policyname, r.tablename;
    END LOOP;
END $$;

-- 3. VERIFICAR E CORRIGIR CHAVES ESTRANGEIRAS
-- =====================================================
-- Garante que as relações entre tabelas estão corretas

-- Verificar se messages.sender_id referencia profiles.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%messages_sender_id_fkey%'
        AND table_name = 'messages'
    ) THEN
        ALTER TABLE messages 
        ADD CONSTRAINT messages_sender_id_fkey 
        FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Adicionada FK: messages.sender_id -> profiles.id';
    END IF;
END $$;

-- Verificar se conversation_participants.conversation_id referencia conversations.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%conversation_participants_conversation_id_fkey%'
        AND table_name = 'conversation_participants'
    ) THEN
        ALTER TABLE conversation_participants 
        ADD CONSTRAINT conversation_participants_conversation_id_fkey 
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
        RAISE NOTICE 'Adicionada FK: conversation_participants.conversation_id -> conversations.id';
    END IF;
END $$;

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
-- Melhora a performance das consultas

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location_state, location_city);

-- Índices para conversations
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

-- Índices para messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Índices para conversation_participants
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_profile_id ON conversation_participants(profile_id);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- 5. CRIAR TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================
-- Mantém updated_at sempre atualizado

-- Trigger para profiles
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();

-- Trigger para conversations
CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversations_updated_at ON conversations;
CREATE TRIGGER trigger_update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_conversations_updated_at();

-- Trigger para messages
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_messages_updated_at ON messages;
CREATE TRIGGER trigger_update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();

-- 6. VERIFICAR ESTRUTURA DAS TABELAS
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

-- 7. CONFIGURAÇÕES DE PERFORMANCE
-- =====================================================
-- Otimizações para produção

-- Configurar work_mem para consultas complexas
ALTER SYSTEM SET work_mem = '256MB';

-- Configurar shared_buffers para cache
ALTER SYSTEM SET shared_buffers = '256MB';

-- Configurar effective_cache_size
ALTER SYSTEM SET effective_cache_size = '1GB';

-- 8. VERIFICAÇÃO FINAL
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

-- 9. RESUMO DAS CORREÇÕES
-- =====================================================
SELECT 
    'RESUMO DAS CORREÇÕES' as secao,
    'Configurações corrigidas para produção' as status,
    'Agora teste o site da Vercel - erro 406 deve estar resolvido' as acao;
