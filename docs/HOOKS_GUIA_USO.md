# 📚 Guia de Uso de Hooks - ConfiLar

## 🎯 Objetivo

Este guia documenta quais hooks usar e quais evitar para manter o código consistente e evitar duplicação.

---

## ✅ HOOKS RECOMENDADOS (Usar Estes)

### Autenticação

#### `useUnifiedAuth`
**Status:** ✅ **USAR ESTE**  
**Arquivo:** `src/hooks/useUnifiedAuth.ts`  
**Uso:** 8 arquivos

```typescript
import { useAuth } from '@/hooks/useUnifiedAuth'

const { user, profile, signIn, signOut, updateProfile } = useAuth()
```

**Funcionalidades:**
- ✅ Autenticação completa
- ✅ Rate limiting integrado
- ✅ Gerenciamento de perfil
- ✅ Session handling
- ✅ Logging integrado

**Contexto:**
```typescript
import { useAuthContext } from '@/contexts/AuthContext'

const { user, profile } = useAuthContext()
```

---

### Mensagens

#### `useMessages`
**Status:** ✅ **USAR ESTE**  
**Arquivo:** `src/hooks/useMessages.ts`  
**Uso:** 4 arquivos

```typescript
import { useMessages } from '@/hooks/useMessages'

const { messages, sendMessage, markAsRead } = useMessages(conversationId)
```

**Funcionalidades:**
- ✅ Gerenciamento de mensagens
- ✅ Realtime updates
- ✅ Marcação de lidas
- ✅ Paginação

---

#### `useOptimizedMessages` (Futuro)
**Status:** 🟡 **DISPONÍVEL MAS NÃO USADO**  
**Arquivo:** Não existe ainda  
**Recomendação:** Criar no futuro com React Query

---

### Notificações

#### `useNotificationPreferences`
**Status:** ✅ **USAR ESTE**  
**Arquivo:** `src/hooks/useNotificationPreferences.ts`

```typescript
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences'

const { preferences, updatePreference } = useNotificationPreferences()
```

---

#### `usePushNotifications`
**Status:** ✅ **USAR ESTE**  
**Arquivo:** `src/hooks/usePushNotifications.ts`

```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications'

const { requestPermission, subscribe } = usePushNotifications()
```

---

### Timeline

#### `useUnifiedTimeline`
**Status:** ✅ **USAR ESTE**  
**Arquivo:** `src/hooks/useUnifiedTimeline.ts`

```typescript
import { useUnifiedTimeline } from '@/hooks/useUnifiedTimeline'

const { posts, loading, refreshTimeline } = useUnifiedTimeline(filters)
```

---

### Cache

#### `useStaticCache`
**Status:** ✅ **USAR PARA DADOS ESTÁTICOS**  
**Arquivo:** `src/hooks/useStaticCache.ts`

```typescript
import { useStaticCache } from '@/hooks/useStaticCache'

const { data, loading } = useStaticCache('services', fetchServices)
```

---

#### `useRealtimeCache`
**Status:** ✅ **USAR PARA DADOS DINÂMICOS**  
**Arquivo:** `src/hooks/useRealtimeCache.ts`

```typescript
import { useRealtimeCache } from '@/hooks/useRealtimeCache'

const { data } = useRealtimeCache('notifications')
```

---

## ⚠️ HOOKS DUPLICADOS (Evitar)

### Profile Check

#### ❌ `useProfileCheck` 
**Status:** ⚠️ **LEGADO**  
**Uso:** 0 arquivos  
**Substituir por:** `useProfileCheckSafe`

#### ❌ `useProfileCheckFixed`
**Status:** ⚠️ **LEGADO**  
**Uso:** 0 arquivos  
**Substituir por:** `useProfileCheckSafe`

#### ✅ `useProfileCheckSafe`
**Status:** ✅ **USAR ESTE**  
**Uso:** Verificar

```typescript
import { useProfileCheckSafe } from '@/hooks/useProfileCheckSafe'

const { hasProfile, loading } = useProfileCheckSafe()
```

---

## 🔧 HOOKS ESPECIALIZADOS

### Referral (Indicações)

#### `useReferralTracking`
```typescript
import { useReferralTracking } from '@/hooks/useReferralTracking'

const { trackReferral } = useReferralTracking()
```

#### `useReferralStats`
```typescript
import { useReferralStats } from '@/hooks/useReferralStats'

const { stats, tier } = useReferralStats()
```

#### `useReferralCode`
```typescript
import { useReferralCode } from '@/hooks/useReferralCode'

const { code, generate } = useReferralCode()
```

