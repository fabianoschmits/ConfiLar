export interface Service {
  id: string
  name: string
  icon: string
  description?: string
  category: string
}

// Serviços profissionais centralizados - CONFILAR
// Este é o arquivo de referência para todos os serviços disponíveis na plataforma
export const services: Service[] = [
  // Construção e Reforma
  { id: 'construction', name: 'Construção e Reforma', icon: '🏗️', description: 'Obras, reformas e construções', category: 'Construção e Reforma' },
  { id: 'masonry', name: 'Pedreiro', icon: '🧱', description: 'Alvenaria, reboco e acabamentos', category: 'Construção e Reforma' },
  { id: 'electrical', name: 'Elétrica', icon: '⚡', description: 'Instalações e reparos elétricos', category: 'Construção e Reforma' },
  { id: 'plumbing', name: 'Encanamento', icon: '🔧', description: 'Instalações hidráulicas e sanitárias', category: 'Construção e Reforma' },
  { id: 'painting', name: 'Pintura', icon: '🎨', description: 'Pintura interna e externa', category: 'Construção e Reforma' },
  { id: 'carpentry', name: 'Marcenaria', icon: '🪚', description: 'Móveis e trabalhos em madeira', category: 'Construção e Reforma' },
  { id: 'roofing', name: 'Telhado', icon: '🏠', description: 'Reparos e instalação de telhas', category: 'Construção e Reforma' },
  { id: 'flooring', name: 'Pisos', icon: '🧱', description: 'Instalação de pisos e revestimentos', category: 'Construção e Reforma' },

  // Limpeza e Higiene
  { id: 'cleaning', name: 'Limpeza e Higiene', icon: '🧹', description: 'Limpeza residencial e comercial', category: 'Limpeza e Higiene' },
  { id: 'housekeeping', name: 'Diarista', icon: '🏠', description: 'Limpeza e organização doméstica', category: 'Limpeza e Higiene' },
  { id: 'deep-cleaning', name: 'Limpeza Profunda', icon: '✨', description: 'Limpeza detalhada e especializada', category: 'Limpeza e Higiene' },
  { id: 'carpet-cleaning', name: 'Limpeza de Tapetes', icon: '🟫', description: 'Higienização de carpetes', category: 'Limpeza e Higiene' },

  // Jardinagem e Exteriores
  { id: 'gardening', name: 'Jardinagem', icon: '🌱', description: 'Cuidados com plantas e jardins', category: 'Jardinagem e Exteriores' },
  { id: 'landscaping', name: 'Paisagismo', icon: '🌿', description: 'Design e manutenção de jardins', category: 'Jardinagem e Exteriores' },
  { id: 'pool-maintenance', name: 'Manutenção de Piscina', icon: '🏊', description: 'Limpeza e tratamento de piscinas', category: 'Jardinagem e Exteriores' },
  { id: 'tree-care', name: 'Poda de Árvores', icon: '🌳', description: 'Poda e manutenção arbórea', category: 'Jardinagem e Exteriores' },

  // Beleza e Bem-estar
  { id: 'beauty', name: 'Beleza e Bem-estar', icon: '💄', description: 'Serviços de beleza e estética', category: 'Beleza e Bem-estar' },
  { id: 'hairdressing', name: 'Cabeleireiro', icon: '✂️', description: 'Cortes, coloração e tratamentos', category: 'Beleza e Bem-estar' },
  { id: 'manicure', name: 'Manicure', icon: '💅', description: 'Cuidados com unhas', category: 'Beleza e Bem-estar' },
  { id: 'esthetics', name: 'Esteticista', icon: '✨', description: 'Tratamentos faciais e corporais', category: 'Beleza e Bem-estar' },
  { id: 'personal-trainer', name: 'Personal Trainer', icon: '💪', description: 'Treinamento físico personalizado', category: 'Beleza e Bem-estar' },
  { id: 'massage', name: 'Massagem', icon: '👐', description: 'Terapias e relaxamento', category: 'Beleza e Bem-estar' },

  // Tecnologia e Informática
  { id: 'technology', name: 'Tecnologia', icon: '💻', description: 'Serviços de TI e informática', category: 'Tecnologia e Informática' },
  { id: 'computer-repair', name: 'Manutenção de Computadores', icon: '🖥️', description: 'Reparos e manutenção', category: 'Tecnologia e Informática' },
  { id: 'network', name: 'Redes e Internet', icon: '🌐', description: 'Instalação e configuração de redes', category: 'Tecnologia e Informática' },
  { id: 'software', name: 'Software', icon: '📱', description: 'Desenvolvimento e suporte', category: 'Tecnologia e Informática' },

  // Transporte e Logística
  { id: 'transport', name: 'Transporte', icon: '🚗', description: 'Serviços de transporte', category: 'Transporte e Logística' },
  { id: 'moving', name: 'Mudanças', icon: '📦', description: 'Transporte de móveis e objetos', category: 'Transporte e Logística' },
  { id: 'delivery', name: 'Entregas', icon: '📮', description: 'Entrega de encomendas', category: 'Transporte e Logística' },
  { id: 'passenger', name: 'Transporte de Passageiros', icon: '👥', description: 'Carona e transporte pessoal', category: 'Transporte e Logística' },

  // Educação e Tutoria
  { id: 'education', name: 'Educação', icon: '📚', description: 'Aulas e tutoria', category: 'Educação e Tutoria' },
  { id: 'tutoring', name: 'Aulas Particulares', icon: '✏️', description: 'Reforço escolar e preparação', category: 'Educação e Tutoria' },
  { id: 'language', name: 'Idiomas', icon: '🗣️', description: 'Aulas de idiomas', category: 'Educação e Tutoria' },
  { id: 'music', name: 'Música', icon: '🎵', description: 'Aulas de instrumentos musicais', category: 'Educação e Tutoria' },

  // Cuidados e Assistência
  { id: 'care', name: 'Cuidados e Assistência', icon: '🤱', description: 'Cuidados pessoais e assistência', category: 'Cuidados e Assistência' },
  { id: 'babysitting', name: 'Babá', icon: '👶', description: 'Cuidados com crianças', category: 'Cuidados e Assistência' },
  { id: 'elderly-care', name: 'Cuidador de Idosos', icon: '👴', description: 'Assistência para idosos', category: 'Cuidados e Assistência' },
  { id: 'pet-care', name: 'Cuidados com Pets', icon: '🐕', description: 'Cuidados com animais domésticos', category: 'Cuidados e Assistência' },
  { id: 'dog-walking', name: 'Dog Walker', icon: '🦮', description: 'Passeios com cães', category: 'Cuidados e Assistência' },
  { id: 'pet-grooming', name: 'Tosador', icon: '✂️', description: 'Tosa e higiene de pets', category: 'Cuidados e Assistência' },

  // Lavanderia e Costura
  { id: 'laundry', name: 'Lavanderia', icon: '👕', description: 'Lavagem e passadoria', category: 'Lavanderia e Costura' },
  { id: 'sewing', name: 'Costura', icon: '🧵', description: 'Consertos e confecções', category: 'Lavanderia e Costura' },

  // Eventos e Celebrações
  { id: 'events', name: 'Eventos', icon: '🎉', description: 'Organização de eventos', category: 'Eventos e Celebrações' },
  { id: 'catering', name: 'Buffet', icon: '🍽️', description: 'Serviços de alimentação', category: 'Eventos e Celebrações' },
  { id: 'decoration', name: 'Decoração', icon: '🎨', description: 'Decoração de eventos', category: 'Eventos e Celebrações' },

  // Manutenção Geral
  { id: 'maintenance', name: 'Manutenção Geral', icon: '🔨', description: 'Reparos e manutenção diversa', category: 'Manutenção Geral' },
  { id: 'appliance-repair', name: 'Reparo de Eletrodomésticos', icon: '🔌', description: 'Conserto de aparelhos', category: 'Manutenção Geral' },
  { id: 'locksmith', name: 'Chaveiro', icon: '🔑', description: 'Serviços de chaveiro', category: 'Manutenção Geral' },
  { id: 'glass-repair', name: 'Vidraçaria', icon: '🪟', description: 'Reparo e instalação de vidros', category: 'Manutenção Geral' }
]

