# 📋 Ordem de Execução dos Scripts SQL

## ⚠️ IMPORTANTE: Executar na Ordem Correta!

Os scripts devem ser executados nesta ordem exata:

---

## 1️⃣ **FASE 1 - Sistema de Pontos Base** (PRIMEIRO)
```sql
scripts/create-points-system-phase1.sql
```
**O que cria:**
- ✅ Tabela `user_points_balance`
- ✅ Tabela `point_transactions`
- ✅ Tabela `points_config`
- ✅ Funções base (`add_points`, etc)
- ✅ Triggers automáticos

**Status:** ⏳ PRECISA SER EXECUTADO

---

## 2️⃣ **FASE 2 - Sistema de Economia** (SEGUNDO)
```sql
scripts/create-points-system-phase2-economy.sql
```
**O que cria:**
- ✅ Tabela `points_packages`
- ✅ Tabela `points_purchases`
- ✅ Tabela `points_withdrawals`
- ✅ Tabela `points_transfers`
- ✅ Tabela `points_store_items`
- ✅ Funções de economia

**Depende de:** Fase 1 (user_points_balance)

**Status:** ⏳ AGUARDANDO FASE 1

---

## 3️⃣ **SISTEMA ANTI-FRAUDE** (TERCEIRO)
```sql
scripts/create-antifraud-system.sql
```
**O que cria:**
- ✅ Tabela `user_verification`
- ✅ Tabela `point_locks`
- ✅ Tabela `fraud_detection`
- ✅ Funções anti-fraude
- ✅ Detecção automática

**Depende de:** Fase 1 (user_points_balance, point_transactions)

**Status:** ⏳ AGUARDANDO FASE 1

---

## 📝 **COMO EXECUTAR NO SUPABASE**

### **Opção A: SQL Editor (Recomendado)**

1. Abra o Supabase SQL Editor
2. Copie o conteúdo de cada script
3. Execute na ordem:
   - ✅ Fase 1
   - ✅ Fase 2
   - ✅ Anti-Fraude

### **Opção B: Um Script por Vez**

Execute cada comando separadamente:

```sql
-- 1. FASE 1
\i scripts/create-points-system-phase1.sql

-- 2. FASE 2 (após Fase 1 concluir)
\i scripts/create-points-system-phase2-economy.sql

-- 3. ANTI-FRAUDE (após Fase 2 concluir)
\i scripts/create-antifraud-system.sql
```

---

## ⚠️ **ERROS COMUNS**

### **Erro: "relation user_points_balance does not exist"**
**Solução:** Execute a Fase 1 primeiro!

### **Erro: "function add_points does not exist"**
**Solução:** Execute a Fase 1 primeiro!

### **Erro: "column purchased_balance does not exist"**
**Solução:** Execute o Anti-Fraude por último (ele adiciona essa coluna)

---

## ✅ **VERIFICAÇÃO PÓS-INSTALAÇÃO**

Após executar todos os scripts, verifique:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%point%'
ORDER BY table_name;

-- Deve mostrar:
-- point_locks
-- point_transactions
-- points_config
-- points_packages
-- points_purchases
-- points_store_items
-- points_store_purchases
-- points_system_config
-- points_transfers
-- points_withdrawals
-- user_points_balance

-- Verificar tabelas de segurança
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_verification', 'fraud_detection')
ORDER BY table_name;

-- Deve mostrar:
-- fraud_detection
-- user_verification
```

---

## 🎯 **STATUS ATUAL**

- ❌ Fase 1: NÃO EXECUTADA (necessária)
- ❌ Fase 2: NÃO EXECUTADA (aguardando Fase 1)
- ❌ Anti-Fraude: NÃO EXECUTADA (aguardando Fase 1)

**Próximo passo:** Executar Fase 1!
