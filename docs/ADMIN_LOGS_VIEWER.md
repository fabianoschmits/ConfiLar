# 📋 Sistema de Logs do Admin - ConfiLar

## 🎯 **Visão Geral**

O sistema de logs permite que administradores visualizem e monitorem eventos importantes do sistema ConfiLar, similar ao painel de logs do Supabase.

## 🚀 **Como Usar**

### **1. Acessar a Aba de Logs**

1. Acesse o painel admin: `/admin/dashboard`
2. Clique na aba **"Logs"** no topo do painel
3. Os logs serão carregados automaticamente

### **2. Funcionalidades**

#### **Filtros**
- **Busca**: Busque por mensagem, ação, categoria, endpoint ou usuário
- **Nível**: Filtre por nível (INFO, WARNING, ERROR, SUCCESS, DEBUG)
- **Categoria**: Filtre por categoria (auth, posts, users, payments, etc.)
- **Período**: Escolha entre última hora, 24h, 7 dias ou 30 dias

#### **Estatísticas**
- Total de logs no período
- Contagem de erros
- Contagem de avisos
- Contagem de sucessos

#### **Visualização**
- Lista de logs com informações principais
- Clique em um log para expandir e ver detalhes completos
- Cores diferentes para cada nível de log:
  - 🔴 **ERROR**: Vermelho
  - 🟠 **WARNING**: Laranja
  - 🟢 **SUCCESS**: Verde
  - 🔵 **INFO**: Azul
  - ⚪ **DEBUG**: Cinza

#### **Exportação**
- Botão "Exportar" para baixar logs em formato CSV
- Útil para análise externa ou backup

### **3. Detalhes dos Logs**

Cada log contém:
- **Timestamp**: Data e hora do evento
- **Nível**: Severidade do log
- **Categoria**: Tipo de evento (auth, posts, etc.)
- **Mensagem**: Descrição do evento
- **Usuário**: Nome e email do usuário (se aplicável)
- **Endpoint**: Rota da API ou página (se aplicável)
- **Status Code**: Código HTTP (se aplicável)
- **IP Address**: Endereço IP do usuário
- **User Agent**: Navegador/dispositivo usado
- **Detalhes**: JSON com informações adicionais

## 🔧 **Configuração Inicial**

### **1. Criar Tabela de Logs**

Execute o script SQL no Supabase:

```sql
-- Execute: scripts/create-system-logs-table.sql
```

Isso criará:
- Tabela `system_logs` para armazenar os logs
- Índices para performance
- Políticas RLS (apenas admins podem ver)
- Função helper `create_system_log()` para criar logs facilmente

### **2. Registrar Logs no Código**

Para registrar um log de uma ação importante, use a função SQL:

```typescript
// Exemplo: Registrar log de cadastro de usuário
const { error } = await supabase.rpc('create_system_log', {
  p_level: 'INFO',
  p_category: 'auth',
  p_action: 'user_signup',
  p_message: 'Novo usuário cadastrado',
  p_details: {
    email: userData.email,
    user_type: userData.user_type
  },
  p_user_id: userId,
  p_endpoint: '/api/auth/signup',
  p_status_code: 200
})
```

## 📊 **Categorias de Logs Recomendadas**

### **Auth (Autenticação)**
- `user_signup` - Cadastro de novo usuário
- `user_login` - Login de usuário
- `user_logout` - Logout de usuário
- `password_reset` - Recuperação de senha
- `email_verification` - Verificação de email
- `account_deletion` - Exclusão de conta

### **Posts**
- `post_created` - Criação de post
- `post_updated` - Atualização de post
- `post_deleted` - Exclusão de post
- `post_liked` - Post curtido
- `post_shared` - Post compartilhado

### **Users**
- `profile_updated` - Perfil atualizado
- `user_verified` - Usuário verificado
- `user_banned` - Usuário banido
- `user_unbanned` - Usuário desbanido

### **Payments**
- `payment_processed` - Pagamento processado
- `payment_failed` - Pagamento falhou
- `refund_processed` - Reembolso processado

### **API**
- `api_error` - Erro na API
- `rate_limit_exceeded` - Limite de taxa excedido
- `unauthorized_access` - Acesso não autorizado

## 🔍 **Exemplos de Uso**

### **Registrar Log de Cadastro**

```typescript
// No hook de autenticação
const { error } = await supabase.rpc('create_system_log', {
  p_level: 'SUCCESS',
  p_category: 'auth',
  p_action: 'user_signup',
  p_message: `Usuário ${userData.email} cadastrado com sucesso`,
  p_details: {
    user_type: userData.user_type,
    referral_code: userData.referral_code
  },
  p_user_id: userId,
  p_endpoint: '/auth',
  p_status_code: 200
})
```

### **Registrar Log de Erro**

```typescript
// Em um catch de erro
try {
  // ... código
} catch (error) {
  await supabase.rpc('create_system_log', {
    p_level: 'ERROR',
    p_category: 'api',
    p_action: 'api_error',
    p_message: `Erro ao processar requisição: ${error.message}`,
    p_details: {
      error_type: error.constructor.name,
      stack: error.stack
    },
    p_endpoint: '/api/endpoint',
    p_status_code: 500
  })
}
```

### **Registrar Log de Ação do Usuário**

```typescript
// Quando usuário cria um post
await supabase.rpc('create_system_log', {
  p_level: 'INFO',
  p_category: 'posts',
  p_action: 'post_created',
  p_message: `Post criado por ${userName}`,
  p_details: {
    post_id: postId,
    post_type: postType,
    has_image: hasImage
  },
  p_user_id: userId,
  p_endpoint: '/api/posts',
  p_status_code: 201
})
```

## 🎨 **Interface do Visualizador**

O visualizador de logs inclui:

1. **Barra de Estatísticas**: Mostra total, erros, avisos e sucessos
2. **Filtros**: Busca, nível, categoria e período
3. **Lista de Logs**: 
   - Ícone colorido por nível
   - Badge com nível
   - Mensagem principal
   - Informações secundárias (endpoint, status, usuário)
   - Botão para expandir detalhes
4. **Detalhes Expandidos**: Mostra todos os metadados do log

## 🔐 **Segurança**

- Apenas usuários com permissão de admin podem acessar os logs
- RLS (Row Level Security) está configurado na tabela
- Logs sensíveis devem ser filtrados ou mascarados

## 📝 **Boas Práticas**

1. **Não registre dados sensíveis**: Senhas, tokens, etc.
2. **Use níveis apropriados**: ERROR para erros críticos, INFO para eventos normais
3. **Mantenha mensagens claras**: Facilita a busca e compreensão
4. **Use detalhes JSON**: Para informações estruturadas adicionais
5. **Registre endpoints**: Facilita rastreamento de problemas
6. **Inclua user_id**: Quando relevante, para rastrear ações do usuário

## 🚨 **Troubleshooting**

### **Logs não aparecem**
- Verifique se a tabela `system_logs` foi criada
- Verifique se você tem permissão de admin
- Verifique os filtros aplicados

### **Logs muito lentos**
- Verifique os índices na tabela
- Limite o período de busca
- Use filtros mais específicos

### **Não consigo criar logs**
- Verifique se a função `create_system_log` existe
- Verifique se está usando service role key (se necessário)
- Verifique as permissões RLS

## 📚 **Próximos Passos**

1. Integrar registro automático de logs em ações importantes
2. Adicionar alertas para erros críticos
3. Criar dashboard de métricas baseado em logs
4. Implementar retenção automática de logs antigos

