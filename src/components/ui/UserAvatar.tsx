'use client'

import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function UserAvatar({ 
  src, 
  alt = 'Usuário', 
  fallback = 'U',
  size = 'md',
  className 
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

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
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarFallback className={cn(
          "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
          fallbackSize[size]
        )}>
          {fallback}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage 
        src={src} 
        alt={alt}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      <AvatarFallback className={cn(
        "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
        fallbackSize[size]
      )}>
        {fallback}
      </AvatarFallback>
    </Avatar>
  )
}
