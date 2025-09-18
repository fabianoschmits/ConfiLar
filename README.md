# 🏠 ConfiLar - Plataforma de Conexão entre Clientes e Profissionais

<div align="center">

![ConfiLar Logo](https://img.shields.io/badge/ConfiLar-v5-blue?style=for-the-badge&logo=home&logoColor=white)

**Conectando clientes e profissionais de forma confiável e eficiente**

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3.0-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

[![Deploy Status](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)](LICENSE)

</div>

---

## 📋 Índice

- [🎯 Sobre o Projeto](#-sobre-o-projeto)
- [✨ Funcionalidades Implementadas](#-funcionalidades-implementadas)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [📱 Como Funciona](#-como-funciona)
- [🎨 Interface Moderna](#-interface-moderna)
- [🔐 Sistema de Autenticação](#-sistema-de-autenticação)
- [📊 Dashboard Inteligente](#-dashboard-inteligente)
- [💬 Chat em Tempo Real](#-chat-em-tempo-real)
- [⭐ Sistema de Avaliações](#-sistema-de-avaliações)
- [🔍 Busca Avançada](#-busca-avançada)
- [📱 Notificações em Tempo Real](#-notificações-em-tempo-real)
- [📋 Sistema de Classificados](#-sistema-de-classificados)
- [🏗️ Arquitetura](#️-arquitetura)
- [📊 Status Atual](#-status-atual)

---

## 🎯 Sobre o Projeto

**ConfiLar** é uma plataforma inovadora que conecta clientes e profissionais de serviços de forma gratuita, focando na confiança através de avaliações e reputação. A aplicação elimina intermediários, permitindo que profissionais ofereçam seus serviços diretamente aos clientes.

### 🎯 Objetivos Principais

- ✅ **Conexão Direta**: Eliminar intermediários entre clientes e profissionais
- ✅ **Gratuito**: Plataforma 100% gratuita para usuários
- ✅ **Confiabilidade**: Sistema robusto de avaliações e reputação
- ✅ **Proximidade**: Busca por localização geográfica
- ✅ **Mobile-First**: Interface otimizada para dispositivos móveis
- ✅ **Tempo Real**: Notificações e chat instantâneos

---

## ✨ Funcionalidades Implementadas

### 👥 **Para Clientes**
- 🔍 **Busca Inteligente**: Encontre profissionais por proximidade e especialidade
- ⭐ **Avaliações**: Sistema completo de avaliações de 1-5 estrelas
- 💬 **Chat Direto**: Comunicação em tempo real com profissionais
- 📅 **Agendamentos**: Sistema de propostas e acordos
- ❤️ **Favoritos**: Salve profissionais preferidos
- 📱 **Notificações**: Receba atualizações em tempo real
- 📋 **Classificados**: Publique e responda anúncios de serviços
- 🔗 **Recomendações**: Sistema de indicações entre usuários

### 🛠️ **Para Profissionais**
- 📊 **Dashboard Completo**: Métricas e estatísticas detalhadas
- 🎨 **Perfil Profissional**: Portfólio e informações detalhadas
- 📅 **Agenda Integrada**: Gerencie horários e disponibilidade
- 💰 **Controle de Ganhos**: Acompanhe receitas e crescimento
- ⭐ **Reputação**: Sistema de avaliações e badges
- 📱 **App Mobile**: Gerencie tudo pelo celular
- 🔔 **Notificações**: Alertas instantâneos de novas oportunidades
- 📈 **Analytics**: Visualizações, contatos e conversões

---

## 🛠️ Stack Tecnológico

### **Frontend**
- **Next.js 15.4.6** - Framework React com App Router
- **TypeScript 5.0** - Tipagem estática
- **Tailwind CSS 3.0** - Framework CSS utilitário
- **shadcn/ui** - Componentes de interface modernos
- **Lucide React** - Ícones modernos e consistentes
- **Sonner** - Sistema de notificações toast

### **Backend & Database**
- **Supabase 3.0** - Backend-as-a-Service completo
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security (RLS)** - Segurança de dados avançada
- **Supabase Auth** - Sistema de autenticação
- **Supabase Storage** - Armazenamento de arquivos
- **Supabase Realtime** - Notificações e chat em tempo real

### **Deploy & DevOps**
- **Vercel** - Deploy automático e otimizado
- **GitHub Actions** - CI/CD pipeline
- **ESLint** - Linting de código
- **Prettier** - Formatação automática

---

## 📱 Como Funciona

### 🔐 **Fluxo de Autenticação**
1. **Cadastro**: Usuário escolhe entre Cliente ou Profissional
2. **Perfil**: Preenche informações pessoais, localização e especialidades
3. **Verificação**: Confirmação por email automática
4. **Login**: Acesso seguro com sessão persistente e refresh automático

### 🔍 **Sistema de Busca Inteligente**
1. **Geolocalização**: Detecta automaticamente a localização do usuário
2. **Filtros Avançados**: Por estado, cidade, categoria de serviço, avaliação
3. **Resultados Paginados**: Lista com 9 profissionais por página
4. **Perfil Detalhado**: Visualização completa com avaliações e portfólio

### 💬 **Comunicação em Tempo Real**
1. **Contato Direto**: Cliente clica em "Contatar" no perfil do profissional
2. **Chat Instantâneo**: Conversa direta em tempo real
3. **Notificações Push**: Alertas instantâneos para novas mensagens
4. **Histórico Completo**: Todas as conversas ficam salvas permanentemente

### ⭐ **Sistema de Avaliações Robusto**
1. **Avaliação Dupla**: Cliente avalia profissional e vice-versa
2. **Sistema de Estrelas**: Nota de 1 a 5 com comentários obrigatórios
3. **Reputação Automática**: Nota média calculada e exibida
4. **Transparência Total**: Todas as avaliações são públicas e verificáveis

### 📊 **Dashboard Inteligente**
1. **Métricas em Tempo Real**: Visualizações, contatos, avaliações
2. **Gráficos Interativos**: Crescimento e performance ao longo do tempo
3. **Controle de Disponibilidade**: Toggle para ativar/desativar serviços
4. **Estatísticas Detalhadas**: Dados completos de performance

---

## 🎨 Interface Moderna

### **Design System Avançado**
- **Tema Moderno**: Interface limpa com gradientes e glassmorphism
- **Componentes Reutilizáveis**: shadcn/ui para máxima consistência
- **Responsividade Total**: Mobile-first design otimizado
- **Acessibilidade**: WCAG 2.1 compliant
- **Animações Suaves**: Transições e micro-interações

### **Componentes Principais**
- **LoadingOverlay**: Transições suaves entre páginas
- **UserAvatar**: Avatares com fallback automático e upload
- **SearchFilters**: Filtros avançados com comboboxes
- **ChatWidget**: Widget de chat flutuante responsivo
- **NotificationDropdown**: Menu de notificações em tempo real
- **RecommendationButton**: Sistema de recomendações integrado

---

## 🔐 Sistema de Autenticação

### **Características Avançadas**
- **Login/Logout Inteligente**: Redirecionamento automático baseado no contexto
- **Cadastro Completo**: Seleção de avatar (upload ou pixel-art)
- **Recuperação de Senha**: Sistema via email com tokens seguros
- **Sessão Persistente**: Refresh automático e proteção contra expiração
- **Proteção de Rotas**: Middleware avançado para controle de acesso

### **Segurança Máxima**
- **Row Level Security (RLS)**: Proteção de dados no nível do banco
- **Validação Rigorosa**: Zod schemas para todos os inputs
- **Sanitização Automática**: Limpeza de dados maliciosos
- **Rate Limiting**: Proteção contra ataques de força bruta

---

## 📊 Dashboard Inteligente

### **Para Profissionais**
- **Métricas em Tempo Real**: Visualizações, contatos, avaliações
- **Gráficos Interativos**: Crescimento ao longo do tempo
- **Atividade Recente**: Últimas interações e eventos
- **Controle de Disponibilidade**: Toggle para ativar/desativar
- **Estatísticas Detalhadas**: Performance completa

### **Para Clientes**
- **Favoritos**: Profissionais salvos com acesso rápido
- **Histórico**: Serviços contratados e avaliados
- **Conversas Ativas**: Chats em andamento
- **Recomendações**: Usuários que você recomendou

---

## 💬 Chat em Tempo Real

### **Funcionalidades Avançadas**
- **Chat Instantâneo**: Supabase Realtime para comunicação em tempo real
- **Notificações Push**: Alertas instantâneos para novas mensagens
- **Histórico Persistente**: Todas as conversas salvas permanentemente
- **Status de Leitura**: Indicadores visuais de mensagens lidas
- **Interface Responsiva**: Otimizada para mobile e desktop

### **Sistema de Acordos**
- **Propostas**: Sistema de propostas de serviços
- **Aceitação/Rejeição**: Controle total sobre propostas
- **Notificações**: Alertas automáticos para mudanças de status
- **Histórico**: Rastreamento completo de acordos

---

## ⭐ Sistema de Avaliações

### **Características Únicas**
- **Avaliação Dupla**: Cliente e profissional se avaliam mutuamente
- **Sistema de Estrelas**: Nota de 1 a 5 com comentários obrigatórios
- **Prevenção de Duplicatas**: Uma avaliação por serviço prestado
- **Moderação Automática**: Sistema de denúncia e verificação
- **Reputação Transparente**: Todas as avaliações são públicas

### **Funcionalidades**
- **Filtros por Avaliação**: Busca por nota mínima
- **Estatísticas Agregadas**: Média geral e distribuição
- **Badges de Reputação**: Sistema de conquistas
- **Comentários Detalhados**: Feedback completo sobre serviços

---

## 🔍 Busca Avançada

### **Sistema Inteligente**
- **Geolocalização Automática**: Detecta localização do usuário
- **Busca por Proximidade**: Filtra por distância em quilômetros
- **Filtros Múltiplos**: Estado, cidade, categoria, avaliação, disponibilidade
- **Paginação Otimizada**: 9 resultados por página com navegação
- **Resultados Relevantes**: Algoritmo de relevância baseado em proximidade

### **Filtros Disponíveis**
- **Localização**: Estado e cidade com comboboxes inteligentes
- **Categoria**: Tipo de serviço oferecido
- **Avaliação**: Nota mínima desejada
- **Disponibilidade**: Apenas profissionais ativos
- **Tipo de Usuário**: Cliente ou Profissional

---

## 📱 Notificações em Tempo Real

### **Sistema Completo**
- **Canal Único por Usuário**: Evita conflitos e duplicatas
- **Eventos Monitorados**: INSERT, UPDATE, DELETE em tempo real
- **Prevenção de Duplicatas**: Verifica existência antes de adicionar
- **Toasts Automáticos**: Novas notificações aparecem como toast
- **Contador Visual**: Número de não lidas no sino

### **Tipos de Notificação**
- **Mensagens**: Novas mensagens no chat
- **Avaliações**: Quando avaliação fica disponível
- **Acordos**: Propostas aceitas/rejeitadas
- **Sistema**: Notificações gerais da plataforma
- **Recomendações**: Quando alguém te recomenda

### **Funcionalidades do Menu**
- **Marcar como Lida**: Individual ou todas de uma vez
- **Deletar**: Remover notificações específicas
- **Limpar Todas**: Remover todas as notificações
- **Reset Visual**: Contador reseta ao abrir o menu

---

## 📋 Sistema de Classificados

### **Funcionalidades Completas**
- **Publicação de Anúncios**: Clientes e profissionais podem publicar
- **Tipos de Anúncio**: Oferta de serviço ou solicitação
- **Categorias**: Organização por tipo de serviço
- **Filtros Avançados**: Busca por localização, categoria e tipo
- **Paginação**: Sistema de páginas para navegação
- **Fotos de Perfil**: Avatares dos usuários nos anúncios

### **Sistema de Criação**
- **Modal Inteligente**: Interface moderna para criação
- **Validação Completa**: Campos obrigatórios e opcionais
- **Upload de Imagens**: Suporte a imagens nos anúncios
- **Categorias com Scroll**: Lista extensa de categorias

---

## 🏗️ Arquitetura

### **Padrões Modernos**
- **App Router**: Next.js 13+ com roteamento avançado
- **Server Components**: Renderização otimizada no servidor
- **Client Components**: Interatividade no cliente
- **Context API**: Estado global gerenciado
- **Custom Hooks**: Lógica reutilizável encapsulada
- **Middleware**: Proteção de rotas avançada

### **Estrutura de Dados**
```typescript
// Principais entidades
interface Profile {
  id: string
  email: string
  full_name: string
  user_type: 'client' | 'professional'
  avatar_url?: string
  location_city: string
  location_state: string
  is_available: boolean
  created_at: string
  // ... outros campos
}

interface Conversation {
  id: string
  client_id: string
  professional_id: string
  last_message_at: string
  created_at: string
  unread_count: number
}

interface Review {
  id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string
  created_at: string
}

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}
```

---

## 📊 Status Atual

### ✅ **Funcionalidades 100% Implementadas**
- [x] **Sistema de Autenticação Completo**
  - Login/logout com redirecionamento inteligente
  - Cadastro com seleção de avatar
  - Recuperação de senha via email
  - Sessão persistente com refresh automático
  - Proteção de rotas com middleware

- [x] **Dashboard Inteligente**
  - Métricas em tempo real (visualizações, contatos, avaliações)
  - Gráficos interativos de crescimento
  - Controle de disponibilidade
  - Estatísticas detalhadas por tipo de usuário

- [x] **Sistema de Mensagens em Tempo Real**
  - Chat instantâneo com Supabase Realtime
  - Notificações push para novas mensagens
  - Histórico persistente de conversas
  - Status de leitura e timestamps
  - Sistema de acordos e propostas

- [x] **Sistema de Avaliações Robusto**
  - Avaliações de 1-5 estrelas com comentários
  - Sistema de reputação com badges
  - Prevenção de duplicatas
  - Filtros por avaliação na busca
  - Estatísticas agregadas no perfil

- [x] **Busca Avançada por Proximidade**
  - Geolocalização automática
  - Filtros múltiplos (estado, cidade, categoria, avaliação)
  - Paginação otimizada (9 resultados por página)
  - Algoritmo de relevância

- [x] **Notificações em Tempo Real**
  - Canal único por usuário
  - Eventos monitorados (INSERT, UPDATE, DELETE)
  - Prevenção de duplicatas
  - Toasts automáticos
  - Menu completo com ações

- [x] **Sistema de Classificados**
  - Publicação de anúncios (oferta/solicitação)
  - Filtros avançados
  - Paginação
  - Upload de imagens
  - Categorias organizadas

- [x] **Sistema de Recomendações**
  - Botão de recomendar em perfis
  - Modal moderno para recomendações
  - Lista de usuários que recomendaram
  - Contador de recomendações

- [x] **Interface Moderna e Responsiva**
  - Tema moderno com gradientes
  - Componentes shadcn/ui
  - Mobile-first design
  - Acessibilidade WCAG 2.1
  - Animações suaves

- [x] **Deploy Automatizado**
  - Vercel com deploy automático
  - GitHub Actions CI/CD
  - Variáveis de ambiente seguras
  - Build otimizado

### 🚧 **Em Desenvolvimento**
- [ ] **Sistema de Agendamentos Avançado**
  - Agenda semanal com horários
  - Solicitações via chat
  - Confirmação/rejeição automática
  - Lembretes automáticos

- [ ] **Notificações Push Nativas**
  - Service Workers
  - Notificações do sistema
  - Configurações personalizadas

- [ ] **Modo Escuro**
  - Toggle de tema
  - Persistência de preferência
  - Componentes adaptativos

### 📋 **Roadmap Futuro**
- [ ] **App Mobile Nativo**
  - React Native
  - Funcionalidades completas
  - Notificações push nativas

- [ ] **Sistema de Pagamentos**
  - Integração com gateways
  - Pagamentos seguros
  - Controle de transações

- [ ] **Integração com Mapas**
  - Google Maps API
  - Rotas e distâncias
  - Marcadores de localização

- [ ] **Sistema de Badges e Conquistas**
  - Gamificação
  - Metas e objetivos
  - Ranking de usuários

- [ ] **Analytics Avançado**
  - Métricas detalhadas
  - Relatórios personalizados
  - Insights de performance

---

## 🎯 **Diferenciais da Plataforma**

### **🚀 Tecnologia de Ponta**
- **Next.js 15.4.6** com App Router
- **TypeScript** para código robusto
- **Supabase** para backend completo
- **Tempo Real** para todas as interações

### **🔒 Segurança Máxima**
- **Row Level Security** no banco
- **Autenticação robusta** com Supabase
- **Validação rigorosa** de dados
- **Proteção contra ataques**

### **📱 Experiência do Usuário**
- **Interface moderna** e intuitiva
- **Responsividade total** para todos os dispositivos
- **Notificações em tempo real**
- **Performance otimizada**

### **🔄 Funcionalidades Únicas**
- **Sistema de recomendações** entre usuários
- **Avaliação dupla** (cliente e profissional)
- **Chat em tempo real** com acordos
- **Busca por proximidade** inteligente

---

## 📄 Licença

Este projeto é proprietário e não é open source. Todos os direitos reservados.

---

## 👨‍💻 Desenvolvedor

**Fabiano Schmits**
- GitHub: [@fabianoschmits](https://github.com/fabianoschmits)
- LinkedIn: [Fabiano Schmits](https://linkedin.com/in/fabianoschmits)
- Email: contato@conflar.com.br

---

<div align="center">

**🚀 ConfiLar - Conectando pessoas através da confiança**

*Plataforma completa para conectar clientes e profissionais de forma gratuita, segura e eficiente.*

</div>