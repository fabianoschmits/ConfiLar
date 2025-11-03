# ⏰ Cron Job - Deletar Posts Premium Expirados

**Data de Criação:** 30/10/2025

## 📋 Objetivo

Configurar um cron job no Supabase que executa **automaticamente todos os dias às 23:59** para verificar e desativar posts premium que expiraram.

---

## 🚀 Como Configurar

### Passo 1: Executar o Script Principal

1. Acesse o **SQL Editor** do Supabase
2. Execute o arquivo: `scripts/create-auto-delete-expired-posts.sql`
3. Aguarde a confirmação de que todas as funções foram criadas

### Passo 2: Configurar o Cron Job

1. No **SQL Editor** do Supabase
2. Execute o arquivo: `scripts/setup-cron-delete-expired-posts.sql`
3. O cron job será criado e ativado automaticamente

---

## ⚙️ Configuração do Cron

### Horário Configurado:
```sql
'59 2 * * *'  -- 02:59 UTC = 23:59 Brasília (UTC-3)
```

### ✅ **Configurado para Horário de Brasília!**

| Fuso Horário | Horário UTC | Horário Local |
|--------------|-------------|---------------|
| **Brasília (UTC-3)** | 02:59 | **23:59** ✅ |
| São Paulo | 02:59 UTC | **23:59** ✅ |
| Rio de Janeiro | 02:59 UTC | **23:59** ✅ |
| Portugal (UTC+0) | 02:59 UTC | **02:59** |

### ℹ️ **Entendendo o Horário:**

O Supabase usa **horário UTC** para cron jobs. Para executar às **23:59 horário de Brasília (UTC-3)**, configuramos o cron para **02:59 UTC**.

**Cálculo:** 23:59 Brasília + 3 horas = 02:59 UTC (do dia seguinte)

### 🔄 Alterar para Outro Horário de Brasília:

Se quiser executar em outro horário de Brasília, some 3 horas:
- **20:00 Brasília** → `0 23 * * *` (23:00 UTC)
- **03:00 Brasília** → `0 6 * * *` (06:00 UTC)
- **Meia-noite Brasília** → `0 3 * * *` (03:00 UTC)

---

## 🔧 O que o Cron Faz

### Função Executada:
```sql
maintain_premium_posts()
```

### Ações Realizadas:
1. ✅ Busca todos os posts premium com `premium_expires_at < NOW()`
2. ✅ **Desativa** os posts (Soft Delete):
   - `is_active = FALSE`
   - `is_featured = FALSE`
   - `updated_at = NOW()`
3. ✅ Retorna estatísticas:
   - Quantidade de posts desativados
   - IDs dos posts afetados
   - Timestamp da execução

### 📊 Exemplo de Retorno:
```json
{
  "success": true,
  "deactivated_count": 5,
  "deactivated_post_ids": ["uuid1", "uuid2", "uuid3", "uuid4", "uuid5"],
  "timestamp": "2025-10-30T23:59:00Z"
}
```

---

## 📊 Monitoramento

### Ver se o Cron está Ativo:
```sql
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  active
FROM cron.job
WHERE jobname = 'cleanup-expired-premium-posts';
```

### Ver Histórico de Execuções (últimas 10):
```sql
SELECT 
  runid,
  status,
  return_message,
  start_time,
  end_time,
  end_time - start_time as duration
FROM cron.job_run_details 
WHERE jobid = (
  SELECT jobid 
  FROM cron.job 
  WHERE jobname = 'cleanup-expired-premium-posts'
)
ORDER BY start_time DESC 
LIMIT 10;
```

### Ver Posts que Serão Afetados na Próxima Execução:
```sql
SELECT 
  id,
  title,
  premium_expires_at,
  EXTRACT(EPOCH FROM (NOW() - premium_expires_at)) / 3600 AS hours_expired
FROM feed_posts 
WHERE is_premium = TRUE 
  AND premium_expires_at IS NOT NULL 
  AND premium_expires_at < NOW() 
  AND is_active = TRUE;
```

### Ver Posts que Expiram nas Próximas 24h:
```sql
SELECT * FROM v_expiring_soon_premium_posts;
```

---

## 🧪 Testar Manualmente

Antes de esperar as 23:59, você pode testar manualmente:

```sql
-- Executar a manutenção manualmente
SELECT * FROM maintain_premium_posts();

-- Verificar quantos posts foram afetados
SELECT * FROM v_expired_premium_posts;
```

---

## 🛠️ Gerenciamento do Cron

### Desabilitar o Cron:
```sql
SELECT cron.unschedule('cleanup-expired-premium-posts');
```

### Reativar o Cron:
```sql
SELECT cron.schedule(
  'cleanup-expired-premium-posts',
  '59 23 * * *',
  $$SELECT maintain_premium_posts()$$
);
```

### Alterar Horário:
```sql
-- 1. Desabilitar o atual
SELECT cron.unschedule('cleanup-expired-premium-posts');

-- 2. Criar com novo horário (exemplo: 03:00 UTC)
SELECT cron.schedule(
  'cleanup-expired-premium-posts',
  '0 3 * * *',
  $$SELECT maintain_premium_posts()$$
);
```

