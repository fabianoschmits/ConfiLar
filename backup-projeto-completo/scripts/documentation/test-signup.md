# 🧪 Guia de Teste - Cadastro de Usuários

## 🎯 **Objetivo:**
Verificar se o cadastro está funcionando corretamente e salvando todos os dados no perfil.

## 📋 **Passos para Teste:**

### **1. Executar Script SQL:**
```sql
-- Execute o arquivo check-profiles-table.sql no Supabase
-- Isso vai corrigir a estrutura da tabela profiles
```

### **2. Testar Cadastro de Cliente:**
1. **Acesse** a página de cadastro
2. **Preencha** todos os campos:
   - Nome: "João Silva"
   - Email: "joao@teste.com"
   - Senha: "123456"
   - Telefone: "(11) 99999-9999"
   - CPF: "123.456.789-00"
   - Data Nascimento: "1990-01-01"
   - Tipo: "Cliente"
   - Estado: "SP"
   - Cidade: "São Paulo"
   - Bairro: "Centro"

3. **Clique** em "Criar Conta"

### **3. Testar Cadastro de Profissional:**
1. **Acesse** a página de cadastro
2. **Preencha** todos os campos:
   - Nome: "Maria Santos"
   - Email: "maria@teste.com"
   - Senha: "123456"
   - Telefone: "(11) 88888-8888"
   - CPF: "987.654.321-00"
   - Data Nascimento: "1985-05-15"
   - Tipo: "Profissional"
   - Estado: "RJ"
   - Cidade: "Rio de Janeiro"
   - Bairro: "Copacabana"
   - Biografia: "Pedreira experiente com 10 anos de atuação"
   - Anos de Experiência: "10+"
   - Serviços: Marque "Pedreiro", "Pintor"
   - Serviço de Emergência: ✅
   - Cobertura de Seguro: ✅

3. **Clique** em "Criar Conta"

## 🔍 **O que Verificar:**

### **✅ Sucesso:**
- [ ] Conta criada sem erros
- [ ] Redirecionamento para `/perfil`
- [ ] Toast de sucesso
- [ ] Usuário logado automaticamente

### **✅ Dados Salvos:**
- [ ] **Tabela `auth.users`**: Usuário criado
- [ ] **Tabela `profiles`**: Perfil criado com todos os dados
- [ ] **Campos profissionais**: Salvos corretamente (se profissional)

### **✅ Perfil Preenchido:**
- [ ] Acessar `/perfil`
- [ ] Todos os campos devem estar preenchidos
- [ ] Não deve pedir para preencher novamente

## 🐛 **Possíveis Problemas:**

### **❌ Erro de Estrutura:**
```
Erro ao criar perfil: column "professional_services" does not exist
```
**Solução:** Execute o script SQL primeiro

### **❌ Erro de RLS:**
```
new row violates row-level security policy
```
**Solução:** Verificar se as políticas RLS estão corretas

### **❌ Erro de Duplicata:**
```
duplicate key value violates unique constraint
```
**Solução:** O script já trata isso automaticamente

## 📊 **Verificação no Banco:**

### **1. Verificar Usuário:**
```sql
SELECT * FROM auth.users WHERE email = 'joao@teste.com';
```

### **2. Verificar Perfil:**
```sql
SELECT * FROM profiles WHERE email = 'joao@teste.com';
```

### **3. Verificar Estrutura:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';
```

## 🚀 **Resultado Esperado:**

- ✅ **Cadastro funcionando** perfeitamente
- ✅ **Todos os dados salvos** no perfil
- ✅ **Perfil preenchido** automaticamente
- ✅ **Usuário logado** após cadastro
- ✅ **Redirecionamento** para perfil funcionando

## 🔧 **Se Ainda Houver Problemas:**

1. **Verificar logs** do console do navegador
2. **Verificar logs** do Supabase
3. **Executar script SQL** novamente
4. **Verificar políticas RLS** da tabela profiles
5. **Testar com usuário simples** primeiro

---

**Execute o teste e me informe os resultados!** 🎯✨
