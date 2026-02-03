/**
 * Mensagens de boas-vindas personalizadas para cada tipo de usuário
 * Sistema de frases variadas e específicas
 */

export interface WelcomeMessage {
  id: string;
  message: string;
  emoji: string;
  category: string;
}

export const professionalWelcomeMessages: WelcomeMessage[] = [
  {
    id: "prof-001",
    message:
      "Olá! Sou {name} e acabei de me juntar à plataforma ConfiLar! 🎉 Estou aqui para oferecer meus serviços profissionais e prestar um excelente trabalho para meus clientes. Fico feliz em fazer parte desta comunidade!",
    emoji: "🎉",
    category: "apresentacao",
  },
  {
    id: "prof-002",
    message:
      "Oi pessoal! {name} aqui, acabando de entrar na ConfiLar! 💼 Estou animado para conectar com clientes e mostrar meu trabalho. Vamos construir algo incrível juntos!",
    emoji: "💼",
    category: "animacao",
  },
  {
    id: "prof-003",
    message:
      "Salve, galera! {name} se juntou à comunidade ConfiLar! 🚀 Estou pronto para oferecer meus serviços e ajudar vocês com seus projetos. Mal posso esperar para trabalhar com vocês!",
    emoji: "🚀",
    category: "informal",
  },
  {
    id: "prof-004",
    message:
      "Olá! {name} aqui, novo na ConfiLar! ✨ Estou aqui para oferecer meus serviços profissionais com qualidade e dedicação. Vamos fazer negócios incríveis juntos!",
    emoji: "✨",
    category: "profissional",
  },
  {
    id: "prof-005",
    message:
      "E aí, pessoal! {name} acabou de chegar na ConfiLar! 🎯 Estou focado em entregar resultados excepcionais para meus clientes. Vamos começar essa jornada!",
    emoji: "🎯",
    category: "focado",
  },
  {
    id: "prof-006",
    message:
      "Oi! Sou {name} e estou muito feliz em fazer parte da ConfiLar! 🌟 Estou aqui para oferecer meus serviços com paixão e profissionalismo. Vamos conectar!",
    emoji: "🌟",
    category: "paixao",
  },
  {
    id: "prof-007",
    message:
      "Salve! {name} se juntou à plataforma! 💪 Estou pronto para trabalhar duro e entregar o melhor para meus clientes. Vamos fazer acontecer!",
    emoji: "💪",
    category: "determinacao",
  },
  {
    id: "prof-008",
    message:
      "Olá, comunidade! {name} aqui, novo membro da ConfiLar! 🎨 Estou animado para compartilhar minha arte e habilidades com vocês. Vamos criar algo especial!",
    emoji: "🎨",
    category: "criativo",
  },
  {
    id: "prof-009",
    message:
      "Oi pessoal! {name} acabou de entrar na ConfiLar! 🔧 Estou aqui para resolver os problemas de vocês com eficiência e qualidade. Vamos trabalhar juntos!",
    emoji: "🔧",
    category: "resolucao",
  },
  {
    id: "prof-010",
    message:
      "Salve! {name} se juntou à nossa comunidade! 🏆 Estou comprometido em oferecer serviços de excelência. Vamos alcançar grandes resultados!",
    emoji: "🏆",
    category: "excelencia",
  },
  {
    id: "prof-011",
    message:
      "Olá! {name} aqui, novo na ConfiLar! 🌱 Estou pronto para crescer junto com vocês e oferecer meus serviços. Vamos construir o futuro!",
    emoji: "🌱",
    category: "crescimento",
  },
  {
    id: "prof-012",
    message:
      "Oi! Sou {name} e acabei de entrar na ConfiLar! ⚡ Estou cheio de energia para trabalhar e entregar resultados incríveis. Vamos começar!",
    emoji: "⚡",
    category: "energia",
  },
  {
    id: "prof-013",
    message:
      "Salve, galera! {name} se juntou à plataforma! 🎪 Estou aqui para trazer alegria e qualidade aos seus projetos. Vamos fazer a festa!",
    emoji: "🎪",
    category: "alegria",
  },
  {
    id: "prof-014",
    message:
      "Olá! {name} aqui, novo membro da ConfiLar! 🎭 Estou pronto para atuar e entregar performances excepcionais. Vamos subir ao palco!",
    emoji: "🎭",
    category: "performance",
  },
  {
    id: "prof-015",
    message:
      "Oi pessoal! {name} acabou de chegar na ConfiLar! 🎪 Estou animado para trabalhar com vocês e criar experiências únicas. Vamos começar!",
    emoji: "🎪",
    category: "experiencia",
  },
  {
    id: "prof-016",
    message:
      "Salve! {name} se juntou à nossa comunidade! 🎨 Estou aqui para colorir seus projetos com criatividade e profissionalismo. Vamos pintar o futuro!",
    emoji: "🎨",
    category: "criatividade",
  },
  {
    id: "prof-017",
    message:
      "Olá! {name} aqui, novo na ConfiLar! 🎯 Estou focado em acertar em cheio nas suas necessidades. Vamos fazer acontecer!",
    emoji: "🎯",
    category: "precisao",
  },
  {
    id: "prof-018",
    message:
      "Oi! Sou {name} e estou muito feliz em fazer parte da ConfiLar! 🌟 Estou aqui para brilhar e iluminar seus projetos. Vamos fazer a diferença!",
    emoji: "🌟",
    category: "brilho",
  },
  {
    id: "prof-019",
    message:
      "Salve, galera! {name} se juntou à plataforma! 🚀 Estou pronto para decolar e levar seus projetos ao próximo nível. Vamos voar alto!",
    emoji: "🚀",
    category: "decolagem",
  },
  {
    id: "prof-020",
    message:
      "Olá! {name} aqui, novo membro da ConfiLar! 🎉 Estou animado para celebrar cada conquista com vocês. Vamos festejar o sucesso!",
    emoji: "🎉",
    category: "celebracao",
  },
];

