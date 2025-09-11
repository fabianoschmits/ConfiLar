-- =====================================================
-- SCRIPT PARA VERIFICAR E CORRIGIR QUERIES PROBLEMÁTICAS
-- =====================================================
-- Este script identifica e corrige problemas específicos nas queries

-- 1. VERIFICAR ESTRUTURA DAS TABELAS
-- =====================================================
SELECT 
    'ESTRUTURA DAS TABELAS' as info,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'messages', 'reviews', 'appointments', 'notification_preferences', 'user_recommendations')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 2. VERIFICAR ÍNDICES PROBLEMÁTICOS
-- =====================================================
SELECT 
    'ÍNDICES DAS TABELAS' as info,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('profiles', 'messages', 'reviews', 'appointments', 'notification_preferences', 'user_recommendations')
AND schemaname = 'public'
ORDER BY tablename, indexname;

-- 3. VERIFICAR CONSTRAINTS PROBLEMÁTICOS
-- =====================================================
SELECT 
    'CONSTRAINTS DAS TABELAS' as info,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name IN ('profiles', 'messages', 'reviews', 'appointments', 'notification_preferences', 'user_recommendations')
AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 4. CORRIGIR PROBLEMAS ESPECÍFICOS NAS QUERIES
-- =====================================================

-- Corrigir problema na tabela messages (query com OR)
-- A query problemática: or=(sender_id.eq.xxx,receiver_id.eq.xxx)
-- Vamos criar índices específicos para melhorar performance

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Corrigir problema na tabela reviews
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Corrigir problema na tabela appointments
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at);

-- Corrigir problema na tabela notification_preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Corrigir problema na tabela user_recommendations
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_id ON user_recommendations(user_id);

-- 5. VERIFICAR PERMISSÕES DE ACESSO
-- =====================================================
SELECT 
    'PERMISSÕES DE ACESSO' as info,
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename IN ('profiles', 'messages', 'reviews', 'appointments', 'notification_preferences', 'user_recommendations')
AND schemaname = 'public'
ORDER BY tablename;

-- 6. TESTE DE QUERIES ESPECÍFICAS QUE ESTÃO FALHANDO
-- =====================================================

-- Teste da query de profiles que está falhando
SELECT 
    'TESTE QUERY PROFILES' as teste,
    COUNT(*) as total_profiles
FROM profiles 
WHERE id = '8ec76af4-470d-4a95-9ecb-67e74b461ec4';

-- Teste da query de messages que está falhando
SELECT 
    'TESTE QUERY MESSAGES' as teste,
    COUNT(*) as total_messages
FROM messages 
WHERE sender_id = '8ec76af4-470d-4a95-9ecb-67e74b461ec4' 
   OR receiver_id = '8ec76af4-470d-4a95-9ecb-67e74b461ec4';

-- Teste da query de reviews que está falhando
SELECT 
    'TESTE QUERY REVIEWS' as teste,
    COUNT(*) as total_reviews
FROM reviews 
WHERE reviewee_id = '8ec76af4-470d-4a95-9ecb-67e74b461ec4';

-- Teste da query de appointments que está falhando
SELECT 
    'TESTE QUERY APPOINTMENTS' as teste,
    COUNT(*) as total_appointments
FROM appointments 
WHERE client_id = '8ec76af4-470d-4a95-9ecb-67e74b461ec4' 
   OR professional_id = '8ec76af4-470d-4a95-9ecb-67e74b461ec4';

-- 7. VERIFICAÇÃO FINAL
-- =====================================================
SELECT 
    'VERIFICAÇÃO FINAL' as secao,
    'Índices criados para melhorar performance' as status,
    'Queries testadas individualmente' as acao,
    'Se ainda houver erros, pode ser problema de configuração do Supabase' as observacao;
