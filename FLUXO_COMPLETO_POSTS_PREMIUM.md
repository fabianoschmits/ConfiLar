# 🎯 FLUXO COMPLETO - SISTEMA DE POSTS PREMIUM COM EXPIRAÇÃO

## ✅ Status: Build Aprovado - Sistema 100% Funcional

---

## 📊 NOVA TABELA DE PREÇOS (4 OPÇÕES)

| Duração | Pontos | Valor (R$) | Custo/Dia | Economia | Badge |
|---------|--------|------------|-----------|----------|-------|
| **1 dia** 🟢 | 1.000 | R$ 10,00 | 1.000 pts/dia | - | **Teste** |
| **7 dias** 🟡 | 3.000 | R$ 30,00 | 429 pts/dia | **57%** | **Popular** |
| **14 dias** 🔴 | 5.000 | R$ 50,00 | 357 pts/dia | **64%** | **Econômico** |
| **30 dias** 🟣 | 9.000 | R$ 90,00 | 300 pts/dia | **70%** | **Máximo** |

### 💡 **Justificativa dos Preços:**

- **1 dia (1.000 pts)**: Opção acessível para testar o sistema
- **7 dias (3.000 pts)**: Boa relação custo/benefício (57% economia vs. 1 dia)
- **14 dias (5.000 pts)**: Melhor valor intermediário (64% economia)
- **30 dias (9.000 pts)**: Máxima economia para quem quer destaque prolongado (70% economia)

**Evita saturação**: Com 1 dia a 1.000 pontos, não fica tão barato a ponto de todo mundo postar premium o tempo todo.

---

## 🔄 FLUXO COMPLETO DO SISTEMA

### **1️⃣ INTERFACE DO USUÁRIO (Frontend)**

```
┌─────────────────────────────────────────────┐
│          👑 POST PREMIUM                    │
│  Escolha a duração do destaque              │
└─────────────────────────────────────────────┘

Saldo Atual: 10.000 pontos 💰

┌──────────┬──────────┬──────────┬──────────┐
│  1 Dia   │  7 Dias  │ 14 Dias  │ 30 Dias  │
│  🟢      │  🟡      │  🔴      │  🟣      │
│  Teste   │ Popular  │Econômico │ Máximo   │
│   [1]    │   [7]    │   [14]   │   [30]   │
│ 1.000pts │ 3.000pts │ 5.000pts │ 9.000pts │
│24 horas  │1 semana  │2 semanas │  1 mês   │
└──────────┴──────────┴──────────┴──────────┘

📝 Título: _____________________________
📄 Descrição: __________________________
🖼️ Imagens (opcional)

[Cancelar]  [Publicar Post Premium ✨]
```

**Arquivo**: `src/components/timeline/PremiumPostForm.tsx`

---

### **2️⃣ USUÁRIO ESCOLHE E PUBLICA**

**Exemplo**: Usuário escolhe **7 dias (3.000 pontos)**

1. ✅ Verifica saldo: `balance >= 3.000`
2. ✅ Preenche título e descrição
3. ✅ Clica em "Publicar Post Premium"

---

### **3️⃣ PROCESSAMENTO (Backend)**

**Hook**: `src/hooks/usePremiumPost.ts`

```typescript
// 1. Verificar saldo
if (balance < 3000) {
  throw new Error('Saldo insuficiente')
}

// 2. Calcular data de expiração
const expiresAt = new Date()
expiresAt.setDate(expiresAt.getDate() + 7) // +7 dias
// Resultado: 2025-11-05T12:00:00Z (se hoje é 29/10)

// 3. Criar post no banco
await supabase.from('feed_posts').insert({
  user_id: '...',
  title: 'Meu Post Premium',
  description: 'Conteúdo...',
  is_premium: true,
  premium_points_spent: 3000,
  premium_expires_at: '2025-11-05T12:00:00Z',
  premium_highlight_color: '#FFD700',
  is_featured: true,
  metadata: {
    type: 'premium',
    points_spent: 3000,
    duration_days: 7,
    expires_at: '2025-11-05T12:00:00Z'
  }
})

// 4. Deduzir pontos
await supabase.rpc('add_points', {
  p_user_id: userId,
  p_points: -3000,
  p_source: 'premium_post',
  p_description: 'Criou post premium (7 dias - 3000 pontos)'
})
```

---

### **4️⃣ ARMAZENAMENTO NO BANCO**

**Tabela**: `feed_posts`

```sql
INSERT INTO feed_posts (
  id, user_id, title, description,
  is_premium,              -- TRUE
  premium_points_spent,    -- 3000
  premium_expires_at,      -- 2025-11-05T12:00:00Z
  premium_highlight_color, -- #FFD700
  is_featured,             -- TRUE
  is_active,               -- TRUE
  created_at,              -- 2025-10-29T12:00:00Z
  metadata                 -- {...}
)
```