// Export alias for compatibility
export const servicesList = services

// Funções utilitárias para trabalhar com serviços

// Buscar serviço por ID
export const getServiceById = (id: string): Service | undefined => {
  return services.find(service => service.id === id)
}

// Buscar serviço por nome
export const getServiceByName = (name: string): Service | undefined => {
  return services.find(service => 
    service.name.toLowerCase().includes(name.toLowerCase())
  )
}

// Buscar serviços por categoria
export const getServicesByCategory = (category: string): Service[] => {
  return services.filter(service => service.category === category)
}

// Buscar serviços que contenham um termo
export const searchServices = (term: string): Service[] => {
  const searchTerm = term.toLowerCase()
  return services.filter(service => 
    service.name.toLowerCase().includes(searchTerm) ||
    service.description?.toLowerCase().includes(searchTerm) ||
    service.category.toLowerCase().includes(searchTerm)
  )
}

// Obter todas as categorias únicas
export const getCategories = (): string[] => {
  const categories = services.map(service => service.category)
  return Array.from(new Set(categories)).sort()
}

// Obter serviços em ordem alfabética
export const getSortedServices = (): Service[] => {
  return [...services].sort((a, b) => a.name.localeCompare(b.name))
}

// Obter serviços agrupados por categoria
export const getServicesGroupedByCategory = (): Record<string, Service[]> => {
  const grouped: Record<string, Service[]> = {}
  
  services.forEach(service => {
    if (!grouped[service.category]) {
      grouped[service.category] = []
    }
    grouped[service.category].push(service)
  })
  
  return grouped
}

// Validar se um ID de serviço é válido
export const isValidServiceId = (id: string): boolean => {
  return services.some(service => service.id === id)
}

// Obter todos os IDs de serviços
export const getAllServiceIds = (): string[] => {
  return services.map(service => service.id)
}

// Obter serviços por múltiplos IDs
export const getServicesByIds = (ids: string[]): Service[] => {
  return services.filter(service => ids.includes(service.id))
}
