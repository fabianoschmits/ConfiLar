# 📧 Configuração de Email no Supabase - ConfiLar

Este guia explica como configurar o Supabase para enviar todos os emails do projeto (criação de conta, recuperação de senha, confirmação de email, etc.) através do seu próprio servidor SMTP.

## 📧 **Emails do Projeto ConfiLar**

- **Email para envio de notificações/auth**: `no-reply@appconfilar.com.br`
- **Email de contato**: `contato@appconfilar.com.br`
- **Email de suporte**: `suporte@appconfilar.com.br`
- **Email de privacidade**: `privacidade@appconfilar.com.br`

**Domínio**: `appconfilar.com.br`

## 📋 **Pré-requisitos**

1. Acesso ao painel do Supabase (https://supabase.com)
2. Credenciais SMTP do seu provedor de email (ex: Google Workspace, Microsoft 365, SendGrid, etc.)
3. Domínio `appconfilar.com.br` configurado com registros DNS

## 🚀 **Configuração Passo a Passo**

### **Passo 1: Acessar Configurações SMTP no Supabase**

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto **ConfiLar**
3. No menu lateral, vá em **Settings** (ícone de engrenagem)
4. Clique em **Auth** no menu à esquerda
5. Role para baixo até encontrar **SMTP Settings**

### **Passo 2: Obter Credenciais SMTP do seu Email**

Primeiro, você precisa saber qual provedor de email está usando para `appconfilar.com.br`:

#### **Se você usa Google Workspace (Gmail):**
1. Acesse: https://admin.google.com
2. Vá em **Apps** > **Google Workspace** > **Gmail**
3. Role até **SMTP relaying** ou configure via **App Passwords**
4. Você precisará de:
   - **Host**: `smtp.gmail.com`
   - **Port**: `587` (TLS) ou `465` (SSL)
   - **User**: `no-reply@appconfilar.com.br` (ou o email completo)
   - **Password**: [Gerar App Password](https://myaccount.google.com/apppasswords)

#### **Se você usa Microsoft 365:**
1. Acesse: https://admin.microsoft.com
2. Vá em **Settings** > **Mail**
3. Configure SMTP AUTH ou use Exchange Online
4. Você precisará de:
   - **Host**: `smtp.office365.com`
   - **Port**: `587`
   - **User**: `no-reply@appconfilar.com.br`
   - **Password**: [Senha do usuário ou App Password]

#### **Se você usa outro provedor (cPanel, cPanel, etc.):**
Consulte a documentação do seu provedor de hospedagem para obter:
- Host SMTP
- Porta SMTP
- Usuário e senha

### **Passo 3: Configurar SMTP no Supabase**

No painel do Supabase, em **Settings** > **Auth** > **SMTP Settings**, preencha:

```
☑️ Enable Custom SMTP

SMTP Host: [Preencha conforme seu provedor - ex: smtp.gmail.com]
SMTP Port: 587
SMTP User: no-reply@appconfilar.com.br
SMTP Password: [Sua senha SMTP]
Sender Email: no-reply@appconfilar.com.br
Sender Name: ConfiLar
```

**Importante**: 
- ✅ Marque "Enable Custom SMTP"
- ✅ Use `no-reply@appconfilar.com.br` como Sender Email
- ✅ Teste a conexão antes de salvar (alguns painéis têm botão "Test Connection")

### **Passo 4: Exemplos de Configuração por Provedor**

**Exemplos de provedores SMTP:**

#### **Gmail (com App Password)**
- Host: `smtp.gmail.com`
- Port: `587` (TLS) ou `465` (SSL)
- User: `seu-email@gmail.com`
- Password: [Gerar App Password no Google Account](https://myaccount.google.com/apppasswords)

#### **SendGrid**
- Host: `smtp.sendgrid.net`
- Port: `587`
- User: `apikey`
- Password: `[Sua API Key do SendGrid]`

#### **Mailgun**
- Host: `smtp.mailgun.org`
- Port: `587`
- User: `postmaster@seudominio.mailgun.org`
- Password: `[Sua senha do Mailgun]`

#### **AWS SES**
- Host: `email-smtp.us-east-1.amazonaws.com` (ajuste a região)
- Port: `587`
- User: `[Seu SMTP Username]`
- Password: `[Seu SMTP Password]`

### **3. Configurar Templates de Email**

No painel do Supabase, vá em **Authentication** > **Email Templates** e configure os templates:

#### **3.1. Confirmation Email (Email de Confirmação)**

**Subject:**
```
Bem-vindo ao ConfiLar! Confirme sua conta
```

**Body (HTML):**
```html
<h2>Bem-vindo ao ConfiLar!</h2>
<p>Olá,</p>
<p>Obrigado por se cadastrar no ConfiLar! Para ativar sua conta, clique no botão abaixo:</p>
<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
    Confirmar Email
  </a>
</p>
<p>Ou copie e cole este link no seu navegador:</p>
<p>{{ .ConfirmationURL }}</p>
<p>Este link expira em 24 horas.</p>
<p>Se você não se cadastrou no ConfiLar, ignore este email.</p>
<p>Atenciosamente,<br>Equipe ConfiLar</p>
```

#### **3.2. Magic Link (Link Mágico)**

**Subject:**
```
Seu link de acesso ao ConfiLar
```

**Body (HTML):**
```html
<h2>Acesso ao ConfiLar</h2>
<p>Olá,</p>
<p>Clique no botão abaixo para acessar sua conta:</p>
<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
    Acessar Conta
  </a>
</p>
<p>Ou copie e cole este link no seu navegador:</p>
<p>{{ .ConfirmationURL }}</p>
<p>Este link expira em 1 hora.</p>
<p>Se você não solicitou este acesso, ignore este email.</p>
<p>Atenciosamente,<br>Equipe ConfiLar</p>
```

#### **3.3. Change Email Address (Mudança de Email)**

**Subject:**
```
Confirme sua nova conta de email no ConfiLar
```

**Body (HTML):**
```html
<h2>Confirme seu novo email</h2>
<p>Olá,</p>
<p>Você solicitou alterar seu email no ConfiLar. Clique no botão abaixo para confirmar:</p>
<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
    Confirmar Novo Email
  </a>
</p>
<p>Ou copie e cole este link no seu navegador:</p>
<p>{{ .ConfirmationURL }}</p>
<p>Este link expira em 24 horas.</p>
<p>Se você não solicitou esta alteração, ignore este email.</p>
<p>Atenciosamente,<br>Equipe ConfiLar</p>
```

#### **3.4. Reset Password (Recuperação de Senha)**

**Subject:**
```
Redefina sua senha do ConfiLar
```

**Body (HTML):**
```html
<h2>Redefinir Senha</h2>
<p>Olá,</p>
<p>Você solicitou redefinir sua senha no ConfiLar. Clique no botão abaixo para criar uma nova senha:</p>
<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
    Redefinir Senha
  </a>
</p>
<p>Ou copie e cole este link no seu navegador:</p>
<p>{{ .ConfirmationURL }}</p>
<p>Este link expira em 1 hora.</p>
<p>Se você não solicitou esta alteração, ignore este email.</p>
<p>Atenciosamente,<br>Equipe ConfiLar</p>
```

### **4. Configurar URLs de Redirecionamento**

No painel do Supabase, vá em **Authentication** > **URL Configuration** e configure:

**Site URL:**
```
https://appconfilar.com.br
```

**Redirect URLs:**
```
https://appconfilar.com.br/auth/callback
https://appconfilar.com.br/auth
https://appconfilar.com.br/onboarding
https://appconfilar.com.br/home
https://appconfilar.com.br/feed
https://appconfilar.com.br/nova-senha
https://appconfilar.com.br/alterar-email
```

### **5. Configurações Avançadas**

#### **5.1. Habilitar Verificação de Email**

Em **Settings** > **Auth** > **Email Auth**:
- ✅ **Enable email confirmations**: Habilitado
- ✅ **Enable email change confirmations**: Habilitado
- ✅ **Enable secure email change**: Habilitado

#### **5.2. Configurar Rate Limits (Opcional)**

Em **Settings** > **Auth** > **Rate Limits**:
- **Email per hour**: 30 (ajuste conforme necessário)
- **SMS per hour**: 10

#### **5.3. Configurar JWT Expiry (Opcional)**

Em **Settings** > **Auth** > **JWT Settings**:
- **JWT expiry**: 3600 (1 hora)
- **Refresh token expiry**: 2592000 (30 dias)

## 🔧 **Configuração no Código**

O código já está usando `supabase.auth.signUp()`, que automaticamente envia emails através do Supabase. Não é necessário fazer alterações no código, mas você pode garantir que as configurações estão corretas:

### **Verificar se o Supabase está configurado corretamente:**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### **Garantir que emails são enviados:**

Quando você chama `supabase.auth.signUp()`, o Supabase automaticamente:
1. Cria o usuário
2. Envia email de confirmação (se `email_confirm` não estiver definido como `true`)
3. Usa as configurações SMTP que você configurou no painel

## ✅ **Testando a Configuração**

### **1. Testar Email de Confirmação**

1. Crie uma conta de teste no seu projeto
2. Verifique se o email chegou na caixa de entrada
3. Verifique se o link de confirmação funciona
4. Verifique se o email está sendo enviado do endereço correto

### **2. Testar Recuperação de Senha**

1. Vá em "Esqueci minha senha"
2. Digite um email válido
3. Verifique se o email de recuperação chegou
4. Teste o link de redefinição

### **3. Verificar Logs de Email**

No painel do Supabase, vá em **Logs** > **Auth Logs** para ver:
- Se os emails foram enviados
- Se houve erros no envio
- Status de entrega

## 🚨 **Problemas Comuns**

### **Problema: Emails não estão sendo enviados**

**Solução:**
1. Verifique se o SMTP está habilitado e configurado corretamente
2. Verifique se as credenciais SMTP estão corretas
3. Verifique os logs do Supabase para erros
4. Certifique-se de que o provedor SMTP não está bloqueando o envio

### **Problema: Emails vão para spam**

**Solução:**
1. Configure SPF, DKIM e DMARC no seu domínio
2. Use um domínio próprio (não gmail.com)
3. Configure um "Sender Name" apropriado
4. Evite palavras suspeitas no assunto e corpo do email

### **Problema: Links de confirmação não funcionam**

**Solução:**
1. Verifique se as URLs de redirecionamento estão configuradas corretamente
2. Certifique-se de que o Site URL está correto
3. Verifique se o domínio está adicionado nas Redirect URLs

### **Problema: Rate limit excedido**

**Solução:**
1. Aumente o limite em **Settings** > **Auth** > **Rate Limits**
2. Use um provedor SMTP com limites maiores
3. Implemente um sistema de fila para envio de emails

## 📚 **Recursos Adicionais**

- [Documentação do Supabase Auth](https://supabase.com/docs/guides/auth)
- [Configuração de SMTP no Supabase](https://supabase.com/docs/guides/auth/auth-smtp)
- [Email Templates no Supabase](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Melhores Práticas de Email](https://supabase.com/docs/guides/auth/auth-best-practices)

## 🎯 **Checklist de Configuração**

- [ ] SMTP configurado no painel do Supabase
- [ ] Credenciais SMTP testadas e funcionando
- [ ] Templates de email personalizados configurados
- [ ] Site URL configurado
- [ ] Redirect URLs configuradas
- [ ] Email de confirmação habilitado
- [ ] Teste de envio de email realizado
- [ ] Links de confirmação funcionando
- [ ] SPF/DKIM/DMARC configurados (se usando domínio próprio)
- [ ] Rate limits configurados adequadamente

## 📝 **Notas Importantes**

1. **O Supabase envia emails automaticamente** quando você usa `supabase.auth.signUp()`, `supabase.auth.resetPasswordForEmail()`, etc.

2. **Não é necessário código adicional** para enviar emails - o Supabase faz isso automaticamente.

3. **Templates personalizados** melhoram a experiência do usuário e a taxa de abertura.

4. **Use um domínio próprio** para melhorar a reputação e evitar spam.

5. **Monitore os logs** regularmente para identificar problemas de envio.

