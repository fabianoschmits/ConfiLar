# 🔧 Corrigir Políticas RLS da Tabela Profiles

## 🚨 **Problema Identificado**
```
Erro ao criar conta: Erro ao criar perfil: new row violates row-level security policy for table "profiles"
```

Este erro indica que as **políticas RLS (Row Level Security)** estão impedindo a inserção de novos perfis durante o cadastro.

## 🎯 **Solução**
Executar o script SQL `fix-profiles-rls.sql` no Supabase Dashboard para corrigir as políticas RLS.

## 📋 **Passo a Passo**

### **1. Acessar o Supabase Dashboard**
1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto ConfiLar
4. Vá para **SQL Editor** no menu lateral

### **2. Executar o Script**
1. **Clique** em **"New Query"**
2. **Cole** o conteúdo do arquivo `fix-profiles-rls.sql`
3. **Clique** em **"Run"** (botão ▶️)

### **3. Verificar Resultados**
Após executar, você deve ver:
- ✅ **RLS desabilitado** temporariamente
- ✅ **Políticas antigas removidas**
- ✅ **Novas políticas criadas**
- ✅ **RLS habilitado** novamente
- ✅ **Lista de políticas** criadas

## 🔍 **O que o Script Faz**

### **1. Remove Políticas Problemáticas**
```sql
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
-- ... outras políticas
```

### **2. Cria Políticas Corretas**
```sql
-- ✅ Inserção durante cadastro
CREATE POLICY "Enable insert for authenticated users during signup" ON profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- ✅ Visualização própria
CREATE POLICY "Enable read access for users based on user_id" ON profiles
    FOR SELECT 
    USING (auth.uid() = id);

-- ✅ Atualização própria
CREATE POLICY "Enable update for users based on user_id" ON profiles
    FOR UPDATE 
    USING (auth.uid() = id);

-- ✅ Exclusão própria
CREATE POLICY "Enable delete for users based on user_id" ON profiles
    FOR DELETE 
    USING (auth.uid() = id);
```

### **3. Verifica Configuração**
- ✅ **Políticas criadas**
- ✅ **Contagem de registros**
- ✅ **Campos da tabela** (sem comando psql)

## 🚀 **Após Executar o Script**

### **1. Testar Criação de Conta**
1. **Acesse** `/auth`
2. **Clique** em "Criar Conta"
3. **Preencha** os campos
4. **Verifique** se não há mais erro de RLS

### **2. Logs Esperados**
```
📝 Tentando cadastro para: usuario@teste.com
✅ Cadastro bem-sucedido para: usuario@teste.com
🔄 Criando perfil no banco...
📋 Campos do perfil: [id, email, full_name, user_type, ...]
📊 Valores do perfil: {id: "...", email: "...", ...}
✅ Perfil criado com sucesso
```

### **3. Verificar Banco de Dados**
- ✅ **Usuário** criado em `auth.users`
- ✅ **Perfil** criado em `profiles`
- ✅ **Todos os campos** preenchidos

## 🚨 **Importante**

### **⚠️ Segurança**
- As políticas RLS garantem que usuários só acessem seus próprios dados
- Cada usuário só pode ver, editar e excluir seu próprio perfil
- A inserção só é permitida durante o cadastro (quando `auth.uid() = id`)

### **🔒 Como Funciona**
```sql
-- Usuário só pode inserir perfil com seu próprio ID
WITH CHECK (auth.uid() = id)

-- Usuário só pode ver perfil com seu próprio ID  
USING (auth.uid() = id)

-- Usuário só pode atualizar perfil com seu próprio ID
USING (auth.uid() = id)

-- Usuário só pode excluir perfil com seu próprio ID
USING (auth.uid() = id)
```

## 🎯 **Resultado Esperado**

- ✅ **Erro de RLS resolvido**
- ✅ **Criação de conta funcionando**
- ✅ **Perfis sendo salvos no banco**
- ✅ **Segurança mantida** (usuários só acessam seus dados)
- ✅ **Políticas RLS configuradas corretamente**

## 🔧 **Se o Problema Persistir**

### **1. Verificar Logs**
- Console do navegador
- Logs do Supabase
- Erros específicos

### **2. Verificar Estrutura da Tabela**
- Campos obrigatórios
- Tipos de dados
- Valores padrão

### **3. Verificar Políticas RLS**
- Se foram criadas corretamente
- Se estão habilitadas
- Se há conflitos

---

## 🚀 **Execute o Script e Teste!**

Após executar o script SQL:
1. **Teste** a criação de conta
2. **Verifique** os logs no console
3. **Confirme** que não há mais erro de RLS
4. **Me informe** o resultado!

**O erro de RLS deve estar resolvido!** 🎯✨
