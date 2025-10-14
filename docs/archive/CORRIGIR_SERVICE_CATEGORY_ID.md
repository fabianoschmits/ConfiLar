# 🔧 Correção da Coluna `service_category_id`

## 📋 **PROBLEMA IDENTIFICADO**

Ao tentar criar um post com serviço selecionado, o sistema retorna erro:

```
Error: invalid input syntax for type uuid: "masonry"
Code: 22P02
```

**Causa:** A coluna `service_category_id` na tabela `feed_posts` está configurada como tipo **UUID**, mas o sistema usa **strings** como identificadores de serviço (ex: "pintura", "eletrica", "masonry").

---

## ✅ **SOLUÇÃO**

Alterar o tipo da coluna `service_category_id` de **UUID** para **VARCHAR(100)**.

---

## 🛠️ **COMO EXECUTAR A CORREÇÃO**

### **Passo 1: Acessar o Supabase Dashboard**

1. Acesse: https://supabase.com/dashboard/project/oolqodaehouaidxuowtw
2. Faça login se necessário
3. Clique em **"SQL Editor"** no menu lateral

### **Passo 2: Executar o SQL**

Cole o seguinte SQL no editor e clique em **"Run"**:

```sql
-- Remover constraint de foreign key se existir
ALTER TABLE feed_posts 
DROP CONSTRAINT IF EXISTS feed_posts_service_category_id_fkey;

-- Alterar tipo da coluna de UUID para VARCHAR(100)
ALTER TABLE feed_posts 
ALTER COLUMN service_category_id TYPE VARCHAR(100) 
USING service_category_id::text;
```

### **Passo 3: Verificar a Alteração**

Execute este SQL para confirmar a mudança:

```sql
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'feed_posts' 
  AND column_name = 'service_category_id';
```

**Resultado esperado:**

| column_name          | data_type          | character_maximum_length | is_nullable |
|----------------------|--------------------|-----------------------------|-------------|
| service_category_id  | character varying  | 100                         | YES         |

---

## 🧪 **TESTAR APÓS A CORREÇÃO**

1. **Criar um novo post:**
   - Clique em "Novo Post"
   - Preencha título e descrição
   - **SELECIONE UM SERVIÇO** (ex: "Pintura")
   - Publique o post

2. **Resultado esperado:**
   - ✅ Post criado com sucesso
   - ✅ Badge verde com ícone 💼 e nome do serviço aparece no post

---

## 📦 **ARQUIVOS RELACIONADOS**

- `scripts/alter-service-category-column.sql` - SQL de alteração
- `scripts/alter-service-category-column.js` - Script com instruções
- `src/hooks/useUnifiedTimeline.ts` - Hook que salva e busca posts
- `src/components/timeline/TimelinePost.tsx` - Componente que exibe a badge
- `src/types/timeline.ts` - Tipo TypeScript atualizado

---

## 🎯 **COMMITS RELACIONADOS**

Correções implementadas no código:

1. ✅ Adicionado `service_category_id` na interface `TimelinePost`
2. ✅ Adicionado `service_category_id` nas queries SQL (principal e relacionada)
3. ✅ Adicionado `service_category_id` no mapeamento dos posts
4. ✅ Adicionado `service_category_id` na função `addPost` (insert e cache)
5. ✅ Adicionada badge visual de serviço no componente `TimelinePost`
6. ✅ Corrigida lógica de prioridade das badges "Em alta" vs "Verificado"

---

## ⚠️ **IMPORTANTE**

- Esta alteração **NÃO** afeta posts existentes (eles continuam funcionando)
- Apenas permite que **novos posts** sejam criados com serviços
- A alteração é **reversível** se necessário
- **Não há perda de dados** nesta operação

---

## 📞 **SUPORTE**

Se houver algum erro na execução do SQL, verifique:

1. Se você tem permissões de administrador no Supabase
2. Se a tabela `feed_posts` existe
3. Se há posts com valores UUID na coluna (improvável, pois a tabela é nova)

---

**Status:** ⏳ Aguardando execução manual no Supabase Dashboard

