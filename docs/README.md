# 📚 **ConfiLar - Documentação Técnica**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/seuusuario/confilar)
[![Version](https://img.shields.io/badge/version-5.0.0-blue)](https://github.com/seuusuario/confilar)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)

## 🎯 **Visão Geral**

ConfiLar é uma plataforma marketplace que conecta profissionais a clientes de forma gratuita, priorizando avaliações e reputação. Desenvolvido com **Next.js 15**, **TypeScript**, **Supabase** e **React Query**.

## 🏗️ **Arquitetura**

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── api/               # API Routes
│   └── [pages]/           # Páginas da aplicação
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── layout/           # Componentes de layout
│   ├── forms/            # Formulários
│   └── [features]/       # Componentes por feature
├── hooks/                # Custom React Hooks
│   ├── queries/          # React Query hooks
│   └── [custom]/         # Hooks específicos
├── lib/                  # Utilitários e configurações
├── types/                # Definições TypeScript
└── contexts/             # React Contexts
```

## 🚀 **Tecnologias Principais**

### **Frontend:**
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **shadcn/ui** - Componentes base
- **React Query** - Cache e estado do servidor
- **Framer Motion** - Animações

### **Backend:**
- **Supabase** - BaaS (Database, Auth, Storage)
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security** - Segurança em nível de linha

### **Qualidade:**
- **Jest** - Testes unitários
- **Testing Library** - Testes de componentes
- **ESLint** - Linting
- **TypeScript** - Type checking

## 📦 **Instalação e Setup**

### **Pré-requisitos:**
- Node.js 18+
- npm ou yarn
- Conta Supabase

### **Setup Local:**

1. **Clone o repositório:**
```bash
git clone https://github.com/seuusuario/confilar.git
cd confilar
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env.local
# Configure suas credenciais do Supabase
```

4. **Execute o projeto:**
```bash
npm run dev
```

## 🧪 **Testes**

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Coverage report
npm run test:coverage

# Testes para CI
npm run test:ci
```

## 📊 **Scripts Disponíveis**

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting
npm run docs:api     # Gerar documentação da API
npm run docs:serve   # Servir documentação local
npm run analyze      # Análise de bundle
```

## 🔧 **Configuração**

### **Variáveis de Ambiente:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Opcional
ANALYZE=true                    # Bundle analysis
NEXT_PUBLIC_APP_ENV=development # Environment
```

## 🏛️ **Estrutura de Dados**

### **Principais Entidades:**

#### **Profiles (Usuários)**
```typescript
interface Profile {
  id: string
  email: string
  full_name: string
  user_type: 'client' | 'professional'
  location_state: string
  location_city: string
  bio?: string
  rating: number
  total_reviews: number
  is_verified: boolean
  is_available: boolean
  avatar_url?: string
  professional_services?: string[]
  created_at: string
  updated_at: string
}
```

#### **Classified Ads (Anúncios)**
```typescript
interface ClassifiedAd {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  location_state: string
  location_city: string
  is_active: boolean
  views: number
  created_at: string
  updated_at: string
}
```

#### **Reviews (Avaliações)**
```typescript
interface Review {
  id: string
  reviewer_id: string
  reviewed_id: string
  rating: number
  comment?: string
  pros?: string[]
  cons?: string[]
  created_at: string
}
```

## 🔐 **Autenticação e Segurança**

### **Fluxo de Autenticação:**
1. **Registro/Login** via Supabase Auth
2. **Verificação de email** obrigatória
3. **Criação automática de perfil**
4. **Row Level Security** para proteção de dados

### **Políticas de Segurança:**
- Usuários só podem editar seus próprios dados
- Mensagens privadas entre usuários
- Validação client-side e server-side
- Sanitização de inputs

## 🎨 **Design System**

### **Tema Moderno:**
- **Cores:** Paleta neutra com acentos azuis
- **Tipografia:** Inter (principal), Poppins (display)
- **Componentes:** Base shadcn/ui customizada
- **Responsividade:** Mobile-first approach

### **Componentes Base:**
- `Button` - Botões com variantes
- `Card` - Cards modernos
- `Input` - Campos de entrada
- `Modal` - Modais responsivos
- `Avatar` - Avatares de usuário

## 📈 **Performance**

### **Otimizações Implementadas:**
- **React Query** - Cache inteligente
- **Lazy Loading** - Componentes sob demanda
- **Code Splitting** - Bundles otimizados
- **Image Optimization** - Next.js Image
- **Memoization** - Hooks otimizados

### **Métricas Alvo:**
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **Bundle Size:** < 200KB (first load)

## 🔄 **Estado da Aplicação**

### **Gerenciamento de Estado:**
- **React Query** - Estado do servidor
- **React Context** - Estado global da UI
- **useState/useReducer** - Estado local
- **Local Storage** - Persistência local

### **Cache Strategy:**
```typescript
STATIC: 24h        // Estados, cidades
SEMI_STATIC: 10min // Perfis, anúncios
DYNAMIC: 2min      // Mensagens, notificações
REALTIME: 30s      // Contadores, status
```

## 🚀 **Deploy**

### **Vercel (Recomendado):**
```bash
npm run build
vercel --prod
```

### **Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 **Contribuição**

### **Padrões de Código:**
- **ESLint** + **Prettier** para formatação
- **Conventional Commits** para mensagens
- **TypeScript strict mode**
- **100% cobertura de testes** para funções críticas

### **Fluxo de Contribuição:**
1. Fork do repositório
2. Branch feature/bugfix
3. Commits seguindo convenção
4. Testes passando
5. Pull Request com descrição detalhada

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para detalhes.

## 📞 **Suporte**

- **Email:** suporte@confilar.com
- **Documentação:** [docs.confilar.com](https://docs.confilar.com)
- **Issues:** [GitHub Issues](https://github.com/seuusuario/confilar/issues)

---

**Desenvolvido com ❤️ pela equipe ConfiLar**

