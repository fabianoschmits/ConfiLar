-- =====================================================
-- CONFI LAR - SCRIPT DE VERIFICAÇÃO PÓS-LIMPEZA
-- =====================================================
--
-- Execute este script APÓS executar o cleanup-unused-tables.sql
-- para verificar se tudo está funcionando corretamente
--
-- =====================================================

-- =====================================================
-- VERIFICAÇÃO 1: TABELAS ESSENCIAIS EXISTEM
-- =====================================================

SELECT 'VERIFICAÇÃO 1: TABELAS ESSENCIAIS' as teste;

SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'profiles', 'classified_ads', 'notifications', 'notification_preferences',
            'messages', 'conversations', 'conversation_participants', 'reviews',
            'user_reviews', 'user_recommendations', 'favorites', 'contact_agreements',
            'appointments', 'search_history', 'service_categories', 'professional_services',
            'feed_posts', 'post_comments', 'post_likes', 'reports', 'work_schedules',
            'user_activity_log', 'user_files', 'user_preferences', 'user_settings',
            'user_statistics', 'verification_documents'
        ) THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'profiles', 'classified_ads', 'notifications', 'notification_preferences',
    'messages', 'conversations', 'conversation_participants', 'reviews',
    'user_reviews', 'user_recommendations', 'favorites', 'contact_agreements',
    'appointments', 'search_history', 'service_categories', 'professional_services',
    'feed_posts', 'post_comments', 'post_likes', 'reports', 'work_schedules',
    'user_activity_log', 'user_files', 'user_preferences', 'user_settings',
    'user_statistics', 'verification_documents'
)
ORDER BY table_name;

-- =====================================================
-- VERIFICAÇÃO 2: TABELAS REMOVIDAS NÃO EXISTEM
-- =====================================================

SELECT 'VERIFICAÇÃO 2: TABELAS REMOVIDAS' as teste;

SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'achievements', 'ad_interests', 'ad_messages', 'appointment_history',
            'appointment_notifications', 'portfolio_projects', 'service_listings',
            'service_requests', 'service_proposals', 'service_history',
            'service_reviews', 'service_favorites', 'support_tickets',
            'support_messages', 'professional_availability', 'weekly_templates',
            'trust_metrics', 'verification_scores'
        ) THEN '❌ AINDA EXISTE'
        ELSE '✅ REMOVIDA'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'achievements', 'ad_interests', 'ad_messages', 'appointment_history',
    'appointment_notifications', 'portfolio_projects', 'service_listings',
    'service_requests', 'service_proposals', 'service_history',
    'service_reviews', 'service_favorites', 'support_tickets',
    'support_messages', 'professional_availability', 'weekly_templates',
    'trust_metrics', 'verification_scores'
)
ORDER BY table_name;

-- =====================================================
-- VERIFICAÇÃO 3: FOREIGN KEYS INTACTAS
-- =====================================================

SELECT 'VERIFICAÇÃO 3: FOREIGN KEYS' as teste;

SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    CASE 
        WHEN ccu.table_name IS NULL THEN '❌ QUEBRADA'
        ELSE '✅ OK'
    END as status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- =====================================================
-- VERIFICAÇÃO 4: ÍNDICES PRINCIPAIS
-- =====================================================

SELECT 'VERIFICAÇÃO 4: ÍNDICES PRINCIPAIS' as teste;

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN (
    'profiles', 'classified_ads', 'notifications', 'messages',
    'reviews', 'user_reviews', 'user_recommendations', 'favorites',
    'appointments', 'feed_posts', 'reports', 'work_schedules'
)
ORDER BY tablename, indexname;

-- =====================================================
-- VERIFICAÇÃO 5: RLS POLICIES
-- =====================================================

SELECT 'VERIFICAÇÃO 5: RLS POLICIES' as teste;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'profiles', 'classified_ads', 'notifications', 'messages',
    'reviews', 'user_reviews', 'user_recommendations', 'favorites',
    'appointments', 'feed_posts', 'reports', 'work_schedules'
)
ORDER BY tablename, policyname;

-- =====================================================
-- VERIFICAÇÃO 6: CONTAGEM DE REGISTROS
-- =====================================================

SELECT 'VERIFICAÇÃO 6: CONTAGEM DE REGISTROS' as teste;

SELECT 
    'profiles' as tabela,
    COUNT(*) as registros
FROM public.profiles
UNION ALL
SELECT 
    'classified_ads' as tabela,
    COUNT(*) as registros
FROM public.classified_ads
UNION ALL
SELECT 
    'notifications' as tabela,
    COUNT(*) as registros
FROM public.notifications
UNION ALL
SELECT 
    'messages' as tabela,
    COUNT(*) as registros
FROM public.messages
UNION ALL
SELECT 
    'reviews' as tabela,
    COUNT(*) as registros
FROM public.reviews
UNION ALL
SELECT 
    'user_reviews' as tabela,
    COUNT(*) as registros
FROM public.user_reviews
UNION ALL
SELECT 
    'user_recommendations' as tabela,
    COUNT(*) as registros
FROM public.user_recommendations
UNION ALL
SELECT 
    'favorites' as tabela,
    COUNT(*) as registros
FROM public.favorites
UNION ALL
SELECT 
    'appointments' as tabela,
    COUNT(*) as registros
FROM public.appointments
UNION ALL
SELECT 
    'feed_posts' as tabela,
    COUNT(*) as registros
FROM public.feed_posts
UNION ALL
SELECT 
    'reports' as tabela,
    COUNT(*) as registros
FROM public.reports
UNION ALL
SELECT 
    'work_schedules' as tabela,
    COUNT(*) as registros
FROM public.work_schedules
ORDER BY tabela;

-- =====================================================
-- VERIFICAÇÃO 7: ENUMS E TIPOS
-- =====================================================

SELECT 'VERIFICAÇÃO 7: ENUMS E TIPOS' as teste;

SELECT 
    t.typname as tipo,
    e.enumlabel as valor
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
ORDER BY t.typname, e.enumsortorder;

-- =====================================================
-- RESUMO FINAL
-- =====================================================

SELECT 'RESUMO FINAL DA LIMPEZA' as resumo;

SELECT 
    'TABELAS REMOVIDAS' as categoria,
    COUNT(*) as quantidade
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'achievements', 'ad_interests', 'ad_messages', 'appointment_history',
    'appointment_notifications', 'portfolio_projects', 'service_listings',
    'service_requests', 'service_proposals', 'service_history',
    'service_reviews', 'service_favorites', 'support_tickets',
    'support_messages', 'professional_availability', 'weekly_templates',
    'trust_metrics', 'verification_scores'
)

UNION ALL

SELECT 
    'TABELAS MANTIDAS' as categoria,
    COUNT(*) as quantidade
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'profiles', 'classified_ads', 'notifications', 'notification_preferences',
    'messages', 'conversations', 'conversation_participants', 'reviews',
    'user_reviews', 'user_recommendations', 'favorites', 'contact_agreements',
    'appointments', 'search_history', 'service_categories', 'professional_services',
    'feed_posts', 'post_comments', 'post_likes', 'reports', 'work_schedules',
    'user_activity_log', 'user_files', 'user_preferences', 'user_settings',
    'user_statistics', 'verification_documents'
)

UNION ALL

SELECT 
    'TOTAL DE TABELAS' as categoria,
    COUNT(*) as quantidade
FROM information_schema.tables 
WHERE table_schema = 'public';

-- =====================================================
-- FIM DO SCRIPT DE VERIFICAÇÃO
-- =====================================================
