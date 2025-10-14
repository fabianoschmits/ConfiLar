# Sistema de Denúncias - ConfiLar

## Visão Geral

O sistema de denúncias permite que usuários reportem conteúdo inadequado, comportamento inapropriado ou violações das regras da plataforma. Os administradores podem gerenciar essas denúncias através de uma interface dedicada.

## Funcionalidades

### Para Usuários
- **Denunciar conteúdo**: Posts, mensagens, avaliações e outros usuários
- **Motivos específicos**: Lista de motivos pré-definidos para cada tipo de denúncia
- **Prioridade**: Usuários podem definir a urgência da denúncia
- **Acompanhamento**: Status da denúncia é atualizado em tempo real

### Para Administradores
- **Dashboard completo**: Visão geral de todas as denúncias
- **Filtros avançados**: Por status, tipo, prioridade e busca textual
- **Ações administrativas**: Resolver, dispensar, colocar em revisão
- **Estatísticas**: Métricas de denúncias e resolução
- **Notas administrativas**: Sistema de anotações para acompanhamento

## Estrutura do Banco de Dados

### Tabela `reports`
```sql
- id: UUID (PK)
- type: VARCHAR(20) - Tipo da denúncia (user, post, message, review, other)
- reason: VARCHAR(100) - Motivo da denúncia
- description: TEXT - Descrição detalhada
- status: VARCHAR(20) - Status (pending, reviewing, resolved, dismissed)
- priority: VARCHAR(10) - Prioridade (low, medium, high, urgent)
- reporter_id: UUID (FK) - ID do usuário que fez a denúncia
- reported_user_id: UUID (FK) - ID do usuário denunciado
- reported_post_id: UUID (FK) - ID do post denunciado
- reported_message_id: UUID (FK) - ID da mensagem denunciada
- admin_notes: TEXT - Notas do administrador
- resolution: TEXT - Resolução aplicada
- created_at: TIMESTAMP - Data de criação
- updated_at: TIMESTAMP - Data de atualização
```

## Componentes

### 1. ReportButton
Componente para permitir que usuários façam denúncias.

```tsx
<ReportButton 
  type="post" 
  targetId={post.id}
  targetName={post.title}
  variant="ghost"
  size="sm"
/>
```

**Props:**
- `type`: Tipo da denúncia ('user', 'post', 'message', 'review')
- `targetId`: ID do item sendo denunciado
- `targetName`: Nome/título do item (opcional)
- `variant`: Variante do botão
- `size`: Tamanho do botão

### 2. ReportsManagement
Interface administrativa para gerenciar denúncias.

**Funcionalidades:**
- Lista todas as denúncias com filtros
- Ações administrativas (resolver, dispensar, revisar)
- Estatísticas em tempo real
- Modal de detalhes com informações completas

### 3. AdminDashboard
Dashboard principal com aba de denúncias integrada.

## Configuração

### 1. Executar SQL de Configuração
```bash
# Execute o script no Supabase Dashboard > SQL Editor
scripts/setup-reports-system.sql
```

### 2. Testar Sistema
```bash
# Testar se tudo está funcionando
node scripts/test-reports-system.js
```

### 3. Integrar em Componentes
```tsx
import { ReportButton } from '@/components/ReportButton'

// Em um componente de post
<ReportButton 
  type="post" 
  targetId={post.id}
  targetName={post.title}
/>
```

## Tipos de Denúncia

### 1. Denúncia de Usuário
- **Motivos**: Comportamento inadequado, spam, perfil falso, assédio
- **Ações**: Suspensão temporária, banimento, aviso

### 2. Denúncia de Post
- **Motivos**: Conteúdo inapropriado, informações falsas, spam
- **Ações**: Remoção do post, edição, ocultação

### 3. Denúncia de Mensagem
- **Motivos**: Mensagem ofensiva, spam, assédio, ameaças
- **Ações**: Remoção da mensagem, suspensão do usuário

### 4. Denúncia de Avaliação
- **Motivos**: Avaliação falsa, conteúdo ofensivo, spam
- **Ações**: Remoção da avaliação, suspensão do usuário

## Status das Denúncias

- **pending**: Aguardando revisão
- **reviewing**: Em análise pela equipe
- **resolved**: Resolvida com ação tomada
- **dismissed**: Dispensada (sem fundamento)

## Prioridades

- **urgent**: Requer ação imediata
- **high**: Alta prioridade
- **medium**: Prioridade normal
- **low**: Baixa prioridade

## Políticas de Segurança (RLS)

### Para Usuários
- Podem ver apenas suas próprias denúncias
- Podem criar denúncias
- Podem editar apenas denúncias pendentes

### Para Administradores
- Acesso completo a todas as denúncias
- Podem atualizar status e adicionar notas
- Podem tomar ações administrativas

## Monitoramento

### Métricas Disponíveis
- Total de denúncias
- Denúncias pendentes
- Taxa de resolução
- Denúncias por tipo
- Denúncias por prioridade
- Atividade das últimas 24h

### Alertas
- Denúncias urgentes não resolvidas
- Alto volume de denúncias
- Padrões suspeitos de denúncias

## Melhores Práticas

### Para Usuários
1. **Seja específico**: Descreva claramente o problema
2. **Use motivos apropriados**: Selecione o motivo mais adequado
3. **Não abuse**: Denúncias falsas podem resultar em suspensão
4. **Seja construtivo**: Ajude a manter a comunidade saudável

### Para Administradores
1. **Responda rapidamente**: Especialmente denúncias urgentes
2. **Seja consistente**: Aplique as mesmas regras para todos
3. **Documente ações**: Use as notas administrativas
4. **Monitore padrões**: Identifique problemas recorrentes

## Troubleshooting

### Problemas Comuns

1. **Erro ao criar denúncia**
   - Verificar se o usuário está logado
   - Verificar se a tabela `reports` existe
   - Verificar políticas RLS

2. **Denúncias não aparecem no admin**
   - Verificar se o usuário tem permissão de admin
   - Verificar políticas RLS para admins

3. **Erro de permissão**
   - Verificar se as políticas RLS estão corretas
   - Verificar se o usuário está autenticado

### Logs e Debug
```javascript
// Verificar denúncias
const { data, error } = await supabase
  .from('reports')
  .select('*')
  .order('created_at', { ascending: false })

console.log('Denúncias:', data)
console.log('Erro:', error)
```

## Roadmap

### Funcionalidades Futuras
- [ ] Notificações automáticas para denúncias urgentes
- [ ] Sistema de escalação automática
- [ ] Integração com moderação automática
- [ ] Relatórios de denúncias por período
- [ ] Sistema de reputação baseado em denúncias
- [ ] API para integração com sistemas externos

## Suporte

Para dúvidas ou problemas com o sistema de denúncias:
1. Verifique os logs do console
2. Execute o script de teste
3. Verifique as políticas RLS
4. Consulte a documentação do Supabase