export const clientWelcomeMessages: WelcomeMessage[] = [
  {
    id: "client-001",
    message:
      "Olá! Sou {name} e acabei de me juntar à plataforma ConfiLar! 🎉 Estou aqui para encontrar profissionais qualificados para meus projetos. Mal posso esperar para conhecer a comunidade!",
    emoji: "🎉",
    category: "apresentacao",
  },
  {
    id: "client-002",
    message:
      "Oi pessoal! {name} aqui, novo na ConfiLar! 👋 Estou animado para encontrar os melhores profissionais para meus projetos. Vamos trabalhar juntos!",
    emoji: "👋",
    category: "animacao",
  },
  {
    id: "client-003",
    message:
      "Salve, galera! {name} se juntou à comunidade ConfiLar! 🏠 Estou aqui para transformar meus espaços com ajuda de profissionais incríveis. Vamos começar!",
    emoji: "🏠",
    category: "transformacao",
  },
  {
    id: "client-004",
    message:
      "Olá! {name} aqui, novo na ConfiLar! ✨ Estou em busca de profissionais talentosos para realizar meus sonhos. Vamos fazer acontecer!",
    emoji: "✨",
    category: "sonhos",
  },
  {
    id: "client-005",
    message:
      "E aí, pessoal! {name} acabou de chegar na ConfiLar! 🎯 Estou focado em encontrar os melhores profissionais para meus projetos. Vamos conectar!",
    emoji: "🎯",
    category: "foco",
  },
  {
    id: "client-006",
    message:
      "Oi! Sou {name} e estou muito feliz em fazer parte da ConfiLar! 🌟 Estou aqui para descobrir talentos incríveis. Vamos explorar juntos!",
    emoji: "🌟",
    category: "descoberta",
  },
  {
    id: "client-007",
    message:
      "Salve! {name} se juntou à plataforma! 💡 Estou pronto para encontrar soluções criativas para meus projetos. Vamos inovar!",
    emoji: "💡",
    category: "inovacao",
  },
  {
    id: "client-008",
    message:
      "Olá, comunidade! {name} aqui, novo membro da ConfiLar! 🎨 Estou animado para colaborar com artistas e criativos. Vamos criar arte!",
    emoji: "🎨",
    category: "colaboracao",
  },
  {
    id: "client-009",
    message:
      "Oi pessoal! {name} acabou de entrar na ConfiLar! 🔧 Estou aqui para encontrar especialistas que resolvam meus problemas. Vamos resolver!",
    emoji: "🔧",
    category: "solucao",
  },
  {
    id: "client-010",
    message:
      "Salve! {name} se juntou à nossa comunidade! 🏆 Estou em busca de profissionais de excelência. Vamos alcançar grandes resultados!",
    emoji: "🏆",
    category: "excelencia",
  },
  {
    id: "client-011",
    message:
      "Olá! {name} aqui, novo na ConfiLar! 🌱 Estou pronto para crescer meus projetos com ajuda profissional. Vamos plantar sementes de sucesso!",
    emoji: "🌱",
    category: "crescimento",
  },
  {
    id: "client-012",
    message:
      "Oi! Sou {name} e acabei de entrar na ConfiLar! ⚡ Estou cheio de ideias e preciso de profissionais para realizá-las. Vamos começar!",
    emoji: "⚡",
    category: "ideias",
  },
  {
    id: "client-013",
    message:
      "Salve, galera! {name} se juntou à plataforma! 🎪 Estou aqui para encontrar profissionais que tornem meus projetos uma festa. Vamos celebrar!",
    emoji: "🎪",
    category: "festa",
  },
  {
    id: "client-014",
    message:
      "Olá! {name} aqui, novo membro da ConfiLar! 🎭 Estou pronto para encontrar talentos que transformem meus projetos em espetáculos. Vamos atuar!",
    emoji: "🎭",
    category: "espetaculo",
  },
  {
    id: "client-015",
    message:
      "Oi pessoal! {name} acabou de chegar na ConfiLar! 🎪 Estou animado para viver experiências únicas com profissionais incríveis. Vamos começar!",
    emoji: "🎪",
    category: "experiencia",
  },
  {
    id: "client-016",
    message:
      "Salve! {name} se juntou à nossa comunidade! 🎨 Estou aqui para colorir minha vida com ajuda de profissionais criativos. Vamos pintar o futuro!",
    emoji: "🎨",
    category: "criatividade",
  },
  {
    id: "client-017",
    message:
      "Olá! {name} aqui, novo na ConfiLar! 🎯 Estou focado em encontrar profissionais que acertem em cheio nas minhas necessidades. Vamos fazer acontecer!",
    emoji: "🎯",
    category: "precisao",
  },
  {
    id: "client-018",
    message:
      "Oi! Sou {name} e estou muito feliz em fazer parte da ConfiLar! 🌟 Estou aqui para brilhar com ajuda de profissionais talentosos. Vamos fazer a diferença!",
    emoji: "🌟",
    category: "brilho",
  },
  {
    id: "client-019",
    message:
      "Salve, galera! {name} se juntou à plataforma! 🚀 Estou pronto para decolar meus projetos com ajuda de profissionais experientes. Vamos voar alto!",
    emoji: "🚀",
    category: "decolagem",
  },
  {
    id: "client-020",
    message:
      "Olá! {name} aqui, novo membro da ConfiLar! 🎉 Estou animado para celebrar cada conquista com profissionais incríveis. Vamos festejar o sucesso!",
    emoji: "🎉",
    category: "celebracao",
  },
];

