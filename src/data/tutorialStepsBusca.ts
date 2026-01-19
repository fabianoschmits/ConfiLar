export interface TutorialStep {
  targetId: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
}

export const tutorialStepsBusca: TutorialStep[] = [
  {
    targetId: "tutorial-welcome",
    title: "Bem-vindo à Busca de Profissionais!",
    content:
      "Encontre os melhores profissionais da sua região. Vamos conhecer como funciona a busca.",
    position: "center",
  },
  {
    targetId: "search-input",
    title: "Campo de Busca",
    content:
      "Digite o serviço que você procura ou o nome de um profissional. A busca é inteligente e mostra resultados relevantes.",
    position: "bottom",
  },
  {
    targetId: "category-filters",
    title: "Categorias de Serviços",
    content:
      "Navegue pelas categorias para encontrar profissionais especializados: Elétrica, Encanamento, Limpeza e muito mais.",
    position: "bottom",
  },
  {
    targetId: "location-filter",
    title: "Filtro de Localização",
    content:
      "Filtre por cidade ou estado para encontrar profissionais próximos a você.",
    position: "bottom",
  },
  {
    targetId: "professional-card",
    title: "Perfil do Profissional",
    content:
      "Veja avaliações, serviços oferecidos e informações de contato. Clique no perfil para ver mais detalhes e entrar em contato.",
    position: "top",
  },
];
