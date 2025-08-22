export interface ServiceCategory {
  id: string
  name: string
  icon: string
  description?: string
}

// Categorias de serviços profissionais - CENTRALIZADAS
// Para adicionar novas categorias, apenas edite este arquivo
export const serviceCategories: ServiceCategory[] = [
  // Construção e Reforma
  { id: 'construction', name: 'Construção e Reforma', icon: '🏗️', description: 'Obras, reformas e construções' },
  { id: 'masonry', name: 'Pedreiro', icon: '🧱', description: 'Alvenaria, reboco e acabamentos' },
  { id: 'electrical', name: 'Elétrica', icon: '⚡', description: 'Instalações e reparos elétricos' },
  { id: 'plumbing', name: 'Encanamento', icon: '🔧', description: 'Instalações hidráulicas e sanitárias' },
  { id: 'painting', name: 'Pintura', icon: '🎨', description: 'Pintura interna e externa' },
  { id: 'carpentry', name: 'Marcenaria', icon: '🪚', description: 'Móveis e trabalhos em madeira' },
  { id: 'roofing', name: 'Telhado', icon: '🏠', description: 'Reparos e instalação de telhas' },
  { id: 'flooring', name: 'Pisos', icon: '🧱', description: 'Instalação de pisos e revestimentos' },
  
  // Limpeza e Higiene
  { id: 'cleaning', name: 'Limpeza e Higiene', icon: '🧹', description: 'Limpeza residencial e comercial' },
  { id: 'housekeeping', name: 'Diarista', icon: '🏠', description: 'Limpeza e organização doméstica' },
  { id: 'deep-cleaning', name: 'Limpeza Profunda', icon: '✨', description: 'Limpeza detalhada e especializada' },
  { id: 'carpet-cleaning', name: 'Limpeza de Tapetes', icon: '🟫', description: 'Higienização de carpetes' },
  
  // Jardinagem e Exteriores
  { id: 'gardening', name: 'Jardinagem', icon: '🌱', description: 'Cuidados com plantas e jardins' },
  { id: 'landscaping', name: 'Paisagismo', icon: '🌿', description: 'Design e manutenção de jardins' },
  { id: 'pool-maintenance', name: 'Manutenção de Piscina', icon: '🏊', description: 'Limpeza e tratamento de piscinas' },
  { id: 'tree-care', name: 'Poda de Árvores', icon: '🌳', description: 'Poda e manutenção arbórea' },
  
  // Beleza e Bem-estar
  { id: 'beauty', name: 'Beleza e Bem-estar', icon: '💄', description: 'Serviços de beleza e estética' },
  { id: 'hairdressing', name: 'Cabeleireiro', icon: '✂️', description: 'Cortes, coloração e tratamentos' },
  { id: 'manicure', name: 'Manicure', icon: '💅', description: 'Cuidados com unhas' },
  { id: 'esthetics', name: 'Esteticista', icon: '✨', description: 'Tratamentos faciais e corporais' },
  { id: 'personal-trainer', name: 'Personal Trainer', icon: '💪', description: 'Treinamento físico personalizado' },
  { id: 'massage', name: 'Massagem', icon: '👐', description: 'Terapias e relaxamento' },
  
  // Tecnologia e Informática
  { id: 'technology', name: 'Tecnologia', icon: '💻', description: 'Serviços de TI e informática' },
  { id: 'computer-repair', name: 'Manutenção de Computadores', icon: '🖥️', description: 'Reparos e manutenção' },
  { id: 'network', name: 'Redes e Internet', icon: '🌐', description: 'Instalação e configuração de redes' },
  { id: 'software', name: 'Software', icon: '📱', description: 'Desenvolvimento e suporte' },
  
  // Transporte e Logística
  { id: 'transport', name: 'Transporte', icon: '🚗', description: 'Serviços de transporte' },
  { id: 'moving', name: 'Mudanças', icon: '📦', description: 'Transporte de móveis e objetos' },
  { id: 'delivery', name: 'Entregas', icon: '📮', description: 'Entrega de encomendas' },
  { id: 'passenger', name: 'Transporte de Passageiros', icon: '👥', description: 'Carona e transporte pessoal' },
  
  // Educação e Tutoria
  { id: 'education', name: 'Educação', icon: '📚', description: 'Aulas e tutoria' },
  { id: 'tutoring', name: 'Aulas Particulares', icon: '✏️', description: 'Reforço escolar e preparação' },
  { id: 'language', name: 'Idiomas', icon: '🗣️', description: 'Aulas de idiomas' },
  { id: 'music', name: 'Música', icon: '🎵', description: 'Aulas de instrumentos musicais' },
  
  // Cuidados e Assistência
  { id: 'care', name: 'Cuidados e Assistência', icon: '🤱', description: 'Cuidados pessoais e assistência' },
  { id: 'babysitting', name: 'Babá', icon: '👶', description: 'Cuidados com crianças' },
  { id: 'elderly-care', name: 'Cuidador de Idosos', icon: '👴', description: 'Assistência para idosos' },
  { id: 'pet-care', name: 'Cuidados com Pets', icon: '🐕', description: 'Cuidados com animais domésticos' },
  { id: 'dog-walking', name: 'Dog Walker', icon: '🦮', description: 'Passeios com cães' },
  { id: 'pet-grooming', name: 'Tosador', icon: '✂️', description: 'Tosa e higiene de pets' },
  
  // Lavanderia e Costura
  { id: 'laundry', name: 'Lavanderia', icon: '👕', description: 'Lavagem e passadoria' },
  { id: 'sewing', name: 'Costura', icon: '🧵', description: 'Consertos e confecções' },
  
  // Eventos e Celebrações
  { id: 'events', name: 'Eventos', icon: '🎉', description: 'Organização de eventos' },
  { id: 'catering', name: 'Buffet', icon: '🍽️', description: 'Serviços de alimentação' },
  { id: 'decoration', name: 'Decoração', icon: '🎨', description: 'Decoração de eventos' },
  
  // Manutenção Geral
  { id: 'maintenance', name: 'Manutenção Geral', icon: '🔨', description: 'Reparos e manutenção diversa' },
  { id: 'appliance-repair', name: 'Reparo de Eletrodomésticos', icon: '🔌', description: 'Conserto de aparelhos' },
  { id: 'locksmith', name: 'Chaveiro', icon: '🔑', description: 'Serviços de chaveiro' },
  { id: 'glass-repair', name: 'Vidraçaria', icon: '🪟', description: 'Reparo e instalação de vidros' }
]

