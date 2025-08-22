# 🧪 Teste de Criação de Conta - ConfiLar

## 🎯 **Objetivo**
Testar se a criação de conta está funcionando corretamente após as correções implementadas.

## 🔧 **Correções Implementadas**

### **1. Campos da Tabela Corrigidos**
- ✅ **`professional_experience_years`** - Convertido para `number | null`
- ✅ **`emergency_service`** - Removido (não existe na tabela)
- ✅ **`insurance_coverage`** - Removido (não existe na tabela)
- ✅ **Campos obrigatórios** - Adicionados com valores padrão

### **2. Campos Obrigatórios Adicionados**
```typescript
is_verified: false,
badge: 'bronze',
rating: 0,
total_reviews: 0,
is_available: true,
address: '',
profile_completed: false
```

### **3. Logs de Debug Melhorados**
- ✅ **Campos sendo enviados** - Lista todos os campos
- ✅ **Valores do perfil** - Mostra todos os valores
- ✅ **Detalhes do erro** - Código, mensagem e detalhes

## 🚀 **Como Testar**

### **1. Criar Conta de Cliente**
1. Acesse `/auth`
2. Clique em "Criar Conta"
3. Preencha os campos:
   - **Nome:** `Teste Cliente`
   - **Email:** `cliente@teste.com`
   - **Senha:** `Teste123!`
   - **Tipo:** `Cliente`
   - **Telefone:** `11999999999`
   - **CPF:** `12345678900`
   - **Estado:** `São Paulo`
   - **Cidade:** `São Paulo`
   - **Bairro:** `Centro`

### **2. Criar Conta de Profissional**
1. Acesse `/auth`
2. Clique em "Criar Conta"
3. Preencha os campos:
   - **Nome:** `Teste Profissional`
   - **Email:** `profissional@teste.com`
   - **Senha:** `Teste123!`
   - **Tipo:** `Profissional`
   - **Telefone:** `11999999999`
   - **CPF:** `12345678900`
   - **Estado:** `São Paulo`
   - **Cidade:** `São Paulo`
   - **Bairro:** `Centro`
   - **Biografia:** `Profissional experiente`
   - **Anos de Experiência:** `5`

## 🔍 **O que Verificar**

### **1. Console do Navegador**
- ✅ **Logs de criação** aparecem
- ✅ **Campos do perfil** são listados
- ✅ **Valores do perfil** são mostrados
- ✅ **Erro 400** não aparece mais

### **2. Banco de Dados**
- ✅ **Usuário** criado na tabela `auth.users`
- ✅ **Perfil** criado na tabela `profiles`
- ✅ **Todos os campos** preenchidos corretamente

### **3. Redirecionamento**
- ✅ **Login automático** após criação
- ✅ **Redirecionamento** para `/feed` ou página principal

## 🚨 **Possíveis Problemas**

### **1. Erro 400 Persiste**
- Verificar se todos os campos obrigatórios estão sendo enviados
- Verificar se os tipos de dados estão corretos
- Verificar se há campos extras sendo enviados

### **2. Erro de Validação**
- Verificar se o CPF está no formato correto
- Verificar se o telefone está no formato correto
- Verificar se a senha atende aos critérios

### **3. Erro de RLS (Row Level Security)**
- Verificar se as políticas RLS estão configuradas
- Verificar se o usuário tem permissão para inserir

## 📋 **Logs Esperados**

### **Criação Bem-sucedida:**
```
📝 Tentando cadastro para: cliente@teste.com
✅ Cadastro bem-sucedido para: cliente@teste.com
🔄 Criando perfil no banco...
📋 Campos do perfil: [id, email, full_name, user_type, ...]
📊 Valores do perfil: {id: "...", email: "...", ...}
✅ Perfil criado com sucesso
```

### **Erro (se houver):**
```
❌ Erro ao criar perfil: {...}
❌ Código do erro: 400
❌ Mensagem do erro: Bad Request
❌ Detalhes do erro: {...}
```

## 🎯 **Resultado Esperado**

- ✅ **Conta criada** com sucesso
- ✅ **Perfil salvo** no banco
- ✅ **Login automático** funcionando
- ✅ **Redirecionamento** correto
- ✅ **Sem erros 400** no console

---

## 🔧 **Se o Problema Persistir**

1. **Verificar logs** detalhados no console
2. **Verificar estrutura** da tabela `profiles` no Supabase
3. **Verificar políticas RLS** da tabela
4. **Verificar tipos** de dados sendo enviados
5. **Comparar campos** enviados vs. campos esperados

**Teste e me informe o resultado!** 🚀✨
