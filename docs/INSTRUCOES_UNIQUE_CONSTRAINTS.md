# 🔒 Garantir Email e CPF Únicos no Banco de Dados

## 📋 Problema
Atualmente, é possível cadastrar **2 ou mais usuários com o mesmo email ou CPF**, o que causa:
- ❌ Duplicação de registros
- ❌ Problemas de login/autenticação
- ❌ Confusão na identificação de usuários
- ❌ Vulnerabilidade de segurança

## ✅ Solução Implementada

### 🎯 O que foi criado:
- **Script SQL completo**: `scripts/add-unique-constraints-profiles.sql`
- Adiciona **constraints UNIQUE** para email e CPF/CNPJ
- Remove duplicatas existentes (se houver)
- Cria índices para melhor performance

---

## 🚀 Como Executar

### **Passo 1: Acessar o Supabase Dashboard**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto **ConfiLar**
3. Clique em **"SQL Editor"** no menu lateral

### **Passo 2: Verificar se há duplicatas**
Execute primeiro esta query para verificar:

```sql
-- Verificar emails duplicados
SELECT email, COUNT(*) as total
FROM profiles
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY total DESC;

-- Verificar CPF/CNPJ duplicados
SELECT cpf_cnpj, COUNT(*) as total
FROM profiles
WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != ''
GROUP BY cpf_cnpj
HAVING COUNT(*) > 1
ORDER BY total DESC;
```

**Resultado esperado:**
- Se retornar **vazio**: ✅ Não há duplicatas, pode prosseguir
- Se retornar **linhas**: ⚠️ Há duplicatas que precisam ser tratadas

---

### **Passo 3: Remover duplicatas (se necessário)**

⚠️ **ATENÇÃO**: Execute APENAS se houver duplicatas confirmadas no Passo 2

```sql
-- Backup dos registros que serão removidos
CREATE TABLE IF NOT EXISTS profiles_duplicates_backup AS
SELECT * FROM profiles
WHERE id NOT IN (
  SELECT DISTINCT ON (email) id
  FROM profiles
  WHERE email IS NOT NULL
  ORDER BY email, created_at DESC
);

-- Remover duplicatas de email (mantém o mais recente)
DELETE FROM profiles
WHERE id NOT IN (
  SELECT DISTINCT ON (email) id
  FROM profiles
  WHERE email IS NOT NULL
  ORDER BY email, created_at DESC
);

-- Remover duplicatas de CPF/CNPJ (mantém o mais recente)
DELETE FROM profiles
WHERE cpf_cnpj IS NOT NULL 
  AND cpf_cnpj != ''
  AND id NOT IN (
    SELECT DISTINCT ON (cpf_cnpj) id
    FROM profiles
    WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != ''
    ORDER BY cpf_cnpj, created_at DESC
  );
```

---

### **Passo 4: Adicionar constraints UNIQUE**

Execute este SQL para adicionar as constraints:

```sql
-- Adicionar constraint UNIQUE para email
ALTER TABLE profiles 
ADD CONSTRAINT unique_profile_email 
UNIQUE (email);

-- Adicionar constraint UNIQUE para cpf_cnpj
ALTER TABLE profiles 
ADD CONSTRAINT unique_profile_cpf_cnpj 
UNIQUE (cpf_cnpj);
```

**Resultado esperado:**
```
✅ ALTER TABLE
```

---

### **Passo 5: Criar índices para performance**

```sql
-- Criar índice para email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Criar índice para cpf_cnpj
CREATE INDEX IF NOT EXISTS idx_profiles_cpf_cnpj ON profiles(cpf_cnpj) 
WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != '';
```

---

### **Passo 6: Verificar se funcionou**

Execute para confirmar que os constraints foram criados:

```sql
-- Listar todos os constraints da tabela profiles
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles'
  AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
ORDER BY tc.constraint_name;
```

**Resultado esperado:**
```
constraint_name            | constraint_type | column_name
---------------------------+-----------------+-------------
profiles_pkey              | PRIMARY KEY     | id
unique_profile_email       | UNIQUE          | email
unique_profile_cpf_cnpj    | UNIQUE          | cpf_cnpj
```

