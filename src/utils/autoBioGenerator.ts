/**
 * Gerador de Biografias Automáticas
 * Sistema que cria biografias personalizadas baseadas no tipo de perfil do usuário
 */

// Frases para clientes
const CLIENT_BIO_PHRASES = [
  "Sempre em busca dos melhores profissionais para meus projetos! 💼",
  "Apaixonado por qualidade e excelência em serviços. ⭐",
  "Valorizo muito o trabalho bem feito e profissionais dedicados. 🎯",
  "Sempre procurando os melhores especialistas para minhas necessidades. 🔍",
  "Acredito que bons profissionais fazem toda a diferença! 💪",
  "Sou criterioso na escolha de quem contrato para meus projetos. 🎨",
  "Busco sempre a excelência e qualidade nos serviços que contrato. ✨",
  "Valorizo profissionais comprometidos e com boa reputação. 🏆",
  "Sempre em busca de soluções profissionais de qualidade. 🚀",
  "Acredito que investir em bons profissionais é investir no sucesso! 💎",
  "Sou detalhista e busco sempre o melhor para meus projetos. 🎭",
  "Valorizo a transparência e honestidade nos profissionais. 🤝",
  "Busco profissionais que compartilhem minha visão de qualidade. 👁️",
  "Sempre em busca de inovação e excelência em serviços. 🌟",
  "Acredito que bons profissionais transformam ideias em realidade! 🎪",
];

// Frases para profissionais
const PROFESSIONAL_BIO_PHRASES = [
  "Profissional dedicado com anos de experiência e paixão pelo que faço! 💼",
  "Especialista comprometido em entregar sempre o melhor resultado. ⭐",
  "Profissional experiente, sempre buscando superar expectativas. 🎯",
  "Especialista apaixonado por qualidade e satisfação do cliente. 🔍",
  "Profissional dedicado com foco em excelência e resultados. 💪",
  "Especialista criativo, sempre inovando para melhor atender. 🎨",
  "Profissional experiente, comprometido com a satisfação total. ✨",
  "Especialista dedicado, sempre buscando a excelência no trabalho. 🏆",
  "Profissional apaixonado por transformar ideias em realidade! 🚀",
  "Especialista experiente, sempre em busca da perfeição. 💎",
  "Profissional criativo e detalhista, focado em resultados únicos. 🎭",
  "Especialista transparente e honesto, valorizando a confiança. 🤝",
  "Profissional inovador, sempre buscando novas soluções. 👁️",
  "Especialista dedicado, transformando visões em realidade. 🌟",
  "Profissional experiente, sempre superando expectativas! 🎪",
];

// Frases adicionais baseadas na localização
const LOCATION_BASED_PHRASES = {
  SP: [
    "Atuando em São Paulo com dedicação e qualidade! 🏙️",
    "Profissional paulista, sempre em busca da excelência! 🌆",
    "Atendendo em São Paulo com compromisso e qualidade! 🏢",
  ],
  RJ: [
    "Atuando no Rio de Janeiro com paixão e dedicação! 🏖️",
    "Profissional carioca, sempre entregando o melhor! 🌊",
    "Atendendo no Rio com qualidade e compromisso! 🏔️",
  ],
  MG: [
    "Atuando em Minas Gerais com tradição e qualidade! ⛰️",
    "Profissional mineiro, sempre em busca da excelência! 🏔️",
    "Atendendo em MG com dedicação e compromisso! 🌄",
  ],
  RS: [
    "Atuando no Rio Grande do Sul com qualidade gaúcha! 🤠",
    "Profissional sulista, sempre entregando o melhor! 🌾",
    "Atendendo no RS com tradição e excelência! 🏞️",
  ],
  PR: [
    "Atuando no Paraná com dedicação e qualidade! 🌲",
    "Profissional paranaense, sempre em busca da excelência! 🏔️",
    "Atendendo no PR com compromisso e qualidade! 🌿",
  ],
};

// Frases baseadas nos serviços oferecidos (para profissionais)
const SERVICE_BASED_PHRASES = {
  design: [
    "Especialista em design criativo e inovador! 🎨",
    "Designer apaixonado por criar soluções únicas! ✨",
    "Especialista em design, sempre buscando a perfeição visual! 🖼️",
  ],
  construção: [
    "Especialista em construção com anos de experiência! 🏗️",
    "Profissional da construção, sempre entregando qualidade! 🔨",
    "Especialista em obras, comprometido com a excelência! 🏠",
  ],
  tecnologia: [
    "Especialista em tecnologia e inovação! 💻",
    "Profissional tech, sempre em busca de soluções modernas! 🚀",
    "Especialista em TI, transformando ideias em realidade digital! ⚡",
  ],
  saúde: [
    "Profissional da saúde dedicado ao bem-estar! 🏥",
    "Especialista em saúde, sempre cuidando com carinho! ❤️",
    "Profissional da área médica, comprometido com a qualidade! 🩺",
  ],
  educação: [
    "Educador apaixonado por ensinar e transformar vidas! 📚",
    "Profissional da educação, sempre buscando o melhor! 🎓",
    "Especialista em ensino, comprometido com o aprendizado! ✏️",
  ],
};

