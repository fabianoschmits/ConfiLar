# 🔒 REVISÃO COMPLETA DE SEGURANÇA - ConfiLar

## 📅 Data: Outubro 2025

---

## 📊 RESUMO EXECUTIVO

Esta revisão identificou **7 vulnerabilidades críticas** de segurança além das 2 já corrigidas:
- **5 rotas sem validação de autenticação/autorização**
- **2 rotas administrativas sem validação de permissões**
- **1 rota pública que pode expor dados**

---

## 🚨 VULNERABILIDADES CRÍTICAS ENCONTRADAS

### 1. ⚠️ **API de Notificações Push - Subscribe** (CRÍTICA)

**Arquivo:** `src/app/api/notifications/subscribe/route.ts`

**Problema:**
- ❌ Não valida autenticação
- ❌ Aceita `userId` do body sem validação
- ❌ Qualquer pessoa pode criar subscriptions push para qualquer usuário

**Código vulnerável:**
```typescript
export async function POST(request: NextRequest) {
  const { subscription, userId } = await request.json() // ❌ Aceita qualquer userId
  
  const adminSupabase = createAdminSupabaseClient()
  await adminSupabase
    .from('push_subscriptions')
    .upsert({
      user_id: userId, // ❌ Qualquer ID!
      // ...
    })
}
```

**Exploração:**
```javascript
// Atacante pode criar subscription para qualquer usuário
fetch('/api/notifications/subscribe', {
  method: 'POST',
  body: JSON.stringify({
    subscription: { endpoint: '...', keys: {...} },
    userId: 'victim-id' // ⚠️ Vítima receberá notificações destinadas ao atacante
  })
})
```

**Impacto:** 🔴 **CRÍTICO**
- Permite redirecionar notificações push de outros usuários
- Violação de privacidade
- Possibilidade de phishing através de notificações falsas

**Solução:**
```typescript
export const POST = withAuth(async (request, supabase, user) => {
  const { subscription } = await request.json()
  // Sempre usar user.id autenticado
  const authenticatedUserId = user.id
  // ...
})
```

---

### 2. ⚠️ **API de Enviar Notificações Push** (CRÍTICA)

**Arquivo:** `src/app/api/notifications/send/route.ts`

**Problema:**
- ❌ Não valida autenticação
- ❌ Aceita `userId` do body sem validação
- ❌ Qualquer pessoa pode enviar notificações push para qualquer usuário

**Código vulnerável:**
```typescript
export async function POST(request: NextRequest) {
  const { userId, title, body } = await request.json() // ❌ Aceita qualquer userId
  
  const adminSupabase = createAdminSupabaseClient()
  // Busca subscription do userId fornecido
  // Envia notificação para esse userId
}
```

**Exploração:**
```javascript
// Atacante pode enviar notificações spam/falsas para qualquer usuário
fetch('/api/notifications/send', {
  method: 'POST',
  body: JSON.stringify({
    userId: 'victim-id', // ⚠️ Envia para vítima
    title: 'Spam',
    body: 'Conteúdo malicioso'
  })
})
```

**Impacto:** 🔴 **CRÍTICO**
- Permite spam em massa
- Permite phishing através de notificações falsas
- Violação de privacidade

**Solução:**
- Restringir a admins OU validar que o usuário só pode enviar para si mesmo
- Adicionar autenticação e autorização

---

### 3. ⚠️ **API de Compartilhar Post** (CRÍTICA)

**Arquivo:** `src/app/api/posts/share/route.ts`

**Problema:**
- ❌ Não valida autenticação
- ❌ Aceita `fromUserId` e `fromUserName` do body sem validação
- ❌ Qualquer pessoa pode compartilhar posts como se fosse outro usuário

**Código vulnerável:**
```typescript
export async function POST(request: NextRequest) {
  const { postId, userIds, message, fromUserId, fromUserName } = body
  // ❌ Aceita fromUserId e fromUserName sem validação
  
  // Cria notificações como se fossem de fromUserId
  const notifications = userIds.map((userId: string) => ({
    user_id: userId,
    message: message || `${fromUserName} compartilhou um post com você`,
    metadata: {
      from_user_id: fromUserId, // ❌ Qualquer ID!
      // ...
    }
  }))
}
```

**Exploração:**
```javascript
// Atacante pode compartilhar posts fingindo ser outro usuário
fetch('/api/posts/share', {
  method: 'POST',
  body: JSON.stringify({
    postId: 'post-id',
    userIds: ['victim-id'],
    fromUserId: 'admin-id', // ⚠️ Finge ser admin
    fromUserName: 'Admin'
  })
})
```

**Impacto:** 🔴 **CRÍTICO**
- Permite impersonação (fingir ser outro usuário)
- Permite spam em massa
- Violação de integridade de dados

