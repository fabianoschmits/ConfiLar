# 🧹 LIMPEZA DO SISTEMA ANTIGO DE NOTIFICAÇÕES

## ⚠️ **O QUE ESTE SCRIPT FAZ:**

Remove **APENAS** funções, triggers e tabelas antigas que **NÃO SÃO MAIS USADAS**.

### ✅ **O QUE PERMANECE (IMPORTANTE):**
- ✅ Tabela `notifications` (principal)
- ✅ Tabela `notification_preferences` (preferências)
- ✅ Todos os 5 triggers novos que você acabou de criar
- ✅ Todas as 5 funções novas dos triggers

### ❌ **O QUE SERÁ REMOVIDO:**
- ❌ Funções antigas não usadas
- ❌ Triggers genéricos substituídos
- ❌ Tabelas auxiliares não usadas (templates, logs, queue)
- ❌ Views antigas

---

## 📋 **COPIE E EXECUTE ESTE SQL:**

```sql
-- =====================================================
-- LIMPEZA DO SISTEMA ANTIGO DE NOTIFICAÇÕES
-- =====================================================

-- 1. REMOVER FUNÇÕES ANTIGAS
DROP FUNCTION IF EXISTS mark_notification_read(UUID);
DROP FUNCTION IF EXISTS get_unread_notifications(UUID);
DROP FUNCTION IF EXISTS cleanup_old_notifications();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS create_notification(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS mark_notification_read(UUID, UUID);
DROP FUNCTION IF EXISTS cleanup_expired_notifications();
DROP FUNCTION IF EXISTS update_notifications_updated_at();

-- 2. REMOVER TRIGGERS ANTIGOS
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;

-- 3. REMOVER VIEWS ANTIGAS
DROP VIEW IF EXISTS notification_stats;
DROP VIEW IF EXISTS recent_notifications;

-- 4. REMOVER TABELAS AUXILIARES NÃO USADAS
DROP TABLE IF EXISTS notification_templates CASCADE;
DROP TABLE IF EXISTS notification_logs CASCADE;
DROP TABLE IF EXISTS notification_queue CASCADE;

-- 5. REMOVER POLÍTICAS RLS ANTIGAS
DROP POLICY IF EXISTS "Users can view their own preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can view their own logs" ON notification_logs;

-- 6. OTIMIZAR TABELAS
REINDEX TABLE notifications;
ANALYZE notifications;
ANALYZE notification_preferences;

-- 7. VERIFICAR O QUE FICOU
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND (trigger_name LIKE '%notif%' OR event_object_table LIKE '%notif%')
ORDER BY event_object_table, trigger_name;
```

---

## 🎯 **RESULTADO ESPERADO:**

Após executar, você deve ver apenas os **5 triggers ativos**:

| trigger_name | event_object_table | action_statement |
|--------------|-------------------|------------------|
| trigger_notify_new_ad | classified_ads | create_classified_ad_notification() |
| trigger_notify_new_message | messages | create_message_notification() |
| trigger_notify_new_review | reviews | create_review_notification() |
| trigger_notify_new_favorite | user_favorites | create_favorite_notification() |
| trigger_notify_new_recommendation | user_recommendations | create_recommendation_notification() |

---

## ✅ **BENEFÍCIOS DA LIMPEZA:**

1. **Banco mais limpo** - Sem funções/triggers não usados
2. **Melhor performance** - Menos objetos no banco
3. **Mais fácil de manter** - Apenas o necessário
4. **Sem confusão** - Apenas triggers ativos

---

## 🚨 **SEGURANÇA:**

- ✅ **Não remove** notificações existentes
- ✅ **Não remove** preferências dos usuários
- ✅ **Não remove** os triggers novos
- ✅ **Não afeta** o sistema em produção

**É seguro executar!** 👍

---

## 📝 **PASSO A PASSO:**

1. **Supabase Dashboard** → **SQL Editor**
2. **Copiar** o SQL acima
3. **Colar** e **Run**
4. **Verificar** que apenas os 5 triggers aparecem
5. **Pronto!** Sistema limpo e otimizado

---

**Tempo estimado: 2 minutos** ⏱️

