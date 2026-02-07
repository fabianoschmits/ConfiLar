// DEPRECATED: Este arquivo foi substituído por src/data/services.ts
// Mantido apenas para compatibilidade com código existente
// Use src/data/services.ts para novos desenvolvimentos

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

// Importar serviços do arquivo centralizado
import { services } from "./services";

// Converter serviços para formato de categorias (compatibilidade)
export const serviceCategories: ServiceCategory[] = services.map((service) => ({
  id: service.id,
  name: service.name,
  icon: service.icon,
  description: service.description,
}));

// Função para buscar categoria por ID
export const getCategoryById = (id: string): ServiceCategory | undefined => {
  return serviceCategories.find((category) => category.id === id);
};

// Função para buscar categoria por nome
export const getCategoryByName = (
  name: string,
): ServiceCategory | undefined => {
  return serviceCategories.find((category) =>
    category.name.toLowerCase().includes(name.toLowerCase()),
  );
};

// Função para buscar categorias que contenham um termo
export const searchCategories = (term: string): ServiceCategory[] => {
  const searchTerm = term.toLowerCase();
  return serviceCategories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm) ||
      category.description?.toLowerCase().includes(searchTerm),
  );
};

// Função para obter todas as categorias em ordem alfabética
export const getSortedCategories = (): ServiceCategory[] => {
  return [...serviceCategories].sort((a, b) => a.name.localeCompare(b.name));
};

// Função para obter categorias por grupo
export const getCategoriesByGroup = () => {
  const groups = {
    "Construção e Reforma": [
      "construcao",
      "pedreiro",
      "eletrica",
      "encanamento",
      "pintura",
      "marcenaria",
      "telhado",
      "pisos",
    ],
    "Limpeza e Higiene": [
      "limpeza",
      "diarista",
      "limpeza-profunda",
      "limpeza-tapetes",
    ],
    "Jardinagem e Exteriores": [
      "jardinagem",
      "paisagismo",
      "manutencao-piscina",
      "poda-arvores",
    ],
    "Beleza e Bem-estar": [
      "beleza",
      "cabeleireiro",
      "manicure",
      "esteticista",
      "personal-trainer",
      "massagem",
    ],
    Tecnologia: [
      "tecnologia",
      "manutencao-computadores",
      "redes-e-internet",
      "desenvolvimento-software",
    ],
    Transporte: [
      "transporte",
      "mudancas",
      "entregas",
      "transporte-passageiros",
    ],
    Educação: ["educacao", "aulas-particulares", "idiomas", "musica"],
    Cuidados: [
      "cuidados",
      "baba",
      "cuidador-idosos",
      "cuidados-animais",
      "passeador-caes",
      "tosador",
    ],
    "Lavanderia e Costura": ["lavanderia", "costura"],
    Eventos: ["eventos", "buffet", "decoracao"],
    Manutenção: [
      "manutencao-geral",
      "reparo-eletrodomesticos",
      "chaveiro",
      "vidracaria",
    ],
  };

  return groups;
};
