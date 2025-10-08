# 🔧 Solução para Erro no Onboarding

## ❌ Problema Identificado
```
POST https://oolqodaehouaidxuowtw.supabase.co/rest/v1/profiles?on_conflict=id 400 (Bad Request)
❌ Erro ao salvar perfil: {code: 'PGRST204', details: null, hint: null, message: "Could not find the 'gender' column of 'profiles' in the schema cache"}
```

**Causa:** A tabela `profiles` não possui a coluna `gender`, mas o código do onboarding está tentando enviar esse campo.

## ✅ Soluções Implementadas

### 1. Solução Temporária (JÁ APLICADA)
- ✅ Comentei temporariamente o campo `gender` no código do onboarding
- ✅ O onboarding agora funcionará sem o campo gender
- ✅ Usuários podem completar o cadastro normalmente

### 2. Solução Definitiva (PENDENTE)
Para adicionar a coluna `gender` na tabela `profiles`:

#### 📋 Passos:
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

#### 🔄 Após Adicionar a Coluna:
1. **Descomente as linhas no código:**
   - Linha 511: `gender: data.gender,`
   - Linha 553: `gender: data.gender,`

2. **Remova os comentários temporários:**
   ```typescript
   // gender: data.gender, // TEMPORARIAMENTE COMENTADO - coluna não existe na tabela
   ```
   Vire:
   ```typescript
   gender: data.gender,
   ```

## 🎯 Status Atual
- ✅ **Onboarding funcionando** (sem campo gender)
- ⏳ **Aguardando adição da coluna gender** no banco
- 🔄 **Após adicionar coluna:** descomentar linhas no código

## 📝 Nota
A coluna `gender` aceitará os valores: `'male'`, `'female'`, `'other'` conforme definido no código do onboarding.

---
**Data:** $(date)
**Status:** ✅ Solução temporária aplicada, ⏳ Solução definitiva pendente
