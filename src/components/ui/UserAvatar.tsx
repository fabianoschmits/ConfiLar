'use client'

import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { ReferralBadge } from '@/components/referral/ReferralBadge'
import { useReferralStats } from '@/hooks/useReferralStats'

interface UserAvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  userId?: string
  showReferralBadge?: boolean
}

export function UserAvatar({ 
  src, 
  alt = 'Usuário', 
  fallback = 'U',
  size = 'md',
  className,
  userId,
  showReferralBadge = true
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Carregar stats de referral se userId fornecido
  const { stats, loading: statsLoading } = useReferralStats(showReferralBadge && userId ? userId : undefined)

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const fallbackSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg'
  }

  const handleImageError = () => {
    console.log('❌ Erro ao carregar avatar:', src)
    setImageError(true)
  }

  const handleImageLoad = () => {
    console.log('✅ Avatar carregado com sucesso:', src)
    setImageLoaded(true)
  }

  // Se não há src ou houve erro, mostrar apenas o fallback
  if (!src || imageError) {
    return (
      <div className="relative inline-block">
        <Avatar className={cn(sizeClasses[size], className)}>
          <AvatarFallback className={cn(
            "bg-blue-100 text-blue-600 font-semibold border border-gray-300",
            fallbackSize[size]
          )}>
            {fallback}
          </AvatarFallback>
        </Avatar>
        {showReferralBadge && stats && stats.tier !== 'none' && !statsLoading && (
          <div className="absolute -top-1 -right-1">
            <ReferralBadge
              tier={stats.tier}
              totalReferrals={stats.totalReferrals}
              size="sm"
              showCount={false}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative inline-block">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage 
          src={src} 
          alt={alt}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        <AvatarFallback className={cn(
          "bg-blue-100 text-blue-600 font-semibold border border-gray-300",
          fallbackSize[size]
        )}>
          {fallback}
        </AvatarFallback>
      </Avatar>
      {showReferralBadge && stats && stats.tier !== 'none' && !statsLoading && (
        <div className="absolute -top-1 -right-1">
          <ReferralBadge
            tier={stats.tier}
            totalReferrals={stats.totalReferrals}
            size="sm"
            showCount={false}
          />
        </div>
      )}
    </div>
  )
}