/**
 * Gera uma biografia automática baseada no tipo de perfil e dados do usuário
 */
export function generateAutoBio(
  userType: "client" | "professional",
  userData?: {
    location_state?: string;
    professional_services?: string[];
    full_name?: string;
  },
): string {
  // Selecionar frase base baseada no tipo de usuário
  const basePhrases =
    userType === "client" ? CLIENT_BIO_PHRASES : PROFESSIONAL_BIO_PHRASES;
  const basePhrase =
    basePhrases[Math.floor(Math.random() * basePhrases.length)];

  // Adicionar frase baseada na localização se disponível
  let locationPhrase = "";
  if (
    userData?.location_state &&
    LOCATION_BASED_PHRASES[
      userData.location_state as keyof typeof LOCATION_BASED_PHRASES
    ]
  ) {
    const locationPhrases =
      LOCATION_BASED_PHRASES[
        userData.location_state as keyof typeof LOCATION_BASED_PHRASES
      ];
    locationPhrase =
      locationPhrases[Math.floor(Math.random() * locationPhrases.length)];
  }

  // Adicionar frase baseada nos serviços (apenas para profissionais)
  let servicePhrase = "";
  if (
    userType === "professional" &&
    userData?.professional_services &&
    userData.professional_services.length > 0
  ) {
    // Verificar se algum serviço tem frase específica
    for (const service of userData.professional_services) {
      const serviceKey = service.toLowerCase();
      for (const [key, phrases] of Object.entries(SERVICE_BASED_PHRASES)) {
        if (serviceKey.includes(key)) {
          servicePhrase = phrases[Math.floor(Math.random() * phrases.length)];
          break;
        }
      }
      if (servicePhrase) break;
    }
  }

  // Combinar as frases
  const phrases = [basePhrase, locationPhrase, servicePhrase].filter(Boolean);

  // Se temos múltiplas frases, escolher 1-2 aleatoriamente
  if (phrases.length > 1) {
    const numPhrases = Math.random() < 0.7 ? 1 : 2; // 70% chance de 1 frase, 30% de 2
    const selectedPhrases = phrases
      .sort(() => Math.random() - 0.5)
      .slice(0, numPhrases);
    return selectedPhrases.join(" ");
  }

  return phrases[0] || basePhrase;
}

/**
 * Verifica se uma biografia é automática (gerada pelo sistema)
 */
export function isAutoBio(bio: string | null): boolean {
  if (!bio) return false;

  // Verificar se contém emojis característicos das biografias automáticas
  const autoBioEmojis = [
    "💼",
    "⭐",
    "🎯",
    "🔍",
    "💪",
    "🎨",
    "✨",
    "🏆",
    "🚀",
    "💎",
    "🎭",
    "🤝",
    "👁️",
    "🌟",
    "🎪",
    "🏙️",
    "🌆",
    "🏢",
    "🏖️",
    "🌊",
    "🏔️",
    "⛰️",
    "🌄",
    "🤠",
    "🌾",
    "🏞️",
    "🌲",
    "🌿",
    "🖼️",
    "🏗️",
    "🔨",
    "🏠",
    "💻",
    "⚡",
    "🏥",
    "❤️",
    "🩺",
    "📚",
    "🎓",
    "✏️",
  ];

  return autoBioEmojis.some((emoji) => bio.includes(emoji));
}

/**
 * Gera uma biografia automática se o usuário não forneceu uma
 *
 * COMPORTAMENTO:
 * - Se o usuário escreveu uma biografia (mesmo que curta), usa a biografia dele
 * - Se o usuário deixou em branco, gera uma biografia automática personalizada
 *
 * @param userBio - Biografia que o usuário escreveu (pode ser null, undefined ou string vazia)
 * @param userType - Tipo do usuário (client ou professional)
 * @param userData - Dados adicionais para personalizar a biografia automática
 * @returns Biografia do usuário ou biografia automática gerada
 */
export function getBioOrDefault(
  userBio: string | null | undefined,
  userType: "client" | "professional",
  userData?: {
    location_state?: string;
    professional_services?: string[];
    full_name?: string;
  },
): string {
  // PRIORIDADE 1: Se o usuário escreveu uma biografia, usar ela
  if (userBio && userBio.trim().length > 0) {
    return userBio.trim();
  }

  // PRIORIDADE 2: Se não escreveu nada, gerar biografia automática personalizada
  return generateAutoBio(userType, userData);
}