---

## 🧪 Testar se funciona

### Teste 1: Tentar cadastrar email duplicado

```sql
-- Substitua 'email_existente@example.com' por um email real do seu banco
INSERT INTO profiles (id, email, full_name, user_type)
VALUES (
  gen_random_uuid(), 
  'email_existente@example.com',
  'Teste Duplicado',
  'client'
);
```

**Resultado esperado:**
```
ERROR: duplicate key value violates unique constraint "unique_profile_email"
DETAIL: Key (email)=(email_existente@example.com) already exists.
```

✅ **Isso significa que está funcionando!** O banco agora **rejeita emails duplicados**.

---

## 📊 O que acontece agora?

### ✅ Comportamento após implementação:

1. **No cadastro via interface:**
   - Usuário tenta se cadastrar com email já existente
   - Sistema retorna erro: `"Email já cadastrado"`
   - Usuário precisa usar outro email ou recuperar senha

2. **No cadastro via código:**
   ```typescript
   // Antes: Permitia duplicatas
   // Agora: Retorna erro do banco
   const { error } = await supabase
     .from('profiles')
     .insert({ email: 'duplicado@example.com' })
   
   if (error) {
     // error.code === '23505' (unique violation)
     toast.error('Email já cadastrado na plataforma')
   }
   ```

3. **No banco de dados:**
   - ✅ Impossível criar 2 perfis com mesmo email
   - ✅ Impossível criar 2 perfis com mesmo CPF/CNPJ
   - ✅ Garantia de integridade dos dados

---

## 🛡️ Tratamento de Erros no Código

Para melhorar a experiência do usuário, você pode adicionar tratamento específico:

### Exemplo em TypeScript:

```typescript
try {
  const { error } = await supabase
    .from('profiles')
    .insert({
      email: data.email,
      cpf_cnpj: data.cpf_cnpj,
      // ... outros campos
    })

  if (error) {
    // Código de erro para constraint unique violation
    if (error.code === '23505') {
      // Verificar qual campo causou o erro
      if (error.message.includes('unique_profile_email')) {
        toast.error('❌ Este email já está cadastrado na plataforma')
      } else if (error.message.includes('unique_profile_cpf_cnpj')) {
        toast.error('❌ Este CPF/CNPJ já está cadastrado na plataforma')
      } else {
        toast.error('❌ Dados duplicados detectados')
      }
    } else {
      toast.error('❌ Erro ao criar conta')
    }
  }
} catch (err) {
  console.error('Erro no cadastro:', err)
}
```

---

## 📝 Resumo

| Item | Status |
|------|--------|
| ✅ Email único | Garantido pelo banco |
| ✅ CPF/CNPJ único | Garantido pelo banco |
| ✅ Performance otimizada | Índices criados |
| ✅ Integridade dos dados | Constraints ativas |
| ✅ Duplicatas removidas | Backup criado |

---

## 🎯 Próximos Passos

1. ✅ **Execute o SQL** conforme instruções acima
2. ✅ **Teste o cadastro** na interface
3. ✅ **Verifique os logs** de erro se houver problemas
4. 🔄 **Adicione tratamento de erro** no código (opcional)

---

## ❓ Perguntas Frequentes

**P: E se eu já tiver usuários duplicados?**
R: O Passo 3 remove duplicatas mantendo o registro mais recente.

**P: Posso reverter os constraints?**
R: Sim, execute:
```sql
ALTER TABLE profiles DROP CONSTRAINT unique_profile_email;
ALTER TABLE profiles DROP CONSTRAINT unique_profile_cpf_cnpj;
```

**P: E se um usuário quiser mudar o email?**
R: Funciona normalmente, desde que o novo email não esteja sendo usado por outro usuário.

**P: E se o CPF for NULL?**
R: CPF NULL é permitido, a constraint UNIQUE só valida valores não nulos.

---

**✅ Problema resolvido!** Agora é **impossível** ter 2 registros com mesmo email ou CPF.

