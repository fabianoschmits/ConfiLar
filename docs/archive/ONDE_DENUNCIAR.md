# Onde os Usuários Podem Denunciar - ConfiLar

## 📍 Locais de Denúncia na Aplicação

### 1. **Posts no Feed** 📝
**Localização:** Página principal do feed (`/feed`)

**Como denunciar:**
- **Menu de 3 pontos** no canto superior direito de cada post
- **Botão "Denunciar"** na barra de ações do post

**Tipos de denúncia:**
- Denunciar o **post** (conteúdo inapropriado, spam, informações falsas)
- Denunciar o **usuário** que fez o post (comportamento inadequado)

**Implementação:**
```tsx
// Em TimelinePost.tsx
<ReportButton 
  type="post" 
  targetId={post.id}
  targetName={post.title}
  variant="ghost"
  size="sm"
/>

<ReportButton 
  type="user" 
  targetId={post.professional_id}
  targetName={post.professional.full_name}
  variant="ghost"
  size="sm"
/>
```

### 2. **Mensagens no Chat** 💬
**Localização:** Chat flutuante (menu de mensagens)

**Como denunciar:**
- **Menu de 3 pontos** em cada mensagem
- **Menu da conversa** para denunciar o usuário

**Tipos de denúncia:**
- Denunciar **mensagem específica** (conteúdo ofensivo, spam)
- Denunciar o **usuário** da conversa (assédio, comportamento inadequado)

**Implementação:**
```tsx
// Em MessageMenu.tsx
<ReportButton 
  type="message" 
  targetId={message.id}
  targetName="Mensagem"
  variant="ghost"
  size="sm"
/>

// Em ConversationMenu.tsx
<ReportButton 
  type="user" 
  targetId={conversation.user_id}
  targetName={conversation.user_name}
  variant="ghost"
  size="sm"
/>
```

### 3. **Perfis de Usuários** 👤
**Localização:** Página de perfil (`/perfil/[id]`)

**Como denunciar:**
- **Menu de 3 pontos** no cabeçalho do perfil
- **Botão "Denunciar"** na seção de ações

**Tipos de denúncia:**
- Denunciar o **usuário** (perfil falso, comportamento inadequado)

**Implementação:**
```tsx
// Em perfil/[id]/page.tsx
<ReportButton 
  type="user" 
  targetId={profile.id}
  targetName={profile.full_name}
  variant="outline"
  size="sm"
/>
```

### 4. **Avaliações/Reviews** ⭐
**Localização:** Página de perfil, seção de avaliações

**Como denunciar:**
- **Menu de 3 pontos** em cada avaliação
- **Botão "Denunciar"** na avaliação

**Tipos de denúncia:**
- Denunciar a **avaliação** (avaliação falsa, conteúdo ofensivo)

**Implementação:**
```tsx
// Em ReviewCard.tsx
<ReportButton 
  type="review" 
  targetId={review.id}
  targetName="Avaliação"
  variant="ghost"
  size="sm"
/>
```

### 5. **Posts em Destaque (Trending)** 🔥
**Localização:** Modal de posts em alta

**Como denunciar:**
- **Menu de 3 pontos** no cabeçalho do post
- **Botão "Denunciar"** nas ações do post

**Tipos de denúncia:**
- Denunciar o **post** ou **usuário**

**Implementação:**
```tsx
// Em TrendingPostModal.tsx
<ReportButton 
  type="post" 
  targetId={post.id}
  targetName={post.title}
  variant="ghost"
  size="sm"
/>
```

## 🎯 Estratégia de Implementação

### **Fase 1: Componentes Principais** ✅
- [x] ReportButton criado
- [x] Sistema de denúncias no admin
- [x] Banco de dados configurado

### **Fase 2: Integração nos Posts** 🔄
```tsx
// TimelinePost.tsx - Adicionar botão de denúncia
import { ReportButton } from '@/components/ReportButton'

// No menu de ações do post
<div className="flex items-center gap-2">
  <ReactionButton postId={post.id} />
  <button>Comentar</button>
  <button>Compartilhar</button>
  <ReportButton 
    type="post" 
    targetId={post.id}
    targetName={post.title}
  />
</div>
```

