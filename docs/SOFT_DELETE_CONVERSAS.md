# Sistema de Soft Delete para Conversas

## 📝 Visão Geral

Implementamos um sistema de **soft delete** para conversas no chat, onde cada usuário pode deletar a conversa apenas da sua própria lista, sem afetar o outro participante.

## 🎯 Funcionalidades

### ✅ Como Funciona

1. **Deleção Individual**: Quando um usuário deleta uma conversa, ela é removida apenas da lista dele
2. **Preservação para o Outro**: O outro participante continua tendo acesso completo à conversa
3. **Deleção Permanente**: Apenas quando AMBOS os usuários deletam, a conversa é removida permanentemente do banco de dados
4. **Notificação Clara**: Modal de confirmação informa que a deleção é apenas para o usuário atual

### 🗄️ Estrutura do Banco de Dados

#### Novos Campos na Tabela `conversations`:

```sql
-- Indica se o cliente deletou (ocultou) a conversa
deleted_by_client BOOLEAN DEFAULT FALSE

-- Indica se o profissional deletou (ocultou) a conversa
deleted_by_professional BOOLEAN DEFAULT FALSE

-- Timestamp de quando o cliente deletou (para filtrar mensagens antigas)
deleted_at_client TIMESTAMP WITH TIME ZONE

-- Timestamp de quando o profissional deletou (para filtrar mensagens antigas)
deleted_at_professional TIMESTAMP WITH TIME ZONE
```

#### Índices para Performance:

```sql
-- Índice para filtro de conversas deletadas por clientes
CREATE INDEX idx_conversations_deleted_by_client ON conversations(deleted_by_client);

-- Índice para filtro de conversas deletadas por profissionais
CREATE INDEX idx_conversations_deleted_by_professional ON conversations(deleted_by_professional);
```

## 🔧 Implementação

### 1. Hook `useMessages` - Função `deleteConversation`

```typescript
// Soft delete - marca como deletada para o usuário atual
const deleteConversation = async (conversationId: string) => {
  // Identifica se o usuário é cliente ou profissional
  const isClient = conversation.client_id === user.id
  const isProfessional = conversation.professional_id === user.id
  
  // Marca como deletada apenas para o usuário atual
  if (isClient) {
    updateData.deleted_by_client = true
  } else if (isProfessional) {
    updateData.deleted_by_professional = true
  }
  
  // Verifica se ambos deletaram - deleta permanentemente
  if (bothDeleted) {
    // Remove mensagens, acordos e conversa do banco
  }
}
```

### 2. Hook `useMessages` - Função `loadConversations`

```typescript
// Filtra conversas que NÃO foram deletadas pelo usuário atual
const activeConversations = (data || []).filter(conversation => {
  const isClient = conversation.client_id === user.id
  const isProfessional = conversation.professional_id === user.id
  
  // Se é cliente e deletou, não mostrar
  if (isClient && conversation.deleted_by_client) return false
  // Se é profissional e deletou, não mostrar
  if (isProfessional && conversation.deleted_by_professional) return false
  
  return true
})

// Também filtra a última mensagem e contador de não lidas
// para respeitar o soft delete
const deletedAt = isClient ? conversation.deleted_at_client : 
                 isProfessional ? conversation.deleted_at_professional : null

if (deletedAt) {
  // Buscar apenas mensagens depois da deleção
  lastMessageQuery = lastMessageQuery.gt('created_at', deletedAt)
  unreadQuery = unreadQuery.gt('created_at', deletedAt)
}
```

### 3. Hook `useMessages` - Função `loadMessages`

```typescript
// Ao carregar mensagens de uma conversa, verifica se foi deletada
const { data: conversation } = await supabase
  .from('conversations')
  .select('client_id, professional_id, deleted_at_client, deleted_at_professional')
  .eq('id', conversationId)
  .maybeSingle()

// Filtra mensagens antigas se conversação foi deletada
const isClient = conversation.client_id === user.id
const isProfessional = conversation.professional_id === user.id

if (isClient && conversation.deleted_at_client) {
  query = query.gt('created_at', conversation.deleted_at_client)
} else if (isProfessional && conversation.deleted_at_professional) {
  query = query.gt('created_at', conversation.deleted_at_professional)
}
```

