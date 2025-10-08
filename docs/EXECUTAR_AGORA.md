# ⚡ EXECUTAR TRIGGERS SQL - GUIA RÁPIDO

## 🚨 **ATENÇÃO: Este é o passo FINAL e CRÍTICO!**

Sem executar este SQL, as notificações NÃO funcionarão instantaneamente.

---

## 📋 **PASSO A PASSO (5 MINUTOS):**

### **1️⃣ Abrir Supabase Dashboard**
```
URL: https://supabase.com/dashboard
Projeto: ConfiLar
```

### **2️⃣ Ir para SQL Editor**
```
Menu lateral → SQL Editor → "+ New query"
```

### **3️⃣ Copiar ESTE SQL:**

```sql
-- =====================================================
-- TRIGGERS PARA NOTIFICAÇÕES AUTOMÁTICAS
-- =====================================================

-- 1. FUNÇÃO PARA MENSAGENS
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
  existing_notification UUID;
BEGIN
  IF NEW.sender_id = NEW.receiver_id THEN
    RETURN NEW;
  END IF;

  SELECT full_name INTO sender_name FROM profiles WHERE id = NEW.sender_id;

  SELECT id INTO existing_notification
  FROM notifications
  WHERE user_id = NEW.receiver_id
    AND type = 'message'
    AND metadata->>'message_id' = NEW.id::text;

  IF existing_notification IS NULL THEN
    INSERT INTO notifications (user_id, title, message, type, priority, action_url, metadata)
    VALUES (
      NEW.receiver_id,
      '💬 Nova mensagem de ' || COALESCE(sender_name, 'Usuário'),
      LEFT(NEW.content, 100),
      'message',
      'high',
      NULL,
      jsonb_build_object('sender_name', COALESCE(sender_name, 'Usuário'), 'conversation_id', NEW.conversation_id, 'sender_id', NEW.sender_id, 'message_id', NEW.id, 'action_type', 'open_chat')
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_new_message ON messages;
CREATE TRIGGER trigger_notify_new_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION create_message_notification();

-- 2. FUNÇÃO PARA FAVORITOS
CREATE OR REPLACE FUNCTION create_favorite_notification()
RETURNS TRIGGER AS $$
DECLARE
  favoriter_name TEXT;
  existing_notification UUID;
BEGIN
  SELECT full_name INTO favoriter_name FROM profiles WHERE id = NEW.user_id;

  SELECT id INTO existing_notification
  FROM notifications
  WHERE user_id = NEW.favorite_user_id
    AND type = 'favorite'
    AND metadata->>'favorite_id' = NEW.id::text;

  IF existing_notification IS NULL THEN
    INSERT INTO notifications (user_id, title, message, type, priority, action_url, metadata)
    VALUES (
      NEW.favorite_user_id,
      '❤️ ' || COALESCE(favoriter_name, 'Usuário') || ' adicionou você aos favoritos',
      'Seu perfil foi adicionado aos favoritos',
      'favorite',
      'normal',
      '/perfil/' || NEW.user_id,
      jsonb_build_object('favoriter_name', COALESCE(favoriter_name, 'Usuário'), 'favoriter_id', NEW.user_id, 'favorite_id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_new_favorite ON user_favorites;
CREATE TRIGGER trigger_notify_new_favorite
AFTER INSERT ON user_favorites
FOR EACH ROW
EXECUTE FUNCTION create_favorite_notification();

-- 3. FUNÇÃO PARA RECOMENDAÇÕES
CREATE OR REPLACE FUNCTION create_recommendation_notification()
RETURNS TRIGGER AS $$
DECLARE
  recommender_name TEXT;
  existing_notification UUID;
BEGIN
  SELECT full_name INTO recommender_name FROM profiles WHERE id = NEW.recommender_id;

  SELECT id INTO existing_notification
  FROM notifications
  WHERE user_id = NEW.recommended_id
    AND type = 'recommendation'
    AND metadata->>'recommendation_id' = NEW.id::text;

  IF existing_notification IS NULL THEN
    INSERT INTO notifications (user_id, title, message, type, priority, action_url, metadata)
    VALUES (
      NEW.recommended_id,
      '⭐ ' || COALESCE(recommender_name, 'Usuário') || ' recomendou você',
      'Você recebeu uma nova recomendação',
      'recommendation',
      'normal',
      '/perfil/' || NEW.recommender_id,
      jsonb_build_object('recommender_name', COALESCE(recommender_name, 'Usuário'), 'recommender_id', NEW.recommender_id, 'recommendation_id', NEW.id, 'recommendation_type', NEW.recommendation_type)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_new_recommendation ON user_recommendations;
CREATE TRIGGER trigger_notify_new_recommendation
AFTER INSERT ON user_recommendations
FOR EACH ROW
EXECUTE FUNCTION create_recommendation_notification();

-- 4. FUNÇÃO PARA AVALIAÇÕES
CREATE OR REPLACE FUNCTION create_review_notification()
RETURNS TRIGGER AS $$
DECLARE
  reviewer_name TEXT;
  existing_notification UUID;
BEGIN
  IF NEW.reviewer_id = NEW.reviewed_id THEN
    RETURN NEW;
  END IF;

  SELECT full_name INTO reviewer_name FROM profiles WHERE id = NEW.reviewer_id;

  SELECT id INTO existing_notification
  FROM notifications
  WHERE user_id = NEW.reviewed_id
    AND type = 'review'
    AND metadata->>'review_id' = NEW.id::text;

  IF existing_notification IS NULL THEN
    INSERT INTO notifications (user_id, title, message, type, priority, action_url, metadata)
    VALUES (
      NEW.reviewed_id,
      '⭐ ' || COALESCE(reviewer_name, 'Usuário') || ' avaliou você',
      'Você recebeu uma avaliação de ' || NEW.rating_person || ' estrelas',
      'review',
      'normal',
      '/avaliacoes',
      jsonb_build_object('reviewer_name', COALESCE(reviewer_name, 'Usuário'), 'reviewer_id', NEW.reviewer_id, 'review_id', NEW.id, 'rating', NEW.rating_person)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_new_review ON reviews;
CREATE TRIGGER trigger_notify_new_review
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION create_review_notification();

-- VERIFICAR SE TRIGGERS FORAM CRIADOS
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'trigger_notify_%'
ORDER BY event_object_table;
```