#### `useWhoReferredMe`
```typescript
import { useWhoReferredMe } from '@/hooks/useWhoReferredMe'

const { referrer, loading } = useWhoReferredMe()
```

---

### Disponibilidade

#### `useAvailability`
```typescript
import { useAvailability } from '@/hooks/useAvailability'

const { isAvailable, toggle } = useAvailability()
```

#### `useAutoAvailability`
```typescript
import { useAutoAvailability } from '@/hooks/useAutoAvailability'

// Automático - apenas importar
```

---

### Busca e Filtros

#### `useAdvancedSearch`
```typescript
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch'

const { results, search } = useAdvancedSearch()
```

#### `useClassifiedSearch`
```typescript
import { useClassifiedSearch } from '@/hooks/useClassifiedSearch'

const { classifieds, filter } = useClassifiedSearch()
```

#### `useIBGE`
```typescript
import { useIBGE } from '@/hooks/useIBGE'

const { estados, cidades } = useIBGE()
```

---

### Performance e Rate Limiting

#### `useRateLimit`
```typescript
import { useRateLimit } from '@/hooks/useRateLimit'

const { checkLimit, isBlocked } = useRateLimit('login')
```

#### `useApiRateLimit`
```typescript
import { useApiRateLimit } from '@/hooks/useApiRateLimit'

const { limited, remaining } = useApiRateLimit(endpoint)
```

---

### PWA

#### `usePWA`
```typescript
import { usePWA } from '@/hooks/usePWA'

const { isInstalled, promptInstall } = usePWA()
```

---

### Sons (Novo!)

#### `useNotificationSound`
```typescript
import { useNotificationSound } from '@/hooks/useNotificationSound'

const { playSound, setVolume } = useNotificationSound()
```

---

## 📊 Estatísticas de Uso

| Hook | Status | Arquivos Usando |
|------|--------|-----------------|
| useUnifiedAuth | ✅ Ativo | 8 |
| useMessages | ✅ Ativo | 4 |
| useProfileCheckSafe | ✅ Ativo | ? |
| useProfileCheck | ⚠️ Legado | 0 |
| useProfileCheckFixed | ⚠️ Legado | 0 |

---

## 🚀 Boas Práticas

### 1. Sempre use o hook recomendado
```typescript
// ✅ BOM
import { useAuth } from '@/hooks/useUnifiedAuth'

// ❌ RUIM (não existe mais)
import { useAuth } from '@/hooks/useAuth'
```

### 2. Prefira contextos quando disponível
```typescript
// ✅ MELHOR (não refaz queries)
import { useAuthContext } from '@/contexts/AuthContext'
const { user } = useAuthContext()

// 🟡 OK (mas pode refazer queries)
import { useAuth } from '@/hooks/useUnifiedAuth'
const { user } = useAuth()
```

### 3. Use cache quando apropriado
```typescript
// ✅ Para dados que mudam raramente
const { data } = useStaticCache('services', fetchServices)

// ✅ Para dados em tempo real
const { data } = useRealtimeCache('notifications')
```

### 4. Evite hooks legados
```typescript
// ❌ Evitar
import { useProfileCheck } from '@/hooks/useProfileCheck'

// ✅ Usar
import { useProfileCheckSafe } from '@/hooks/useProfileCheckSafe'
```

---

## 📝 Criando Novos Hooks

### Checklist

- [ ] Nome descritivo e único
- [ ] Verificar se não existe similar
- [ ] Adicionar TypeScript
- [ ] Documentar uso
- [ ] Adicionar neste guia
- [ ] Testes (opcional)

### Template

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Hook para [DESCRIÇÃO]
 * 
 * @example
 * ```tsx
 * const { data, loading } = useMeuHook(param)
 * ```
 */
export function useMeuHook(param: string) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const fetchData = useCallback(async () => {
    setLoading(true)
    // Lógica aqui
    setLoading(false)
  }, [param])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  return { data, loading, refetch: fetchData }
}
```

---

## 🔄 Migração de Hooks Legados

### useProfileCheck → useProfileCheckSafe

```typescript
// ❌ Antes
import { useProfileCheck } from '@/hooks/useProfileCheck'
const { hasProfile } = useProfileCheck()

// ✅ Depois
import { useProfileCheckSafe } from '@/hooks/useProfileCheckSafe'
const { hasProfile } = useProfileCheckSafe()
```

---

## 📚 Documentação Adicional

- [Sistema de Logging](./GUIA_LOGGING.md)
- [Rate Limiting](./CORRECOES_CRITICAS_APLICADAS.md)
- [Sistema de Sons](./SISTEMA_SONS_NOTIFICACOES.md)

---

**Última Atualização:** Outubro 2025  
**Versão:** 1.0.0