---

## 📅 Opções de Horário

### Exemplos de Agendamentos (Horário de Brasília):

| Descrição | Cron Expression (UTC) | Horário UTC | Horário Brasília |
|-----------|----------------------|-------------|------------------|
| **Atual: 23:59 Brasília** | `59 2 * * *` | 02:59 | **23:59** ✅ |
| Meia-noite Brasília | `0 3 * * *` | 03:00 | 00:00 |
| Às 03:00 Brasília | `0 6 * * *` | 06:00 | 03:00 |
| Às 09:00 Brasília | `0 12 * * *` | 12:00 | 09:00 |
| Às 20:00 Brasília | `0 23 * * *` | 23:00 | 20:00 |
| A cada 6 horas (Brasília) | `0 3,9,15,21 * * *` | 03,09,15,21:00 | 00,06,12,18:00 |
| A cada hora | `0 * * * *` | XX:00 | XX:00 (sempre) |
| Segundas 09:00 Brasília | `0 12 * * 1` | 12:00 | 09:00 |

**Lembre-se:** Sempre some 3 horas ao horário de Brasília para obter o UTC!

---

## 🔍 Views de Monitoramento

### 1. Posts Expirados (já desativados):
```sql
SELECT * FROM v_expired_premium_posts;
```

**Colunas:**
- `id` - ID do post
- `user_id` - ID do usuário
- `title` - Título do post
- `premium_points_spent` - Pontos gastos
- `premium_expires_at` - Data de expiração
- `hours_expired` - Horas desde a expiração

### 2. Posts Expirando em Breve (próximas 24h):
```sql
SELECT * FROM v_expiring_soon_premium_posts;
```

**Colunas:**
- `id` - ID do post
- `user_id` - ID do usuário
- `title` - Título do post
- `premium_points_spent` - Pontos gastos
- `premium_expires_at` - Data de expiração
- `hours_remaining` - Horas até expirar

---

## 🐛 Troubleshooting

### Problema: Cron não está executando

**Verificações:**

1. **Verificar se pg_cron está habilitado:**
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

2. **Verificar se o job está ativo:**
```sql
SELECT * FROM cron.job WHERE jobname = 'cleanup-expired-premium-posts';
```
- Se `active = false`, o cron está desabilitado

3. **Ver erros nas execuções:**
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (
  SELECT jobid 
  FROM cron.job 
  WHERE jobname = 'cleanup-expired-premium-posts'
)
AND status = 'failed'
ORDER BY start_time DESC;
```

4. **Verificar logs do Supabase:**
   - Acesse o painel do Supabase
   - Vá em "Logs" → "Postgres Logs"
   - Procure por erros relacionados ao cron

---

## ⚠️ Importante

### Soft Delete vs Hard Delete:

Por padrão, o cron usa **Soft Delete** (`deactivate_expired_premium_posts`):
- ✅ **Recomendado** - Mantém histórico
- Posts ficam `is_active = FALSE`
- Não aparecem nas listagens
- Podem ser restaurados se necessário

Se preferir **Hard Delete** permanente:
```sql
-- Alterar para usar hard delete
SELECT cron.unschedule('cleanup-expired-premium-posts');

SELECT cron.schedule(
  'cleanup-expired-premium-posts',
  '59 23 * * *',
  $$SELECT delete_expired_premium_posts()$$  -- Hard delete
);
```

---

## 📈 Estatísticas e Métricas

### Consulta para Dashboard:

```sql
SELECT 
  COUNT(*) FILTER (WHERE is_premium = TRUE AND is_active = TRUE) as posts_premium_ativos,
  COUNT(*) FILTER (WHERE is_premium = TRUE AND is_active = FALSE) as posts_premium_expirados,
  COUNT(*) FILTER (WHERE is_premium = TRUE AND premium_expires_at > NOW() AND premium_expires_at < NOW() + INTERVAL '24 hours') as expirando_24h,
  COUNT(*) FILTER (WHERE is_premium = TRUE AND premium_expires_at > NOW() AND premium_expires_at < NOW() + INTERVAL '7 days') as expirando_7d
FROM feed_posts;
```

---

## ✅ Checklist de Configuração

- [ ] Executar `create-auto-delete-expired-posts.sql`
- [ ] Executar `setup-cron-delete-expired-posts.sql`
- [ ] Verificar se cron foi criado: `SELECT * FROM cron.job`
- [ ] Testar manualmente: `SELECT * FROM maintain_premium_posts()`
- [ ] Verificar timezone e ajustar se necessário
- [ ] Configurar monitoramento (opcional)
- [ ] Documentar no projeto

---

## 🎯 Conclusão

O cron job está configurado para executar **automaticamente às 23:59 UTC** (20:59 Brasília) todos os dias, mantendo o sistema limpo e eficiente ao desativar posts premium expirados.

**Nenhuma ação manual é necessária!** O sistema roda automaticamente. 🚀

