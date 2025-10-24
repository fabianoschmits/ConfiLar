# 🚀 Como Instalar o Sistema ConfiPoints

## ⚠️ **IMPORTANTE: Execute na Ordem!**

---

## 📋 **PASSO A PASSO**

### **1. Abrir Supabase SQL Editor**
1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor**
3. Clique em **New Query**

---

### **2. Executar FASE 1 (Base)** ✅

**Copie e cole TODO o conteúdo de:**
```
scripts/create-points-system-phase1.sql
```

**Clique em RUN (ou Ctrl+Enter)**

**Aguarde:** ~10 segundos

**Verificar:** Se não deu erro, prossiga!

---

### **3. Executar FASE 2 (Economia)** ✅

**Copie e cole TODO o conteúdo de:**
```
scripts/create-points-system-phase2-economy.sql
```

**Clique em RUN**

**Aguarde:** ~10 segundos

**Verificar:** Se não deu erro, prossiga!

---

### **4. Executar Anti-Fraude** ✅

**Copie e cole TODO o conteúdo de:**
```
scripts/create-antifraud-system.sql
```

**Clique em RUN**

**Aguarde:** ~10 segundos

**Verificar:** Se não deu erro, PRONTO!

---

## ✅ **VERIFICAÇÃO**

Execute este SQL para confirmar que tudo foi instalado:

```sql
-- Verificar tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (
  table_name LIKE '%point%' OR 
  table_name IN ('user_verification', 'fraud_detection')
)
ORDER BY table_name;
```

**Deve mostrar 13 tabelas:**
1. ✅ fraud_detection
2. ✅ point_locks
3. ✅ point_transactions
4. ✅ points_config
5. ✅ points_packages
6. ✅ points_purchases
7. ✅ points_store_items
8. ✅ points_store_purchases
9. ✅ points_system_config
10. ✅ points_transfers
11. ✅ points_withdrawals
12. ✅ user_points_balance
13. ✅ user_verification

---

## ❌ **SE DER ERRO**

### **Erro: "relation already exists"**
**Solução:** Já está instalado! Pule este script.

### **Erro: "relation does not exist"**
**Solução:** Execute o script anterior primeiro!

### **Erro: "function already exists"**
**Solução:** Normal, pode ignorar.

---

## 🎯 **ORDEM CORRETA (RESUMO)**

```
1️⃣ create-points-system-phase1.sql
        ↓
2️⃣ create-points-system-phase2-economy.sql
        ↓
3️⃣ create-antifraud-system.sql
        ↓
    ✅ PRONTO!
```

---

## 🔥 **DICA RÁPIDA**

Se quiser executar tudo de uma vez:

1. Abra `create-points-system-phase1.sql`
2. **Copie TODO o conteúdo**
3. Cole no SQL Editor
4. **RUN**
5. Aguarde terminar
6. Repita para os outros 2 arquivos

---

## ✅ **APÓS INSTALAÇÃO**

Execute um build para testar:
```bash
npm run build
```

Se compilar sem erros = **SUCESSO!** 🎉

---

## 📞 **PRECISA DE AJUDA?**

Se der algum erro:
1. Copie a mensagem de erro completa
2. Me mande
3. Vou resolver! 😊

**Sistema está quase pronto para uso!** 🚀
