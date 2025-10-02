-- =====================================================
-- LIMPEZA DO SISTEMA ANTIGO DE NOTIFICAÇÕES
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- ⚠️ ATENÇÃO: Este script remove APENAS funções e triggers ANTIGOS
-- As tabelas principais (notifications, etc) são MANTIDAS

-- =====================================================
-- 1. REMOVER FUNÇÕES ANTIGAS (NÃO USADAS)
-- =====================================================

-- Funções antigas que podem ter sido criadas antes
DROP FUNCTION IF EXISTS mark_notification_read(UUID);
DROP FUNCTION IF EXISTS get_unread_notifications(UUID);
DROP FUNCTION IF EXISTS cleanup_old_notifications();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS create_notification(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS mark_notification_read(UUID, UUID);
DROP FUNCTION IF EXISTS cleanup_expired_notifications();

-- Função de atualização genérica (se existir)
DROP FUNCTION IF EXISTS update_notifications_updated_at();

-- =====================================================
-- 2. REMOVER TRIGGERS ANTIGOS (NÃO USADOS)
-- =====================================================

-- Trigger de updated_at genérico (substituído pelos triggers específicos)
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;

-- =====================================================
-- 3. REMOVER VIEWS ANTIGAS (SE EXISTIREM)
-- =====================================================

DROP VIEW IF EXISTS notification_stats;
DROP VIEW IF EXISTS recent_notifications;

-- =====================================================
-- 4. REMOVER TABELAS AUXILIARES NÃO USADAS
-- =====================================================

-- NOTA: Apenas tabelas auxiliares que NÃO são usadas no sistema atual

-- Notification templates (não usamos templates no sistema atual)
DROP TABLE IF EXISTS notification_templates CASCADE;

-- Notification logs (não temos logging separado)
DROP TABLE IF EXISTS notification_logs CASCADE;

-- Notification queue (não usamos fila)
DROP TABLE IF EXISTS notification_queue CASCADE;

-- =====================================================
-- 5. REMOVER POLÍTICAS RLS ANTIGAS (SE EXISTIREM)
-- =====================================================

-- Políticas antigas que podem ter nomes diferentes
DROP POLICY IF EXISTS "Users can view their own preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can view their own logs" ON notification_logs;

-- =====================================================
-- 6. VERIFICAR O QUE FOI REMOVIDO
-- =====================================================

-- Listar funções relacionadas a notificações que ainda existem
SELECT 
  routine_name as function_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%notif%'
ORDER BY routine_name;

-- Listar triggers relacionados a notificações que ainda existem
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND (trigger_name LIKE '%notif%' OR event_object_table LIKE '%notif%')
ORDER BY event_object_table, trigger_name;

-- Listar tabelas relacionadas a notificações que ainda existem
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%notif%'
ORDER BY table_name;

-- =====================================================
-- 7. RESUMO DO QUE DEVE FICAR
-- =====================================================

/*
✅ TABELAS QUE DEVEM PERMANECER:
- notifications (tabela principal)
- notification_preferences (preferências do usuário)

✅ FUNÇÕES QUE DEVEM PERMANECER:
- create_message_notification()
- create_favorite_notification()
- create_recommendation_notification()
- create_review_notification()
- notify_new_classified_ad() (se existir)

✅ TRIGGERS QUE DEVEM PERMANECER:
- trigger_notify_new_message
- trigger_notify_new_favorite
- trigger_notify_new_recommendation
- trigger_notify_new_review
- trigger_notify_new_ad (se existir)

❌ O QUE FOI REMOVIDO:
- Funções antigas não usadas
- Triggers genéricos substituídos
- Tabelas auxiliares não usadas
- Views não usadas
*/

-- =====================================================
-- 8. OTIMIZAÇÃO FINAL
-- =====================================================

-- Reindexar tabela de notificações para melhor performance
REINDEX TABLE notifications;

-- Atualizar estatísticas
ANALYZE notifications;
ANALYZE notification_preferences;

-- Limpar notificações muito antigas e já lidas (opcional - comentado)
/*
DELETE FROM notifications 
WHERE is_read = TRUE 
AND created_at < NOW() - INTERVAL '90 days';
*/

-- =====================================================
-- ✅ LIMPEZA COMPLETA!
-- =====================================================

SELECT '✅ Sistema de notificações limpo e otimizado!' as status;
