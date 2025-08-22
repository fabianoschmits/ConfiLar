# Confilar v3 - Sistema de Gestão Empresarial

Sistema moderno de gestão empresarial construído com Next.js 15, TypeScript, Tailwind CSS e Supabase.

## 🚀 Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estado**: Zustand
- **Formulários**: React Hook Form + Zod
- **UI Components**: Radix UI + shadcn/ui
- **Notificações**: Sonner

## 📋 Pré-requisitos

- Node.js 18+ 
- npm, yarn ou pnpm
- Conta no Supabase

## 🔧 Configuração

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd confilar-v3
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase

#### 3.1 Crie um projeto no Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie uma nova conta ou faça login
- Crie um novo projeto
- Anote a URL e as chaves de API

#### 3.2 Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 3.3 Execute as migrações do banco
No painel do Supabase, vá para SQL Editor e execute o conteúdo do arquivo:
```
supabase/migrations/001_initial_schema.sql
```

### 4. Execute o projeto
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🏗️ Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── (auth)/           # Páginas de autenticação
│   ├── (public)/         # Páginas protegidas
│   └── layout.tsx        # Layout principal
├── components/            # Componentes reutilizáveis
│   ├── auth/             # Componentes de autenticação
│   ├── forms/            # Formulários
│   ├── layout/           # Componentes de layout
│   └── ui/               # Componentes UI base
├── contexts/              # Contextos React
├── hooks/                 # Hooks personalizados
├── lib/                   # Utilitários e configurações
├── stores/                # Estado global (Zustand)
├── types/                 # Tipos TypeScript
└── styles/                # Estilos globais
```

## 🔐 Funcionalidades de Autenticação

- ✅ Login com email/senha
- ✅ Registro de novos usuários
- ✅ Proteção de rotas
- ✅ Gerenciamento de sessão
- ✅ Perfil de usuário
- ✅ Logout

## 📱 Páginas Disponíveis

- **`/`** - Redireciona para dashboard ou auth
- **`/auth`** - Página de login/registro
- **`/dashboard`** - Dashboard principal (protegido)

## 🎨 Componentes UI

O projeto usa componentes baseados em Radix UI com estilização Tailwind:

- Button, Input, Label
- Card, Dialog, Tabs
- Form, Select, Textarea
- Avatar, Dropdown Menu

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras plataformas
Configure as variáveis de ambiente e execute:
```bash
npm run build
npm start
```

## 🔧 Desenvolvimento

### Scripts disponíveis
```bash
npm run dev          # Desenvolvimento com Turbopack
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificação de código
```

### Estrutura de commits
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação de código
- `refactor:` Refatoração
- `test:` Testes

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique a documentação
2. Procure por issues existentes
3. Crie uma nova issue com detalhes do problema

---

**Confilar v3** - Transformando a gestão empresarial com tecnologia moderna.
