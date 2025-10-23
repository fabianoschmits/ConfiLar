# 📋 TODOs e Melhorias Futuras - ConfiLar

## 🎯 Objetivo

Este documento centraliza todos os TODOs, FIXMEs e melhorias pendentes encontrados no código.

**Total encontrado:** 226 ocorrências

---

## 🔴 CRÍTICO (Fazer Urgente)

### Nenhum! ✅

Todos os problemas críticos foram resolvidos:
- ✅ OTP falso corrigido
- ✅ Rate limiting implementado
- ✅ Tipos TypeScript corrigidos

---

## 🟡 IMPORTANTE (Próxima Sprint)

### 1. Migrar para Sistema de Logging

**Onde:** ~584 arquivos com `console.error/warn/log`  
**O que fazer:** Substituir por sistema de logging condicional

```typescript
// ❌ Antes
console.log('Debug:', data)

// ✅ Depois
import { debug } from '@/lib/logger'
debug('Debug', { data })
```

**Documentação:** `docs/GUIA_LOGGING.md`  
**Prioridade:** 🟡 MÉDIA

---

### 2. Executar Triggers SQL

**Onde:** `scripts/create-automatic-notification-triggers.sql`  
**O que fazer:** 
1. Executar SQL no Supabase
2. Testar triggers
3. Remover código manual do frontend

**Documentação:** `docs/TRIGGERS_SQL_DOCUMENTACAO.md`  
**Prioridade:** 🟡 MÉDIA

---

### 3. Implementar Rate Limiting em Todas APIs

**Onde:** APIs sem rate limiting  
**O que fazer:** Adicionar `withRateLimit` em todas as rotas

```typescript
import { withRateLimit } from '@/lib/rateLimitMiddleware'

export const POST = withRateLimit(handler, 'API_DEFAULT')
```

**Exemplo:** `src/app/api/example-with-rate-limit/route.ts`  
**Prioridade:** 🟡 MÉDIA

---

## 🟢 MELHORIAS (Backlog)

### 4. Consolidar Componentes de Notificação

**Problema:** Múltiplos componentes similares  
**Onde:**
- `NotificationProviderSimple.tsx`
- `AdaptiveNotificationCenter.tsx`
- `ModernNotificationCenter.tsx`
- `NotificationDropdown.tsx`

**O que fazer:** Escolher 1-2 e deprecar os outros  
**Prioridade:** 🟢 BAIXA

---

### 5. Otimizar Bundle Size

**Problema:** Componentes não usados no bundle  
**O que fazer:** Lazy loading e code splitting

```typescript
// Carregar componentes sob demanda
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />
})
```

**Prioridade:** 🟢 BAIXA

---

### 6. Adicionar Testes

**Problema:** Poucos testes automatizados  
**O que fazer:**
- Unit tests para hooks críticos
- Integration tests para APIs
- E2E tests para fluxos principais

**Configurado:** 
- ✅ Jest
- ✅ Playwright
- ⏳ Adicionar mais testes

**Prioridade:** 🟢 BAIXA

---

### 7. Melhorar Acessibilidade

**O que fazer:**
- Adicionar ARIA labels
- Melhorar navegação por teclado
- Testar com screen readers
- Contraste de cores (WCAG AA)

**Prioridade:** 🟢 BAIXA

---

### 8. Implementar Monitoramento

**O que fazer:**
- Integrar Sentry para erros
- Adicionar métricas de performance
- Criar dashboard de monitoramento

**Integração:**
```typescript
// Em src/lib/logger.ts
import * as Sentry from '@sentry/nextjs'
// Já preparado para integração
```

**Prioridade:** 🟢 BAIXA

---

## 📝 TODOs por Categoria

### Autenticação

- [ ] Implementar 2FA (autenticação de dois fatores)
- [ ] Adicionar login social (Google, Facebook)
- [ ] Melhorar fluxo de recuperação de senha
- [ ] Implementar sessões múltiplas

### Notificações

- [ ] Adicionar notificações por email
- [ ] Implementar notificações por SMS
- [ ] Criar preferências granulares
- [ ] Agrupar notificações similares

### Performance

