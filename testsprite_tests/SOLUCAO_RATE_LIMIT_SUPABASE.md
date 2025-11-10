# Solução para Rate Limit do Supabase

## 🔍 Problema Identificado

Após os testes do TestSprite, quando você tenta criar uma conta, recebe o erro:
```
"Erro ao criar conta: email rate limit exceeded"
```

## 📊 Causa do Problema

O **Supabase** tem um **rate limiting interno** para envio de emails que é **separado** do rate limiting da aplicação. Durante os testes do TestSprite, muitas tentativas de cadastro foram feitas, e o Supabase bloqueou o envio de mais emails.

### Rate Limiting do Supabase vs Aplicação

1. **Rate Limiting da Aplicação** (`src/lib/rateLimitBackend.ts`):
   - Controla requisições à API
   - Configurado no código
   - Bloqueia após X tentativas

2. **Rate Limiting do Supabase** (Painel do Supabase):
   - Controla envio de emails
   - Configurado no painel do Supabase
   - Bloqueia após X emails por hora
   - **Este é o problema atual!**

## 🔧 Soluções

### Solução 1: Aguardar o Rate Limit Expirar ⏰

O rate limiting do Supabase geralmente expira em **1 hora**. Você pode:

1. **Aguardar 1 hora** e tentar novamente
2. **Verificar no painel do Supabase** quando o limite será resetado

### Solução 2: Aumentar o Limite no Painel do Supabase 📈

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** > **Auth** > **Rate Limits**
4. Aumente o limite de **"Email per hour"** (padrão: 30)
5. Salve as alterações

**⚠️ Atenção**: Aumentar muito o limite pode resultar em custos adicionais.

### Solução 3: Usar Ambiente de Teste Separado 🧪

Para testes automatizados, recomenda-se:

1. **Criar um projeto de teste no Supabase**
2. **Configurar limites maiores** no projeto de teste
3. **Usar o projeto de teste** apenas para testes automatizados
4. **Manter o projeto de produção** com limites normais

### Solução 4: Desabilitar Verificação de Email (Apenas para Testes) 🚫

**⚠️ NÃO RECOMENDADO PARA PRODUÇÃO**

Para testes locais, você pode temporariamente:

1. No painel do Supabase: **Settings** > **Auth** > **Email Auth**
2. Desabilitar **"Enable email confirmations"**
3. Isso permite cadastros sem enviar emails
4. **Reabilitar após os testes!**

## 🛠️ Melhorias no Código

Vou melhorar o tratamento de erros para:

1. **Detectar erros de rate limit do Supabase**
2. **Mostrar mensagem mais amigável**
3. **Sugerir soluções ao usuário**

## 📝 Como Verificar o Status do Rate Limit

### Via Painel do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** > **Auth** > **Rate Limits**
4. Verifique o limite atual e quantos emails foram enviados

### Via Logs do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Logs** > **Auth Logs**
4. Procure por erros de rate limit

## 🔄 Reset Manual do Rate Limit

Infelizmente, **não há uma forma de resetar manualmente** o rate limit do Supabase via API ou código. Você precisa:

1. **Aguardar o período de rate limit expirar** (geralmente 1 hora)
2. **Aumentar o limite** no painel do Supabase
3. **Usar um projeto de teste** separado

## 💡 Prevenção Futura

Para evitar esse problema no futuro:

1. **Usar ambiente de teste separado** para testes automatizados
2. **Configurar limites maiores** no ambiente de teste
3. **Limitar número de testes** que criam contas
4. **Usar mocks** para testes que não precisam de cadastros reais
5. **Configurar cleanup** para deletar contas de teste após os testes

## 🎯 Próximos Passos

1. ✅ Melhorar tratamento de erros no código
2. ✅ Adicionar mensagem mais amigável para rate limit
3. ✅ Criar ambiente de teste separado (recomendado)
4. ✅ Documentar processo de testes

## 📚 Referências

- [Supabase Rate Limits Documentation](https://supabase.com/docs/guides/auth/auth-rate-limits)
- [Supabase Auth Settings](https://supabase.com/docs/guides/auth/auth-settings)
- [TestSprite Best Practices](https://testsprite.ai/docs/best-practices)