**Colunas Premium Criadas**:
- ✅ `is_premium` (BOOLEAN)
- ✅ `premium_points_spent` (INTEGER)
- ✅ `premium_expires_at` (TIMESTAMP)
- ✅ `premium_highlight_color` (VARCHAR)

---

### **5️⃣ POST ATIVO NO FEED**

```
┌─────────────────────────────────────────┐
│ 👑 POST PREMIUM (7 dias restantes ⚡)   │
├─────────────────────────────────────────┤
│ 👤 João Silva • São Paulo               │
│ 📅 Há 5 minutos                          │
│                                          │
│ 🔥 Meu Post Premium                      │
│ Conteúdo destacado com borda dourada... │
│                                          │
│ [❤️ Curtir] [💬 Comentar] [🔗 Compartilhar] │
└─────────────────────────────────────────┘
```

**Destaque Visual**:
- ✨ Borda dourada (`premium_highlight_color`)
- 👑 Ícone de coroa
- ⚡ Badge "Premium" ou "7 dias restantes"
- 📌 Fixado no topo do feed (`is_featured = true`)

---

### **6️⃣ TEMPO PASSA... (7 dias depois)**

**Data Atual**: 05/11/2025 12:00:00

```sql
-- Post agora está expirado
SELECT 
  id,
  premium_expires_at,
  NOW(),
  premium_expires_at < NOW() as esta_expirado
FROM feed_posts
WHERE id = 'post-id';

-- Resultado:
-- esta_expirado = TRUE ❌
```

---

### **7️⃣ LIMPEZA AUTOMÁTICA (Cron Job)**

**Função**: `maintain_premium_posts()`

**Executa a cada hora** via:
- Supabase Edge Function
- Vercel Cron Job
- ou manualmente: `SELECT * FROM maintain_premium_posts()`

```sql
-- O que a função faz:
UPDATE feed_posts
SET 
  is_active = FALSE,      -- ❌ Desativa
  is_featured = FALSE,    -- ❌ Remove destaque
  updated_at = NOW()
WHERE is_premium = TRUE
  AND premium_expires_at < NOW()
  AND is_active = TRUE;

-- Retorna:
{
  "success": true,
  "deactivated_count": 1,
  "deactivated_post_ids": ["post-id"],
  "timestamp": "2025-11-05T12:01:00Z"
}
```

---

### **8️⃣ POST EXPIRADO (Não aparece mais)**

```sql
-- Post agora está inativo
SELECT id, is_active, is_featured
FROM feed_posts
WHERE id = 'post-id';

-- Resultado:
-- is_active = FALSE
-- is_featured = FALSE
```

**No Feed**: Post não aparece mais na listagem (filtro `WHERE is_active = TRUE`)

**Histórico**: Post ainda existe no banco (soft delete) para:
- Estatísticas
- Histórico do usuário
- Analytics
- Pode ser visualizado no perfil do usuário

---

## 🧪 TESTES COMPLETOS

### **Teste 1: Criar Post Premium de 1 Dia**

```bash
# 1. Rodar app em dev
npm run dev

# 2. Acessar: http://localhost:3000/feed

# 3. Clicar em "Criar Post Premium"

# 4. Selecionar "1 Dia - 1.000 pontos"

# 5. Preencher título e descrição

# 6. Publicar
```

**Verificar no Banco**:
```sql
SELECT 
  id,
  title,
  is_premium,
  premium_points_spent,
  premium_expires_at,
  EXTRACT(HOUR FROM (premium_expires_at - created_at)) as horas_duracao
FROM feed_posts 
WHERE is_premium = TRUE 
ORDER BY created_at DESC 
LIMIT 1;

-- Esperado:
-- horas_duracao = 24
-- premium_points_spent = 1000
```

---

### **Teste 2: Simular Expiração**

```sql
-- Forçar post a expirar (APENAS TESTE)
UPDATE feed_posts
SET premium_expires_at = NOW() - INTERVAL '1 hour'
WHERE id = 'seu-post-id';

-- Executar limpeza
SELECT * FROM maintain_premium_posts();

-- Verificar se foi desativado
SELECT id, is_active, is_featured 
FROM feed_posts 
WHERE id = 'seu-post-id';

-- Esperado:
-- is_active = FALSE
-- is_featured = FALSE
```

---

### **Teste 3: Verificar Views de Monitoramento**

