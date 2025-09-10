# 🏠 ConfiLar - Plataforma de Conexão entre Clientes e Profissionais

<div align="center">

![ConfiLar Logo](https://img.shields.io/badge/ConfiLar-v5-blue?style=for-the-badge&logo=home&logoColor=white)

**Conectando clientes e profissionais de forma confiável e eficiente**

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3.0-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

[![Deploy Status](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📋 Índice

- [🎯 Sobre o Projeto](#-sobre-o-projeto)
- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologias](#️-tecnologias)
- [🚀 Instalação](#-instalação)
- [⚙️ Configuração](#️-configuração)
- [📱 Funcionalidades Principais](#-funcionalidades-principais)
- [🎨 Interface](#-interface)
- [🔐 Autenticação](#-autenticação)
- [📊 Dashboard](#-dashboard)
- [💬 Sistema de Mensagens](#-sistema-de-mensagens)
- [⭐ Sistema de Avaliações](#-sistema-de-avaliações)
- [📅 Sistema de Agendamentos](#-sistema-de-agendamentos)
- [🔍 Busca por Proximidade](#-busca-por-proximidade)
- [📱 PWA (Progressive Web App)](#-pwa-progressive-web-app)
- [🏗️ Arquitetura](#️-arquitetura)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🔧 Scripts Disponíveis](#-scripts-disponíveis)
- [🌐 Deploy](#-deploy)
- [🤝 Contribuição](#-contribuição)
- [📄 Licença](#-licença)

---

## 🎯 Sobre o Projeto

**ConfiLar** é uma plataforma inovadora que conecta clientes e profissionais de serviços de forma gratuita, focando na confiança através de avaliações e reputação. A aplicação elimina intermediários, permitindo que profissionais ofereçam seus serviços diretamente aos clientes.

### 🎯 Objetivos Principais

- ✅ **Conexão Direta**: Eliminar intermediários entre clientes e profissionais
- ✅ **Gratuito**: Plataforma 100% gratuita para usuários
- ✅ **Confiabilidade**: Sistema robusto de avaliações e reputação
- ✅ **Proximidade**: Busca por localização geográfica
- ✅ **Mobile-First**: Interface otimizada para dispositivos móveis

---

## ✨ Funcionalidades

### 👥 Para Clientes
- 🔍 **Busca Inteligente**: Encontre profissionais por proximidade e especialidade
- ⭐ **Avaliações**: Avalie serviços recebidos
- 💬 **Chat Direto**: Comunicação direta com profissionais
- 📅 **Agendamentos**: Marque serviços facilmente
- ❤️ **Favoritos**: Salve profissionais preferidos
- 📱 **Notificações**: Receba atualizações em tempo real

### 🛠️ Para Profissionais
- 📊 **Dashboard Completo**: Métricas e estatísticas detalhadas
- 🎨 **Perfil Profissional**: Portfólio e informações detalhadas
- 📅 **Agenda Integrada**: Gerencie horários e disponibilidade
- 💰 **Controle de Ganhos**: Acompanhe receitas e crescimento
- ⭐ **Reputação**: Sistema de avaliações e badges
- 📱 **App Mobile**: Gerencie tudo pelo celular

---

## 🛠️ Tecnologias

### Frontend
- **Next.js 15.4.6** - Framework React com App Router
- **TypeScript 5.0** - Tipagem estática
- **Tailwind CSS 3.0** - Framework CSS utilitário
- **shadcn/ui** - Componentes de interface
- **Lucide React** - Ícones modernos
- **Phosphor Icons** - Biblioteca de ícones

### Backend & Database
- **Supabase 3.0** - Backend-as-a-Service
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security (RLS)** - Segurança de dados
- **Supabase Auth** - Autenticação
- **Supabase Storage** - Armazenamento de arquivos

### Deploy & DevOps
- **Vercel** - Deploy automático
- **GitHub Actions** - CI/CD
- **ESLint** - Linting de código
- **Prettier** - Formatação de código

---

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### 1. Clone o repositório
```bash
git clone https://github.com/fabianoschmits/ConfiLar-v5.git
cd ConfiLar-v5
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 4. Execute o projeto
```bash
npm run dev
# ou
yarn dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuração

### Configuração do Supabase

1. **Crie um projeto no Supabase**
2. **Execute os scripts SQL** na ordem:
   ```sql
   -- 1. Estrutura do banco
   backup-projeto-completo/scripts/database/conflar_database_complete.sql
   
   -- 2. Configurações de storage
   backup-projeto-completo/scripts/storage/supabase-storage-setup.sql
   
   -- 3. Correções de RLS (se necessário)
   fix-supabase-errors.sql
   ```

3. **Configure as políticas RLS** conforme necessário

### Configuração do Vercel

1. **Conecte o repositório GitHub**
2. **Configure as variáveis de ambiente**
3. **Deploy automático** será ativado

---

## 📱 Funcionalidades Principais

### 🔐 Sistema de Autenticação Robusto
- **Login/Logout** com redirecionamento inteligente
- **Cadastro** com seleção de avatar (upload ou pixel-art)
- **Recuperação de senha** via email
- **Sessão persistente** com refresh automático
- **Proteção de rotas** com middleware

### 📊 Dashboard Inteligente
- **Métricas em tempo real**: visualizações, contatos, avaliações
- **Gráficos interativos**: crescimento ao longo do tempo
- **Atividade recente**: últimas interações e eventos
- **Diferenciação por tipo**: cliente vs profissional

### 💬 Sistema de Mensagens Avançado
- **Chat em tempo real** com Supabase Realtime
- **Notificações push** para novas mensagens
- **Histórico persistente** de conversas
- **Status de leitura** e timestamps
- **Interface responsiva** para mobile

### ⭐ Sistema de Avaliações
- **Avaliações de 1-5 estrelas** com comentários
- **Sistema de reputação** com badges
- **Filtros por avaliação** na busca
- **Estatísticas agregadas** no perfil

### 📅 Sistema de Agendamentos
- **Agenda semanal** com horários disponíveis
- **Solicitações de agendamento** via chat
- **Confirmação/Rejeição** pelo profissional
- **Notificações** de lembretes

### 🔍 Busca por Proximidade
- **Geolocalização** automática do usuário
- **Busca por distância** (km)
- **Filtros avançados**: tipo de serviço, avaliação, disponibilidade
- **Mapa integrado** com marcadores

---

## 🎨 Interface

### Design System
- **Tema consistente** com cores da marca
- **Componentes reutilizáveis** (shadcn/ui)
- **Responsividade** mobile-first
- **Acessibilidade** WCAG 2.1
- **Dark mode** (em desenvolvimento)

### Componentes Principais
- **LoadingOverlay**: Transições suaves entre páginas
- **NavigationLink**: Links com loading automático
- **UserAvatar**: Avatares com fallback
- **SearchFilters**: Filtros avançados de busca
- **ChatWidget**: Widget de chat flutuante

---

## 🏗️ Arquitetura

### Padrões Utilizados
- **App Router** (Next.js 13+)
- **Server Components** e **Client Components**
- **Context API** para estado global
- **Custom Hooks** para lógica reutilizável
- **Middleware** para proteção de rotas

### Estrutura de Dados
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
  // ... outros campos
}

interface Conversation {
  id: string
  client_id: string
  professional_id: string
  last_message_at: string
  created_at: string
}

interface Review {
  id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string
  created_at: string
}
```

---

## 📁 Estrutura do Projeto

```
ConfiLar-v5/
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── (auth)/            # Rotas de autenticação
│   │   ├── _public/           # Páginas públicas
│   │   ├── api/               # API Routes
│   │   └── globals.css        # Estilos globais
│   ├── components/             # Componentes React
│   │   ├── ui/                # Componentes base (shadcn/ui)
│   │   ├── layout/            # Componentes de layout
│   │   ├── forms/             # Formulários
│   │   ├── chat/              # Sistema de chat
│   │   └── notifications/     # Sistema de notificações
│   ├── hooks/                 # Custom Hooks
│   ├── contexts/              # Context Providers
│   ├── lib/                   # Utilitários e configurações
│   └── types/                 # Definições TypeScript
├── public/                    # Arquivos estáticos
├── backup-projeto-completo/   # Scripts e documentação
└── docs/                      # Documentação adicional
```

---

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting do código

# Banco de dados
npm run db:setup     # Configuração inicial
npm run db:migrate   # Executar migrações
npm run db:seed      # Popular com dados de teste

# Deploy
npm run deploy       # Deploy para Vercel
npm run preview      # Preview do build
```

---

## 🌐 Deploy

### Vercel (Recomendado)
1. **Conecte o repositório** no Vercel
2. **Configure as variáveis** de ambiente
3. **Deploy automático** a cada push

### Outras Plataformas
- **Netlify**: Compatível com Next.js
- **Railway**: Deploy com banco incluído
- **DigitalOcean**: VPS com Docker

---

## 🤝 Contribuição

### Como Contribuir
1. **Fork** o projeto
2. **Crie uma branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra um Pull Request**

### Padrões de Código
- **ESLint** configurado
- **Prettier** para formatação
- **Conventional Commits** para mensagens
- **TypeScript** obrigatório
- **Testes** (em desenvolvimento)

---

## 📊 Status do Projeto

### ✅ Funcionalidades Implementadas
- [x] Sistema de autenticação completo
- [x] Dashboard com métricas
- [x] Sistema de mensagens em tempo real
- [x] Sistema de avaliações
- [x] Busca por proximidade
- [x] PWA básico
- [x] Deploy automatizado

### 🚧 Em Desenvolvimento
- [ ] Sistema de pagamentos
- [ ] Notificações push avançadas
- [ ] Modo escuro
- [ ] Testes automatizados
- [ ] Documentação da API

### 📋 Roadmap
- [ ] App mobile nativo (React Native)
- [ ] Sistema de agendamentos avançado
- [ ] Integração com mapas
- [ ] Sistema de badges e conquistas
- [ ] Analytics avançado

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Desenvolvedor

**Fabiano Schmits**
- GitHub: [@fabianoschmits](https://github.com/fabianoschmits)
- LinkedIn: [Fabiano Schmits](https://linkedin.com/in/fabianoschmits)
- Email: contato@conflar.com.br

---

<div align="center">

**⭐ Se este projeto te ajudou, considere dar uma estrela! ⭐**

[![GitHub stars](https://img.shields.io/github/stars/fabianoschmits/ConfiLar-v5?style=social)](https://github.com/fabianoschmits/ConfiLar-v5/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/fabianoschmits/ConfiLar-v5?style=social)](https://github.com/fabianoschmits/ConfiLar-v5/network)

</div>