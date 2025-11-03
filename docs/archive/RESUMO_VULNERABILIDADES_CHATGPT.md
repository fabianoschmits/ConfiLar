# 🔒 RESUMO DE VULNERABILIDADES DE SEGURANÇA - Para ChatGPT

## CONTEXTO

Sistema Next.js + Supabase com API routes vulneráveis. As rotas não validam se o usuário autenticado é realmente o dono do `userId` fornecido, permitindo acesso não autorizado.

---

## VULNERABILIDADE 1: Exposição de Saldo (IDOR)

**Arquivo:** `src/app/api/points/balance/route.ts`

**Problema:**
- Aceita `userId` via query parameter sem validar autenticação
- Usa `createAdminSupabaseClient()` que bypassa RLS
- Retorna dados financeiros de qualquer usuário

**Exploração:**
```javascript
// Qualquer usuário logado pode acessar saldo de qualquer outro usuário
fetch('/api/points/balance?userId=victim-id', {
  credentials: 'include'
})
// Retorna: balance, total_earned, total_spent, level da vítima
```

**Impacto:** 🔴 CRÍTICO - Violação de privacidade de dados financeiros

---

## VULNERABILIDADE 2: Manipulação de Premium Like (Fraude)

**Arquivo:** `src/app/api/points/premium-like/route.ts`

**Problema:**
- Aceita `userId` no body sem validar se corresponde ao usuário autenticado
- Deduz pontos do `userId` fornecido (não do autenticado)
- Cria likes no nome do `userId` fornecido

**Exploração:**
```javascript
// Atacante pode gastar pontos de qualquer usuário
fetch('/api/points/premium-like', {
  method: 'POST',
  credentials: 'include',
  body: JSON.stringify({
    postId: 'any-post',
    userId: 'victim-id'  // ⚠️ Vítima paga, atacante não gasta nada
  })
})
// Resultado: Vítima perde 5 pontos, like é criado no nome da vítima
```

**Cenário de Fraude:**
```javascript
// Atacante cria post, depois faz múltiplas curtidas usando IDs de vítimas
// Cada vítima paga 5 pontos, atacante recebe 5 pontos por curtida
// Atacante pode gerar pontos infinitos para si mesmo
```

**Impacto:** 🔴 CRÍTICO - Fraude financeira + Manipulação de dados

---

## COMPARAÇÃO: Rota Correta vs Vulnerável

### ✅ CORRETO (Referência: `src/app/api/points/add/route.ts`):

```typescript
export async function POST(request: NextRequest) {
  // ✅ 1. Criar cliente autenticado
  const supabase = createRouteHandlerClient({ cookies })
  
  // ✅ 2. Verificar autenticação
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // ✅ 3. Usar sempre user.id (não aceitar do body)
  const { data, error } = await supabase.rpc('add_points', {
    p_user_id: user.id,  // ✅ Sempre o ID autenticado
    // ...
  })
}
```

### ❌ VULNERÁVEL (Atual: `balance/route.ts` e `premium-like/route.ts`):

```typescript
// ❌ Não verifica autenticação
// ❌ Aceita userId de qualquer fonte (query/body)
// ❌ Não valida se userId === usuário autenticado
// ❌ Usa admin client que bypassa RLS sem validação
```

---

## SOLUÇÃO NECESSÁRIA

Para cada rota vulnerável, implementar:

1. **Verificar autenticação:**
   ```typescript
   const supabase = createRouteHandlerClient({ cookies })
   const { data: { user }, error: authError } = await supabase.auth.getUser()
   if (authError || !user) {
     return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
   }
   ```

2. **Validar autorização:**
   ```typescript
   // Opção A: Ignorar userId fornecido, usar sempre user.id
   const authenticatedUserId = user.id
   
   // Opção B: Validar se userId fornecido === user.id
   if (userIdParam && userIdParam !== user.id) {
     return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
   }
   ```

3. **Usar userId autenticado:**
   ```typescript
   // Sempre usar authenticatedUserId em vez de userId fornecido
   .eq('user_id', authenticatedUserId)
   ```

---

## PERGUNTAS PARA O CHATGPT

1. Qual a melhor abordagem para corrigir essas vulnerabilidades?
2. Devo criar um helper/middleware reutilizável para autenticação?
3. Como manter funcionalidades que precisam de admin client (bypass RLS) de forma segura?
4. Há outras vulnerabilidades semelhantes que devo procurar no código?
5. Qual a melhor forma de adicionar logging/auditoria para essas operações?

---

## INFORMAÇÕES TÉCNICAS

- **Framework:** Next.js 14+ (App Router)
- **Banco:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth (cookies)
- **Helper disponível:** `createRouteHandlerClient({ cookies })` de `@supabase/auth-helpers-nextjs`
- **Admin client:** `createAdminSupabaseClient()` (usa SERVICE_ROLE_KEY, bypass RLS)

**Importações necessárias:**
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
```