/**
 * Função para obter uma mensagem aleatória baseada no tipo de usuário
 */
export function getRandomWelcomeMessage(
  userType: "professional" | "client",
  userName: string,
): string {
  const messages =
    userType === "professional"
      ? professionalWelcomeMessages
      : clientWelcomeMessages;
  const randomIndex = Math.floor(Math.random() * messages.length);
  const selectedMessage = messages[randomIndex];

  return selectedMessage.message.replace("{name}", userName);
}

/**
 * Função para obter uma mensagem específica por categoria
 */
export function getWelcomeMessageByCategory(
  userType: "professional" | "client",
  userName: string,
  category: string,
): string {
  const messages =
    userType === "professional"
      ? professionalWelcomeMessages
      : clientWelcomeMessages;
  const categoryMessages = messages.filter((msg) => msg.category === category);

  if (categoryMessages.length === 0) {
    return getRandomWelcomeMessage(userType, userName);
  }

  const randomIndex = Math.floor(Math.random() * categoryMessages.length);
  const selectedMessage = categoryMessages[randomIndex];

  return selectedMessage.message.replace("{name}", userName);
}

/**
 * Função para obter todas as categorias disponíveis
 */
export function getAvailableCategories(
  userType: "professional" | "client",
): string[] {
  const messages =
    userType === "professional"
      ? professionalWelcomeMessages
      : clientWelcomeMessages;
  const categories = [...new Set(messages.map((msg) => msg.category))];
  return categories;
}