// Função para buscar categoria por ID
export const getCategoryById = (id: string): ServiceCategory | undefined => {
  return serviceCategories.find(category => category.id === id)
}

// Função para buscar categoria por nome
export const getCategoryByName = (name: string): ServiceCategory | undefined => {
  return serviceCategories.find(category => 
    category.name.toLowerCase().includes(name.toLowerCase())
  )
}

// Função para buscar categorias que contenham um termo
export const searchCategories = (term: string): ServiceCategory[] => {
  const searchTerm = term.toLowerCase()
  return serviceCategories.filter(category => 
    category.name.toLowerCase().includes(searchTerm) ||
    category.description?.toLowerCase().includes(searchTerm)
  )
}

// Função para obter todas as categorias em ordem alfabética
export const getSortedCategories = (): ServiceCategory[] => {
  return [...serviceCategories].sort((a, b) => a.name.localeCompare(b.name))
}

// Função para obter categorias por grupo
export const getCategoriesByGroup = () => {
  const groups = {
    'Construção e Reforma': ['construction', 'masonry', 'electrical', 'plumbing', 'painting', 'carpentry', 'roofing', 'flooring'],
    'Limpeza e Higiene': ['cleaning', 'housekeeping', 'deep-cleaning', 'carpet-cleaning'],
    'Jardinagem e Exteriores': ['gardening', 'landscaping', 'pool-maintenance', 'tree-care'],
    'Beleza e Bem-estar': ['beauty', 'hairdressing', 'manicure', 'esthetics', 'personal-trainer', 'massage'],
    'Tecnologia': ['technology', 'computer-repair', 'network', 'software'],
    'Transporte': ['transport', 'moving', 'delivery', 'passenger'],
    'Educação': ['education', 'tutoring', 'language', 'music'],
    'Cuidados': ['care', 'babysitting', 'elderly-care', 'pet-care', 'dog-walking', 'pet-grooming'],
    'Lavanderia e Costura': ['laundry', 'sewing'],
    'Eventos': ['events', 'catering', 'decoration'],
    'Manutenção': ['maintenance', 'appliance-repair', 'locksmith', 'glass-repair']
  }
  
  return groups
}