```sql
-- Ver posts expirados
SELECT * FROM v_expired_premium_posts LIMIT 5;

-- Ver posts próximos da expiração (próximas 24h)
SELECT * FROM v_expiring_soon_premium_posts LIMIT 5;

-- Estatísticas gerais
SELECT 
  COUNT(*) as total_posts,
  COUNT(*) FILTER (WHERE is_premium = TRUE) as total_premium,
  COUNT(*) FILTER (WHERE is_premium = TRUE AND is_active = TRUE) as premium_ativos,
  COUNT(*) FILTER (WHERE is_premium = TRUE AND premium_expires_at < NOW()) as premium_expirados
FROM feed_posts;
```

---

### **Teste 4: Testar Todas as 4 Opções**

Criar 4 posts premium, um de cada duração:

| Post | Duração | Pontos | Esperado |
|------|---------|--------|----------|
| Post 1 | 1 dia | 1.000 | Expira em 24h |
| Post 2 | 7 dias | 3.000 | Expira em 7 dias |
| Post 3 | 14 dias | 5.000 | Expira em 14 dias |
| Post 4 | 30 dias | 9.000 | Expira em 30 dias |

**Verificar**:
```sql
SELECT 
  id,
  title,
  premium_points_spent,
  premium_expires_at,
  EXTRACT(DAY FROM (premium_expires_at - created_at)) as dias_duracao
FROM feed_posts
WHERE is_premium = TRUE
  AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY premium_points_spent;

-- Esperado: 4 linhas com dias_duracao = 1, 7, 14, 30
```

---

## 📋 CHECKLIST DE FUNCIONALIDADES

### **Frontend** ✅
- [x] Modal com 4 opções de duração (1, 7, 14, 30 dias)
- [x] Grid responsivo (2 cols mobile, 4 cols desktop)
- [x] Badges diferentes para cada opção
- [x] Cores distintas para cada opção
- [x] Validação de saldo
- [x] Preview de custo antes de publicar

### **Backend** ✅
- [x] Hook `usePremiumPost` aceita `durationDays`
- [x] Calcula `premium_expires_at` dinamicamente
- [x] Salva campos premium no banco
- [x] Deduz pontos corretamente
- [x] Toast de sucesso

### **Banco de Dados** ✅
- [x] Colunas premium criadas
- [x] Função `maintain_premium_posts()` funcionando
- [x] Views de monitoramento criadas
- [x] Trigger automático ativo
- [x] Índices de performance criados

### **Build & Deploy** ✅
- [x] Build sem erros
- [x] TypeScript validado
- [x] Nenhum lint error

---

## ⚠️ LEMBRETE IMPORTANTE

### 🔔 **CONFIGURAR CRON JOB**

Você pediu para lembrar de configurar o Cron! Aqui está:

#### **Opção 1: Supabase Edge Function** ⭐ RECOMENDADO

1. No Supabase Dashboard > Edge Functions
2. Criar nova função: `cleanup-expired-posts`
3. Código:
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data, error } = await supabase.rpc('maintain_premium_posts')

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

4. Configurar Cron: `0 * * * *` (a cada hora)

#### **Opção 2: Vercel Cron**

Adicionar em `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup-posts",
    "schedule": "0 * * * *"
  }]
}
```

Criar `src/app/api/cron/cleanup-posts/route.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase.rpc('maintain_premium_posts')

  return NextResponse.json({ result: data })
}
```

---

## 📊 RESUMO FINAL

### **Arquivos Modificados**:
1. ✅ `src/constants/premiumPrices.ts` - 4 opções de preço
2. ✅ `src/components/timeline/PremiumPostForm.tsx` - 4 cards visuais
3. ✅ `src/hooks/usePremiumPost.ts` - Salva expiração
4. ✅ `src/hooks/useUnifiedTimeline.ts` - Aceita durationDays
5. ✅ `src/app/feed/page.tsx` - Passa durationDays

### **Scripts SQL Criados**:
1. ✅ `scripts/add-premium-columns-feed-posts.sql`
2. ✅ `scripts/create-auto-delete-expired-posts.sql`
3. ✅ `scripts/verificar-sistema-premium.sql`

### **Documentação**:
1. ✅ `docs/SISTEMA_EXPIRACAO_POSTS_PREMIUM.md`
2. ✅ `scripts/GUIA_RAPIDO_EXECUCAO.md`
3. ✅ `FLUXO_COMPLETO_POSTS_PREMIUM.md` (este arquivo)

---

## ✅ SISTEMA 100% FUNCIONAL

- ✅ Build aprovado
- ✅ 4 opções de duração implementadas
- ✅ Sistema de expiração automática pronto
- ✅ Banco de dados configurado
- ⏳ **Falta apenas: Configurar Cron Job**

---

**Data**: 29/10/2025
**Status**: ✅ PRONTO PARA PRODUÇÃO
**Próximo Passo**: Configurar Cron Job automático

