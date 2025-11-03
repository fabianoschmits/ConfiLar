# 🔒 ANÁLISE COMPLETA DE PROBLEMAS DE SEGURANÇA - ConfiLar

## 📋 RESUMO EXECUTIVO

O sistema possui **vulnerabilidades críticas de autorização** em duas rotas de API que permitem acesso não autorizado a dados e operações financeiras de outros usuários. As rotas não verificam se o usuário autenticado é realmente o dono do `userId` fornecido, permitindo que qualquer usuário logado acesse dados e realize operações em nome de qualquer outro usuário.

---

## 🚨 VULNERABILIDADE 1: Exposição de Saldo de Pontos (IDOR - Insecure Direct Object Reference)

### **Arquivo Vulnerável:**
`src/app/api/points/balance/route.ts`

### **Código Atual (VULNERÁVEL):**

```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')  // ⚠️ Aceita userId de qualquer fonte

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    // ❌ PROBLEMA: Usa admin client que bypassa RLS, mas não valida autenticação
    const supabaseAdmin = createAdminSupabaseClient()
    const { data, error } = await supabaseAdmin
      .from('user_points_balance')
      .select('*')
      .eq('user_id', userId)  // ⚠️ Busca por qualquer userId fornecido
      .single()

    return NextResponse.json({ data })  // ⚠️ Retorna dados sem validar se o usuário tem permissão
  } catch (error) {
    // ...
  }
}
```

### **Como Funciona a Exploração:**

1. **O que o atacante precisa:**
   - Estar autenticado no sistema (qualquer usuário logado)
   - Conhecer ou descobrir o UUID de outro usuário
   - Acesso ao console do navegador ou ferramentas de desenvolvimento

2. **Passo a passo do ataque:**
   ```javascript
   // 1. Atacante (usuário logado com ID: "abc-123") faz requisição
   // 2. No console do navegador ou via Postman/curl:
   
   fetch('/api/points/balance?userId=xyz-789', {
     method: 'GET',
     credentials: 'include'  // Envia cookies de autenticação do atacante
   })
   .then(res => res.json())
   .then(data => {
     // ✅ FUNCIONA! Obtém saldo completo do usuário xyz-789
     console.log('Saldo da vítima:', data.data.balance)
     console.log('Total ganho:', data.data.total_earned)
     console.log('Total gasto:', data.data.total_spent)
     console.log('Nível:', data.data.level)
   })
   ```

3. **Dados Expostos:**
   - Saldo atual de pontos (`balance`)
   - Total ganho na plataforma (`total_earned`)
   - Total gasto (`total_spent`)
   - Nível do usuário (`level`)
   - Qualquer outro campo da tabela `user_points_balance`

### **Por Que É Perigoso:**

- **Violação de Privacidade:** Informações financeiras/gamificação são sensíveis
- **Reconhecimento de Padrões:** Permite identificar usuários com mais pontos (potenciais alvos)
- **Análise de Comportamento:** Permite mapear quanto cada usuário gasta/ganha
- **Sem Auditoria:** Não há logs de quem acessou dados de quem
- **Escalável:** Atacante pode fazer milhares de requisições para mapear todos os usuários

### **Impacto:**

- **Severidade:** 🔴 **CRÍTICA**
- **CVSS Score estimado:** 8.1 (High)
- **Categoria:** IDOR (Insecure Direct Object Reference)
- **OWASP Top 10:** A01:2021 – Broken Access Control

---

## 🚨 VULNERABILIDADE 2: Manipulação de Curtidas Premium (Privilege Escalation + Financial Fraud)

### **Arquivo Vulnerável:**
`src/app/api/points/premium-like/route.ts`

