-- =====================================================
-- MONITOR DE REQUISIÇÕES E DETECÇÃO DE LOOPS
-- =====================================================

-- 1. VERIFICAR REQUISIÇÕES RECENTES POR USUÁRIO
-- Mostra usuários com muitas requisições nas últimas 24 horas
SELECT 
    user_id,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as requests_last_hour,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '10 minutes' THEN 1 END) as requests_last_10min,
    MIN(created_at) as first_request,
    MAX(created_at) as last_request
FROM notifications 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id 
ORDER BY total_requests DESC
LIMIT 20;

-- 2. DETECTAR PADRÕES DE LOOP (mesmo título/mensagem repetido)
SELECT 
    user_id,
    title,
    message,
    COUNT(*) as duplicate_count,
    MIN(created_at) as first_occurrence,
    MAX(created_at) as last_occurrence,
    EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) / COUNT(*) as avg_seconds_between
FROM notifications 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id, title, message
HAVING COUNT(*) > 10
ORDER BY duplicate_count DESC;

-- 3. VERIFICAR NOTIFICAÇÕES DE TESTE EM LOOP
SELECT 
    user_id,
    COUNT(*) as test_notifications,
    MIN(created_at) as first_test,
    MAX(created_at) as last_test
FROM notifications 
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND (title ILIKE '%teste%' OR title ILIKE '%test%' OR message ILIKE '%teste%' OR message ILIKE '%test%')
GROUP BY user_id
ORDER BY test_notifications DESC;

-- 4. VERIFICAR NOTIFICAÇÕES DE MENSAGEM EM LOOP
SELECT 
    user_id,
    COUNT(*) as message_notifications,
    MIN(created_at) as first_message,
    MAX(created_at) as last_message
FROM notifications 
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND type = 'message'
GROUP BY user_id
ORDER BY message_notifications DESC;

-- 5. VERIFICAR NOTIFICAÇÕES POR TIPO
SELECT 
    type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour,
    COUNT(DISTINCT user_id) as unique_users
FROM notifications 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY type
ORDER BY total_count DESC;

-- 6. VERIFICAR REQUISIÇÕES POR MINUTO (para detectar spikes)
SELECT 
    DATE_TRUNC('minute', created_at) as minute,
    COUNT(*) as requests_per_minute,
    COUNT(DISTINCT user_id) as unique_users
FROM notifications 
WHERE created_at > NOW() - INTERVAL '2 hours'
GROUP BY DATE_TRUNC('minute', created_at)
ORDER BY minute DESC
LIMIT 20;

-- 7. USUÁRIOS COM MAIS DE 100 NOTIFICAÇÕES POR HORA
SELECT 
    user_id,
    COUNT(*) as total_notifications,
    COUNT(*) / 24 as avg_per_hour,
    MIN(created_at) as first_notification,
    MAX(created_at) as last_notification
FROM notifications 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id
HAVING COUNT(*) > 100
ORDER BY total_notifications DESC;

-- 8. LIMPAR NOTIFICAÇÕES DE TESTE EM MASSA
-- Descomente para executar
-- DELETE FROM notifications 
-- WHERE created_at > NOW() - INTERVAL '24 hours'
--   AND (title ILIKE '%teste%' OR title ILIKE '%test%' OR message ILIKE '%teste%' OR message ILIKE '%test%');

-- 9. LIMPAR NOTIFICAÇÕES DUPLICADAS (mesmo título/mensagem)
-- Descomente para executar
-- DELETE FROM notifications 
-- WHERE id NOT IN (
--     SELECT DISTINCT ON (user_id, title, message) id
--     FROM notifications
--     WHERE created_at > NOW() - INTERVAL '24 hours'
--     ORDER BY user_id, title, message, created_at DESC
-- );

-- 10. VERIFICAR TAMANHO DA TABELA
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE tablename = 'notifications';

-- 11. VERIFICAR ÍNDICES
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'notifications';

-- 12. ESTATÍSTICAS DE PERFORMANCE
SELECT 
    COUNT(*) as total_notifications,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(CASE WHEN is_read = false THEN 1 END) as unread_count,
    MIN(created_at) as oldest_notification,
    MAX(created_at) as newest_notification
FROM notifications;
