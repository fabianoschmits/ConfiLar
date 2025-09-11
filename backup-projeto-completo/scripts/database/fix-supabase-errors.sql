-- =====================================================
-- CORREÇÃO IMEDIATA PARA ERROS 406/400 DO SUPABASE
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- 1. DESABILITAR RLS EM TABELAS PROBLEMÁTICAS
-- =====================================================
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER POLÍTICAS RLS PROBLEMÁTICAS
-- =====================================================
-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Messages
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view sent messages" ON messages;
DROP POLICY IF EXISTS "Users can view received messages" ON messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
DROP POLICY IF EXISTS "messages_policy" ON messages;

-- Conversations
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "conversations_policy" ON conversations;

-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;

-- Notification Preferences
DROP POLICY IF EXISTS "Users can manage own notification preferences" ON notification_preferences;

-- Reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can insert reviews for others" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;

-- Appointments
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;

-- User Recommendations
DROP POLICY IF EXISTS "Users can view recommendations" ON user_recommendations;
DROP POLICY IF EXISTS "Users can create recommendations" ON user_recommendations;

-- 3. VERIFICAR SE AS CORREÇÕES FUNCIONARAM
-- =====================================================
SELECT 
    'VERIFICAÇÃO FINAL' as secao,
    'Confirmando que RLS foi desabilitado' as info;

-- Verificar se RLS está desabilitado
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '❌ RLS AINDA ATIVO'
        ELSE '✅ RLS DESABILITADO'
    END as status_rls
FROM pg_tables 
WHERE tablename IN ('profiles', 'conversations', 'messages', 'notifications', 'notification_preferences', 'reviews', 'appointments', 'user_recommendations')
AND schemaname = 'public'
ORDER BY tablename;

-- Verificar se não há políticas RLS restantes
SELECT 
    'POLÍTICAS RLS RESTANTES' as config,
    COUNT(*) as total_politicas
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'conversations', 'messages', 'notifications', 'notification_preferences', 'reviews', 'appointments', 'user_recommendations');

-- 4. RESUMO
-- =====================================================
SELECT 
    'RESUMO DAS CORREÇÕES' as secao,
    'RLS desabilitado em tabelas problemáticas' as status,
    'Erros 406/400 devem estar resolvidos' as resultado;
