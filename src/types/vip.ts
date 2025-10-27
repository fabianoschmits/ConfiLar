// ============================================
// TIPOS PARA SISTEMA VIP
// ============================================

export type VipBadgeType = 'vip_bronze' | 'vip_silver' | 'vip_gold' | 'vip_platinum' | 'vip_diamond'

export interface VipBadge {
  id: string
  user_id: string
  badge_type: VipBadgeType
  badge_name: string
  badge_description: string
  badge_icon: string
  badge_color: string
  is_active: boolean
  purchased_at: string
  expires_at?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface VipBadgeConfig {
  badge_type: VipBadgeType
  name: string
  description: string
  icon: string
  color: string
  min_purchase_amount: number
  duration_days?: number
}

export const VIP_BADGE_CONFIGS: Record<VipBadgeType, VipBadgeConfig> = {
  vip_bronze: {
    badge_type: 'vip_bronze',
    name: 'VIP Bronze',
    description: 'Cliente VIP Bronze - Comprou R$ 20+ em pontos',
    icon: '🥉',
    color: '#CD7F32',
    min_purchase_amount: 20
  },
  vip_silver: {
    badge_type: 'vip_silver',
    name: 'VIP Silver',
    description: 'Cliente VIP Silver - Comprou R$ 50+ em pontos',
    icon: '🥈',
    color: '#C0C0C0',
    min_purchase_amount: 50
  },
  vip_gold: {
    badge_type: 'vip_gold',
    name: 'VIP Gold',
    description: 'Cliente VIP Gold - Comprou R$ 100+ em pontos',
    icon: '👑',
    color: '#FFD700',
    min_purchase_amount: 100
  },
  vip_platinum: {
    badge_type: 'vip_platinum',
    name: 'VIP Platinum',
    description: 'Cliente VIP Platinum - Comprou R$ 500+ em pontos',
    icon: '💎',
    color: '#E5E4E2',
    min_purchase_amount: 500
  },
  vip_diamond: {
    badge_type: 'vip_diamond',
    name: 'VIP Diamond',
    description: 'Cliente VIP Diamond - Comprou R$ 1000+ em pontos',
    icon: '💠',
    color: '#B9F2FF',
    min_purchase_amount: 1000
  }
}

export function getVipBadgeForAmount(amount: number): VipBadgeType | null {
  if (amount >= VIP_BADGE_CONFIGS.vip_diamond.min_purchase_amount) return 'vip_diamond'
  if (amount >= VIP_BADGE_CONFIGS.vip_platinum.min_purchase_amount) return 'vip_platinum'
  if (amount >= VIP_BADGE_CONFIGS.vip_gold.min_purchase_amount) return 'vip_gold'
  if (amount >= VIP_BADGE_CONFIGS.vip_silver.min_purchase_amount) return 'vip_silver'
  if (amount >= VIP_BADGE_CONFIGS.vip_bronze.min_purchase_amount) return 'vip_bronze'
  return null
}

export function getVipBadgeConfig(badgeType: VipBadgeType): VipBadgeConfig {
  return VIP_BADGE_CONFIGS[badgeType]
}

