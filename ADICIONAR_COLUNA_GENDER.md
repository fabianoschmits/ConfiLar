# 🔧 Adicionar Coluna Gender na Tabela Profiles

## ❌ Problema Identificado
O erro no onboarding está ocorrendo porque a tabela `profiles` não possui a coluna `gender`, mas o código está tentando enviar esse campo.

## ✅ Solução
Você precisa adicionar a coluna `gender` na tabela `profiles` no Supabase.

### 📋 Passos para Resolver:

1. **Acesse o Dashboard do Supabase:**
   - URL: https://supabase.com/dashboard/project/oolqodaehouaidxuowtw/editor

2. **Vá para o SQL Editor:**
   - No menu lateral, clique em "SQL Editor"

3. **Execute o seguinte SQL:**
   ```sql
   ALTER TABLE profiles ADD COLUMN gender VARCHAR(10);
   ```

4. **Verifique se a coluna foi criada:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'profiles' 
   AND column_name = 'gender';
   ```

### 🎯 Resultado Esperado
Após executar o SQL, a coluna `gender` será adicionada à tabela `profiles` e o erro no onboarding será resolvido.

### 📝 Nota
A coluna `gender` aceitará os valores: `'male'`, `'female'`, `'other'` conforme definido no código do onboarding.

---
**Status:** ⏳ Aguardando execução manual no dashboard
