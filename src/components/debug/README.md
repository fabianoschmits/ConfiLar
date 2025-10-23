# 🐛 Componentes de Debug

## ⚠️ ATENÇÃO

Estes componentes são **APENAS PARA DESENVOLVIMENTO**.

Em produção, eles são automaticamente **EXCLUÍDOS DO BUNDLE** pelo webpack.

---

## 📝 Componentes Disponíveis

### 1. `SimpleMentionTest.tsx`
Teste do sistema de menções

### 2. `MentionDebug.tsx`
Debug de menções inline

### 3. `AuthContextDebug.tsx`
Debug do contexto de autenticação

---

## 🚀 Como Usar

```typescript
// Importar normalmente em desenvolvimento
import { SimpleMentionTest } from '@/components/debug/SimpleMentionTest'

// Usar condicionalmente
{process.env.NODE_ENV === 'development' && <SimpleMentionTest />}
```

---

## ⚙️ Configuração

No `next.config.mjs`:

```javascript
webpack: (config, { dev }) => {
  if (!dev) {
    config.resolve.alias = {
      '@/components/debug/SimpleMentionTest': false,
      '@/components/debug/MentionDebug': false,
      '@/components/debug/AuthContextDebug': false,
    }
  }
  return config
}
```

---

## ✅ Status

- ✅ Excluídos do bundle de produção automaticamente
- ✅ Disponíveis apenas em desenvolvimento
- ✅ Não afetam performance em produção
- ✅ Não expõem informações sensíveis

---

## 📊 Impacto no Bundle

| Ambiente | Incluído? | Tamanho |
|----------|-----------|---------|
| Development | ✅ Sim | ~50kb |
| Production | ❌ Não | 0kb |

---

**Criado:** Outubro 2025