- [ ] Implementar Redis para cache
- [ ] Otimizar queries do Supabase
- [ ] Adicionar CDN para assets
- [ ] Implementar ISR (Incremental Static Regeneration)

### UX/UI

- [ ] Modo escuro completo
- [ ] Animações fluidas
- [ ] Feedback visual melhorado
- [ ] Onboarding interativo

### Mobile

- [ ] Otimizar para telas pequenas
- [ ] Gestos touch (swipe, pinch)
- [ ] Modo offline robusto
- [ ] Push notifications nativas

---

## 🔄 Refatorações Sugeridas

### 1. Consolidar Hooks Similares

```
useProfileCheck → useProfileCheckSafe (USAR ESTE)
useProfileCheckFixed → useProfileCheckSafe
```

### 2. Remover Código Morto

Arquivos não usados:
- `useAuth.ts` (substituído por `useUnifiedAuth`)
- Componentes de teste antigos
- Rotas de desenvolvimento antigas

### 3. Modernizar Código

- Usar Server Components onde apropriado
- Migrar para App Router completo
- Usar Server Actions para mutations

---

## 📊 Estatísticas

### TODOs por Prioridade

| Prioridade | Quantidade | Status |
|-----------|------------|--------|
| 🔴 Crítico | 0 | ✅ Resolvidos |
| 🟡 Importante | 3 | ⏳ Pendente |
| 🟢 Backlog | 5+ | ⏳ Pendente |

### TODOs por Tipo

| Tipo | Quantidade |
|------|------------|
| TODO | 120+ |
| FIXME | 45+ |
| BUG | 30+ |
| HACK | 15+ |
| XXX | 16+ |

---

## 🎯 Roadmap Sugerido

### Sprint 1 (1-2 semanas)
- ✅ Corrigir vulnerabilidades críticas
- ✅ Implementar rate limiting backend
- ✅ Criar sistema de logging
- ⏳ Migrar console.logs

### Sprint 2 (2-3 semanas)
- ⏳ Executar triggers SQL
- ⏳ Adicionar rate limit em todas APIs
- ⏳ Consolidar componentes duplicados

### Sprint 3 (3-4 semanas)
- ⏳ Implementar testes
- ⏳ Melhorar acessibilidade
- ⏳ Otimizar performance

### Sprint 4+ (Backlog)
- ⏳ Monitoramento (Sentry)
- ⏳ 2FA
- ⏳ Login social
- ⏳ Melhorias UX

---

## 📚 Documentação Relacionada

- [Sistema de Logging](./GUIA_LOGGING.md)
- [Rate Limiting](./CORRECOES_CRITICAS_APLICADAS.md)
- [Triggers SQL](./TRIGGERS_SQL_DOCUMENTACAO.md)
- [Hooks Guia](./HOOKS_GUIA_USO.md)
- [Sistema de Sons](./SISTEMA_SONS_NOTIFICACOES.md)

---

## ✅ Concluído Recentemente

- ✅ OTP seguro implementado
- ✅ Rate limiting backend criado
- ✅ Tipos TypeScript corrigidos
- ✅ Sistema de logging implementado
- ✅ Componentes de debug protegidos
- ✅ Triggers SQL criados
- ✅ Guia de hooks documentado
- ✅ Sistema de sons implementado

---

## 🔄 Como Contribuir

### Marcar TODO como Feito

1. Completar a tarefa
2. Remover comentário TODO do código
3. Atualizar este documento
4. Adicionar na seção "Concluído Recentemente"

### Adicionar Novo TODO

1. Adicionar comentário no código:
```typescript
// TODO: Descrição do que fazer
// Prioridade: ALTA/MÉDIA/BAIXA
// Estimativa: 1h / 1d / 1w
```

2. Adicionar neste documento
3. Categorizar corretamente
4. Adicionar no roadmap se urgente

---

**Última Atualização:** Outubro 2025  
**Versão:** 1.0.0  
**Status:** 📋 Atualizado

---

## 💡 Dicas

- **Não delete TODOs sem fazer** - Documente aqui
- **Priorize críticos** - Segurança primeiro
- **Teste antes de marcar** - Sempre verificar
- **Documente decisões** - Por que foi feito assim

