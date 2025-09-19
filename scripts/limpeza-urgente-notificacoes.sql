-- =====================================================
-- LIMPEZA URGENTE DE NOTIFICAÇÕES - LIMITE SUPABASE ATINGIDO
-- =====================================================

-- 1. VERIFICAR SITUAÇÃO ATUAL
SELECT 
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour,
    COUNT(DISTINCT user_id) as unique_users
FROM notifications;

-- 2. IDENTIFICAR USUÁRIOS COM MAIS NOTIFICAÇÕES (TOP 10)
SELECT 
    user_id,
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour,
    MIN(created_at) as first_notification,
    MAX(created_at) as last_notification
FROM notifications 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id 
ORDER BY total_notifications DESC
LIMIT 10;

-- 3. LIMPEZA URGENTE - REMOVER NOTIFICAÇÕES DUPLICADAS
-- Remove notificações duplicadas (mesmo título e mensagem), mantendo apenas a mais recente
DELETE FROM notifications 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id, title, message) id
    FROM notifications
    WHERE created_at > NOW() - INTERVAL '24 hours'
    ORDER BY user_id, title, message, created_at DESC
);

-- 4. LIMPEZA URGENTE - REMOVER NOTIFICAÇÕES DE TESTE
DELETE FROM notifications 
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND (title ILIKE '%teste%' OR title ILIKE '%test%' OR message ILIKE '%teste%' OR message ILIKE '%test%');

-- 5. LIMPEZA URGENTE - REMOVER NOTIFICAÇÕES ANTIGAS (mais de 7 dias)
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '7 days';

-- 6. LIMPEZA URGENTE - REMOVER NOTIFICAÇÕES DE USUÁRIOS COM MAIS DE 1000 NOTIFICAÇÕES
DELETE FROM notifications 
WHERE user_id IN (
    SELECT user_id 
    FROM notifications 
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY user_id 
    HAVING COUNT(*) > 1000
);

-- 7. LIMPEZA URGENTE - REMOVER NOTIFICAÇÕES COM TÍTULO/MENSAGEM VAZIOS
DELETE FROM notifications 
WHERE title IS NULL 
   OR title = ''
   OR message IS NULL 
   OR message = '';

-- 8. VERIFICAR RESULTADO APÓS LIMPEZA
SELECT 
    COUNT(*) as total_notifications_after_cleanup,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h_after_cleanup,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour_after_cleanup,
    COUNT(DISTINCT user_id) as unique_users_after_cleanup
FROM notifications;

-- 9. VERIFICAR USUÁRIOS RESTANTES COM MAIS NOTIFICAÇÕES
SELECT 
    user_id,
    COUNT(*) as remaining_notifications,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour_remaining
FROM notifications 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id 
ORDER BY remaining_notifications DESC
LIMIT 10;

-- 10. RECRIAR ÍNDICES PARA OTIMIZAR PERFORMANCE
DROP INDEX IF EXISTS idx_notifications_user_created;
CREATE INDEX idx_notifications_user_created 
ON notifications(user_id, created_at DESC);

DROP INDEX IF EXISTS idx_notifications_user_read;
CREATE INDEX idx_notifications_user_read 
ON notifications(user_id, is_read);

-- 11. VERIFICAR TAMANHO DA TABELA APÓS LIMPEZA
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename = 'notifications';
