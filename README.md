# 🏠 ConfiLar - Plataforma de Confiança Profissional

> **Sistema completo de conexão entre profissionais e clientes com sistema de confiança, avaliações, feed social em tempo real e economia de pontos.**

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.55.0-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📋 Índice

- [🎯 Visão Geral](#-visão-geral)
- [✨ Funcionalidades](#-funcionalidades)
- [💰 Sistema de Pontos (ConfiPoints)](#-sistema-de-pontos-confipoints)
- [🌟 Anúncios e Posts Premium](#-anúncios-e-posts-premium)
- [🎨 Funcionalidades de UX](#-funcionalidades-de-ux)
- [🚀 Tecnologias](#-tecnologias)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🗄️ Banco de Dados](#️-banco-de-dados)
- [🧪 Testes](#-testes)
- [📊 Métricas do Projeto](#-métricas-do-projeto)
- [🔒 Segurança](#-segurança)
- [📱 PWA](#-pwa)
- [🚀 Deploy](#-deploy)
- [📄 Licença](#-licença)

---

## 🎯 Visão Geral

O **ConfiLar** é uma plataforma inovadora que conecta profissionais qualificados com clientes, oferecendo um ecossistema completo de confiança baseado em:

- ✅ **Avaliações e Recomendações** - Sistema transparente de feedback
- ✅ **Feed Social em Tempo Real** - Interações sociais instantâneas
- ✅ **Sistema de Economia Interna** - Pontos e gamificação
- ✅ **Chat Integrado** - Comunicação direta entre usuários
- ✅ **Classificados Premium** - Anúncios destacados
- ✅ **PWA Completo** - App instalável com suporte offline
- ✅ **Conformidade LGPD** - Segurança e privacidade garantidas

---

## ✨ Funcionalidades

### 🔐 Autenticação e Perfil

#### Sistema de Autenticação Completo
- ✅ Cadastro único para clientes e profissionais
- ✅ Verificação obrigatória por email
- ✅ Recuperação de senha com OTP
- ✅ Onboarding inteligente com avatar automático
- ✅ Reautenticação segura (OTP) para ações sensíveis
- ✅ Troca de email com verificação
- ✅ Rate limiting para segurança

#### Perfil de Usuário
- ✅ Perfil completo personalizável
- ✅ Avatar inteligente (geração automática baseada no nome)
- ✅ Upload de foto de perfil
- ✅ Informações pessoais e profissionais
- ✅ Localização (Estado, Cidade, Bairro)
- ✅ Sistema de badges (Bronze, Silver, Gold, Platinum, Diamond)
- ✅ Verificação de perfil com documentos
- ✅ Histórico de atividades
- ✅ Estatísticas de engajamento

---

### 💬 Comunicação em Tempo Real

#### Chat Flutuante
- ✅ Chat disponível em todas as páginas
- ✅ Mensagens em tempo real (Supabase Realtime)
- ✅ Histórico completo de conversas
- ✅ Status de leitura (lida/não lida)
- ✅ Indicadores de digitação
- ✅ Mensagens de sistema
- ✅ Solicitação de avaliação
- ✅ Propostas e acordos de serviço

#### Notificações Inteligentes
- ✅ Notificações em tempo real via WebSocket
- ✅ Push notifications nativas (PWA)
- ✅ Sistema de sons personalizados por tipo
- ✅ Configurações granulares de notificações
- ✅ Modo silencioso (horários configuráveis)
- ✅ Categorização de notificações (mensagens, avaliações, sistema, etc.)
- ✅ Badge de contador não lidas

---

### 📱 Feed Social

#### Sistema de Posts
- ✅ Posts automáticos de boas-vindas
- ✅ Posts de avaliação automáticos
- ✅ Posts de recomendação
- ✅ Posts premium (destacados)
- ✅ Sistema de curtidas com pontos
- ✅ Comentários e respostas
- ✅ Menções (@usuario)
- ✅ Compartilhamento de posts
- ✅ Filtros por localização
- ✅ Sistema de trending

#### Interações
- ✅ Curtidas premium (com pontos)
- ✅ Reações (like, heart, laugh, fire)
- ✅ Comentários em cascata
- ✅ Compartilhamentos rastreados
- ✅ Visualizações contabilizadas

---

### 🏢 Funcionalidades Profissionais

#### Portfólio Digital
- ✅ Upload de projetos realizados
- ✅ Galeria de trabalhos
- ✅ Categorização por serviço
- ✅ Contagem de visualizações
- ✅ Links diretos para projetos

#### Sistema de Disponibilidade
- ✅ Status online/offline em tempo real
- ✅ Horários de atendimento configuráveis
- ✅ Disponibilidade por região
- ✅ Especialidades e serviços oferecidos
- ✅ Experiência profissional documentada

---

### 💰 Sistema de Economia e Pontos (ConfiPoints)

#### Sistema de Referral
- ✅ Código de indicação único por usuário
- ✅ Rastreamento completo de indicações
- ✅ Sistema de marcos (perfil completo, primeiro post, primeira avaliação, 30 dias ativo)
- ✅ Ranking público de indicadores
- ✅ Histórico detalhado de pontos
- ✅ Níveis: Bronze, Silver, Gold, Platinum, Diamond
- ✅ Badges e conquistas

#### Economia de Pontos
- ✅ Pontos ganhos por indicações
- ✅ Pontos por curtidas premium
- ✅ Histórico completo de transações
- ✅ Saldo de pontos
- ✅ Compras de pacotes de pontos (PIX)
- ✅ Loja de pontos (anúncios premium, etc.)
- ✅ Transferência de pontos entre usuários
- ✅ Saque de pontos (conversão para dinheiro)

#### Anúncios Premium
- ✅ Anúncios destacados com pontos
- ✅ Destaque visual personalizado
- ✅ Maior visibilidade
- ✅ Expiração automática
- ✅ Renovação de anúncios

---

## 💰 Sistema de Pontos (ConfiPoints)

### 📈 Como Ganhar Pontos

O sistema de pontos **ConfiPoints** oferece múltiplas formas de ganhar pontos através de atividades na plataforma:

#### 🎯 Sistema de Referral (Indicações)

**1. Pessoa Indicada se Cadastra**
- **Pontos:** +200 pontos
- **Quando:** Cada vez que alguém se cadastra usando seu código de indicação
- **Limite:** Ilimitado

**2. Pessoa Indicada Completa Perfil**
- **Pontos:** +150 pontos
- **Quando:** Pessoa indicada completa 100% do perfil
- **Limite:** Por indicação

**3. Pessoa Indicada Faz Primeiro Post**
- **Pontos:** +100 pontos
- **Quando:** Pessoa indicada cria primeiro post no feed
- **Limite:** Por indicação

**4. Pessoa Indicada Faz Primeira Avaliação**
- **Pontos:** +100 pontos
- **Quando:** Pessoa indicada avalia alguém pela primeira vez
- **Limite:** Por indicação

**5. Pessoa Indicada Fica Ativa por 30 Dias**
- **Pontos:** +300 pontos
- **Quando:** Pessoa indicada completa 30 dias de atividade
- **Limite:** Por indicação

**Total Máximo por Indicação:** 850 pontos

---

#### 💬 Sistema de Interações Sociais

**1. Receber Curtida em Post**
- **Pontos:** +2 pontos
- **Limite Diário:** 500 pontos (até 250 curtidas/dia)

**2. Receber Comentário em Post**
- **Pontos:** +5 pontos
- **Limite Diário:** 200 pontos (até 40 comentários/dia)

**3. Curtir um Post (Custo)**
- **Pontos:** -2 pontos
- **Nota:** Curtir posts normais custa pontos

**4. Comentar um Post (Custo)**
- **Pontos:** -1 ponto
- **Nota:** Comentar posts normais custa pontos

---

#### ✅ Sistema de Atividades

**1. Login Diário**
- **Pontos:** +10 pontos
- **Limite Diário:** 1 vez por dia
- **Quando:** Primeiro acesso do dia

**2. Completar Perfil 100%**
- **Pontos:** +150 pontos
- **Limite:** Uma vez na vida
- **Quando:** Todas as informações do perfil preenchidas

**3. Primeiro Post no Feed**
- **Pontos:** +50 pontos
- **Limite:** Uma vez na vida
- **Quando:** Primeiro post criado

**4. Criar Anúncio de Serviço**
- **Pontos:** +100 pontos
- **Limite Diário:** 10 anúncios (até 1.000 pontos/dia)
- **Quando:** Publica anúncio em classificados

---

#### 🎖️ Sistema de Níveis e Conquistas

**Subir de Nível**
- **Pontos:** Bônus variável
- **Níveis:** Bronze → Silver → Gold → Platinum → Diamond
- **Quando:** Ao atingir limites de pontos

**Alcançar Marco**
- **Pontos:** Bônus especial
- **Quando:** Conquistas importantes (ex: 100 indicações, 1000 posts, etc.)

---

### 💳 Como Gastar Pontos

#### 1. Curtidas Premium
- **Custo:** 10 pontos por curtida
- **Benefício:** Curtida destacada que transfere pontos para o dono do post
- **Quando:** Ao curtir um post premium

#### 2. Posts Premium
- **1 dia:** 1.000 pontos (R$ 10,00)
- **7 dias:** 6.000 pontos (R$ 60,00)
- **14 dias:** 10.000 pontos (R$ 100,00)
- **30 dias:** 18.000 pontos (R$ 180,00)
- **Benefício:** Post destacado no topo do feed com maior visibilidade

#### 3. Anúncios Premium
- **1 dia:** 2.000 pontos (R$ 20,00)
- **7 dias:** 12.000 pontos (R$ 120,00)
- **14 dias:** 20.000 pontos (R$ 200,00)
- **30 dias:** 35.000 pontos (R$ 350,00)
- **Benefício:** Anúncio destacado no topo da lista de classificados

#### 4. Transferências
- **Mínimo:** 100 pontos
- **Benefício:** Transferir pontos para outros usuários
- **Uso:** Presentear, pagar, etc.

#### 5. Loja de Pontos
- **Badges VIP:** Preços variados
- **Funcionalidades Premium:** Preços variados

---

### 💰 Conversão de Pontos

- **Taxa:** R$ 1,00 = 100 pontos
- **Compra:** Pacotes disponíveis via PIX
- **Saque:** Conversão de pontos para dinheiro (mínimo 10.000 pontos)

---

## 🌟 Anúncios e Posts Premium

### 📢 Anúncios Premium

Os **Anúncios Premium** são uma forma de destacar seu anúncio de serviço na plataforma, garantindo maior visibilidade e mais oportunidades de negócio.

#### Como Criar um Anúncio Premium

**1. Acessar a Página de Anúncios Premium**
- Vá para `/confipoints/anuncios-premium`
- Ou clique em "Criar Anúncio Premium" nos Classificados

**2. Preencher Informações do Anúncio**
- **Título:** Nome do seu serviço
- **Descrição:** Detalhes completos do serviço
- **Categoria:** Tipo de serviço oferecido
- **Localização:** Estado e cidade
- **Tipo:** Oferta ou Procurar serviço
- **Imagens:** Fotos do serviço/trabalho
- **Preço:** Faixa de preço (opcional)
- **Contato:** Telefone e email

**3. Escolher Duração do Premium**
- **1 dia** - 2.000 pontos (R$ 20,00)
- **7 dias** - 12.000 pontos (R$ 120,00) ⭐ **Melhor custo-benefício**
- **14 dias** - 20.000 pontos (R$ 200,00)
- **30 dias** - 35.000 pontos (R$ 350,00) ⭐ **Maior desconto**

**4. Verificar Saldo**
- O sistema verifica automaticamente se você tem pontos suficientes
- Se não tiver, pode comprar pontos via PIX

**5. Publicar**
- Clique em "Criar Anúncio Premium"
- Os pontos são debitados automaticamente
- O anúncio aparece destacado no topo da lista

#### Benefícios do Anúncio Premium

- ✅ **Destaque Visual:** Borda dourada e destaque no topo
- ✅ **Maior Visibilidade:** Aparece antes dos anúncios normais
- ✅ **Mais Visualizações:** Até 5x mais visualizações
- ✅ **Expiração Automática:** Remove destaque quando expira
- ✅ **Renovação Fácil:** Pode renovar antes de expirar

#### Renovação de Anúncios

- Acesse "Meus Anúncios"
- Clique em "Renovar" no anúncio que deseja
- Escolha nova duração
- Os pontos são debitados automaticamente

---

### 📝 Posts Premium

Os **Posts Premium** são posts destacados no feed social que aparecem no topo para todos os usuários, garantindo máxima visibilidade para seu conteúdo.

#### Como Criar um Post Premium

**1. Acessar a Página de Posts Premium**
- Vá para `/confipoints/posts-premium`
- Ou clique em "Criar Post Premium" no Feed

**2. Criar o Conteúdo**
- **Título:** Título chamativo do post
- **Descrição:** Conteúdo completo do post
- **Imagens:** Fotos relevantes (opcional)
- **Localização:** Cidade e estado (opcional)
- **Categoria:** Tipo de serviço (opcional)

**3. Escolher Duração do Premium**
- **1 dia** - 1.000 pontos (R$ 10,00)
- **7 dias** - 6.000 pontos (R$ 60,00) ⭐ **Melhor custo-benefício**
- **14 dias** - 10.000 pontos (R$ 100,00)
- **30 dias** - 18.000 pontos (R$ 180,00) ⭐ **Maior desconto**

**4. Verificar Saldo**
- O sistema verifica automaticamente se você tem pontos suficientes
- Se não tiver, pode comprar pontos via PIX

**5. Publicar**
- Clique em "Criar Post Premium"
- Os pontos são debitados automaticamente
- O post aparece destacado no topo do feed

#### Benefícios do Post Premium

- ✅ **Destaque Visual:** Borda dourada e badge "Premium"
- ✅ **Topo do Feed:** Aparece antes de todos os posts
- ✅ **Maior Engajamento:** Até 10x mais curtidas e comentários
- ✅ **Visibilidade Garantida:** Todos os usuários veem primeiro
- ✅ **Expiração Automática:** Remove destaque quando expira
- ✅ **Renovação Fácil:** Pode renovar antes de expirar

#### Renovação de Posts

- Acesse "Meus Posts"
- Clique em "Renovar" no post que deseja
- Escolha nova duração
- Os pontos são debitados automaticamente

---

### ❤️ Curtidas Premium

As **Curtidas Premium** são uma forma especial de curtir posts, transferindo pontos para o dono do post e destacando sua curtida.

#### Como Fazer uma Curtida Premium

**1. Encontrar um Post**
- Navegue pelo feed social
- Encontre um post que deseja curtir de forma premium

**2. Curtir com Pontos**
- Clique no botão de curtida premium (ícone especial)
- Confirme o gasto de 10 pontos
- Sua curtida aparece destacada

#### Benefícios da Curtida Premium

- ✅ **Destaque:** Sua curtida aparece destacada no post
- ✅ **Transferência:** O dono do post recebe pontos
- ✅ **Visibilidade:** Seu nome aparece em destaque
- ✅ **Engajamento:** Ajuda a promover o conteúdo

---

## 🎨 Funcionalidades de UX

O ConfiLar foi desenvolvido pensando na melhor experiência do usuário, com recursos modernos e intuitivos que facilitam o uso da plataforma.

### 🎨 Interface e Design

#### Design Moderno e Responsivo
- ✅ **Design Responsivo:** Funciona perfeitamente em desktop, tablet e mobile
- ✅ **Interface Limpa:** Design minimalista e profissional
- ✅ **Cores Consistentes:** Paleta de cores harmoniosa em toda a plataforma
- ✅ **Tipografia Legível:** Fontes otimizadas para leitura
- ✅ **Espaçamento Adequado:** Elementos bem organizados e espaçados

#### Tema Dark/Light
- ✅ **Modo Escuro:** Interface com tema escuro para uso noturno
- ✅ **Modo Claro:** Interface com tema claro para uso diurno
- ✅ **Troca Automática:** Respeita preferências do sistema
- ✅ **Persistência:** Lembra da escolha do usuário

#### Navegação Intuitiva
- ✅ **Menu Lateral:** Navegação fácil e rápida
- ✅ **Breadcrumbs:** Mostra localização atual na plataforma
- ✅ **Menu Rápido:** Acesso rápido às principais funcionalidades
- ✅ **Busca Global:** Encontre qualquer conteúdo rapidamente

---

### ⚡ Performance e Velocidade

#### Carregamento Rápido
- ✅ **Lazy Loading:** Carrega conteúdo conforme necessário
- ✅ **Image Optimization:** Imagens otimizadas automaticamente
- ✅ **Code Splitting:** Código dividido para carregar mais rápido
- ✅ **Cache Inteligente:** Dados em cache para acesso rápido

#### Feedback Visual
- ✅ **Loading States:** Indicadores de carregamento claros
- ✅ **Skeleton Screens:** Placeholders durante carregamento
- ✅ **Progress Bars:** Barras de progresso para ações longas
- ✅ **Spinners:** Indicadores de processamento

---

### 🔔 Notificações e Alertas

#### Sistema de Notificações Inteligente
- ✅ **Notificações em Tempo Real:** Receba atualizações instantâneas
- ✅ **Sons Personalizados:** Diferentes sons para cada tipo de notificação
- ✅ **Badges Contadores:** Veja quantas notificações não lidas
- ✅ **Agrupamento:** Notificações agrupadas por tipo
- ✅ **Configurações Granulares:** Controle total sobre notificações

#### Toast Messages
- ✅ **Feedback Imediato:** Confirmação de ações
- ✅ **Mensagens Claras:** Textos objetivos e informativos
- ✅ **Auto-dismiss:** Fecham automaticamente após alguns segundos
- ✅ **Posicionamento:** Aparecem em local não intrusivo

---

### 💬 Comunicação Facilitada

#### Chat Flutuante
- ✅ **Sempre Acessível:** Chat disponível em todas as páginas
- ✅ **Minimizável:** Pode minimizar enquanto navega
- ✅ **Indicadores Visuais:** Veja quando há novas mensagens
- ✅ **Histórico Completo:** Todas as conversas salvas
- ✅ **Busca:** Encontre conversas antigas rapidamente

#### Mensagens em Tempo Real
- ✅ **Instantâneo:** Mensagens chegam imediatamente
- ✅ **Status de Leitura:** Veja se a mensagem foi lida
- ✅ **Digitando...:** Veja quando o outro está digitando
- ✅ **Notificações Push:** Receba notificações mesmo com app fechado

---

### 🔍 Busca e Filtros

#### Busca Avançada
- ✅ **Busca Rápida:** Encontre usuários, posts e anúncios
- ✅ **Filtros Múltiplos:** Combine vários filtros
- ✅ **Filtros Salvos:** Salve filtros favoritos
- ✅ **Busca por Localização:** Encontre profissionais próximos
- ✅ **Busca por Categoria:** Filtre por tipo de serviço

#### Filtros Inteligentes
- ✅ **Sugestões:** O sistema sugere filtros relevantes
- ✅ **Histórico:** Lembra de buscas anteriores
- ✅ **Filtros Rápidos:** Botões para filtros mais usados
- ✅ **Limpar Filtros:** Remova todos os filtros com um clique

---

### 📱 Experiência Mobile

#### PWA Completo
- ✅ **App Instalável:** Instale como app nativo
- ✅ **Offline:** Funciona mesmo sem internet
- ✅ **Notificações Push:** Receba notificações como app
- ✅ **Tela Inicial:** Acesso rápido pela tela inicial

#### Gestos e Touch
- ✅ **Swipe:** Gestos intuitivos para ações rápidas
- ✅ **Pull to Refresh:** Puxe para atualizar conteúdo
- ✅ **Touch Optimized:** Botões e áreas toque otimizados
- ✅ **Zoom:** Imagens podem ser ampliadas

---

### 🎯 Onboarding e Tutoriais

#### Onboarding Inteligente
- ✅ **Passo a Passo:** Guia para novos usuários
- ✅ **Tutoriais Interativos:** Aprenda usando a plataforma
- ✅ **Dicas Contextuais:** Dicas aparecem quando necessário
- ✅ **Progresso Visual:** Veja seu progresso no onboarding

#### Help Center
- ✅ **Central de Ajuda:** Encontre respostas rapidamente
- ✅ **FAQ:** Perguntas frequentes respondidas
- ✅ **Vídeos Tutoriais:** Aprenda visualmente
- ✅ **Suporte:** Entre em contato com suporte

---

### ♿ Acessibilidade

#### Recursos de Acessibilidade
- ✅ **Navegação por Teclado:** Use sem mouse
- ✅ **Screen Readers:** Compatível com leitores de tela
- ✅ **Contraste:** Cores com bom contraste
- ✅ **Tamanho de Fonte:** Ajustável pelo navegador
- ✅ **ALT Text:** Imagens com texto alternativo

---

### 🔄 Sincronização e Backup

#### Sincronização Automática
- ✅ **Cloud Sync:** Dados sincronizados automaticamente
- ✅ **Multi-device:** Acesse de qualquer dispositivo
- ✅ **Backup Automático:** Dados sempre seguros
- ✅ **Recovery:** Recupere dados perdidos facilmente

---

### 🔍 Busca e Classificados

#### Sistema de Busca Avançada
- ✅ Busca por texto livre
- ✅ Filtros por localização (Estado, Cidade)
- ✅ Filtros por categoria de serviço
- ✅ Filtros por tipo (oferta/solicitação)
- ✅ Busca por proximidade
- ✅ Apenas profissionais verificados
- ✅ Ordenação por relevância

#### Classificados
- ✅ Anúncios de ofertas de serviços
- ✅ Solicitações de serviços
- ✅ Categorização completa
- ✅ Upload de imagens
- ✅ Anúncios premium (destaque)
- ✅ Contato direto via chat
- ✅ Visualizações contabilizadas

---

### ⭐ Avaliações e Recomendações

#### Sistema de Avaliações
- ✅ Avaliações detalhadas (pessoa, trabalho, pontualidade, qualidade)
- ✅ Comentários e pontos positivos/negativos
- ✅ Respostas do profissional
- ✅ Avaliações verificadas
- ✅ Histórico completo
- ✅ Posts automáticos de avaliações

#### Sistema de Recomendações
- ✅ Recomendações públicas entre usuários
- ✅ Recomendações de cliente para profissional
- ✅ Recomendações de profissional para cliente
- ✅ Aparecem no perfil recomendado
- ✅ Posts automáticos de recomendações

---

### 📊 Analytics e Estatísticas

#### Para Profissionais
- ✅ Visualizações de perfil
- ✅ Mensagens recebidas
- ✅ Avaliações recebidas
- ✅ Favoritos (quantos salvaram o perfil)
- ✅ Métricas de engajamento
- ✅ Histórico de atividades

#### Dashboard Administrativo
- ✅ Estatísticas de usuários
- ✅ Estatísticas de posts
- ✅ Estatísticas de mensagens
- ✅ Métricas de crescimento
- ✅ Sistema de denúncias
- ✅ Gerenciamento de banimentos
- ✅ Analytics de pontos
- ✅ Logs do sistema

---

### 🛡️ Segurança e Conformidade

#### LGPD (Lei Geral de Proteção de Dados)
- ✅ Política de Privacidade completa
- ✅ Termos de Uso detalhados
- ✅ Banner de consentimento de cookies
- ✅ Portabilidade de dados (exportação JSON)
- ✅ Direito ao esquecimento (exclusão completa)
- ✅ Configurações de privacidade

#### Sistema de Denúncias
- ✅ Denúncia de usuários
- ✅ Denúncia de posts
- ✅ Denúncia de mensagens
- ✅ Denúncia de classificados
- ✅ Moderação administrativa
- ✅ Histórico de denúncias do usuário

#### Segurança Técnica
- ✅ Row Level Security (RLS) no Supabase
- ✅ Rate limiting em APIs
- ✅ Validação de dados com Zod
- ✅ Sanitização de inputs
- ✅ Proteção CSRF
- ✅ Error boundaries

---

### 📱 PWA (Progressive Web App)

#### Funcionalidades PWA
- ✅ App instalável (Android, iOS, Desktop)
- ✅ Service Worker para cache
- ✅ Funcionalidades offline
- ✅ Push notifications nativas
- ✅ Ícones e splash screens
- ✅ Tema personalizado
- ✅ Sincronização automática

#### Offline
- ✅ Cache de páginas essenciais
- ✅ Dados offline (perfil, conversas, favoritos)
- ✅ Indicadores visuais de conexão
- ✅ Sincronização quando online

---

## 🚀 Tecnologias

### Frontend

- **Framework:** Next.js 15.4.6 (App Router)
- **UI Library:** React 19.1.0
- **Linguagem:** TypeScript 5.0
- **Estilização:** Tailwind CSS 3.4.0
- **Componentes:** Radix UI (20+ componentes)
- **Ícones:** Lucide React, Heroicons, Phosphor Icons, Tabler Icons
- **Animações:** Framer Motion 12.23.24
- **Formulários:** React Hook Form 7.62.0 + Zod 4.0.17
- **Estado Global:** Zustand 5.0.7
- **Cache/Estado:** TanStack React Query 5.90.9
- **Internacionalização:** next-intl 4.5.5 (pt-BR, en)
- **Tema:** next-themes 0.4.6 (dark/light)
- **Toast:** Sonner 2.0.7
- **Gráficos:** Chart.js 4.5.0, Recharts 2.15.4

### Backend

- **BaaS:** Supabase 2.55.0
- **Banco de Dados:** PostgreSQL 17.4.1
- **Autenticação:** Supabase Auth
- **Storage:** Supabase Storage
- **Realtime:** Supabase Realtime (WebSockets)
- **Edge Functions:** Supabase Edge Functions
- **Segurança:** Row Level Security (RLS)

### PWA e Mobile

- **Service Worker:** Custom implementation
- **Push Notifications:** Web Push API
- **Cache Strategy:** Network-first, Cache-fallback
- **Manifest:** Web App Manifest
- **Offline Support:** IndexedDB + Cache API

### Ferramentas de Desenvolvimento

- **Linting:** ESLint 9
- **Formatação:** Prettier
- **Testes Unitários:** Jest 30.1.3
- **Testes E2E:** Playwright 1.40.0
- **Type Checking:** TypeScript
- **Git Hooks:** Husky 9.1.7
- **Commit Linting:** Commitlint
- **CI/CD:** GitHub Actions

---

## 📁 Estrutura do Projeto

```
confilar/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Rotas de autenticação
│   │   ├── api/                 # API Routes (50+ endpoints)
│   │   │   ├── admin/          # Endpoints administrativos
│   │   │   ├── auth/           # Autenticação
│   │   │   ├── economy/        # Sistema de economia
│   │   │   ├── lgpd/           # LGPD (exportação, exclusão)
│   │   │   ├── notifications/  # Notificações
│   │   │   ├── payment/        # Pagamentos (AbacatePay)
│   │   │   ├── points/         # Sistema de pontos
│   │   │   ├── posts/          # Posts
│   │   │   └── referrals/      # Sistema de indicações
│   │   ├── admin/              # Dashboard administrativo
│   │   ├── classificados/      # Classificados
│   │   ├── confipoints/        # Sistema de pontos
│   │   ├── feed/               # Feed social
│   │   ├── perfil/             # Perfis de usuários
│   │   └── ...                 # Outras páginas
│   ├── components/             # Componentes React (215+ arquivos)
│   │   ├── admin/             # Componentes administrativos
│   │   ├── auth/              # Autenticação
│   │   ├── chat/              # Sistema de chat
│   │   ├── classifieds/       # Classificados
│   │   ├── layout/            # Layouts
│   │   ├── lgpd/              # LGPD
│   │   ├── notifications/     # Notificações
│   │   ├── points/            # Pontos
│   │   ├── referral/          # Referral
│   │   ├── timeline/          # Timeline/Feed
│   │   └── ui/                # Componentes UI base (69 arquivos)
│   ├── contexts/              # React Contexts (4 arquivos)
│   ├── hooks/                 # Custom Hooks (98 arquivos)
│   ├── lib/                   # Utilitários e configurações (23 arquivos)
│   ├── services/              # Serviços (3 arquivos)
│   ├── types/                 # TypeScript types (9 arquivos)
│   ├── utils/                 # Funções auxiliares (3 arquivos)
│   ├── data/                  # Dados estáticos
│   ├── i18n/                  # Internacionalização
│   └── constants/             # Constantes
├── public/                    # Arquivos estáticos
│   ├── imagens/              # Imagens
│   ├── sounds/               # Sons de notificações (54 arquivos)
│   └── Fonts/                # Fontes customizadas
├── scripts/                   # Scripts utilitários
├── supabase/                  # Migrações do Supabase
├── tests/                     # Testes
│   ├── e2e/                  # Testes end-to-end
│   └── unit/                 # Testes unitários
└── docs/                      # Documentação
```

---

## 🗄️ Banco de Dados

### Estrutura Atual

O banco de dados possui **55 tabelas ativas** no schema `public`, organizadas em:

#### Tabelas Principais
- ✅ `profiles` - Perfis de usuários (65 registros)
- ✅ `feed_posts` - Posts do feed (71 registros)
- ✅ `classified_ads` - Anúncios classificados (85 registros)
- ✅ `messages` - Mensagens de chat (237 registros)
- ✅ `conversations` - Conversas (49 registros)
- ✅ `reviews` - Avaliações (15 registros)
- ✅ `user_recommendations` - Recomendações (110 registros)

#### Sistema de Interações
- ✅ `feed_posts_likes` - Curtidas premium (227 registros)
- ✅ `post_reactions` - Reações em posts (93 registros)
- ✅ `post_comments` - Comentários (4 registros)
- ✅ `comment_likes` - Likes em comentários (1 registro)
- ✅ `profile_views` - Visualizações de perfil (166 registros)
- ✅ `post_views` - Visualizações de posts (94 registros)

#### Sistema de Economia
- ✅ `point_transactions` - Transações de pontos (481 registros)
- ✅ `user_points_balance` - Saldo de pontos (53 registros)
- ✅ `points_packages` - Pacotes de pontos (11 registros)
- ✅ `points_purchases` - Compras de pontos (11 registros)
- ✅ `points_transfers` - Transferências (9 registros)
- ✅ `points_store_items` - Loja de pontos (5 registros)

#### Sistema de Referral
- ✅ `referrals` - Indicações (187 registros)
- ✅ `user_referral_stats` - Estatísticas (65 registros)
- ✅ `referral_points_history` - Histórico (219 registros)
- ✅ `referral_badges` - Badges (5 registros)

#### Notificações
- ✅ `notifications` - Notificações (220 registros)
- ✅ `notification_preferences` - Preferências (50 registros)
- ✅ `push_subscriptions` - Push subscriptions (1 registro)

#### Outras
- ✅ `favorites` - Favoritos (75 registros)
- ✅ `contact_agreements` - Acordos de contato (3 registros)
- ✅ `evaluation_requests` - Solicitações de avaliação (23 registros)
- ✅ `reports` - Denúncias (6 registros)
- ✅ `user_bans` - Banimentos (4 registros)
- ✅ `admins` - Administradores (1 registro)

### Migrações Recentes

✅ **Limpeza de Tabelas Duplicadas (2025-01-18)**
- Removidas 6 tabelas duplicadas
- Migrados 11 registros para tabelas principais
- Banco de dados otimizado e organizado

---


## 🧪 Testes

### Testes Unitários (Jest)

```bash
npm run test
npm run test:watch
npm run test:coverage
```

**Cobertura atual:** ~80%

### Testes E2E (Playwright)

```bash
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:headed
```

**Cenários testados:**
- Registro e verificação de email
- Login com rate limiting
- Edição de perfil e avatar
- Feed social em tempo real
- Sistema de chat
- Sistema de pontos
- Busca avançada
- Sistema de avaliações
- Notificações
- Funcionalidades PWA
- Conformidade LGPD

---

## 📊 Métricas do Projeto

### Código

- **Componentes React:** 215+ arquivos
- **Páginas/Rotas:** 100+ arquivos
- **API Routes:** 50+ endpoints
- **Custom Hooks:** 98 arquivos
- **Linhas de Código:** ~50.000+ linhas

### Banco de Dados

- **Tabelas Ativas:** 55 tabelas
- **Registros Totais:** ~3.000+ registros
- **Foreign Keys:** 100+ constraints
- **RLS Policies:** Todas as tabelas protegidas

### Funcionalidades

- ✅ **100%** Sistema de autenticação
- ✅ **100%** Chat em tempo real
- ✅ **100%** Feed social
- ✅ **100%** Sistema de pontos
- ✅ **100%** PWA
- ✅ **100%** Notificações
- ✅ **100%** LGPD

---

## 🔒 Segurança

### Implementações de Segurança

- ✅ **Row Level Security (RLS)** - Todas as tabelas protegidas
- ✅ **Rate Limiting** - APIs protegidas contra abuse
- ✅ **Validação de Dados** - Zod schemas em todas as entradas
- ✅ **Sanitização** - Inputs sanitizados
- ✅ **Autenticação Segura** - Supabase Auth com verificação
- ✅ **HTTPS** - Todas as conexões criptografadas
- ✅ **CORS** - Configurado corretamente
- ✅ **Error Handling** - Erros não expõem informações sensíveis
- ✅ **LGPD Compliant** - Conformidade total

---

## 📱 PWA

### Funcionalidades PWA Implementadas

- ✅ **App Instalável** - Manifest configurado
- ✅ **Service Worker** - Cache inteligente
- ✅ **Offline Support** - Funcionalidades offline
- ✅ **Push Notifications** - Notificações nativas
- ✅ **Ícones Adaptativos** - Todos os tamanhos
- ✅ **Splash Screens** - Personalizadas
- ✅ **Tema** - Suporte a dark/light mode

### Instalação

1. Acesse o site no navegador
2. Clique no ícone de instalação (ou menu do navegador)
3. Confirme a instalação
4. O app será instalado como aplicativo nativo

---

## 🚀 Deploy

### Vercel (Recomendado)

O projeto está configurado para deploy automático na Vercel:

1. **Conectar Repositório**
   - Conecte seu repositório GitHub à Vercel
   - Configure variáveis de ambiente

2. **Deploy Automático**
   - Push para `master` = Deploy automático
   - Preview URLs para Pull Requests

3. **Configurações**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Outras Plataformas

- **Netlify** - Suportado
- **Railway** - Suportado
- **Docker** - Configuração disponível

---

## 📚 Documentação Adicional

- [Relatório Completo do Projeto](RELATORIO_COMPLETO_PROJETO.md)
- [Resumo de Análise](RESUMO_FINAL_COMPLETO.md)
- [Migração de Tabelas Duplicadas](MIGRACAO_TABELAS_DUPLICADAS.md)

---

## 🎯 Status do Projeto

### ✅ Implementado e Funcionando

- ✅ Autenticação completa
- ✅ Perfis de usuário
- ✅ Chat em tempo real
- ✅ Feed social
- ✅ Sistema de pontos
- ✅ Sistema de referral
- ✅ Classificados
- ✅ Avaliações e recomendações
- ✅ Notificações
- ✅ PWA
- ✅ Dashboard administrativo
- ✅ LGPD

### 🔄 Em Melhoria Contínua

- 🔄 Otimizações de performance
- 🔄 Novos recursos de gamificação
- 🔄 Expansão do sistema de pontos
- 🔄 Melhorias na experiência do usuário

---


## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Contato e Suporte

- **Website:** [https://confilar.com](https://confilar.com)
- **Email:** contato@confilar.com
- **GitHub:** [https://github.com/confilar](https://github.com/confilar)

---

## 🙏 Agradecimentos

Agradecimentos a todos os desenvolvedores e contribuidores que tornaram este projeto possível.

---

**ConfiLar** - Conectando profissionais e clientes através da confiança! 🏠✨

---

_Última atualização: 2025-01-18_
_Versão: 0.1.0_
_Status: Produção_
