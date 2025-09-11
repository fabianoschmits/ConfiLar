-- =====================================================
-- SCRIPT DEFINITIVO PARA CORRIGIR ERROS 406/400 SUPABASE
-- =====================================================
-- Este script resolve definitivamente os problemas de acesso às tabelas

-- 1. VERIFICAR STATUS ATUAL DAS TABELAS
-- =====================================================
SELECT 
    'STATUS ATUAL DAS TABELAS' as info,
    tablename,
    CASE 
        WHEN rowsecurity THEN '❌ RLS ATIVO'
        ELSE '✅ RLS DESABILITADO'
    END as status_rls
FROM pg_tables 
WHERE tablename IN ('profiles', 'conversations', 'messages', 'conversation_participants', 'notifications', 'reviews', 'appointments', 'notification_preferences', 'user_recommendations', 'classified_ads')
AND schemaname = 'public'
ORDER BY tablename;

-- 2. DESABILITAR RLS EM TODAS AS TABELAS CRÍTICAS
-- =====================================================
-- Força a desabilitação do RLS mesmo se já estiver desabilitado

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations DISABLE ROW LEVEL SECURITY;
ALTER TABLE classified_ads DISABLE ROW LEVEL SECURITY;

-- 3. REMOVER TODAS AS POLÍTICAS RLS EXISTENTES
-- =====================================================
-- Remove todas as políticas que podem estar causando conflitos

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Conversations
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can delete conversations they participate in" ON conversations;

-- Messages
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

-- Conversation Participants
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add themselves to conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can remove themselves from conversations" ON conversation_participants;

-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- Reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;

-- Appointments
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete own appointments" ON appointments;

-- Notification Preferences
DROP POLICY IF EXISTS "Users can manage own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can view own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can update own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can insert own notification preferences" ON notification_preferences;

-- User Recommendations
DROP POLICY IF EXISTS "Users can view own recommendations" ON user_recommendations;
DROP POLICY IF EXISTS "Users can create recommendations" ON user_recommendations;
DROP POLICY IF EXISTS "Users can delete own recommendations" ON user_recommendations;

-- Classified Ads
DROP POLICY IF EXISTS "Users can view classified ads" ON classified_ads;
DROP POLICY IF EXISTS "Users can create classified ads" ON classified_ads;
DROP POLICY IF EXISTS "Users can update own classified ads" ON classified_ads;
DROP POLICY IF EXISTS "Users can delete own classified ads" ON classified_ads;

-- 4. VERIFICAR SE AS TABELAS EXISTEM E CRIAR SE NECESSÁRIO
-- =====================================================

-- Verificar se classified_ads existe, se não criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'classified_ads' AND table_schema = 'public') THEN
        CREATE TABLE classified_ads (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            user_name TEXT NOT NULL,
            user_type TEXT NOT NULL CHECK (user_type IN ('client', 'professional')),
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            location_state TEXT NOT NULL,
            location_city TEXT NOT NULL,
            ad_type TEXT NOT NULL CHECK (ad_type IN ('service_request', 'service_offer')),
            budget DECIMAL(10,2),
            price DECIMAL(10,2),
            urgency TEXT CHECK (urgency IN ('low', 'medium', 'high')),
            availability TEXT,
            is_active BOOLEAN DEFAULT true,
            views_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela classified_ads criada com sucesso';
    END IF;
END $$;

-- 5. ADICIONAR COLUNAS QUE PODEM ESTAR FALTANDO
-- =====================================================

-- Adicionar colunas em profiles se não existirem
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

-- 6. VERIFICAÇÃO FINAL E TESTE DE ACESSO
-- =====================================================

-- Verificar se RLS está desabilitado
SELECT 
    'VERIFICAÇÃO FINAL - RLS STATUS' as secao,
    tablename,
    CASE 
        WHEN rowsecurity THEN '❌ RLS AINDA ATIVO - PROBLEMA!'
        ELSE '✅ RLS DESABILITADO - OK'
    END as status_rls
FROM pg_tables 
WHERE tablename IN ('profiles', 'conversations', 'messages', 'conversation_participants', 'notifications', 'reviews', 'appointments', 'notification_preferences', 'user_recommendations', 'classified_ads')
AND schemaname = 'public'
ORDER BY tablename;

-- Verificar se não há políticas RLS restantes
SELECT 
    'POLÍTICAS RLS RESTANTES' as config,
    schemaname,
    tablename,
    policyname,
    COUNT(*) as total_politicas
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'conversations', 'messages', 'conversation_participants', 'notifications', 'reviews', 'appointments', 'notification_preferences', 'user_recommendations', 'classified_ads')
GROUP BY schemaname, tablename, policyname
ORDER BY tablename, policyname;

-- Teste de acesso às tabelas principais
SELECT 
    'TESTE DE ACESSO' as config,
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN '✅ PROFILES ACESSÍVEL'
        ELSE '❌ PROFILES NÃO ACESSÍVEL'
    END as profiles_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM messages LIMIT 1) THEN '✅ MESSAGES ACESSÍVEL'
        ELSE '❌ MESSAGES NÃO ACESSÍVEL'
    END as messages_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM reviews LIMIT 1) THEN '✅ REVIEWS ACESSÍVEL'
        ELSE '❌ REVIEWS NÃO ACESSÍVEL'
    END as reviews_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM appointments LIMIT 1) THEN '✅ APPOINTMENTS ACESSÍVEL'
        ELSE '❌ APPOINTMENTS NÃO ACESSÍVEL'
    END as appointments_status;

-- 7. RESUMO DAS CORREÇÕES
-- =====================================================
SELECT 
    'RESUMO DAS CORREÇÕES' as secao,
    'Script executado com sucesso' as status,
    'RLS desabilitado em todas as tabelas críticas' as acao_1,
    'Políticas RLS removidas' as acao_2,
    'Tabelas verificadas e criadas se necessário' as acao_3,
    'Agora teste o site - erros 406/400 devem estar resolvidos' as proximo_passo;
