# 🔧 Configuração do Supabase para appconfilar.com.br

## 📋 **Checklist de Configurações Necessárias**

### 1. **Authentication > URL Configuration**

No painel do Supabase, vá em **Authentication > URL Configuration** e configure:

#### **Site URL**
```
https://appconfilar.com.br
```

#### **Redirect URLs** (adicione todas estas URLs):
```
https://appconfilar.com.br/auth/callback
https://appconfilar.com.br/auth
https://appconfilar.com.br/onboarding
https://appconfilar.com.br/home
https://appconfilar.com.br/feed
https://appconfilar.com.br/indicacoes
```

### 2. **Settings > API > CORS Origins**

Adicione os seguintes domínios:
```
https://appconfilar.com.br
https://www.appconfilar.com.br
```

### 3. **Settings > General > Site URL**

Atualize para:
```
https://appconfilar.com.br
```

### 4. **Email Templates (Opcional)**

Se estiver usando templates de email personalizados, atualize as URLs nos templates para usar `appconfilar.com.br`.

## 🔄 **Verificações Pós-Configuração**

### 1. **Testar Autenticação**
- [ ] Login funciona corretamente
- [ ] Redirecionamento após login vai para `/feed`
- [ ] Logout funciona e redireciona corretamente

### 2. **Testar Links de Referral**
- [ ] Links de referral geram com `appconfilar.com.br`
- [ ] Parâmetro `?ref=` é preservado corretamente
- [ ] Tracking de referral funciona

### 3. **Testar Redirecionamentos**
- [ ] Usuários não autenticados são redirecionados para `/auth`
- [ ] Usuários autenticados não podem acessar `/auth`
- [ ] Onboarding funciona corretamente

## 🚨 **Problemas Comuns e Soluções**

### **Problema**: Links de referral ainda mostram `confilar.vercel.app`
**Solução**: O código já está configurado para usar `window.location.origin`, então isso deve se resolver automaticamente quando o site estiver rodando em `appconfilar.com.br`.

### **Problema**: Erro de CORS
**Solução**: Certifique-se de que `https://appconfilar.com.br` está adicionado em **Settings > API > CORS Origins**.

### **Problema**: Redirecionamentos não funcionam
**Solução**: Verifique se todas as URLs estão adicionadas em **Authentication > URL Configuration > Redirect URLs**.

## 📝 **Código Atual (Já Configurado)**

O código já está preparado para o novo domínio:

```typescript
// src/hooks/useReferralCode.ts
const baseUrl = typeof window !== 'undefined' 
  ? window.location.origin  // Será https://appconfilar.com.br
  : 'https://appconfilar.com.br'  // Fallback
```

## ✅ **Status das Configurações**

- [x] Código da aplicação já configurado
- [ ] Site URL no Supabase
- [ ] Redirect URLs no Supabase  
- [ ] CORS Origins no Supabase
- [ ] Testes de funcionalidade

## 🎯 **Próximos Passos**

1. Acesse o painel do Supabase
2. Configure as URLs conforme o checklist acima
3. Teste a aplicação em `appconfilar.com.br`
4. Verifique se os links de referral estão funcionando corretamente
