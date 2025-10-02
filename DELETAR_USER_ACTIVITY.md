# 🗑️ DELETAR SISTEMA DE STATUS DE USUÁRIO DO BANCO

## ✅ Sistema Removido do Código

O sistema de status de usuário (bolinhas online/offline) foi **completamente removido** do projeto:

### Componentes Deletados:
- ❌ `UserStatusDot.tsx`
- ❌ `ActivityStatusIndicator.tsx`
- ❌ `UserActivityInitializer.tsx`
- ❌ `UserConnectivityStatus.tsx`

### Hooks Deletados:
- ❌ `useUserActivity.ts`
- ❌ `useNewActivityMonitor.ts`

### Páginas Atualizadas:
- ✅ `/buscar` - Removido UserStatusDot
- ✅ `/classificados` - Removido UserStatusDot
- ✅ `/perfil/[id]` - Removido UserStatusDot
- ✅ `FloatingChat` - Removido UserStatusDot
- ✅ `SimpleHeaderBell` - Removido ActivityDot
- ✅ `layout.tsx` - Removido UserActivityInitializer

---

## 🗄️ DELETAR TABELA DO BANCO DE DADOS

Agora você precisa **executar o SQL** para remover a tabela `user_activity` do Supabase:

### 1️⃣ Acesse o Supabase SQL Editor
- Vá para: https://supabase.com/dashboard/project/oolqodaehouaidxuowtw/sql/new
- Ou: Dashboard → SQL Editor → New Query

### 2️⃣ Cole e Execute este SQL

```sql
-- Remover políticas RLS
DROP POLICY IF EXISTS "Users can view their own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can update their own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can insert their own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can delete their own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Anyone can view user activity" ON public.user_activity;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_activity;
DROP POLICY IF EXISTS "Public read access" ON public.user_activity;
DROP POLICY IF EXISTS "Users insert own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users update own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Anyone can view user activity status" ON public.user_activity;

-- Remover trigger
DROP TRIGGER IF EXISTS set_updated_at ON public.user_activity;

-- Remover função do trigger
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- Remover índices
DROP INDEX IF EXISTS public.idx_user_activity_status;
DROP INDEX IF EXISTS public.idx_user_activity_is_online;
DROP INDEX IF EXISTS public.idx_user_activity_last_activity;

-- Deletar tabela
DROP TABLE IF EXISTS public.user_activity CASCADE;

-- Verificar se foi removido
SELECT 
  'Tabela user_activity deletada' as status,
  NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_activity'
  ) as sucesso;
```

### 3️⃣ Clique em "Run" (Ctrl+Enter)

Se `sucesso = true`, a tabela foi removida com sucesso! ✅

---

## 📊 Benefícios da Remoção

### 🎯 Performance
- ✅ Bundle JS reduzido em ~6KB
- ✅ Menos requisições ao banco (erros 406 eliminados)
- ✅ Menos processamento no cliente
- ✅ Páginas carregam mais rápido

### 🧹 Código Limpo
- ✅ Menos complexidade
- ✅ Menos bugs potenciais
- ✅ Código mais fácil de manter
- ✅ Menos dependências

### 💾 Banco de Dados
- ✅ Menos tabelas para gerenciar
- ✅ Menos políticas RLS
- ✅ Menos triggers e funções
- ✅ Banco mais limpo e organizado

---

## 🔄 Se Quiser Reativar no Futuro

Para reativar o sistema de status, você precisará:

1. Restaurar os componentes deletados do Git
2. Recriar a tabela `user_activity` no banco
3. Configurar as políticas RLS corretamente
4. Testar em todos os dispositivos

**Recomendação**: Só reative se for realmente necessário para o negócio.

