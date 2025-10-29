// ============================================
// CONSTANTES DE PREÇOS PREMIUM - SISTEMA CONFIPOINTS
// ============================================
// CONVERSÃO: R$ 1,00 = 100 pontos | R$ 10,00 = 1.000 pontos
// ============================================

export const PREMIUM_PRICES = {
  // Curtida Premium
  LIKE: {
    POINTS: 10,
    BRL: 0.10,
    DESCRIPTION: 'Curtida com destaque especial',
    DURATION: 'Permanente'
  },
  
  // Comentário Premium  
  COMMENT: {
    POINTS: 50,
    BRL: 0.50,
    DESCRIPTION: 'Comentário destacado no topo',
    DURATION: 'Permanente'
  },
  
  // Post Premium - Múltiplas Opções
  POST: {
    POINTS: 1000,
    BRL: 10.00,
    DESCRIPTION: 'Post em destaque no feed',
    DURATION: '1 dia'
  },
  
  // Opções de Post Premium por Duração (4 opções)
  POST_1_DAY: {
    POINTS: 1000,
    BRL: 10.00,
    DESCRIPTION: 'Post em destaque no feed',
    DURATION: '1 dia',
    DAYS: 1
  },
  
  POST_7_DAYS: {
    POINTS: 3000,
    BRL: 30.00,
    DESCRIPTION: 'Post em destaque no feed',
    DURATION: '7 dias',
    DAYS: 7
  },
  
  POST_14_DAYS: {
    POINTS: 5000,
    BRL: 50.00,
    DESCRIPTION: 'Post em destaque no feed',
    DURATION: '14 dias',
    DAYS: 14
  },
  
  POST_30_DAYS: {
    POINTS: 9000,
    BRL: 90.00,
    DESCRIPTION: 'Post em destaque no feed',
    DURATION: '30 dias',
    DAYS: 30
  },
  
  // Anúncio Premium
  AD: {
    POINTS: 5000,
    BRL: 50.00,
    DESCRIPTION: 'Anúncio destacado',
    DURATION: '30 dias'
  }
} as const

// Taxa de conversão
export const CONVERSION_RATE = {
  POINTS_PER_BRL: 100,  // 100 pontos = R$ 1,00
  BRL_PER_POINT: 0.01   // 1 ponto = R$ 0,01
} as const

// Função helper para converter pontos em reais
export function pointsToBRL(points: number): number {
  return points * CONVERSION_RATE.BRL_PER_POINT
}

// Função helper para converter reais em pontos
export function brlToPoints(brl: number): number {
  return Math.floor(brl * CONVERSION_RATE.POINTS_PER_BRL)
}