**Solução:**
```typescript
export const POST = withAuth(async (request, supabase, user) => {
  const { postId, userIds, message } = body
  // Sempre usar user.id e buscar nome real do banco
  const authenticatedUserId = user.id
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', authenticatedUserId)
    .single()
  
  const fromUserName = profile?.full_name || 'Usuário'
  // ...
})
```

---

### 4. ⚠️ **API de Banimentos - Listar** (ALTA)

**Arquivo:** `src/app/api/admin/bans/route.ts` (GET)

**Problema:**
- ❌ Não valida se o usuário é admin
- ❌ Qualquer usuário autenticado pode listar todos os banimentos
- ❌ Expõe informações sensíveis (razões de ban, dados de usuários banidos)

**Código vulnerável:**
```typescript
export async function GET(request: NextRequest) {
  const adminSupabase = createAdminSupabaseClient()
  // ❌ Sem validação de admin
  
  const { data: bans } = await adminSupabase
    .from('user_bans')
    .select('*') // Expõe todos os banimentos
}
```

**Impacto:** 🟠 **ALTA**
- Violação de privacidade
- Exposição de dados administrativos sensíveis

**Solução:**
- Criar helper `withAdminAuth()` que valida se o usuário é admin
- Verificar role/permissões do usuário antes de permitir acesso

---

### 5. ⚠️ **API de Banimentos - Criar** (CRÍTICA)

**Arquivo:** `src/app/api/admin/bans/route.ts` (POST)

**Problema:**
- ❌ Não valida se o usuário é admin
- ❌ Qualquer usuário autenticado pode banir outros usuários
- ❌ Aceita `userId` do body sem validação adicional

**Código vulnerável:**
```typescript
export async function POST(request: NextRequest) {
  const { userId, reason, banType } = await request.json()
  // ❌ Sem validação de admin
  
  const adminSupabase = createAdminSupabaseClient()
  await adminSupabase
    .from('user_bans')
    .insert({
      user_id: userId, // Qualquer usuário pode banir qualquer outro
      // ...
    })
}
```

**Exploração:**
```javascript
// Qualquer usuário pode banir outros
fetch('/api/admin/bans', {
  method: 'POST',
  credentials: 'include',
  body: JSON.stringify({
    userId: 'victim-id', // ⚠️ Bane a vítima
    reason: 'Banimento malicioso',
    banType: 'permanent'
  })
})
```

**Impacto:** 🔴 **CRÍTICO**
- Permite banimento de qualquer usuário
- Permite vandalismo na plataforma
- Quebra da autoridade administrativa

**Solução:**
- Criar `withAdminAuth()` helper
- Validar role/permissões do usuário

---

### 6. ⚠️ **API de Banimentos - Atualizar** (CRÍTICA)

**Arquivo:** `src/app/api/admin/bans/route.ts` (PUT)

**Problema:**
- ❌ Não valida se o usuário é admin
- ❌ Qualquer usuário autenticado pode revogar/ativar banimentos

**Impacto:** 🔴 **CRÍTICO**
- Permite manipulação de banimentos existentes
- Permite revogar banimentos legítimos

**Solução:**
- Mesmo que POST: adicionar `withAdminAuth()`

---

### 7. ⚠️ **Rotas Admin sem Validação** (ALTA)

**Arquivos:**
- `src/app/api/admin/reports/route.ts`
- `src/app/api/admin/reports/stats/route.ts`
- `src/app/api/admin/investigations/route.ts`

**Problema:**
- ❌ Não validam se o usuário é admin
- ❌ Qualquer usuário autenticado pode acessar dados administrativos

**Impacto:** 🟠 **ALTA**
- Exposição de relatórios e investigações
- Violação de privacidade

---

## ✅ ROTAS CORRETAS (Referência)

As seguintes rotas estão **corretas** e podem servir de referência:

### Rotas que validam autenticação corretamente:
1. ✅ `src/app/api/points/add/route.ts` - Valida auth, usa `user.id`
2. ✅ `src/app/api/points/history/route.ts` - Valida auth, valida userId
3. ✅ `src/app/api/points/balance/route.ts` - Valida auth com `withAuth()`
4. ✅ `src/app/api/points/premium-like/route.ts` - Valida auth com `withAuth()`
5. ✅ `src/app/api/economy/transfer/create/route.ts` - Valida auth, usa `user.id`
6. ✅ `src/app/api/economy/withdrawal/create/route.ts` - Valida auth, usa `user.id`
7. ✅ `src/app/api/economy/store/purchase/route.ts` - Valida auth, usa `user.id`
8. ✅ `src/app/api/lgpd/export-data/route.ts` - Valida auth, usa `user.id`
9. ✅ `src/app/api/lgpd/delete-account/route.ts` - Valida auth, usa `user.id`

---

## 🔍 ANÁLISE DE ROTAS PÚBLICAS

