-- =====================================================
-- LIMPEZA DE NOTIFICAÇÕES EM MASSA
-- =====================================================

-- 1. LIMPAR TODAS AS NOTIFICAÇÕES DE UM USUÁRIO ESPECÍFICO
-- Substitua 'USER_ID_AQUI' pelo ID do usuário problemático
DELETE FROM notifications 
WHERE user_id = 'USER_ID_AQUI';

-- 2. LIMPAR NOTIFICAÇÕES DUPLICADAS (mesmo título e mensagem)
-- Remove notificações duplicadas, mantendo apenas a mais recente
DELETE FROM notifications 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id, title, message) id
    FROM notifications
    ORDER BY user_id, title, message, created_at DESC
);

-- 3. LIMPAR NOTIFICAÇÕES ANTIGAS (mais de 30 dias)
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '30 days';

-- 4. LIMPAR NOTIFICAÇÕES DE TESTE
DELETE FROM notifications 
WHERE title LIKE '%teste%' 
   OR title LIKE '%test%'
   OR message LIKE '%teste%'
   OR message LIKE '%test%';

-- 5. LIMPAR NOTIFICAÇÕES COM TÍTULO VAZIO OU INVÁLIDO
DELETE FROM notifications 
WHERE title IS NULL 
   OR title = ''
   OR message IS NULL 
   OR message = '';

-- 6. VERIFICAR QUANTIDADE DE NOTIFICAÇÕES POR USUÁRIO
SELECT 
    user_id,
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN is_read = false THEN 1 END) as unread_notifications
FROM notifications 
GROUP BY user_id 
ORDER BY total_notifications DESC;

-- 7. LIMPAR NOTIFICAÇÕES DE USUÁRIOS COM MAIS DE 1000 NOTIFICAÇÕES
DELETE FROM notifications 
WHERE user_id IN (
    SELECT user_id 
    FROM notifications 
    GROUP BY user_id 
    HAVING COUNT(*) > 1000
);

-- 8. LIMPAR TODAS AS NOTIFICAÇÕES (CUIDADO!)
-- Descomente apenas se quiser limpar TODAS as notificações
-- DELETE FROM notifications;

-- 9. RECRIAR ÍNDICES PARA OTIMIZAR PERFORMANCE
DROP INDEX IF EXISTS idx_notifications_user_created;
CREATE INDEX idx_notifications_user_created 
ON notifications(user_id, created_at DESC);

DROP INDEX IF EXISTS idx_notifications_user_read;
CREATE INDEX idx_notifications_user_read 
ON notifications(user_id, is_read);

-- 10. VERIFICAR RESULTADO FINAL
SELECT 
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN is_read = false THEN 1 END) as unread_notifications,
    COUNT(DISTINCT user_id) as users_with_notifications
FROM notifications;
