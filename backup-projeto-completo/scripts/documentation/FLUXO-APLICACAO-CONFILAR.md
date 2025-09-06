# 🔄 Fluxo Completo da Aplicação ConfiLar

## 📋 Visão Geral
A ConfiLar é uma plataforma que conecta clientes e profissionais de serviços, oferecendo um sistema completo de comunicação, busca, avaliações e gerenciamento de perfis.

---

## 🚀 **1. FLUXO DE AUTENTICAÇÃO E CADASTRO**

### **1.1 Página Inicial (`/`)**
```
Usuário não logado → Landing Page
├── Header com navegação
├── Hero Section
├── Seção "Como Funciona"
├── Categorias de serviços
├── Estatísticas
└── Botões: "Entrar" | "Criar Conta"
```

### **1.2 Autenticação (`/auth`)**
```
Página de Auth
├── Tab: Login
│   ├── Formulário de login
│   ├── Validação de credenciais
│   └── Redirecionamento para /home
└── Tab: Cadastro
    ├── SimpleRegistrationForm
    ├── Campos obrigatórios
    ├── Validação de dados
    └── Criação de perfil automática
```

### **1.3 Tipos de Usuário**
- **Cliente**: Busca serviços, avalia profissionais
- **Profissional**: Oferece serviços, gerencia agenda

---

## 🏠 **2. FLUXO DE NAVEGAÇÃO PRINCIPAL**

### **2.1 Layout Principal (Usuário Logado)**
```
MainLayout
├── Navigation (Header)
│   ├── Logo ConfiLar
│   ├── Links de navegação
│   │   ├── Home
│   │   ├── Feed Social
│   │   ├── Buscar
│   │   ├── Classificados
│   │   └── [Profissional] Agenda | Meus Serviços
│   └── Perfil do usuário
├── Sidebar (Mobile/Desktop)
│   ├── Principal: Home, Dashboard
│   ├── Descobrir: Buscar, Classificados, Feed
│   ├── Comunicação: Mensagens, Notificações
│   ├── Perfil: Meu Perfil, Editar Perfil, Portfólio
│   └── [Profissional] Serviços, Agenda, Ganhos
└── FloatingChat (Chat flutuante)
```

### **2.2 Páginas Principais**
- **`/home`**: Dashboard principal
- **`/buscar`**: Busca de profissionais
- **`/classificados`**: Anúncios de serviços
- **`/mensagens`**: Sistema de chat
- **`/perfil`**: Perfil do usuário
- **`/agenda`**: [Profissional] Gerenciamento de agenda

---

## 💬 **3. FLUXO DE MENSAGENS E CHAT**

### **3.1 Sistema de Chat Flutuante**
```
FloatingChatContext
├── Estado global do chat
├── openChat(userId, userName)
│   ├── Verificar conversa existente
│   ├── Criar nova conversa (se necessário)
│   ├── Abrir chat diretamente
│   └── Limpar targetUserId após criação
├── selectConversation(conversationId)
└── Gerenciar estado de abertura/fechamento
```

### **3.2 Fluxo de Iniciação de Conversa**
```
Usuário clica "Contatar" em:
├── Página de busca (/buscar)
├── Página de classificados (/classificados)
├── Perfil público (/perfil/[id])
└── Lista de profissionais

↓

openChat() é chamado
├── checkExistingConversation()
├── Se existe: Abrir conversa existente
├── Se não existe: createConversation()
│   ├── Determinar client_id e professional_id
│   ├── Inserir na tabela conversations
│   └── Retornar conversationId
└── Abrir chat com conversa selecionada
```

### **3.3 Envio de Mensagens**
```
handleSendMessage()
├── Verificar se há conversa selecionada
├── Se não há: Criar nova conversa
├── Enviar mensagem via sendMessage()
├── Atualizar last_message_at na conversa
├── Criar notificação para destinatário
├── Atualizar lista de conversas
└── Scroll para nova mensagem
```

### **3.4 Notificações de Mensagem**
```
sendMessage() → createNotification()
├── Determinar otherUserId da conversa
├── Buscar dados do remetente
├── Criar notificação com:
│   ├── Título: "Nova mensagem de [Nome]"
│   ├── Mensagem: Conteúdo (truncado)
│   ├── Tipo: 'message'
│   └── Action URL: Link para conversa
└── Apenas destinatário recebe notificação
```

---

## 🔍 **4. FLUXO DE BUSCA E CLASSIFICADOS**

### **4.1 Página de Busca (`/buscar`)**
```
BuscarPage
├── Filtros de busca
│   ├── Termo de busca (nome, bio, serviços)
│   ├── Categoria de serviço
│   ├── Localização (estado, cidade)
│   └── Ordenação (rating, proximidade)
├── Lista de profissionais
│   ├── Card do profissional
│   ├── Informações básicas
│   ├── Rating e avaliações
│   └── Botão "Contatar"
└── Histórico de buscas
```

### **4.2 Página de Classificados (`/classificados`)**
```
ClassificadosPage
├── Lista de anúncios
│   ├── Serviços profissionais
│   ├── Informações do profissional
│   ├── Preços e disponibilidade
│   └── Botão "Contatar"
├── Filtros por categoria
└── Sistema de favoritos
```

