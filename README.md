# 🏠 ConfiLar - Plataforma de Confiança Profissional

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Real--time-green?style=flat-square&logo=supabase)](https://supabase.com/)

> **Plataforma completa de conexão entre profissionais e clientes com sistema de confiança, avaliações e feed social em tempo real.**

## ✨ Funcionalidades Principais

### 🔒 Sistema de Confiança
- **Avaliações e Recomendações** - Sistema completo de feedback
- **Histórico Profissional** - Trajetória e conquistas
- **Sistema de Favoritos** - Salvar profissionais de interesse

### 📱 Feed Social em Tempo Real
- **Posts Automáticos** - Baseados em ações dos usuários
- **Interações Sociais** - Curtir, comentar e compartilhar
- **Notificações** - Alertas em tempo real
- **Chat Integrado** - Sistema de mensagens flutuante

### 🎨 Avatars Inteligentes
- **Geração Automática** - Baseada no nome do usuário
- **Atualização em Tempo Real** - Conforme usuário digita
- **Personalização por Gênero** - Cores e características únicas
- **Otimização de Performance** - Debounce e cache inteligente

## 🛠️ Tecnologias

### Frontend
- **Next.js 15.4.6** - Framework React com SSR/SSG
- **TypeScript 5.0** - Tipagem estática
- **Tailwind CSS 3.0** - Framework CSS utilitário
- **React Hook Form + Zod** - Formulários e validação
- **React Query** - Cache e sincronização de dados

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security (RLS)** - Segurança a nível de linha
- **Real-time Subscriptions** - Atualizações em tempo real

## 🚀 Instalação

### 1. Clone o Repositório
```bash
git clone https://github.com/fabianoschmits/ConfiLar.git
cd ConfiLar
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure as Variáveis de Ambiente
```bash
cp .env.example .env.local
```

Preencha o arquivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
```

### 4. Execute o Projeto
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📱 Páginas Principais

### 🏠 Públicas
- **`/`** - Landing page
- **`/auth`** - Autenticação
- **`/sobre`** - Sobre a plataforma

### 👤 Usuário
- **`/feed`** - Feed social principal
- **`/perfil/[id]`** - Perfil público
- **`/editarperfil`** - Edição de perfil
- **`/onboarding`** - Completar cadastro
- **`/favoritos`** - Lista de favoritos

### 🔍 Busca
- **`/buscar`** - Busca de profissionais
- **`/classificados`** - Anúncios e ofertas
- **`/avaliacoes`** - Sistema de avaliações

## 🔧 Funcionalidades Avançadas

### 🎨 Sistema de Avatars
```typescript
// Geração automática baseada no nome
const generateDicebearAvatar = async (name: string, gender: string) => {
  const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}&backgroundColor=transparent&size=100&facialHairProbability=${facialHairProbability}&hairColor=${hairColor}&skinColor=${skinColor}`
  return avatarUrl
}
```

### 📱 Feed Social
```typescript
// Posts automáticos baseados em ações
const createAutomaticPost = async (type: 'favorite' | 'recommendation' | 'review', data: any) => {
  const post = await supabase.from('feed_posts').insert({
    user_id: data.user_id,
    title: generatePostTitle(type, data),
    metadata: { type, ...data }
  })
}
```

### 💬 Chat Flutuante
```typescript
// Chat integrado em todas as páginas
const { openChat } = useFloatingChat()
const handleContact = (userId: string, userName: string) => {
  openChat(userId, userName)
}
```

## 📊 Sistema de Posts Automáticos

### 🎯 Tipos de Posts
- **🎉 Boas-vindas** - Novos usuários
- **❤️ Favoritos** - Adicionar aos favoritos
- **💡 Recomendações** - Recomendar profissionais
- **⭐ Avaliações** - Avaliar serviços
- **🏆 Conquistas** - Metas alcançadas

### ⚡ Performance
- **Debounce de 500ms** para evitar spam
- **Cache inteligente** com React Query
- **Lazy loading** de componentes
- **Otimização de imagens** automática

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes com coverage
npm run test:coverage

# Build de produção
npm run build
```

## 📦 Deploy

### 🚀 Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### ⚙️ Variáveis de Ambiente (Produção)
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_producao
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_producao
SUPABASE_SERVICE_ROLE_KEY=sua_chave_servico_producao
```

## 🤝 Contribuição

1. **Fork** o repositório
2. **Crie** uma branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

**Desenvolvido com ❤️ por [Fabiano Schmits](https://github.com/fabianoschmits)**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/fabianoschmits)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/fabianoschmits)

</div>