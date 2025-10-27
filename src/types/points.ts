// ============================================
// TIPOS PARA SISTEMA DE PONTOS - FASE 1
// ============================================

export type UserLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

export type PointTransactionType = 'earn' | 'spend' | 'transfer' | 'purchase' | 'refund'

export type PointSource = 
  | 'premium_like'
  | 'premium_post'
  | 'premium_ad'
  | 'level_up'
  | 'milestone_reached'
  | 'referral_signup'
  | 'referral_profile_completed' 
  | 'referral_first_post'
  | 'referral_first_review'
  | 'referral_active_30_days'

export interface PointTransaction {
  id: string
  user_id: string
  amount: number // Positivo = ganhou, Negativo = gastou
  type: PointTransactionType
  source: PointSource
  description?: string
  metadata?: Record<string, any>
  referral_id?: string
  post_id?: string
  related_user_id?: string
  created_at: string
  processed_at: string
}

export interface PointsConfig {
  id: string
  action_type: PointSource
  points_value: number
  daily_limit?: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserPointsBalance {
  balance: number
  level: UserLevel
  daily_earned: number
  total_earned: number
  total_spent: number
  last_daily_reset?: string
}

export interface UserPointsStats {
  user_id: string
  full_name: string
  points_balance: number
  user_level: UserLevel
  daily_points_earned: number
  total_points_earned: number
  total_points_spent: number
  last_daily_reset: string
  monthly_earned: number
  monthly_spent: number
  global_rank: number
}

export interface PointsLeaderboard {
  user_id: string
  full_name: string
  avatar_url?: string
  points_balance: number
  user_level: UserLevel
  total_points_earned: number
  global_rank: number
}

export interface AddPointsRequest {
  action_type: PointSource
  description?: string
  metadata?: Record<string, any>
  referral_id?: string
  post_id?: string
  related_user_id?: string
}

export interface PointsHistoryFilters {
  type?: PointTransactionType
  source?: PointSource
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

export interface PointsDashboard {
  balance: UserPointsBalance
  recent_transactions: PointTransaction[]
  monthly_stats: {
    earned: number
    spent: number
    net: number
  }
  level_progress: {
    current_level: UserLevel
    next_level: UserLevel | null
    points_to_next: number
    progress_percentage: number
  }
  leaderboard_position: number
  daily_limits: {
    [key in PointSource]?: {
      earned: number
      limit: number
      remaining: number
    }
  }
}

// ============================================
// CONSTANTES PARA SISTEMA DE PONTOS
// ============================================

export const USER_LEVELS: Record<UserLevel, { min_points: number; color: string; name: string }> = {
  bronze: { min_points: 0, color: '#CD7F32', name: 'Bronze' },
  silver: { min_points: 500, color: '#C0C0C0', name: 'Prata' },
  gold: { min_points: 2000, color: '#FFD700', name: 'Ouro' },
  platinum: { min_points: 5000, color: '#E5E4E2', name: 'Platina' },
  diamond: { min_points: 10000, color: '#B9F2FF', name: 'Diamante' }
}

export const POINTS_SOURCES_CONFIG: Record<PointSource, { 
  points: number; 
  daily_limit?: number; 
  description: string;
  icon: string;
  is_featured?: boolean;
}> = {
  // Sistema de Ações Premium (PAGAS)
  premium_like: { 
    points: -5, 
    daily_limit: 1000,
    description: 'Curtir post (premium)',
    icon: '⚡',
    is_featured: true
  },
  premium_post: { 
    points: -50, 
    daily_limit: 50,
    description: 'Criar post premium',
    icon: '🚀',
    is_featured: true
  },
  premium_ad: { 
    points: -200, 
    daily_limit: 20,
    description: 'Criar anúncio premium destacado',
    icon: '⭐',
    is_featured: true
  },
  
  // Sistema de Referral (APENAS RANKING - SEM PONTOS CONFIPOINTS)
  referral_signup: { 
    points: 0, 
    description: 'Pessoa indicada se cadastrou',
    icon: '👥',
    is_featured: false
  },
  referral_profile_completed: { 
    points: 0, 
    description: 'Pessoa indicada completou perfil',
    icon: '✅',
    is_featured: false
  },
  referral_first_post: { 
    points: 0, 
    description: 'Pessoa indicada fez primeiro post',
    icon: '📝',
    is_featured: false
  },
  referral_first_review: { 
    points: 0, 
    description: 'Pessoa indicada fez primeira avaliação',
    icon: '⭐',
    is_featured: false
  },
  referral_active_30_days: { 
    points: 0, 
    description: 'Pessoa indicada ficou ativa por 30 dias',
    icon: '🔥',
    is_featured: false
  },
  
  // Sistema de Níveis
  level_up: { 
    points: 0, 
    description: 'Subiu de nível',
    icon: '🎉',
    is_featured: false
  },
  milestone_reached: { 
    points: 0, 
    description: 'Alcançou marco',
    icon: '🏆',
    is_featured: false
  }
}

// ============================================
// UTILITÁRIOS PARA SISTEMA DE PONTOS
// ============================================

export function getLevelFromPoints(points: number): UserLevel {
  if (points >= USER_LEVELS.diamond.min_points) return 'diamond'
  if (points >= USER_LEVELS.platinum.min_points) return 'platinum'
  if (points >= USER_LEVELS.gold.min_points) return 'gold'
  if (points >= USER_LEVELS.silver.min_points) return 'silver'
  return 'bronze'
}

export function getNextLevel(currentLevel: UserLevel): UserLevel | null {
  const levels: UserLevel[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond']
  const currentIndex = levels.indexOf(currentLevel)
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null
}

export function getPointsToNextLevel(currentPoints: number, currentLevel: UserLevel): number {
  const nextLevel = getNextLevel(currentLevel)
  if (!nextLevel) return 0
  
  // Verificar se o próximo nível existe
  if (!USER_LEVELS[nextLevel]) {
    console.warn(`Próximo nível inválido: ${nextLevel}`)
    return 0
  }
  
  const nextLevelMinPoints = USER_LEVELS[nextLevel].min_points
  return Math.max(0, nextLevelMinPoints - currentPoints)
}

export function getLevelProgress(currentPoints: number, currentLevel: UserLevel): number {
  const nextLevel = getNextLevel(currentLevel)
  if (!nextLevel) return 100
  
  // Verificar se o nível atual existe
  if (!USER_LEVELS[currentLevel]) {
    console.warn(`Nível inválido: ${currentLevel}`)
    return 0
  }
  
  const currentLevelMinPoints = USER_LEVELS[currentLevel].min_points
  const nextLevelMinPoints = USER_LEVELS[nextLevel].min_points
  const levelRange = nextLevelMinPoints - currentLevelMinPoints
  const progress = currentPoints - currentLevelMinPoints
  
  return Math.min(100, Math.max(0, (progress / levelRange) * 100))
}

export function formatPoints(points: number): string {
  // Verificar se points é válido
  if (points === null || points === undefined || isNaN(points)) {
    return '0'
  }
  
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`
  }
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`
  }
  return points.toString()
}

export function getPointsSourceIcon(source: PointSource): string {
  return POINTS_SOURCES_CONFIG[source]?.icon || '💰'
}

export function getPointsSourceDescription(source: PointSource): string {
  return POINTS_SOURCES_CONFIG[source]?.description || source
}
