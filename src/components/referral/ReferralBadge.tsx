'use client'

import React from 'react'
import { Star, Award, Crown, Gem, Sparkles, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReferralBadgeProps {
  tier: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  totalReferrals: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  className?: string
}

const tierConfig = {
  none: {
    icon: null,
    gradient: 'from-gray-400 to-gray-500',
    border: 'border-gray-300',
    glow: '',
    name: ''
  },
  bronze: {
    icon: Shield,
    gradient: 'from-amber-600 to-amber-700',
    border: 'border-amber-400',
    glow: 'shadow-amber-500/50',
    name: 'Embaixador Iniciante'
  },
  silver: {
    icon: Award,
    gradient: 'from-gray-400 to-gray-500',
    border: 'border-gray-300',
    glow: 'shadow-gray-400/50',
    name: 'Embaixador ConfiLar'
  },
  gold: {
    icon: Crown,
    gradient: 'from-yellow-400 to-yellow-600',
    border: 'border-yellow-300',
    glow: 'shadow-yellow-500/50',
    name: 'Embaixador Gold'
  },
  platinum: {
    icon: Gem,
    gradient: 'from-cyan-400 to-blue-500',
    border: 'border-cyan-300',
    glow: 'shadow-cyan-400/50',
    name: 'Embaixador Premium'
  },
  diamond: {
    icon: Sparkles,
    gradient: 'from-blue-400 via-purple-400 to-pink-400',
    border: 'border-blue-300',
    glow: 'shadow-blue-500/50 animate-pulse',
    name: 'Super Embaixador'
  }
}

const sizeConfig = {
  sm: {
    container: 'w-5 h-5',
    icon: 'w-3 h-3',
    count: 'w-4 h-4 text-[8px]',
    border: 'border-2'
  },
  md: {
    container: 'w-6 h-6',
    icon: 'w-4 h-4',
    count: 'w-5 h-5 text-[9px]',
    border: 'border-2'
  },
  lg: {
    container: 'w-8 h-8',
    icon: 'w-5 h-5',
    count: 'w-6 h-6 text-[10px]',
    border: 'border-2'
  }
}

export function ReferralBadge({
  tier,
  totalReferrals,
  size = 'sm',
  showCount = false,
  className
}: ReferralBadgeProps) {
  if (tier === 'none') return null

  const config = tierConfig[tier]
  const sizes = sizeConfig[size]
  const Icon = config.icon

  if (!Icon) return null

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Badge Principal */}
      <div
        className={cn(
          sizes.container,
          sizes.border,
          `bg-gradient-to-br ${config.gradient} ${config.border}`,
          'rounded-full flex items-center justify-center',
          'shadow-lg',
          config.glow
        )}
        title={`${config.name} - ${totalReferrals} indicações`}
      >
        <Icon className={cn(sizes.icon, 'text-white')} />
      </div>

      {/* Contador de Indicações */}
      {showCount && totalReferrals > 0 && (
        <div
          className={cn(
            sizes.count,
            'absolute -bottom-1 -right-1',
            'bg-blue-600 dark:bg-blue-500 rounded-full',
            'border border-white dark:border-gray-900',
            'text-white font-bold',
            'flex items-center justify-center',
            'shadow-md'
          )}
        >
          {totalReferrals > 99 ? '99+' : totalReferrals}
        </div>
      )}
    </div>
  )
}

export function ReferralBadgeLarge({
  tier,
  totalReferrals,
  className
}: Omit<ReferralBadgeProps, 'size' | 'showCount'>) {
  if (tier === 'none') return null

  const config = tierConfig[tier]
  const Icon = config.icon

  if (!Icon) return null

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
        `bg-gradient-to-r ${config.gradient}`,
        'text-white shadow-lg',
        config.glow,
        className
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-semibold">{config.name}</span>
      <span className="text-xs opacity-90">({totalReferrals})</span>
    </div>
  )
}

export function ReferralTierProgress({
  currentTier,
  totalReferrals
}: {
  currentTier: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  totalReferrals: number
}) {
  const tiers = [
    { name: 'Bronze', required: 1, tier: 'bronze' as const },
    { name: 'Prata', required: 5, tier: 'silver' as const },
    { name: 'Ouro', required: 10, tier: 'gold' as const },
    { name: 'Platina', required: 25, tier: 'platinum' as const },
    { name: 'Diamante', required: 50, tier: 'diamond' as const }
  ]

  const currentTierIndex = tiers.findIndex(t => t.tier === currentTier)
  const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null

  if (!nextTier) {
    return (
      <div className="text-center py-4">
        <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          🎉 Você alcançou o nível máximo!
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Continue indicando para manter seu status de Super Embaixador
        </p>
      </div>
    )
  }

  const remaining = nextTier.required - totalReferrals
  const progress = Math.min((totalReferrals / nextTier.required) * 100, 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700 dark:text-gray-300">
          Progresso para <span className="font-semibold">{nextTier.name}</span>
        </span>
        <span className="text-gray-600 dark:text-gray-400">
          {totalReferrals} / {nextTier.required}
        </span>
      </div>

      <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full bg-gradient-to-r transition-all duration-500',
            tierConfig[nextTier.tier].gradient
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
        {remaining > 0 ? (
          <>
            Faltam <span className="font-semibold text-blue-600 dark:text-blue-400">{remaining}</span>{' '}
            {remaining === 1 ? 'indicação' : 'indicações'} para o próximo nível
          </>
        ) : (
          <span className="text-green-600 dark:text-green-400 font-semibold">
            Nível desbloqueado! 🎉
          </span>
        )}
      </p>
    </div>
  )
}

