# 📋 Como Usar o Sistema de Logs - ConfiLar

## 🎯 **Visão Geral**

O sistema de logs registra as ações mais importantes dos usuários em português, de forma simples e clara.

## 📝 **Exemplos de Mensagens**

As mensagens aparecem assim:
- ✅ "João Silva fez login"
- ✅ "Maria Santos criou um post"
- ✅ "Pedro Costa criou um anúncio: Serviço de limpeza"
- ✅ "Ana Oliveira atualizou o perfil"
- ✅ "Carlos Rocha ganhou 200 pontos"

## 🚀 **Como Registrar Logs**

### **1. Importar as funções**

```typescript
import { 
  logUserLogin,
  logUserSignup,
  logPostCreated,
  logClassifiedCreated,
  // ... outras funções
} from '@/lib/logs'
```

### **2. Exemplos de Uso**

#### **Login de Usuário**

```typescript
// No hook de autenticação (useUnifiedAuth.ts)
import { logUserLogin } from '@/lib/logs'

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})

if (data.user) {
  // Buscar nome do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', data.user.id)
    .single()

  // Registrar log
  await logUserLogin(
    data.user.id,
    profile?.full_name || 'Usuário',
    data.user.email || ''
  )
}
```

#### **Cadastro de Usuário**

```typescript
// No BasicSignupForm.tsx ou SimpleRegistrationForm.tsx
import { logUserSignup } from '@/lib/logs'

const { error, data: signUpData } = await signUpBasic({
  email: data.email,
  password: data.password,
  cpf_cnpj: data.cpf_cnpj,
})

if (!error && signUpData?.user) {
  // Registrar log
  await logUserSignup(
    signUpData.user.id,
    data.name || 'Novo Usuário',
    data.email,
    data.user_type || 'client'
  )
}
```

#### **Criação de Post**

```typescript
// Ao criar um post no feed
import { logPostCreated } from '@/lib/logs'

const { data: post, error } = await supabase
  .from('feed_posts')
  .insert(postData)
  .select()
  .single()

if (!error && post) {
  // Buscar nome do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single()

  // Registrar log
  await logPostCreated(
    userId,
    profile?.full_name || 'Usuário',
    post.id,
    post.type
  )
}
```

#### **Criação de Anúncio/Classificado**

```typescript
// Ao criar um anúncio
import { logClassifiedCreated } from '@/lib/logs'

const { data: classified, error } = await supabase
  .from('classified_ads')
  .insert(classifiedData)
  .select()
  .single()

if (!error && classified) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single()

  await logClassifiedCreated(
    userId,
    profile?.full_name || 'Usuário',
    classified.id,
    classified.title
  )
}
```

#### **Atualização de Perfil**

```typescript
// Ao atualizar perfil
import { logProfileUpdated } from '@/lib/logs'

const { error } = await supabase
  .from('profiles')
  .update(profileData)
  .eq('id', userId)

if (!error) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single()

  await logProfileUpdated(
    userId,
    profile?.full_name || 'Usuário'
  )
}
```

#### **Ganho de Pontos**

```typescript
// Quando usuário ganha pontos
import { logPointsEarned } from '@/lib/logs'

// ... código que adiciona pontos ...

await logPointsEarned(
  userId,
  userName,
  pointsAmount,
  'Indicação realizada' // motivo
)
```

#### **Registrar Erro**

```typescript
// Em catch de erro
import { logError } from '@/lib/logs'

try {
  // ... código ...
} catch (error) {
  await logError(
    error as Error,
    'processar_pagamento',
    userId,
    '/api/payments'
  )
}
```

## 📋 **Funções Disponíveis**

### **Autenticação**
- `logUserLogin(userId, userName, email)` - Usuário fez login
- `logUserLogout(userId, userName)` - Usuário fez logout
- `logUserSignup(userId, userName, email, userType)` - Novo usuário se cadastrou
- `logPasswordReset(email)` - Recuperação de senha
- `logEmailVerification(userId, userName)` - Email verificado

### **Posts**
- `logPostCreated(userId, userName, postId, postType?)` - Post criado
- `logPostUpdated(userId, userName, postId)` - Post atualizado
- `logPostDeleted(userId, userName, postId)` - Post deletado

### **Anúncios/Classificados**
- `logClassifiedCreated(userId, userName, classifiedId, title)` - Anúncio criado
- `logClassifiedUpdated(userId, userName, classifiedId, title)` - Anúncio atualizado
- `logClassifiedDeleted(userId, userName, classifiedId)` - Anúncio deletado

### **Perfil**
- `logProfileUpdated(userId, userName)` - Perfil atualizado
- `logOnboardingCompleted(userId, userName)` - Onboarding completado

### **Pontos**
- `logPointsEarned(userId, userName, points, reason)` - Pontos ganhos
- `logPointsSpent(userId, userName, points, reason)` - Pontos gastos

### **Indicações**
- `logReferralCreated(userId, userName, referredUserId, referredUserName)` - Nova indicação

### **Administração**
- `logUserBanned(adminUserId, adminName, bannedUserId, bannedUserName, reason)` - Usuário banido
- `logUserUnbanned(adminUserId, adminName, unbannedUserId, unbannedUserName)` - Usuário desbanido

### **Erros**
- `logError(error, context, userId?, endpoint?)` - Erro no sistema

## 🎨 **Visualização no Admin**

No painel admin (`/admin/dashboard` > aba "Logs"), você verá:

1. **Estatísticas rápidas**: Total, erros, avisos, sucessos
2. **Filtros**: Busca, tipo, categoria, período
3. **Lista de logs**: Mensagens em português com informações do usuário
4. **Detalhes**: Clique em um log para ver mais informações

## ✅ **Boas Práticas**

1. ✅ **Sempre use as funções helper** - Elas já formatam as mensagens em português
2. ✅ **Registre apenas ações importantes** - Não sobrecarregue o sistema
3. ✅ **Use nomes de usuários** - Facilita a identificação
4. ✅ **Registre erros** - Ajuda no debug
5. ✅ **Não registre dados sensíveis** - Senhas, tokens, etc.

## 🚨 **Importante**

- Os logs são armazenados na tabela `system_logs` no Supabase
- Apenas administradores podem ver os logs
- Os logs são mantidos por tempo limitado (configurável)
- Use as funções helper para garantir consistência nas mensagens

