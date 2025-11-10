# Como Resolver o Rate Limit do Supabase

## 🚨 Problema Atual

Após os testes do TestSprite, você está recebendo o erro:
```
"Erro ao criar conta: email rate limit exceeded"
```

## ✅ Solução Imediata (Escolha uma)

### Opção 1: Aguardar (Recomendado) ⏰

O rate limit do Supabase geralmente expira em **1 hora**. 

1. **Aguarde 1 hora** após a última tentativa de cadastro
2. **Tente criar a conta novamente**
3. Se ainda não funcionar, aguarde mais 1 hora

### Opção 2: Aumentar Limite no Supabase 📈

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: **oolqodaehouaidxuowtw**
3. Vá em **Settings** (⚙️) > **Auth** > **Rate Limits**
4. Encontre **"Email per hour"**
5. Aumente o limite (ex: de 30 para 100)
6. Clique em **Save**
7. Tente criar a conta novamente

**⚠️ Atenção**: 
- Limites muito altos podem resultar em custos adicionais
- Recomenda-se aumentar apenas temporariamente para testes

### Opção 3: Desabilitar Verificação de Email (Apenas para Testes) 🚫

**⚠️ NÃO RECOMENDADO PARA PRODUÇÃO - Use apenas para desenvolvimento/testes**

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** > **Auth** > **Email Auth**
4. Desabilite **"Enable email confirmations"**
5. Salve as alterações
6. Agora você pode criar contas sem enviar emails
7. **REABILITE após os testes!**

### Opção 4: Usar Projeto de Teste Separado 🧪

**RECOMENDADO PARA TESTES AUTOMATIZADOS**

1. Crie um novo projeto no Supabase para testes
2. Configure limites maiores no projeto de teste
3. Use variáveis de ambiente diferentes para testes
4. Execute testes no projeto de teste
5. Mantenha o projeto de produção intacto

## 🔍 Como Verificar o Status

### Verificar Rate Limit no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** > **Auth** > **Rate Limits**
4. Verifique:
   - **Email per hour**: Limite atual
   - **Emails enviados**: Quantos emails foram enviados na última hora

### Verificar Logs do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Logs** > **Auth Logs**
4. Procure por erros de rate limit
5. Veja quando foi o último erro

## 🛠️ Melhorias Implementadas

### 1. Mensagens de Erro Melhoradas ✅

Agora, quando o rate limit for excedido, você verá uma mensagem mais amigável:

```
"Limite de emails excedido: Muitos emails foram enviados recentemente. 
Por favor, aguarde algumas horas e tente novamente. 
Se o problema persistir, entre em contato com o suporte."
```

### 2. Detecção Automática de Erros ✅

O código agora detecta automaticamente:
- Rate limit excedido
- Email já cadastrado
- Email inválido
- Senha inválida

### 3. Mensagens Mais Longas ✅

Mensagens importantes agora são exibidas por **8 segundos** em vez de 3 segundos.

## 📊 Estatísticas dos Testes

Durante os testes do TestSprite:
- **12 casos de teste** executados
- **Múltiplas tentativas de cadastro** foram feitas
- **Rate limit do Supabase foi atingido**

## 🔄 Limpeza de Contas de Teste

### Limpar Contas de Teste Criadas

Se você quiser limpar as contas de teste criadas durante os testes:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Authentication** > **Users**
4. Filtre por emails de teste (ex: `test@`, `teste@`, etc.)
5. Delete as contas de teste manualmente

**⚠️ Atenção**: Não delete contas reais de usuários!

## 💡 Prevenção Futura

### Para Testes Automatizados

1. **Use ambiente de teste separado**
2. **Configure limites maiores** no ambiente de teste
3. **Limite número de cadastros** por teste
4. **Use mocks** quando possível
5. **Limpe contas de teste** após os testes

### Para Produção

1. **Mantenha limites razoáveis** (30-50 emails/hora)
2. **Monitore uso de emails**
3. **Configure alertas** para rate limit
4. **Use SMTP próprio** para limites maiores

## 🎯 Próximos Passos

1. ✅ **Aguarde 1 hora** ou **aumente o limite** no Supabase
2. ✅ **Tente criar a conta novamente**
3. ✅ **Verifique se a mensagem de erro melhorou**
4. ✅ **Considere criar ambiente de teste** para futuros testes

## 📞 Suporte

Se o problema persistir após 2 horas:

1. Verifique os logs do Supabase
2. Verifique se há outros erros
3. Entre em contato com o suporte do Supabase
4. Considere usar um projeto de teste separado

## 🔗 Links Úteis

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Rate Limits Docs](https://supabase.com/docs/guides/auth/auth-rate-limits)
- [Supabase Auth Settings](https://supabase.com/docs/guides/auth/auth-settings)

---

**Última atualização**: 2025-11-10
**Status**: Problema identificado e soluções documentadas

