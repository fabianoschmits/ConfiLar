# 🚀 COMO EXECUTAR OS TRIGGERS SQL

## ⚠️ **IMPORTANTE - LEIA PRIMEIRO:**

Este é o passo **MAIS IMPORTANTE** para corrigir o sistema de notificações.
Sem os triggers, o sistema continuará usando polling e terá delay.

---

## 📋 **PASSO A PASSO:**

### **1️⃣ Acessar o Supabase Dashboard**
```
1. Abra seu navegador
2. Vá para: https://supabase.com/dashboard
3. Faça login
4. Selecione o projeto: ConfiLar
```

### **2️⃣ Abrir o SQL Editor**
```
1. No menu lateral, clique em "SQL Editor"
2. Clique em "+ New query" para criar uma nova consulta
```

### **3️⃣ Copiar o SQL**
```
1. Abra o arquivo: scripts/create-notification-triggers.sql
2. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
3. Cole no SQL Editor do Supabase (Ctrl+V)
```

### **4️⃣ Executar o SQL**
```
1. Clique no botão "Run" (ou pressione Ctrl+Enter)
2. Aguarde a execução (deve ser rápido, < 5 segundos)
3. Verifique se não há erros na parte inferior
```

### **5️⃣ Verificar se os Triggers Foram Criados**
```sql
-- Execute esta query para verificar:
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'trigger_notify_%'
ORDER BY event_object_table, trigger_name;
```

**Resultado esperado**: Deve mostrar 4 triggers:
- `trigger_notify_new_message` na tabela `messages`
- `trigger_notify_new_favorite` na tabela `user_favorites`
- `trigger_notify_new_recommendation` na tabela `user_recommendations`
- `trigger_notify_new_review` na tabela `reviews`

---

## 🧪 **TESTANDO OS TRIGGERS:**

### **Teste 1: Mensagem**
```sql
-- Buscar 2 usuários existentes
SELECT id, full_name FROM profiles LIMIT 2;

-- Copie os IDs e substitua abaixo:
INSERT INTO messages (sender_id, receiver_id, conversation_id, content)
VALUES (
  'USUARIO-A-ID-AQUI',
  'USUARIO-B-ID-AQUI',
  gen_random_uuid(),
  'Teste de notificação de mensagem'
);

-- Verificar se a notificação foi criada
SELECT * FROM notifications 
WHERE user_id = 'USUARIO-B-ID-AQUI' 
AND type = 'message'
ORDER BY created_at DESC 
LIMIT 1;
```

Se a notificação aparecer, **SUCESSO!** ✅

### **Teste 2: Favorito**
```sql
-- Favoritar um usuário
INSERT INTO user_favorites (user_id, favorite_user_id)
VALUES ('USUARIO-A-ID', 'USUARIO-B-ID');

-- Verificar notificação
SELECT * FROM notifications 
WHERE user_id = 'USUARIO-B-ID' 
AND type = 'favorite'
ORDER BY created_at DESC 
LIMIT 1;
```

---

## ✅ **VERIFICAÇÃO FINAL:**

Após executar os triggers, você deve ver nos logs do frontend:

```
🔔 Sistema de notificações INICIADO
✅ Usando TRIGGERS SQL + REALTIME
⚡ Notificações INSTANTÂNEAS (sem polling)
🎯 Sistema otimizado e eficiente

📋 Como funciona agora:
  1. Evento acontece (mensagem, favorito, etc)
  2. Trigger SQL cria notificação automaticamente
  3. Realtime envia para frontend INSTANTANEAMENTE
  4. Frontend atualiza UI em < 1 segundo

✅ Sistema pronto!
📡 Status da conexão realtime de notificações: SUBSCRIBED
✅ Realtime de notificações CONECTADO com sucesso!
⚡ Sistema pronto para receber notificações instantâneas
```

---

## 🚨 **SE ALGO DER ERRADO:**

### **Erro: "relation already exists"**
**Solução**: Triggers já foram criados. Tudo certo! ✅

### **Erro: "permission denied"**
**Solução**: Use o service_role_key no Supabase Dashboard.

### **Triggers não aparecem na verificação**
**Solução**: 
1. Verifique se o SQL foi executado sem erros
2. Tente executar novamente
3. Verifique se está no projeto correto

### **Notificações não chegam instantaneamente**
**Solução**:
1. Verifique se os triggers foram criados
2. Verifique logs do console (F12)
3. Verifique se o realtime está conectado
4. Teste criar uma mensagem manualmente

---

## 📞 **SUPORTE:**

Se precisar de ajuda:
1. Verifique os logs do console do navegador (F12)
2. Verifique os logs do SQL Editor no Supabase
3. Execute o script: `node scripts/check-notification-system.js`

---

## 🎯 **PRÓXIMO PASSO:**

Após executar os triggers com sucesso:
1. ✅ Faça um build: `npm run build`
2. ✅ Teste enviando uma mensagem
3. ✅ Verifique se a notificação chega instantaneamente
4. ✅ Monitore os logs por 24h

**Sistema estará 100% funcional!** 🎉

