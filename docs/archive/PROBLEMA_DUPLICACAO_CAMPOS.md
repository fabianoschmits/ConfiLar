# 🔍 Problema: Duplicação de Campos na Tabela Reports

## 📊 Situação Encontrada

A tabela `reports` tinha **dois campos para o tipo da denúncia**:

| Campo | Tipo | Nullable | Status |
|-------|------|----------|--------|
| `report_type` | varchar | **NO** (obrigatório) | ❌ Campo antigo |
| `type` | varchar | **YES** (opcional) | ⚠️ Campo novo vazio |

## ❌ Por Que Isso Causava Erro?

### 1. **O Código usava `type`:**
```typescript
const reportData = {
  type: 'post',  // ✅ Correto no código
  description: '...',
  // ...
}

await supabase.from('reports').insert(reportData)
```

### 2. **O Banco exigia `report_type`:**
```sql
-- Campo obrigatório no banco
report_type VARCHAR NOT NULL

-- Campo usado pelo código (vazio)
type VARCHAR NULL
```

### 3. **Resultado:**
- ❌ Inserção falhava: campo obrigatório `report_type` estava NULL
- ❌ Campo `type` ficava vazio
- ❌ Denúncias não eram salvas

---

## ✅ Solução Aplicada

### Script: `scripts/migrate-reports-field.sql`

```sql
-- 1. Copiar dados
UPDATE reports SET type = report_type WHERE type IS NULL;

-- 2. Tornar 'type' obrigatório
ALTER TABLE reports ALTER COLUMN type SET NOT NULL;

-- 3. Depreciar 'report_type'
ALTER TABLE reports ALTER COLUMN report_type DROP NOT NULL;
```

### Resultado Final:

| Campo | Tipo | Nullable | Status |
|-------|------|----------|--------|
| `type` | varchar | **NO** (obrigatório) | ✅ Campo ativo |
| `report_type` | varchar | **YES** (opcional) | ⚠️ Deprecated |

---

## 🎯 Como Ficou Depois da Migração

### Antes (QUEBRADO):
```
Código usa: type
Banco exige: report_type (NOT NULL)
Resultado: ❌ ERRO - campo obrigatório NULL
```

### Depois (FUNCIONANDO):
```
Código usa: type
Banco exige: type (NOT NULL)
Resultado: ✅ SUCESSO - denúncia salva
```

---

## 📝 Próximos Passos

### Imediato:
1. ✅ Executar `scripts/migrate-reports-field.sql`
2. ✅ Testar denúncias no sistema
3. ✅ Verificar em `/minhas-denuncias`

### Futuro (Opcional):
- Remover campo `report_type` completamente:
  ```sql
  ALTER TABLE reports DROP COLUMN report_type;
  ```

---

## 🧪 Teste de Verificação

Após executar o script, teste:

```typescript
// Deve funcionar agora:
const { data, error } = await supabase
  .from('reports')
  .insert({
    type: 'post',
    reason: 'Teste',
    description: 'Teste de denúncia',
    priority: 'medium',
    reporter_id: user.id,
    reported_post_id: 'xxx'
  })

// ✅ Deve retornar sucesso (sem error)
console.log(error) // null
console.log(data)  // { id: '...', type: 'post', ... }
```

---

## 📌 Resumo

**Problema:** Tabela tinha 2 campos (`report_type` e `type`), código usava o errado  
**Causa:** Migração incompleta ou campos duplicados  
**Solução:** Migrar `report_type` → `type` e depreciar `report_type`  
**Status:** ✅ Correção aplicada, aguardando execução do SQL  

