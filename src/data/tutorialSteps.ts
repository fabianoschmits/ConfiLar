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
      "Precisa de um serviço ou quer oferecer o seu? Clique aqui para criar um novo post ou anúncio rapidamente.",
    position: "bottom",
  },
  {
    targetId: "nav-item-profile",
    title: "Seu Perfil",
    content:
      "Gerencie seus dados, veja suas avaliações e configurações de conta aqui.",
    position: "right",
  },
];
