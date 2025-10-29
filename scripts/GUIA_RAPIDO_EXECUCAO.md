# 🚀 Guia Rápido - Sistema de Expiração de Posts Premium

## ⚡ Execução em 3 Passos

### **Passo 1: Abrir Supabase SQL Editor**

1. Acesse: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Clique em "New Query"

---

### **Passo 2: Executar Script Completo** ⭐

Copie e cole o conteúdo do arquivo:
```
scripts/create-auto-delete-expired-posts.sql
```

Clique em **"RUN"** ou pressione `Ctrl+Enter`

✅ O script irá:
- ✅ Criar as colunas premium automaticamente (se não existirem)
- ✅ Criar 3 funções de limpeza
- ✅ Criar 2 views de monitoramento
- ✅ Criar 1 trigger automático
- ✅ Criar índices de performance

---

### **Passo 3: Testar o Sistema**

Execute estes comandos no SQL Editor:

#### **3.1 - Verificar se as colunas foram criadas:**
```sql
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'feed_posts'
  AND column_name IN ('is_premium', 'premium_points_spent', 'premium_expires_at', 'premium_highlight_color')
ORDER BY column_name;
```

**Esperado**: 4 linhas retornadas

---

#### **3.2 - Verificar se as funções foram criadas:**
```sql
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name IN (
  'delete_expired_premium_posts',
  'deactivate_expired_premium_posts',
  'maintain_premium_posts',
  'check_post_expiration'
)
ORDER BY routine_name;
```

**Esperado**: 4 funções

---

#### **3.3 - Ver posts expirados (se houver):**
```sql
SELECT * FROM v_expired_premium_posts LIMIT 5;
```

---

#### **3.4 - Ver posts próximos da expiração:**
```sql
SELECT * FROM v_expiring_soon_premium_posts LIMIT 5;
```

---

#### **3.5 - Executar limpeza manual (teste):**
```sql
SELECT * FROM maintain_premium_posts();
```

**Esperado**: JSON com resultado da limpeza
```json
{
  "success": true,
  "deactivated_count": 0,
  "deactivated_post_ids": [],
  "timestamp": "2024-10-29T12:00:00Z"
}
```

---

## ✅ Pronto!

Se todos os passos acima funcionaram, o sistema está instalado e funcionando!

---

## 🔄 Próximo Passo: Automação

Agora você precisa configurar um **cron job** para executar `maintain_premium_posts()` automaticamente a cada hora.

### **Opção 1: Supabase Edge Function** (Recomendado)

1. Criar Edge Function no Supabase
2. Configurar para chamar `maintain_premium_posts()`
3. Agendar para rodar a cada hora

### **Opção 2: Vercel Cron Job**

1. Criar API route: `/api/cron/cleanup-posts`
2. Adicionar no `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup-posts",
    "schedule": "0 * * * *"
  }]
}
```

---

## 🐛 Problemas?

### **Erro: "column is_premium does not exist"**

**Solução**: Execute primeiro `scripts/add-premium-columns-feed-posts.sql`

### **Erro: "trigger already exists"**

**Solução**: 
```sql
DROP TRIGGER IF EXISTS trigger_check_post_expiration ON feed_posts;
```
Depois execute o script novamente.

### **Nenhuma coluna foi criada?**

Verifique se você tem permissões de administrador no Supabase.

---

## 📊 Monitoramento Contínuo

### **Ver quantos posts expirados existem:**
```sql
SELECT COUNT(*) FROM v_expired_premium_posts;
```

### **Ver quantos posts vão expirar nas próximas 24h:**
```sql
SELECT COUNT(*) FROM v_expiring_soon_premium_posts;
```

### **Ver posts premium ativos:**
```sql
SELECT 
  id,
  title,
  premium_points_spent,
  premium_expires_at,
  EXTRACT(EPOCH FROM (premium_expires_at - NOW())) / 3600 AS hours_remaining
FROM feed_posts
WHERE is_premium = TRUE
  AND is_active = TRUE
  AND premium_expires_at > NOW()
ORDER BY premium_expires_at ASC
LIMIT 10;
```

---

## 📝 Checklist Final

- [ ] Script SQL executado sem erros
- [ ] 4 colunas premium criadas
- [ ] 4 funções criadas
- [ ] 2 views criadas
- [ ] 1 trigger criado
- [ ] Teste de `maintain_premium_posts()` executado
- [ ] Cron job configurado (manual)

---

## 🎯 Status do Sistema

Após executar o script:

| Componente | Status |
|------------|--------|
| Colunas Premium | ✅ Criadas |
| Funções de Limpeza | ✅ Criadas |
| Views de Monitoramento | ✅ Criadas |
| Trigger Automático | ✅ Criado |
| Índices de Performance | ✅ Criados |
| **Cron Job Automático** | ⏳ **Pendente** |

---

## 📚 Documentação Completa

Ver: `docs/SISTEMA_EXPIRACAO_POSTS_PREMIUM.md`

---

**Dúvidas?** Verifique a seção de Troubleshooting na documentação completa!

