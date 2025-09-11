# 📧 Configuração de Email de Verificação - ConfiLar

## 🎯 Como Configurar Email Personalizado no Supabase

### 1. **Acessar o Painel do Supabase**
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Selecione seu projeto ConfiLar

### 2. **Navegar para Authentication > Email Templates**
- No menu lateral, clique em **Authentication**
- Clique em **Email Templates**
- Você verá várias opções de templates

### 3. **Configurar Template de Verificação**
- Clique em **Confirm signup**
- Você verá duas opções:
  - **Subject**: Assunto do email
  - **Body**: Corpo do email (HTML)

### 4. **Configurar o Assunto**
```
Subject: 🎯 ConfiLar - Verifique sua conta
```

### 5. **Configurar o Corpo HTML**
Copie e cole o conteúdo do arquivo `email-templates/verification-email.html` no campo **Body**.

### 6. **Configurar o Corpo Texto**
- Clique na aba **Text**
- Copie e cole o conteúdo do arquivo `email-templates/verification-email.txt`

### 7. **Salvar as Configurações**
- Clique em **Save** para salvar as mudanças
- As configurações serão aplicadas imediatamente

## 🔐 Configuração de Recuperação de Senha

### 1. **Configurar Template de Recuperação**
- Clique em **Reset password**
- Você verá duas opções:
  - **Subject**: Assunto do email
  - **Body**: Corpo do email (HTML)

### 2. **Configurar o Assunto**
```
Subject: 🔐 ConfiLar - Recuperação de Senha
```

### 3. **Configurar o Corpo HTML**
Copie e cole o conteúdo do arquivo `email-templates/password-recovery-email.html` no campo **Body**.

### 4. **Configurar o Corpo Texto**
- Clique na aba **Text**
- Copie e cole o conteúdo do arquivo `email-templates/password-recovery-email.txt`

### 5. **Salvar as Configurações**
- Clique em **Save** para salvar as mudanças

## 🔧 Variáveis Disponíveis no Supabase

O Supabase fornece estas variáveis que você pode usar nos templates:

- `{{ .ConfirmationURL }}` - Link de confirmação
- `{{ .Email }}` - Email do usuário
- `{{ .SiteURL }}` - URL do seu site
- `{{ .Token }}` - Token de confirmação

## 📱 Configurações Adicionais

### **Configurar SMTP Personalizado (Opcional)**
Se quiser usar seu próprio servidor de email:

1. Vá para **Settings > Auth**
2. Role até **SMTP Settings**
3. Configure:
   - **SMTP Host**: seu servidor SMTP
   - **SMTP Port**: porta (geralmente 587)
   - **SMTP User**: seu usuário
   - **SMTP Pass**: sua senha
   - **SMTP Admin Email**: email do administrador

### **Configurar Domínio Personalizado**
1. Vá para **Settings > Auth**
2. Em **Site URL**, configure seu domínio
3. Em **Redirect URLs**, adicione URLs permitidas

## 🎨 Personalização do Template

### **Cores do ConfiLar**
- Primária: `#667eea` (azul)
- Secundária: `#764ba2` (roxo)
- Gradiente: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

### **Elementos Visuais**
- Logo: 🎯 ConfiLar
- Tagline: "Conectando você aos melhores profissionais"
- Botão: Gradiente azul-roxo
- Ícones: Emojis para melhor visual

## ✅ Testando a Configuração

1. **Criar usuário de teste**
2. **Verificar se o email chega**
3. **Testar o link de confirmação**
4. **Verificar se funciona em diferentes clientes de email**

## 🚨 Troubleshooting

### **Email não chega**
- Verifique a pasta de spam
- Confirme as configurações SMTP
- Teste com diferentes provedores de email

### **Link não funciona**
- Verifique as URLs de redirecionamento
- Confirme se o domínio está configurado corretamente

### **Template não aparece**
- Verifique se salvou as configurações
- Confirme se está editando o template correto
- Teste com um novo cadastro

## 📋 Checklist de Configuração

- [ ] Template HTML configurado
- [ ] Template texto configurado
- [ ] Assunto personalizado
- [ ] URLs de redirecionamento configuradas
- [ ] Teste realizado com sucesso
- [ ] Email chega na caixa de entrada
- [ ] Link de confirmação funciona

## 🎯 Próximos Passos

Após configurar o email de verificação:

1. **Configurar outros templates** (recuperação de senha, etc.)
2. **Implementar página de sucesso** após verificação
3. **Configurar notificações** de boas-vindas
4. **Monitorar métricas** de verificação

---

**💡 Dica**: Mantenha os templates simples e diretos. Usuários preferem emails claros e objetivos!