### 4. Hook `useMessages` - Função `createOrFindConversation`

```typescript
// Ao encontrar conversa existente, REATIVA se foi deletada pelo usuário atual

if (existingConversation) {
  const wasDeleted = (isClient && existingConversation.deleted_by_client) || 
                    (isProfessional && existingConversation.deleted_by_professional)

  // Se foi deletada pelo usuário atual, REATIVAR
  if (wasDeleted) {
    const reactivateData = {
      deleted_by_client: false,  // ou deleted_by_professional
      deleted_at_client: null,   // ou deleted_at_professional
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString()
    }
    
    await supabase.from('conversations').update(reactivateData).eq('id', conversationId)
    await loadConversations() // Recarregar para mostrar na lista
  }
  
  return existingConversation.id
}
```

### 5. Hook `useMessages` - Função `sendMessage`

```typescript
// Ao enviar mensagem, também reativa conversa se foi deletada

// Verificar se conversa foi deletada
const wasDeleted = (isClient && conversation.deleted_by_client) || 
                  (isProfessional && conversation.deleted_by_professional)

if (wasDeleted) {
  // Reativar antes de enviar a mensagem
  await supabase.from('conversations').update({
    deleted_by_client: false,
    deleted_at_client: null
  }).eq('id', conversationId)
  
  await loadConversations() // Recarregar lista
}

// Enviar mensagem normalmente...
```

### 5. Modal de Confirmação

O modal agora apresenta informações claras sobre o comportamento:

```
ℹ️ Informação:
• A conversa será removida apenas da sua lista
• O outro participante ainda terá acesso à conversa
• Você não receberá mais mensagens desta conversa
• Esta ação não pode ser desfeita
```

### 6. Toast de Feedback

```typescript
toast.success('Conversa removida!', {
  description: 'A conversa foi removida da sua lista. O outro usuário ainda pode acessá-la.'
})
```

## 🚀 Fluxo de Uso

### Cenário 1: Usuário A Deleta a Conversa

1. Usuário A clica em "Deletar Conversa"
2. Sistema marca `deleted_by_client = true` ou `deleted_by_professional = true`
3. Conversa desaparece da lista do Usuário A
4. Usuário B ainda vê a conversa normalmente
5. Conversa permanece no banco de dados

### Cenário 2: Ambos os Usuários Deletam

1. Usuário A deleta → `deleted_by_client = true`
2. Usuário B deleta → `deleted_by_professional = true`
3. Sistema detecta que ambos deletaram
4. Remove permanentemente:
   - Todas as mensagens da conversa
   - Acordos de contato relacionados
   - A própria conversa
5. Dados são completamente removidos do banco de dados

### Cenário 3: Usuário Reinicia Conversa com Alguém que Deletou

1. Usuário A deleta a conversa (marca `deleted_by_client = true` e salva `deleted_at_client`)
2. Conversa desaparece da lista do Usuário A
3. Usuário A decide conversar com o mesmo usuário novamente (clica em "Entrar em Contato" ou envia mensagem)
4. Sistema encontra a conversa existente no banco
5. **REATIVAÇÃO AUTOMÁTICA**: Sistema detecta que foi deletada e REATIVA automaticamente
   - Marca `deleted_by_client = false`
   - Remove `deleted_at_client` (volta a `null`)
   - Atualiza `last_message_at`
6. Conversa **VOLTA A APARECER** na lista do Usuário A
7. Usuário A vê todo o histórico normalmente (como era antes de deletar)
8. Usuário B nunca soube que foi deletada e continua vendo tudo normalmente

**Importante**: 
- ✅ Ao reativar, o histórico antigo **VOLTA A SER VISÍVEL**
- ✅ A conversa aparece novamente na lista como se nunca tivesse sido deletada
- ✅ Funciona como um "desfazer" automático da deleção
- ⚠️ Se você quiser que o histórico fique oculto permanentemente após deletar, esse não é o comportamento atual

