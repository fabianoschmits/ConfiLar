export interface TutorialStep {
  targetId: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
}

export const tutorialSteps: TutorialStep[] = [
  {
    targetId: "tutorial-welcome", // A generic center target or main container
    title: "Bem-vindo ao ConfiLar!",
    content:
      "Estamos felizes em ter você aqui. Vamos fazer um tour rápido para você conhecer as principais funcionalidades.",
    position: "center",
  },
  {
    targetId: "nav-item-feed",
    title: "Feed Social",
    content:
      "Aqui você encontra atualizações, posts e novidades da sua comunidade.",
    position: "right",
  },
  {
    targetId: "create-post-button",
    title: "Criar Publicação",
    content:
      "Procurando algum serviço diferente? Crie um post com fotos ou vídeos do YouTube sobre ele, ou divulgue ideias e trabalhos que você já realizou para a comunidade.",
    position: "bottom",
  },
  {
    targetId: "nav-item-feed", // Repurposing or choosing a generic target if needed
    title: "Recompensas e Posts Premium",
    content:
      "Sabia que você pode ganhar ConfiPoints? Ao receber 'Likes Premium' em suas publicações, você acumula pontos que podem ser usados para destacar seus próprios posts e anúncios como Premium!",
    position: "center",
  },
  {
    targetId: "nav-item-profile",
    title: "Seu Perfil",
    content:
      "Gerencie seus dados, veja suas avaliações e configurações de conta aqui.",
    position: "right",
  },
];
