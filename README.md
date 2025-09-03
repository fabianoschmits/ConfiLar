# ConfiLar v5

Plataforma de conexão entre clientes e profissionais de confiança.

## 🚀 Deploy Automático

Este projeto está configurado com deploy automático na Vercel. Qualquer push para a branch `master` irá automaticamente atualizar o site em produção.

**Teste de Webhook:** Verificando se o deploy automático está funcionando corretamente.

**✅ Webhook Confirmado:** A conexão entre GitHub e Vercel está ativa e funcionando!

**🎉 Deploy Automático Ativo:** Site atualizado automaticamente em 2m 4s!

## 🚀 Sobre o Projeto

ConfiLar é uma plataforma moderna desenvolvida com Next.js 14 que conecta profissionais qualificados com clientes que precisam de serviços. Oferece funcionalidades completas de gestão de perfis, classificados, notificações, agendamentos e sistema de reputação.

## ✨ Funcionalidades Principais

### 👤 Gestão de Usuários
- Cadastro e autenticação completa
- Perfis detalhados para profissionais e clientes
- Upload de fotos e documentos
- Sistema de verificação

### 📋 Classificados
- Criação e gerenciamento de anúncios
- Busca avançada por categoria e localização
- Sistema de recomendações
- Interação entre usuários

### 🔔 Notificações
- Sistema de notificações em tempo real
- Push notifications configuráveis
- Notificações de mensagens e agendamentos

### 📅 Agendamentos
- Sistema de agendamento profissional
- Calendário interativo
- Gerenciamento de horários

### 💬 Mensagens
- Chat integrado
- Sistema de mensagens privadas
- Notificações de conversas

### 📊 Dashboard
- Painel administrativo completo
- Estatísticas e métricas
- Gerenciamento de conteúdo

## 🛠️ Tecnologias Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Supabase** - Backend e banco de dados
- **Tailwind CSS** - Estilização
- **Shadcn/UI** - Componentes UI
- **PWA** - Progressive Web App

## 📱 Progressive Web App

O ConfiLar é uma PWA completa com:
- Instalação no dispositivo
- Funcionamento offline
- Notificações push
- Icones adaptativos
- Manifest configurado

## 🔧 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/confilar-v3.git
cd confilar-v3
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Configure o Supabase:
- Crie um projeto no Supabase
- Execute os scripts de configuração do banco
- Configure as chaves no arquivo `.env.local`

5. Execute o projeto:
```bash
npm run dev
```

## 📂 Estrutura do Projeto

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Páginas de autenticação
│   ├── _public/       # Páginas públicas
│   └── api/            # API Routes
├── components/         # Componentes React
│   ├── ui/            # Componentes base UI
│   ├── forms/         # Formulários
│   ├── layout/        # Layouts
│   └── notifications/ # Sistema de notificações
├── contexts/          # Context API
├── hooks/            # Custom hooks
├── lib/              # Utilitários
└── types/            # Tipos TypeScript
```

## 🎨 Design System

O projeto utiliza Shadcn/UI com design system consistente:
- Componentes padronizados
- Tema dark/light
- Design responsivo
- Acessibilidade WCAG

## 📊 Banco de Dados

O Supabase gerencia:
- Autenticação de usuários
- Perfis e configurações
- Classificados e interações
- Mensagens e notificações
- Sistema de reputação

## 🚀 Deploy

O projeto está configurado para deploy em:
- Vercel
- Netlify
- Outras plataformas de hosting

## 📝 Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Verificação de código
```

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o projeto, entre em contato através dos canais disponíveis.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**ConfiLar v3.0** - Conectando profissionais e clientes com excelência! ✨