### **Código Atual (VULNERÁVEL):**

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, userId } = body  // ⚠️ Aceita userId do body sem validar autenticação
    
    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 })
    }

    // ❌ PROBLEMA: Usa admin client mas não valida se o userId do body corresponde ao usuário autenticado
    const supabase = createAdminSupabaseClient()
    
    // Verifica saldo do userId fornecido (não do usuário autenticado!)
    const { data: balance } = await supabase
      .from('user_points_balance')
      .select('balance')
      .eq('user_id', userId)  // ⚠️ Busca saldo de qualquer userId
      .single()

    // Deduz pontos do userId fornecido (não do usuário autenticado!)
    const { error: deductError } = await supabase
      .rpc('add_points', {
        p_user_id: userId,  // ⚠️ Deduz pontos de qualquer usuário
        p_points: -pointsCost,
        // ...
      })

    // Cria like no nome do userId fornecido (não do usuário autenticado!)
    const { data: premiumLike } = await supabase
      .from('feed_posts_likes')
      .insert({
        post_id: postId,
        user_id: userId,  // ⚠️ Atribui like a qualquer usuário
        is_premium: true,
        // ...
      })
}
```

### **Como Funciona a Exploração:**

#### **Cenário 1: Gastar Pontos de Outro Usuário**

```javascript
// Atacante (ID: "abc-123") quer gastar pontos da vítima (ID: "xyz-789")
// Vítima tem 1000 pontos, atacante tem 0 pontos

fetch('/api/points/premium-like', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',  // Cookies do atacante
  body: JSON.stringify({
    postId: 'qualquer-post-id',
    userId: 'xyz-789'  // ⚠️ ID da vítima, não do atacante!
  })
})
.then(res => res.json())
.then(data => {
  // ✅ FUNCIONA! 
  // - Deduziu 5 pontos da conta da vítima (xyz-789)
  // - Criou like premium no nome da vítima
  // - Adicionou pontos ao criador do post
  // - Atacante não gastou nada!
})
```

#### **Cenário 2: Gerar Pontos para Si Mesmo (Fraude Financeira)**

```javascript
// Atacante (ID: "abc-123") cria um post (ID: "post-abc-123")
// Depois, faz múltiplas curtidas premium no próprio post usando IDs de vítimas

// Loop para gastar pontos de múltiplas vítimas e gerar pontos para si mesmo
const victimIds = ['victim-1', 'victim-2', 'victim-3', ...]
const myPostId = 'post-abc-123'

victimIds.forEach(victimId => {
  fetch('/api/points/premium-like', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      postId: myPostId,      // Post do atacante
      userId: victimId       // ID da vítima (cada vítima paga 5 pontos)
    })
  })
})

// Resultado:
// - Cada vítima perde 5 pontos
// - Atacante ganha 5 pontos por cada curtida (total: 5 * número de vítimas)
// - Atacante pode ter criado centenas de curtidas premium "fantasma" usando IDs de outros usuários
```

#### **Cenário 3: Framing (Atribuir Likes Indesejados)**

```javascript
// Atacante quer que alguém seja acusado de curtir um post ofensivo
// Post ofensivo ID: "post-problematico"

fetch('/api/points/premium-like', {
  method: 'POST',
  credentials: 'include',
  body: JSON.stringify({
    postId: 'post-problematico',
    userId: 'victim-id'  // Atribui like premium à vítima
  })
})