### **4.3 Integração com Chat**
```
Botão "Contatar" → openChat()
├── Abrir chat flutuante
├── Criar/abrir conversa
└── Usuário pode enviar mensagem imediatamente
```

---

## 👤 **5. FLUXO DE PERFIL E PORTFÓLIO**

### **5.1 Sistema de Perfil**
```
Profile (Database)
├── Dados básicos
│   ├── Nome, email, telefone
│   ├── CPF/CNPJ, data nascimento
│   ├── Localização (estado, cidade, bairro)
│   └── Tipo de usuário (client/professional)
├── Dados profissionais (se professional)
│   ├── Serviços oferecidos
│   ├── Anos de experiência
│   ├── Certificações
│   └── Portfólio URL
├── Sistema de reputação
│   ├── Rating (0-5)
│   ├── Total de avaliações
│   ├── Badge (bronze/silver/gold)
│   └── Status de verificação
└── Score de completude (0-100)
```

### **5.2 Edição de Perfil (`/perfil`)**
```
EditarPerfilPage
├── Dados básicos editáveis
├── Upload de avatar
├── Informações profissionais
├── Validação de dados
└── Atualização em tempo real
```

### **5.3 Perfil Público (`/perfil/[id]`)**
```
PerfilPúblico
├── Informações públicas
├── Avaliações e reviews
├── Serviços oferecidos
├── Portfólio
└── Botão "Contatar" → openChat()
```

---

## 🔔 **6. FLUXO DE NOTIFICAÇÕES**

### **6.1 Sistema de Notificações**
```
NotificationProvider
├── Carregar notificações do banco
├── Conexão em tempo real (Supabase)
├── Notificações push (se permitido)
├── Toast notifications
└── Gerenciamento de estado
```

### **6.2 Tipos de Notificação**
```
Tipos de Notificação:
├── message: Nova mensagem recebida
├── review: Nova avaliação recebida
├── appointment: Solicitação de agendamento
├── system: Atualizações do sistema
└── marketing: Promoções (opcional)
```

### **6.3 Fluxo de Notificação**
```
Evento → createNotification()
├── Inserir na tabela notifications
├── Trigger em tempo real
├── NotificationProvider recebe
├── Mostrar toast
├── Enviar push (se permitido)
└── Atualizar contador não lidas
```

---

## 🗄️ **7. ESTRUTURA DO BANCO DE DADOS**

### **7.1 Tabelas Principais**
```
profiles
├── Dados do usuário
├── Informações profissionais
├── Sistema de reputação
└── Configurações de perfil

conversations
├── client_id, professional_id
├── last_message_at
├── Status da conversa
└── Metadados

messages
├── conversation_id
├── sender_id, receiver_id
├── content, is_read
└── Timestamps

notifications
├── user_id
├── title, message, type
├── is_read, priority
└── Action URLs

classified_ads
├── user_id, title, description
├── category, location
├── is_active, views
└── Timestamps
```

---

## 🔄 **8. FLUXOS DE INTEGRAÇÃO**

### **8.1 Autenticação → Perfil**
```
Login → fetchProfile() → setProfile()
├── Buscar dados do perfil
├── Se não existe: Criar perfil padrão
├── Calcular score de completude
└── Determinar tipo de usuário
```

### **8.2 Busca → Chat**
```
Buscar profissional → openChat()
├── Verificar conversa existente
├── Criar nova conversa
├── Abrir chat flutuante
└── Usuário pode enviar mensagem
```

### **8.3 Mensagem → Notificação**
```
Enviar mensagem → createNotification()
├── Determinar destinatário
├── Criar notificação
├── Enviar em tempo real
└── Atualizar contadores
```

---

## 🎯 **9. PONTOS DE MELHORIA IDENTIFICADOS**

### **9.1 Performance**
- ✅ Sistema de cache implementado
- ✅ Lazy loading de componentes
- ✅ Otimização de imagens (Next.js Image)

### **9.2 UX/UI**
- ✅ Chat flutuante inteligente
- ✅ Navegação responsiva
- ✅ Feedback visual consistente

### **9.3 Funcionalidades**
- ✅ Sistema de mensagens completo
- ✅ Notificações em tempo real
- ✅ Busca avançada
- ✅ Sistema de reputação

### **9.4 Segurança**
- ✅ Row Level Security (RLS)
- ✅ Validação de dados
- ✅ Autenticação robusta

---

## 📊 **10. MÉTRICAS E MONITORAMENTO**

### **10.1 Logs Importantes**
```
Console Logs:
├── 🔍 Verificação de conversas
├── 🆕 Criação de conversas
├── 📨 Envio de mensagens
├── 🔔 Criação de notificações
└── ❌ Erros e warnings
```

### **10.2 Estados de Loading**
```
Loading States:
├── Autenticação inicial
├── Carregamento de perfis
├── Busca de profissionais
├── Envio de mensagens
└── Criação de notificações
```

---

## 🚀 **CONCLUSÃO**

A aplicação ConfiLar possui um fluxo bem estruturado e integrado, com:

✅ **Sistema de autenticação robusto**
✅ **Chat flutuante inteligente**
✅ **Busca e classificados funcionais**
✅ **Sistema de notificações em tempo real**
✅ **Perfis completos e editáveis**
✅ **Navegação intuitiva**
✅ **Integração perfeita entre componentes**

O sistema está pronto para uso em produção, com todas as funcionalidades principais implementadas e testadas.