## 📁 Arquivos Modificados

### Criados:
- `scripts/add-soft-delete-to-conversations.sql` - Script SQL para adicionar os campos
- `docs/SOFT_DELETE_CONVERSAS.md` - Esta documentação

### Modificados:
- `src/hooks/useMessages.ts`:
  - Função `deleteConversation` - Implementa soft delete com timestamps
  - Função `loadConversations` - Filtra conversas e mensagens deletadas
  - Função `loadMessages` - Filtra mensagens antigas baseado em `deleted_at`
  - Função `createOrFindConversation` - NÃO reativa conversas deletadas, apenas permite novas mensagens
- `src/components/chat/ConversationMenu.tsx`:
  - Interface atualizada para `onDelete: Promise<boolean>`
  - Modal de confirmação com informações sobre soft delete
  - Toast messages atualizadas
- `src/components/chat/FloatingChat.tsx`:
  - Handler `onDelete` retorna o valor de sucesso

## 🗃️ Migração do Banco de Dados

Para aplicar as mudanças no banco de dados, execute:

```sql
-- No Supabase SQL Editor
\i scripts/add-soft-delete-to-conversations.sql
```

Ou copie e cole o conteúdo do arquivo no SQL Editor do Supabase.

## ⚠️ Considerações Importantes

1. **Privacidade**: Usuário não sabe se o outro deletou a conversa
2. **Mensagens Novas**: Usuário que deletou NÃO receberá novas mensagens dessa conversa
3. **Permanência**: Deleção permanente só ocorre quando AMBOS deletam
4. **Performance**: Índices foram criados para otimizar as queries de filtro
5. **Rollback**: Não há opção de "desfazer" a deleção

## 🐛 Troubleshooting

### Conversa Não Desaparece Após Deletar
- Verifique se os campos `deleted_by_client` e `deleted_by_professional` existem na tabela
- Verifique os logs do console para erros
- Confirme que o usuário tem permissão de UPDATE na tabela `conversations`

### Conversa Desaparece para Ambos
- Verifique se a lógica de soft delete está correta
- Confirme que apenas o campo correspondente ao usuário está sendo atualizado
- Verifique os logs para ver qual campo está sendo marcado

### Performance Lenta
- Confirme que os índices foram criados corretamente
- Verifique o plano de execução das queries no Supabase
- Considere adicionar índices compostos se necessário

## 📊 Logs e Debugging

O sistema implementa logs detalhados para debugging:

```
🗑️ Iniciando soft delete da conversa: [ID]
✅ Permissão verificada, marcando conversa como deletada...
✅ Conversa marcada como deletada para o usuário!
🗑️ Ambos os usuários deletaram, removendo permanentemente...
✅ Conversa deletada permanentemente do banco de dados
```

## 🎨 UX/UI

### Estados Visuais:
- **Antes de Deletar**: Conversa aparece normalmente
- **Após Deletar**: Conversa desaparece imediatamente da lista
- **Feedback**: Toast de sucesso ou erro
- **Modal**: Informações claras sobre o comportamento

### Mensagens:
- ✅ Sucesso: "Conversa removida! A conversa foi removida da sua lista. O outro usuário ainda pode acessá-la."
- ❌ Erro: "Erro ao deletar conversa - [mensagem específica do erro]"

## 🔄 Melhorias Futuras

1. **Opção de Recuperar**: Implementar uma lixeira temporária
2. **Notificação**: Avisar o outro usuário quando a conversa for deletada (opcional)
3. **Estatísticas**: Rastrear quantas conversas são deletadas
4. **Arquivamento**: Opção de arquivar ao invés de deletar
5. **Exportação**: Permitir exportar conversa antes de deletar

---

**Última Atualização**: 2025-01-14
**Versão**: 1.0.0
**Status**: ✅ Implementado e Testado