// Resultado:
// - Vítima aparece como tendo dado like premium no post ofensivo
// - Vítima perde 5 pontos
// - Criador do post recebe 5 pontos
// - Vítima pode ser bloqueada/reportada por likes em conteúdo inapropriado
```

### **Análise Técnica Detalhada:**

1. **O que acontece na requisição:**
   ```typescript
   // 1. API recebe userId no body
   const { postId, userId } = await request.json()
   
   // 2. ❌ NÃO VERIFICA autenticação
   // ❌ NÃO VERIFICA se userId do body === usuário autenticado
   
   // 3. Busca saldo do userId fornecido (pode ser qualquer um)
   const balance = await supabase
     .from('user_points_balance')
     .select('balance')
     .eq('user_id', userId)  // Qualquer userId!
   
   // 4. Deduz pontos do userId fornecido
   await supabase.rpc('add_points', {
     p_user_id: userId,  // Qualquer userId!
     p_points: -5
   })
   
   // 5. Cria like no nome do userId fornecido
   await supabase
     .from('feed_posts_likes')
     .insert({
       user_id: userId  // Qualquer userId!
     })
   ```

2. **Por que o admin client piora a situação:**
   - `createAdminSupabaseClient()` usa `SERVICE_ROLE_KEY`
   - Isso bypassa Row Level Security (RLS) do Supabase
   - RLS normalmente impediria acessos não autorizados
   - Como RLS é bypassado E não há validação de autenticação, a vulnerabilidade fica total

3. **Por que cookies não ajudam:**
   - A API recebe cookies de autenticação (`credentials: 'include'`)
   - Mas nunca verifica qual usuário está autenticado através desses cookies
   - Apenas confia cegamente no `userId` enviado no body

### **Por Que É Extremamente Perigoso:**

1. **Fraude Financeira:**
   - Permite gastar pontos de qualquer usuário
   - Permite gerar pontos infinitos para si mesmo
   - Impacta diretamente a economia do sistema (ConfiPoints)

2. **Privilege Escalation:**
   - Usuário comum pode realizar ações como outros usuários
   - Pode manipular reputação/perfil de outros usuários
   - Pode criar histórico falso de atividades

3. **Framing/Defamation:**
   - Pode atribuir likes em posts indesejados a outros usuários
   - Pode fazer vítimas serem banidas por comportamento que não cometeram

4. **Violação de Integridade:**
   - Dados de likes ficam incorretos
   - Histórico de transações fica manipulado
   - Estatísticas ficam falsas

### **Impacto:**

- **Severidade:** 🔴 **CRÍTICA**
- **CVSS Score estimado:** 9.1 (Critical)
- **Categoria:** 
  - IDOR (Insecure Direct Object Reference)
  - Privilege Escalation
  - Financial Fraud
  - Data Integrity Violation
- **OWASP Top 10:** 
  - A01:2021 – Broken Access Control
  - A04:2021 – Insecure Design

---

## 🔍 COMPARAÇÃO: Rotas Corretas vs Vulneráveis

### **✅ Rotas CORRETAS (Referência):**

#### 1. `src/app/api/points/add/route.ts` (CORRETO)

```typescript
export async function POST(request: NextRequest) {
  try {
    // ✅ Cria cliente autenticado com cookies
    const supabase = createRouteHandlerClient({ cookies })
    
    // ✅ VERIFICA autenticação primeiro
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // ✅ USA o ID do usuário autenticado (não aceita do body)
    const { data, error } = await supabase.rpc('add_points', {
      p_user_id: user.id,  // ✅ Sempre o ID do usuário autenticado
      // ...
    })
  }
}
```

#### 2. `src/app/api/points/history/route.ts` (CORRETO)

```typescript
export async function GET(request: NextRequest) {
  try {
    // ✅ Cria cliente autenticado
    const supabase = createRouteHandlerClient({ cookies })
    
    // ✅ VERIFICA autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    // ✅ OPCIONAL: Aceita userId na query, mas VALIDA se corresponde ao autenticado
    const userId = searchParams.get('userId')
    if (userId && userId !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // ✅ USA sempre o ID do usuário autenticado
    const authenticatedUserId = user.id
    // ...
  }
}
```

### **❌ Rotas VULNERÁVEIS:**

#### 1. `src/app/api/points/balance/route.ts` (VULNERÁVEL)

```typescript
// ❌ Não verifica autenticação
// ❌ Não valida se userId corresponde ao usuário autenticado
// ❌ Usa admin client que bypassa RLS
// ❌ Confia cegamente no userId da query string
```

#### 2. `src/app/api/points/premium-like/route.ts` (VULNERÁVEL)

```typescript
// ❌ Não verifica autenticação
// ❌ Não valida se userId do body corresponde ao usuário autenticado
// ❌ Usa admin client que bypassa RLS
// ❌ Confia cegamente no userId do body
// ❌ Permite gastar pontos de qualquer usuário
```

---

## 🛠️ COMO O FRONTEND USA ESSAS APIs (Contexto)

### **Hook que chama a API de balance:**

```typescript
// src/hooks/usePoints.ts
export function usePoints(userId?: string) {
  const { data: pointsData } = useQuery({
    queryKey: ['user-points-balance', userId],
    queryFn: async () => {
      if (!userId) return null
      
      // ⚠️ Frontend envia userId na URL
      // ⚠️ Backend não valida se esse userId corresponde ao usuário autenticado
      const response = await fetch(`/api/points/balance?userId=${userId}`)
      // ...
    }
  })
}
```

**Uso normal (legítimo):**
```typescript
// Componente usa o ID do usuário autenticado
const { user } = useAuthContext()
const { balance } = usePoints(user?.id)  // ✅ Correto no frontend
```

**Mas o backend não valida isso!** Se alguém modificar o código ou usar DevTools:
```javascript
// No console do navegador, atacante pode fazer:
const { balance } = usePoints('victim-user-id')  // ⚠️ Acessa dados da vítima
```

### **Hook que chama a API de premium-like:**

```typescript
// src/hooks/usePremiumLikes.ts
const premiumLikeMutation = useMutation({
  mutationFn: async () => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    // ⚠️ Frontend envia userId no body
    // ⚠️ Backend não valida se esse userId corresponde ao usuário autenticado
    const response = await fetch('/api/points/premium-like', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        postId: postId,
        userId: user.id  // ✅ Frontend envia o ID correto
      })
    })
  }
})
```

**Mas no backend:**
```typescript
// ⚠️ Backend aceita qualquer userId sem validar
const { postId, userId } = body  // Pode ser qualquer ID!
// Não verifica se userId === usuário autenticado
```

---

## 📊 RESUMO DAS VULNERABILIDADES

| Vulnerabilidade | Arquivo | Tipo | Severidade | Impacto |
|----------------|---------|------|------------|---------|
| Exposição de Saldo | `balance/route.ts` | IDOR | 🔴 Crítica | Acesso não autorizado a dados financeiros |
| Manipulação de Premium Like | `premium-like/route.ts` | IDOR + Privilege Escalation | 🔴 Crítica | Fraude financeira + Manipulação de dados |

---

## 🎯 REQUISITOS PARA A SOLUÇÃO

A solução deve:

1. **Validar autenticação:**
   - Verificar se há um usuário autenticado através dos cookies
   - Usar `createRouteHandlerClient({ cookies })` ou similar
   - Retornar 401 se não autenticado

2. **Validar autorização:**
   - Comparar `userId` fornecido (query/body) com `user.id` (autenticado)
   - Retornar 403 se não corresponder
   - OU: Ignorar `userId` fornecido e sempre usar `user.id`

3. **Manter funcionalidades necessárias:**
   - Rotas que precisam de admin client (bypass RLS) podem mantê-lo
   - Mas SEMPRE validar autenticação primeiro
   - Usar `user.id` autenticado em vez de confiar no `userId` fornecido

4. **Seguir padrão existente:**
   - Usar o mesmo padrão das rotas corretas (`add/route.ts`, `history/route.ts`)
   - Criar helper reutilizável se necessário

---

## 📝 EXEMPLO DE CÓDIGO CORRETO (Para referência)

### Balance Route (Correto):

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // ✅ 1. Criar cliente autenticado
    const supabase = createRouteHandlerClient({ cookies })
    
    // ✅ 2. Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // ✅ 3. OPCIONAL: Verificar se userId na query corresponde ao autenticado
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get('userId')
    
    if (userIdParam && userIdParam !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // ✅ 4. Usar sempre o ID do usuário autenticado
    const authenticatedUserId = user.id

    // ✅ 5. Se precisa bypass RLS, usa admin client APÓS validar autenticação
    const supabaseAdmin = createAdminSupabaseClient()
    const { data, error } = await supabaseAdmin
      .from('user_points_balance')
      .select('*')
      .eq('user_id', authenticatedUserId)  // ✅ Sempre o ID autenticado
      .single()

    if (error) {
      // ... tratamento de erros
    }

    return NextResponse.json({ data })
  } catch (error) {
    // ... tratamento de erros
  }
}
```