### **Fase 3: Integração no Chat** 🔄
```tsx
// MessageMenu.tsx - Adicionar opção de denúncia
import { ReportButton } from '@/components/ReportButton'

<DropdownMenuItem>
  <ReportButton 
    type="message" 
    targetId={message.id}
    targetName="Mensagem"
  />
</DropdownMenuItem>
```

### **Fase 4: Integração em Perfis** 🔄
```tsx
// perfil/[id]/page.tsx - Adicionar botão de denúncia
import { ReportButton } from '@/components/ReportButton'

// No cabeçalho do perfil
<div className="flex items-center gap-2">
  <Button onClick={handleContact}>Entrar em Contato</Button>
  <Button variant="outline">Compartilhar</Button>
  <ReportButton 
    type="user" 
    targetId={profile.id}
    targetName={profile.full_name}
  />
</div>
```

### **Fase 5: Integração em Avaliações** 🔄
```tsx
// ReviewCard.tsx - Adicionar botão de denúncia
import { ReportButton } from '@/components/ReportButton'

// No menu de ações da avaliação
<div className="flex items-center gap-2">
  <Button variant="ghost" size="sm">Útil</Button>
  <ReportButton 
    type="review" 
    targetId={review.id}
    targetName="Avaliação"
  />
</div>
```

## 🔧 Implementação Técnica

### **1. Importar o Componente**
```tsx
import { ReportButton } from '@/components/ReportButton'
```

### **2. Adicionar o Botão**
```tsx
<ReportButton 
  type="post" | "user" | "message" | "review"
  targetId={item.id}
  targetName={item.name}
  variant="ghost" | "outline" | "default"
  size="sm" | "default" | "lg"
/>
```

### **3. Props do ReportButton**
- `type`: Tipo da denúncia (obrigatório)
- `targetId`: ID do item sendo denunciado (obrigatório)
- `targetName`: Nome/título do item (opcional)
- `variant`: Estilo do botão (opcional)
- `size`: Tamanho do botão (opcional)
- `className`: Classes CSS adicionais (opcional)

## 📱 Experiência do Usuário

### **Fluxo de Denúncia:**
1. **Usuário clica** no botão "Denunciar"
2. **Modal abre** com formulário de denúncia
3. **Usuário seleciona** o motivo da denúncia
4. **Usuário descreve** o problema em detalhes
5. **Usuário define** a prioridade (opcional)
6. **Usuário envia** a denúncia
7. **Confirmação** de que a denúncia foi enviada

### **Feedback Visual:**
- ✅ **Sucesso**: "Denúncia enviada com sucesso!"
- ⚠️ **Aviso**: "Denúncias falsas podem resultar em suspensão"
- ❌ **Erro**: "Erro ao enviar denúncia. Tente novamente."

## 🛡️ Segurança e Moderação

### **Para Usuários:**
- Só podem denunciar conteúdo que conseguem ver
- Não podem denunciar a si mesmos
- Denúncias são anônimas para outros usuários
- Podem ver o status de suas próprias denúncias

### **Para Administradores:**
- Acesso completo a todas as denúncias
- Filtros avançados para encontrar denúncias
- Ações administrativas (resolver, dispensar, revisar)
- Sistema de notas para acompanhamento

## 📊 Métricas e Monitoramento

### **Dashboard Admin:**
- Total de denúncias
- Denúncias pendentes
- Taxa de resolução
- Denúncias por tipo
- Atividade das últimas 24h

### **Alertas Automáticos:**
- Denúncias urgentes não resolvidas
- Alto volume de denúncias
- Padrões suspeitos de denúncias

## 🚀 Próximos Passos

### **Implementação Imediata:**
1. ✅ Sistema de denúncias criado
2. 🔄 Integrar em TimelinePost
3. 🔄 Integrar em FloatingChat
4. 🔄 Integrar em perfis de usuário
5. 🔄 Integrar em avaliações

### **Melhorias Futuras:**
- [ ] Notificações automáticas para denúncias urgentes
- [ ] Sistema de escalação automática
- [ ] Integração com moderação automática
- [ ] Relatórios de denúncias por período
- [ ] Sistema de reputação baseado em denúncias

## 📞 Suporte

Para dúvidas sobre onde implementar denúncias:
1. Verifique a documentação do componente ReportButton
2. Consulte os exemplos de integração
3. Teste o sistema com o script de teste
4. Verifique as políticas RLS no Supabase
