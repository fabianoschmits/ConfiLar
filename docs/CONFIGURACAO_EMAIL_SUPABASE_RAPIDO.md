# 📧 Configuração Rápida de Email no Supabase

## 🎯 **Passos Rápidos (5 minutos)**

### **1. Acessar Configurações SMTP**

No painel do Supabase que você está vendo:

1. ✅ Você já está em **Settings** (ícone de engrenagem)
2. Na sidebar esquerda, em **"CONFIGURATION"**, clique em **"Authentication"**
3. Role a página até encontrar **"SMTP Settings"** ou **"Email Settings"**

### **2. Habilitar SMTP Customizado**

Na seção **SMTP Settings**, você verá:

```
☐ Enable Custom SMTP
```

**Marque esta opção** ✅

### **3. Preencher Credenciais SMTP**

Preencha os campos com as credenciais do seu provedor de email:

```
SMTP Host: [smtp do seu provedor]
SMTP Port: 587
SMTP User: no-reply@appconfilar.com.br
SMTP Password: [sua senha SMTP]
Sender Email: no-reply@appconfilar.com.br
Sender Name: ConfiLar
```

### **4. Como Obter as Credenciais SMTP?**

**Se você usa Google Workspace:**
- Host: `smtp.gmail.com`
- Port: `587`
- User: `no-reply@appconfilar.com.br`
- Password: [App Password - gerar em myaccount.google.com/apppasswords]

**Se você usa Microsoft 365:**
- Host: `smtp.office365.com`
- Port: `587`
- User: `no-reply@appconfilar.com.br`
- Password: [Senha do usuário ou App Password]

**Se você usa cPanel/Hospedagem:**
- Host: [smtp.seudominio.com.br ou smtp do seu provedor]
- Port: `587` ou `465`
- User: `no-reply@appconfilar.com.br`
- Password: [Senha do email]
- ⚠️ Consulte o painel de hospedagem para os dados exatos

### **5. Testar e Salvar**

1. Clique em **"Test Connection"** (se disponível) para verificar se está funcionando
2. Clique em **"Save"** ou **"Update"**

### **6. Configurar Templates de Email (Opcional)**

1. Ainda em **Authentication**, vá em **"Email Templates"**
2. Personalize os templates:
   - **Confirmation Email** - Email de confirmação de conta
   - **Magic Link** - Link de acesso sem senha
   - **Change Email Address** - Mudança de email
   - **Reset Password** - Recuperação de senha

### **7. Testar o Envio**

1. Crie uma conta de teste no seu projeto
2. Verifique se o email chegou na caixa de entrada
3. Verifique se está sendo enviado de `no-reply@appconfilar.com.br`

## ✅ **Checklist**

- [ ] Acessou Authentication no Supabase
- [ ] Habilitou Custom SMTP
- [ ] Preencheu Host, Port, User, Password
- [ ] Configurou Sender Email como `no-reply@appconfilar.com.br`
- [ ] Testou a conexão
- [ ] Salvou as configurações
- [ ] Testou criando uma conta de teste

## 🚨 **Problemas Comuns**

**"Invalid credentials"**
- Verifique se o usuário e senha estão corretos
- Se usar Gmail, certifique-se de usar App Password (não a senha normal)

**"Connection timeout"**
- Verifique se a porta está correta (587 para TLS, 465 para SSL)
- Verifique se o firewall não está bloqueando

**"Authentication failed"**
- Verifique se o SMTP AUTH está habilitado no seu provedor
- Verifique se o usuário tem permissão para enviar emails

## 📞 **Precisa de Ajuda?**

Se você não souber qual provedor de email está usando ou não tiver as credenciais SMTP, entre em contato com:
- Sua empresa de hospedagem
- Administrador do Google Workspace/Microsoft 365
- Suporte técnico do seu domínio

