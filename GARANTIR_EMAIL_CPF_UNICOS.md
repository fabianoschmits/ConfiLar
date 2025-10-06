# 🔒 Como Garantir que Não Haja 2 Registros com Mesmo Email ou CPF

## 📋 Resumo Rápido

Para evitar duplicatas de email e CPF no banco de dados, você precisa adicionar **constraints UNIQUE** na tabela `profiles`.

---

## 🚀 Solução em 3 Passos

### **Passo 1: Verificar se há duplicatas** (Opcional, mas recomendado)

Execute o script para verificar:
```bash
node scripts/check-duplicates.js
```

**OU** execute diretamente no Supabase SQL Editor:
```sql
-- Verificar emails duplicados
SELECT email, COUNT(*) as total
FROM profiles
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;

-- Verificar CPF/CNPJ duplicados
SELECT cpf_cnpj, COUNT(*) as total
FROM profiles
WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != ''
GROUP BY cpf_cnpj
HAVING COUNT(*) > 1;
```

---

### **Passo 2: Executar o SQL**

1. Acesse: **https://supabase.com/dashboard**
2. Selecione seu projeto **ConfiLar**
3. Clique em **"SQL Editor"**
4. Abra o arquivo: **`scripts/add-unique-constraints-profiles.sql`**
5. **Copie e execute** o conteúdo do arquivo

O SQL irá:
- ✅ Verificar duplicatas
- ✅ Remover duplicatas (se houver)
- ✅ Adicionar constraints UNIQUE
- ✅ Criar índices para performance

---

### **Passo 3: Verificar se funcionou**

Execute no SQL Editor:
```sql
SELECT constraint_name, column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles'
  AND tc.constraint_type = 'UNIQUE';
```

**Resultado esperado:**
```
constraint_name          | column_name
-------------------------+-------------
unique_profile_email     | email
unique_profile_cpf_cnpj  | cpf_cnpj
```

---

## ✅ Pronto!

Agora **é impossível** cadastrar 2 usuários com:
- ❌ Mesmo email
- ❌ Mesmo CPF/CNPJ

O banco de dados irá **rejeitar automaticamente** tentativas de cadastro duplicado.

---

## 📖 Documentação Completa

Para instruções detalhadas, consulte:
- **`scripts/INSTRUCOES_UNIQUE_CONSTRAINTS.md`** - Guia completo passo a passo
- **`scripts/add-unique-constraints-profiles.sql`** - Script SQL com todos os comandos
- **`scripts/check-duplicates.js`** - Script para verificar duplicatas

---

## 🆘 Ajuda

Se encontrar erros, verifique:

### Erro: "duplicate key value violates unique constraint"
✅ **Isso significa que funcionou!** O banco está rejeitando duplicatas.

### Erro: "constraint already exists"
✅ **Constraints já estão criados!** Não precisa executar novamente.

### Erro ao criar constraint (há duplicatas)
⚠️ Execute primeiro a seção de **remoção de duplicatas** do SQL.

---

## 💡 Dica

Após implementar, adicione tratamento de erro no código:

```typescript
if (error?.code === '23505') {
  if (error.message.includes('email')) {
    toast.error('❌ Email já cadastrado')
  } else if (error.message.includes('cpf_cnpj')) {
    toast.error('❌ CPF/CNPJ já cadastrado')
  }
}
```

---

**Status:** ✅ **Solução completa criada e documentada**  
**Próximo passo:** Execute o SQL no Supabase Dashboard