### **4️⃣ Colar no SQL Editor**
```
Ctrl+A para selecionar tudo no editor
Ctrl+V para colar o SQL acima
```

### **5️⃣ Executar**
```
Clicar em "Run" ou pressionar Ctrl+Enter
Aguardar 3-5 segundos
```

### **6️⃣ Verificar Resultado**
```
Na parte inferior deve aparecer:
✅ Success. 4 rows returned

Você verá uma tabela com 4 triggers:
- trigger_notify_new_message
- trigger_notify_new_favorite
- trigger_notify_new_recommendation
- trigger_notify_new_review
```

---

## ✅ **PRONTO!**

Agora as notificações serão **INSTANTÂNEAS**!

### **Para Testar:**
1. Abra 2 navegadores (ou abas anônimas)
2. Login como usuário A em um
3. Login como usuário B no outro
4. Usuário A envia mensagem para B
5. **Notificação aparece INSTANTANEAMENTE** para B! ⚡

---

## 🎯 **LOGS QUE VOCÊ VERÁ:**

No console do navegador (F12):
```
✅ Realtime de notificações CONECTADO com sucesso!
⚡ Sistema pronto para receber notificações instantâneas
🔔 Nova notificação recebida via realtime: {...}
✅ Adicionando nova notificação ao estado
```

---

## 🚨 **SE DER ERRO:**

**Erro comum**: "relation does not exist"
- **Solução**: Verifique se as tabelas existem (messages, user_favorites, etc)

**Erro**: "permission denied"
- **Solução**: Use o dashboard do Supabase (já tem permissão)

---

## 📞 **PRECISA DE AJUDA?**

Me avise se der algum erro e eu te ajudo a resolver!

**Boa sorte! 🚀**

