# 📧 CONFIGURAÇÃO DO EMAIL DE REAUTENTICAÇÃO NO SUPABASE

## 🎯 **INSTRUÇÕES PARA CONFIGURAR NO DASHBOARD DO SUPABASE**

### **1. Acesse o Dashboard do Supabase:**
- Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Selecione seu projeto ConfiLar
- Navegue para **Authentication > Settings**

### **2. Configure o Provedor de Email:**
- Em **Email Templates**, encontre a seção **Reauthentication**
- Clique em **Customize** ou **Edit**

### **3. Configure o Template HTML:**
- **Subject**: `🔐 Código de Reautenticação - ConfiLar`
- **Body**: Cole o conteúdo do arquivo `reauthentication-email.html`
- **Variables**: Use `{{ .Token }}` para o código OTP

### **4. Configure o Template de Texto:**
- **Plain Text Body**: Cole o conteúdo do arquivo `reauthentication-email.txt`
- **Variables**: Use `{{ .Token }}` para o código OTP

### **5. Configurações Avançadas:**
- **Token Expiry**: 10 minutos (600 segundos)
- **Token Length**: 6 dígitos
- **Rate Limiting**: 5 tentativas por hora

---

## 🔧 **CONFIGURAÇÕES TÉCNICAS**

### **Variáveis Disponíveis:**
- `{{ .Token }}` - Código OTP de 6 dígitos
- `{{ .SiteURL }}` - URL do site
- `{{ .RedirectTo }}` - URL de redirecionamento

### **Configurações de Segurança:**
```json
{
  "token_expiry": 600,
  "token_length": 6,
  "rate_limit": {
    "max_attempts": 5,
    "window": 3600
  }
}
```

### **Configurações de Email:**
```json
{
  "subject": "🔐 Código de Reautenticação - ConfiLar",
  "from_name": "ConfiLar",
  "from_email": "noreply@confilar.com"
}
```

---

## 📋 **CHECKLIST DE CONFIGURAÇÃO**

### **✅ Configurações Básicas:**
- [ ] Template HTML configurado
- [ ] Template de texto configurado
- [ ] Subject personalizado
- [ ] Variáveis corretas (`{{ .Token }}`)

### **✅ Configurações de Segurança:**
- [ ] Tempo de expiração: 10 minutos
- [ ] Comprimento do código: 6 dígitos
- [ ] Rate limiting configurado
- [ ] HTTPS obrigatório

### **✅ Configurações de Email:**
- [ ] Remetente configurado
- [ ] Domínio verificado
- [ ] SPF/DKIM configurados
- [ ] Teste de envio realizado

### **✅ Testes:**
- [ ] Envio de email de teste
- [ ] Verificação do código OTP
- [ ] Expiração do código
- [ ] Rate limiting funcionando

---

## 🚀 **COMO TESTAR**

### **1. Teste Manual:**
```javascript
// No console do navegador ou em uma função de teste
const { data, error } = await supabase.auth.reauthenticate()
console.log('OTP enviado:', data)
```

### **2. Teste de Integração:**
1. Acesse `/reautenticacao?action=password`
2. Clique em "ENVIAR CÓDIGO DE VERIFICAÇÃO"
3. Verifique seu email
4. Insira o código na tela
5. Verifique se a reautenticação funciona

### **3. Teste de Segurança:**
1. Tente usar código expirado
2. Tente usar código inválido
3. Teste rate limiting
4. Verifique redirecionamentos

---

## 📝 **NOTAS IMPORTANTES**

### **⚠️ Limitações do Supabase:**
- O Supabase não permite customização completa do template de reautenticação
- Algumas variáveis podem não estar disponíveis
- O design pode ser limitado pelas configurações do provedor

### **🔧 Alternativas:**
- Use um provedor de email externo (SendGrid, Mailgun)
- Configure webhooks para emails customizados
- Implemente sistema próprio de OTP

### **📞 Suporte:**
- Documentação: [https://supabase.com/docs/guides/auth/auth-reauthentication](https://supabase.com/docs/guides/auth/auth-reauthentication)
- Comunidade: [https://github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)

---

## 🎨 **DESIGN BRUTALISTA**

O template segue o padrão visual do ConfiLar:
- **Cores**: Fundo amarelo (#fef3c7), bordas pretas
- **Tipografia**: Maiúsculas, font-weight 900
- **Elementos**: Bordas grossas, sombras, animações
- **Layout**: Direto, impactante, sem elementos desnecessários

**Arquivos criados:**
- `email-templates/reauthentication-email.html`
- `email-templates/reauthentication-email.txt`
- `CONFIGURACAO-REAUTHENTICATION.md` (este arquivo)