### Rota Pública Legítima:

**`src/app/api/referrals/validate/route.ts`**
- ✅ Usa admin client corretamente (usuário ainda não está autenticado)
- ✅ Não aceita userId do cliente
- ✅ Aceita apenas código de referral
- ✅ **Status:** ✅ SEGURO

**`src/app/api/points/leaderboard/route.ts`**
- ⚠️ Usa cliente público (anon key)
- ⚠️ Depende de RLS para proteger dados
- ✅ Não aceita userId do cliente
- ⚠️ **Status:** Verificar se RLS está configurado corretamente na tabela

**`src/app/api/users/search/route.ts`**
- ⚠️ Rota pública de busca
- ⚠️ Retorna apenas `userId` - pode ser usado para enumeração
- ⚠️ **Status:** Considerar rate limiting e limitação de resultados

---

## 🛠️ SOLUÇÕES RECOMENDADAS

### 1. Criar Helper de Admin Auth

```typescript
// src/lib/adminAuth.ts
import { withAuth } from './authenticatedRoute'
import { NextResponse } from 'next/server'

export async function withAdminAuth(
  handler: (request: NextRequest, supabase: SupabaseClient, user: User) => Promise<NextResponse>
) {
  return withAuth(async (request, supabase, user) => {
    // Verificar se usuário é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type, is_admin')
      .eq('id', user.id)
      .single()
    
    if (!profile?.is_admin && profile?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      )
    }
    
    return handler(request, supabase, user)
  })
}
```

### 2. Corrigir Rotas de Notificações

```typescript
// notifications/subscribe/route.ts
export const POST = withAuth(async (request, supabase, user) => {
  const { subscription } = await request.json()
  const authenticatedUserId = user.id
  
  // Usar admin client apenas após validação
  const adminSupabase = createAdminSupabaseClient()
  await adminSupabase
    .from('push_subscriptions')
    .upsert({
      user_id: authenticatedUserId, // ✅ Sempre autenticado
      // ...
    })
})
```

### 3. Corrigir Rota de Compartilhar

```typescript
// posts/share/route.ts
export const POST = withAuth(async (request, supabase, user) => {
  const { postId, userIds, message } = await request.json()
  const authenticatedUserId = user.id
  
  // Buscar nome real do usuário autenticado
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', authenticatedUserId)
    .single()
  
  const fromUserName = profile?.full_name || 'Usuário'
  
  // Criar notificações usando dados reais
  const notifications = userIds.map((userId: string) => ({
    user_id: userId,
    metadata: {
      from_user_id: authenticatedUserId, // ✅ Sempre autenticado
      // ...
    }
  }))
})
```

### 4. Proteger Rotas Admin

```typescript
// admin/bans/route.ts
export const GET = withAdminAuth(async (request, supabase, user) => {
  // Agora só admins podem acessar
  // ...
})

export const POST = withAdminAuth(async (request, supabase, user) => {
  // Agora só admins podem banir
  // ...
})
```

---

## 📋 CHECKLIST DE CORREÇÃO

### Prioridade CRÍTICA:
- [ ] Corrigir `notifications/subscribe/route.ts`
- [ ] Corrigir `notifications/send/route.ts`
- [ ] Corrigir `posts/share/route.ts`
- [ ] Criar `withAdminAuth()` helper
- [ ] Proteger `admin/bans/route.ts` (GET, POST, PUT)
- [ ] Proteger `admin/reports/route.ts`
- [ ] Proteger `admin/investigations/route.ts`

### Prioridade ALTA:
- [ ] Verificar RLS em `points/leaderboard/route.ts`
- [ ] Adicionar rate limiting em `users/search/route.ts`
- [ ] Revisar todas as rotas que usam `createAdminSupabaseClient()`

### Boas Práticas:
- [ ] Documentar padrão de segurança para novas rotas
- [ ] Adicionar testes de segurança
- [ ] Implementar logging/auditoria em operações críticas

---

## 🔐 PADRÃO DE SEGURANÇA ESTABELECIDO

### Para rotas de usuário:
```typescript
export const METHOD = withAuth(async (request, supabase, user) => {
  const authenticatedUserId = user.id
  // Nunca confiar em userId de query/body
  // Sempre usar authenticatedUserId
})
```

### Para rotas administrativas:
```typescript
export const METHOD = withAdminAuth(async (request, supabase, user) => {
  // Validado que é admin
  // Pode usar admin client se necessário
})
```

### Para rotas públicas:
- Validar dados de entrada
- Usar rate limiting
- Não expor dados sensíveis
- Considerar RLS no banco

---

**Status da Revisão:** ✅ Completa  
**Vulnerabilidades Críticas:** 7  
**Vulnerabilidades Altas:** 2  
**Ação Requerida:** Correção Imediata