### Premium Like Route (Correto):

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // ✅ 1. Criar cliente autenticado
    const supabase = createRouteHandlerClient({ cookies })
    
    // ✅ 2. Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // ✅ 3. Parse do body
    const body = await request.json()
    const { postId } = body
    
    // ✅ 4. IGNORAR userId do body, usar sempre o autenticado
    const authenticatedUserId = user.id  // ✅ Sempre o ID do usuário autenticado

    if (!postId) {
      return NextResponse.json({ error: 'postId é obrigatório' }, { status: 400 })
    }

    // ✅ 5. Se precisa bypass RLS, usa admin client APÓS validar autenticação
    const supabase = createAdminSupabaseClient()
    
    // ... resto da lógica usando authenticatedUserId em vez de userId do body
    
    // Verificar saldo do usuário autenticado
    const { data: balance } = await supabase
      .from('user_points_balance')
      .select('balance')
      .eq('user_id', authenticatedUserId)  // ✅ ID autenticado
      .single()

    // Deduzir pontos do usuário autenticado
    await supabase.rpc('add_points', {
      p_user_id: authenticatedUserId,  // ✅ ID autenticado
      // ...
    })

    // Criar like no nome do usuário autenticado
    await supabase
      .from('feed_posts_likes')
      .insert({
        user_id: authenticatedUserId,  // ✅ ID autenticado
        // ...
      })
  } catch (error) {
    // ...
  }
}
```

---

## 🔐 CONSIDERAÇÕES DE SEGURANÇA ADICIONAIS

### **Por que não usar apenas RLS?**

- RLS (Row Level Security) do Supabase funciona bem quando você usa o cliente anônimo
- Mas algumas operações precisam de admin client (bypass RLS)
- **Regra de ouro:** Se você bypassa RLS, DEVE validar autenticação/autorização manualmente

### **Por que validar no backend?**

- **Nunca confie no frontend:** Cliente pode modificar código JavaScript
- **Defense in Depth:** Múltiplas camadas de segurança
- **API é o ponto de entrada:** Se a API não valida, tudo pode ser explorado

### **Padrão de Segurança:**

```
1. ✅ Validar autenticação (há um usuário logado?)
2. ✅ Validar autorização (esse usuário pode fazer isso?)
3. ✅ Usar dados do usuário autenticado (nunca confiar em dados enviados)
4. ✅ Logging/auditoria (quem fez o quê?)
```

---

## 📚 REFERÊNCIAS

- **OWASP Top 10 2021:** A01:2021 – Broken Access Control
- **CWE-639:** Authorization Bypass Through User-Controlled Key
- **CVSS v3.1:** Common Vulnerability Scoring System

---

## ✅ CHECKLIST DE CORREÇÃO

- [ ] Adicionar verificação de autenticação em `balance/route.ts`
- [ ] Adicionar validação de autorização em `balance/route.ts`
- [ ] Adicionar verificação de autenticação em `premium-like/route.ts`
- [ ] Adicionar validação de autorização em `premium-like/route.ts`
- [ ] Usar `user.id` autenticado em vez de `userId` fornecido
- [ ] Manter admin client apenas se necessário (após validação)
- [ ] Adicionar testes de segurança
- [ ] Adicionar logging/auditoria
- [ ] Revisar outras rotas de API em busca do mesmo padrão
- [ ] Documentar padrão de segurança para futuras rotas

---

**Data da Análise:** Outubro 2025  
**Status:** 🔴 Vulnerabilidades Críticas Identificadas  
**Ação Requerida:** Correção Imediata

