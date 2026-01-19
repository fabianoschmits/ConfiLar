export interface TutorialStep {
  targetId: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
}

export const tutorialStepsClassifieds: TutorialStep[] = [
  {
    targetId: "tutorial-welcome",
    title: "Bem-vindo aos Classificados!",
    content:
      "Aqui você pode criar anúncios para oferecer seus serviços ou solicitar profissionais. Vamos conhecer as principais funcionalidades.",
    position: "center",
  },
  {
    targetId: "create-ad-button",
    title: "Criar Novo Anúncio",
    content:
      "Clique aqui para criar um anúncio. Você pode oferecer seus serviços ou solicitar um profissional. Use seus créditos grátis de boas-vindas!",
    position: "bottom",
  },
  {
    targetId: "ad-filters",
    title: "Filtros de Busca",
    content:
      "Use os filtros para encontrar exatamente o que procura: por categoria, localização, tipo de anúncio e muito mais.",
    position: "bottom",
  },
  {
    targetId: "premium-badge",
    title: "Anúncios Premium",
    content:
      "Anúncios com a coroa dourada são destacados e aparecem no topo das buscas. Você pode criar um usando seus créditos ou ConfiPoints!",
    position: "top",
  },
];
