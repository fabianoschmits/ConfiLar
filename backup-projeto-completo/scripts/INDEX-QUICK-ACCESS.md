# ⚡ ÍNDICE RÁPIDO - Acesso aos Scripts Mais Usados

## 🎯 SCRIPTS ESSENCIAIS (Execute Primeiro)

### 1. **Configuração Inicial**
```bash
📍 scripts/setup/setup-supabase.js
📍 scripts/database/supabase-agenda-complete.sql
📍 scripts/database/criar-todas-tabelas-novas.sql
```

### 2. **Sistema de Notificações**
```bash
📍 scripts/notifications/fix_notifications_system.sql
📍 scripts/notifications/create_notification_preferences.sql
📍 scripts/notifications/test_notifications_system.sql
```

### 3. **Upload de Arquivos**
```bash
📍 scripts/uploads/fix-avatar-upload-rls-v3.sql
📍 scripts/storage/fix_storage_policies.sql
```

---

## 🔧 SCRIPTS DE CORREÇÃO POR PROBLEMA

### ❌ **Problemas de Autenticação/Login**
```bash
🔧 scripts/database/fix-profiles-rls.sql
🔧 scripts/database/fix-rls-simple.sql
🔧 scripts/database/simple-rls-fix-v2.sql
```

### 📤 **Problemas de Upload de Avatar**
```bash
🔧 scripts/uploads/fix-avatar-upload-rls-v3.sql
🔧 scripts/uploads/fix-avatar-upload-rls-v2.sql
🔧 scripts/uploads/fix-avatar-upload-rls.sql
```

### 💾 **Problemas de Storage**
```bash
🔧 scripts/storage/fix_storage_policies.sql
🔧 scripts/storage/fix_storage_issues.sql
🔧 scripts/storage/corrigir-storage-ultra-simples.sql
```

### 🔔 **Problemas de Notificações**
```bash
🔧 scripts/notifications/fix_notifications_table.sql
🔧 scripts/notifications/fix_notifications_system.sql
🔧 scripts/notifications/check_notifications_table.sql
```

### 📋 **Problemas de Classificados**
```bash
🔧 scripts/database/fix-classified-ads-structure.sql
🔧 scripts/database/fix-classified-ads-likes.sql
🔧 scripts/database/create-classified-ads-table.sql
```

---

## 🔍 SCRIPTS DE DIAGNÓSTICO

### **Verificar Estado Geral**
```bash
🔍 scripts/database/diagnose-database.sql
🔍 scripts/database/check-tables-structure.sql
🔍 scripts/database/quick-check-tables.sql
```

### **Verificar Componentes Específicos**
```bash
🔍 scripts/database/check-profiles-table.sql
🔍 scripts/database/check-user-avatars.sql
🔍 scripts/notifications/check_notifications_table.sql
🔍 scripts/storage/check_storage.sql
```

---

## ⚠️ SCRIPTS DE EMERGÊNCIA (Último Recurso)

### **Limpeza Completa (Cuidado!)**
```bash
⚠️ scripts/database/force-clean-agenda.sql
⚠️ scripts/database/limpar-politicas-completamente.sql
⚠️ scripts/database/corrigir-rls-100-limpo.sql
```

---

## 📚 DOCUMENTAÇÃO POR TEMA

### **Guia de Instalação**
```bash
📖 scripts/documentation/SUPABASE_SETUP.md
📖 scripts/documentation/MIGRATION_INSTRUCTIONS.md
📖 scripts/documentation/PWA_GUIDE.md
```

### **Correções Específicas**
```bash
📖 scripts/documentation/CORRIGIR-RLS-PROFILES.md
📖 scripts/documentation/CORRIGIR-UPLOAD-AVATARES.md
📖 scripts/documentation/CORREÇÃO_NOTIFICAÇÕES.md
```

### **Funcionalidades**
```bash
📖 scripts/documentation/FUNCTIONALITY_SUMMARY.md
📖 scripts/documentation/IMPROVEMENTS-SUMMARY.md
📖 scripts/documentation/SISTEMA-CONFIANCA-REPUTACAO.md
```

---

## 🚀 ORDEM RECOMENDADA DE EXECUÇÃO

### **1. Diagnóstico**
```bash
1️⃣ scripts/database/diagnose-database.sql
2️⃣ scripts/database/check-tables-structure.sql
```

### **2. Correções Básicas**
```bash
3️⃣ scripts/database/fix-rls-simple.sql
4️⃣ scripts/database/fix-profiles-rls.sql
```

### **3. Sistema de Notificações**
```bash
5️⃣ scripts/notifications/fix_notifications_system.sql
6️⃣ scripts/notifications/create_notification_preferences.sql
```

### **4. Upload e Storage**
```bash
7️⃣ scripts/uploads/fix-avatar-upload-rls-v3.sql
8️⃣ scripts/storage/fix_storage_policies.sql
```

### **5. Testes**
```bash
9️⃣ scripts/notifications/test_notifications_system.sql
🔍 Verificar se tudo funciona
```

---

## 📋 CHECKLIST DE VERIFICAÇÃO

### ✅ **Após Configuração Inicial:**
- [ ] Login funcionando
- [ ] Perfil carregando
- [ ] Avatar upload funcionando
- [ ] Notificações aparecendo

### ✅ **Após Correções:**
- [ ] RLS policies ativas
- [ ] Storage buckets configurados
- [ ] Notificações sendo salvas
- [ ] Upload de arquivos OK

---

## 🎯 SCRIPTS MAIS USADOS

| Problema | Script Recomendado |
|----------|-------------------|
| Login não funciona | `fix-profiles-rls.sql` |
| Avatar não sobe | `fix-avatar-upload-rls-v3.sql` |
| Notificações não salvam | `fix_notifications_system.sql` |
| Storage erro | `fix_storage_policies.sql` |
| Tabelas corrompidas | `diagnose-database.sql` |

---

## 💡 DICAS DE USO

1. **Sempre faça backup** antes de executar scripts de correção
2. **Execute primeiro** os scripts de diagnóstico
3. **Teste cada mudança** antes de prosseguir
4. **Use scripts de emergência** apenas como último recurso
5. **Consulte a documentação** se não souber qual script usar

---

## 📞 SUPORTE RÁPIDO

**Problemas comuns e soluções:**

- **RLS Error**: `scripts/database/fix-rls-simple.sql`
- **Upload Error**: `scripts/uploads/fix-avatar-upload-rls-v3.sql`
- **Notification Error**: `scripts/notifications/fix_notifications_system.sql`
- **Storage Error**: `scripts/storage/fix_storage_policies.sql`

**Para diagnóstico completo:** `scripts/database/diagnose-database.sql`
