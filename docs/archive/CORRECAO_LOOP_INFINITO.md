# Correção do Loop Infinito nos Comentários

## 🔍 Problema identificado

Pelos logs do console, vi que:
- ✅ **Comentários estão sendo carregados**: `✅ Comentários carregados: Array(5)`
- ✅ **Hook está funcionando**: `🔍 Carregando comentários para post: 367c0232-669e-4e85-9e5e-f8474a06d107`
- ❌ **Loop infinito**: Os logs se repetem constantemente

## 🛠️ Correções aplicadas

### 1. **Otimização do Hook `useCommentsDebug`**
- ✅ Adicionado `enabled: !!filters.post_id` - só executa se tiver post_id
- ✅ Adicionado `staleTime: 30000` - cache por 30 segundos
- ✅ Adicionado `refetchOnWindowFocus: false` - não recarrega ao focar
- ✅ Simplificado `queryKey` para `['comments-debug', filters.post_id]`

### 2. **Otimização do Componente**
- ✅ Movido logs para `useEffect` com dependências específicas
- ✅ Removido painel de debug da interface
- ✅ Adicionado import do React

### 3. **Resultado esperado**
- ✅ Comentários carregam uma vez
- ✅ Sem loop infinito
- ✅ Performance melhorada
- ✅ Logs limpos no console

## 🎯 Como testar agora

1. **Abra o DevTools (F12)**
2. **Vá para Console**
3. **Clique em "Comentar" em um post**
4. **Verifique se:**
   - Aparece apenas 1 log de carregamento
   - Aparece apenas 1 log de sucesso
   - Os comentários são exibidos na interface
   - Não há mais loop infinito

## 📊 Logs esperados

```
🔍 Carregando comentários para post: [post-id]
✅ Comentários carregados: 5 para post: [post-id]
```

**Apenas uma vez por post!** 🎉
