# 🔔 LEMBRETE: CONFIGURAR CRON JOB

## ⚠️ AÇÃO NECESSÁRIA

O sistema de posts premium está **100% implementado**, mas para funcionar automaticamente, você precisa configurar um **Cron Job** que execute a cada hora.

---

## 🎯 O que o Cron fará:

Executar a função `maintain_premium_posts()` automaticamente a cada hora para:
- Desativar posts premium que expiraram
- Remover destaque dos posts expirados
- Manter o feed limpo automaticamente

---

## ⏰ OPÇÕES DE CONFIGURAÇÃO

### **OPÇÃO 1: Supabase Edge Function** ⭐ RECOMENDADO

#### Vantagens:
- ✅ Integrado direto no Supabase
- ✅ Fácil de configurar
- ✅ Sem custo adicional
- ✅ Logs automáticos

#### Passos:

1. **Acessar**: Supabase Dashboard > Edge Functions
2. **Criar nova função**: `cleanup-expired-posts`
3. **Código**:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const { data, error } = await supabaseAdmin.rpc('maintain_premium_posts')

    if (error) {
      console.error('Erro ao executar manutenção:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('Manutenção executada:', data)
    return new Response(JSON.stringify({ 
      success: true, 
      result: data 
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Erro na função:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

4. **Deploy** da função
5. **Configurar Cron**:
   - Schedule: `0 * * * *` (a cada hora)
   - HTTP Method: GET
   - URL: URL da sua Edge Function

---

### **OPÇÃO 2: Vercel Cron Job**

#### Vantagens:
- ✅ Fácil se você já usa Vercel
- ✅ Configuração via `vercel.json`
- ✅ Grátis no Vercel Pro

#### Passos:

1. **Criar API Route**: `src/app/api/cron/cleanup-posts/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Validar autorização (token secreto)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Criar cliente Supabase com service_role
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Executar função de manutenção
    const { data, error } = await supabase.rpc('maintain_premium_posts')

    if (error) {
      console.error('Erro ao executar manutenção:', error)
      return NextResponse.json({ 
        error: error.message 
      }, { status: 500 })
    }

    console.log('Manutenção executada com sucesso:', data)
    return NextResponse.json({ 
      success: true, 
      result: data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
```

2. **Adicionar em `vercel.json`**:

```json
{
  "crons": [{
    "path": "/api/cron/cleanup-posts",
    "schedule": "0 * * * *"
  }]
}
```

3. **Adicionar variável de ambiente** no Vercel:
   - `CRON_SECRET`: (gerar token aleatório)
   - `SUPABASE_SERVICE_ROLE_KEY`: (do Supabase Dashboard)

4. **Deploy** no Vercel

---

### **OPÇÃO 3: Execução Manual (Temporário)**

Se não quiser configurar cron agora, você pode executar manualmente quando necessário:

```sql
-- No Supabase SQL Editor
SELECT * FROM maintain_premium_posts();
```

**Recomendado executar**: 1x por dia ou quando lembrar

---

## 📊 COMO TESTAR SE O CRON ESTÁ FUNCIONANDO

### **1. Ver últimas execuções:**

```sql
-- Criar tabela de logs (opcional)
CREATE TABLE IF NOT EXISTS cron_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name VARCHAR(100),
  result JSONB,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modificar função para logar (opcional)
-- Ver logs depois
SELECT * FROM cron_logs 
ORDER BY executed_at DESC 
LIMIT 10;
```

### **2. Ver posts expirados:**

```sql
-- Se houver posts expirados, o cron deve limpá-los
SELECT COUNT(*) FROM v_expired_premium_posts;

-- Esperado: 0 (se o cron está rodando)
-- Se houver resultados, significa que o cron não está rodando
```

### **3. Simular post expirado:**

```sql
-- 1. Criar post de teste
INSERT INTO feed_posts (
  user_id, title, description,
  is_premium, premium_points_spent,
  premium_expires_at,
  is_active, is_featured
) VALUES (
  'seu-user-id',
  'Teste Expiração',
  'Post de teste',
  TRUE,
  1000,
  NOW() - INTERVAL '1 hour', -- Já expirado
  TRUE,
  TRUE
) RETURNING id;

-- 2. Aguardar próxima execução do cron (até 1 hora)
-- OU executar manualmente:
SELECT * FROM maintain_premium_posts();

-- 3. Verificar se foi desativado
SELECT is_active, is_featured 
FROM feed_posts 
WHERE title = 'Teste Expiração';

-- Esperado: is_active = FALSE, is_featured = FALSE
```

---

## 📝 CHECKLIST DE CONFIGURAÇÃO

- [ ] Escolher opção de Cron (Supabase Edge Function ou Vercel Cron)
- [ ] Criar código da função/API route
- [ ] Configurar schedule (0 * * * *)
- [ ] Adicionar variáveis de ambiente necessárias
- [ ] Deploy/ativar o cron
- [ ] Testar execução manual
- [ ] Monitorar logs na primeira hora
- [ ] Verificar se posts expirados estão sendo limpos

---

## 🎯 PRÓXIMOS PASSOS

1. ⏳ **AGORA**: Escolher e configurar uma das opções de Cron
2. ✅ **DEPOIS**: Sistema funcionará 100% automaticamente
3. 📊 **OPCIONAL**: Criar dashboard de monitoramento
4. 🔔 **FUTURO**: Notificar usuários 24h antes da expiração

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- `docs/SISTEMA_EXPIRACAO_POSTS_PREMIUM.md` - Documentação completa
- `FLUXO_COMPLETO_POSTS_PREMIUM.md` - Fluxo detalhado do sistema
- `scripts/create-auto-delete-expired-posts.sql` - Funções SQL criadas

---

## 💡 DICA

Configure o cron **assim que possível** para que o sistema funcione automaticamente. Caso contrário, os posts premium nunca expirarão e ficarão destacados para sempre!

---

**Status Atual**: ⏳ Aguardando configuração do Cron Job
**Tempo estimado**: 10-20 minutos para configurar
**Dificuldade**: Fácil ⭐

