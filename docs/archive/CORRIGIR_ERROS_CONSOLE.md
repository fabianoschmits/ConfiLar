# 🔧 CORRIGIR ERROS DO CONSOLE

## 🚨 **ERROS IDENTIFICADOS:**

### **1. Erro 406 - user_activity**
```
Failed to load resource: the server responded with a status of 406
```
**Causa**: Problema com políticas RLS da tabela `user_activity`

### **2. WebSocket failed - Realtime**
```
WebSocket connection failed
❌ ERRO no canal realtime de notificações
```
**Causa**: Realtime não está habilitado ou políticas RLS bloqueando

---

## ✅ **SOLUÇÃO RÁPIDA:**

### **PARTE 1: Corrigir user_activity (SQL)**

**Supabase Dashboard** → **SQL Editor** → Copiar e executar:

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their own activity" ON user_activity;
DROP POLICY IF EXISTS "Anyone can view user activity" ON user_activity;

-- Criar política correta (leitura pública)
CREATE POLICY "Enable read access for all users" ON user_activity
  FOR SELECT USING (true);

-- Criar política de escrita (apenas próprio usuário)
CREATE POLICY "Enable insert for authenticated users only" ON user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON user_activity
  FOR UPDATE USING (auth.uid() = user_id);

-- Garantir RLS habilitado
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Verificar
SELECT * FROM user_activity LIMIT 5;
```

**Resultado esperado**: Consulta retorna dados ✅

---

### **PARTE 2: Corrigir Realtime (SQL + Dashboard)**

#### **2.1 Executar SQL:**

```sql
-- Corrigir políticas de notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

#### **2.2 Habilitar Realtime no Dashboard:**

⚠️ **PASSO CRÍTICO:**

1. **Supabase Dashboard** → **Database** → **Replication**
2. Procurar tabela **`notifications`**
3. Se estiver **desabilitado**, clicar em **"Enable"**
4. **Salvar** (Save)

**Isso resolve o erro de WebSocket!** ✅

---

## 🧪 **TESTAR APÓS CORRIGIR:**

### **1. Recarregar a página**
```
F5 ou Ctrl+R
```

### **2. Abrir Console (F12)**

**Você DEVE ver**:
```javascript
✅ Realtime de notificações CONECTADO com sucesso!
⚡ Sistema pronto para receber notificações instantâneas
```

**NÃO deve ver mais**:
```javascript
❌ ERRO no canal realtime de notificações
Failed to load resource: 406
WebSocket connection failed
```

---

## 📊 **VERIFICAR STATUS:**

### **Console sem erros:**
```javascript
🔔 Sistema de notificações INICIADO
✅ Usando TRIGGERS SQL + REALTIME
📡 Status da conexão realtime: SUBSCRIBED  // ← Deve estar SUBSCRIBED
✅ Realtime de notificações CONECTADO com sucesso!
```

### **Testar notificação:**
1. Enviar mensagem entre 2 usuários
2. Notificação deve aparecer **instantaneamente**
3. Sem erros no console

---

## 🎯 **RESUMO:**

| Problema | Solução | Onde |
|----------|---------|------|
| Erro 406 user_activity | Corrigir RLS | SQL Editor |
| WebSocket failed | Habilitar Realtime | Dashboard → Replication |
| Políticas notifications | Corrigir RLS | SQL Editor |

---

## 📁 **ARQUIVOS COMPLETOS:**

- `scripts/fix-user-activity-rls.sql` - SQL completo para user_activity
- `scripts/fix-realtime-connection.sql` - SQL completo para realtime

---

## ⏱️ **TEMPO ESTIMADO:**

- **Executar SQL**: 2 minutos
- **Habilitar Realtime**: 1 minuto
- **Testar**: 1 minuto
- **Total**: 4 minutos

---

## 🚨 **SE AINDA DER ERRO:**

### **Erro persiste após correção:**

1. **Limpar cache do navegador** (Ctrl+Shift+Delete)
2. **Abrir aba anônima** e testar
3. **Verificar se SQL foi executado** sem erros
4. **Verificar se Realtime está habilitado** no Dashboard

### **WebSocket ainda falha:**

Verifique no Dashboard:
- **Settings** → **API** → **Realtime API enabled?**
- Deve estar **ON** ✅

---

**Execute as correções e me avise o resultado!** 🚀

