'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button'
  width?: string | number
  height?: string | number
  style?: React.CSSProperties
}

export function Skeleton({ 
  className, 
  variant = 'default',
  width,
  height,
  style,
  ...props 
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700"
  
  const variantClasses = {
    default: "rounded-md",
    card: "rounded-lg border border-gray-200 dark:border-gray-700",
    text: "rounded",
    avatar: "rounded-full",
    button: "rounded-md"
  }

  const combinedStyle = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
    ...style
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={combinedStyle}
      {...props}
    />
  )
}

// Skeletons pré-definidos para casos comuns
export function PostSkeleton() {
  return (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Header do post */}
      <div className="flex items-center space-x-3">
        <Skeleton variant="avatar" width={40} height={40} />
        <div className="space-y-2 flex-1">
          <Skeleton width="25%" height={16} />
          <Skeleton width="15%" height={12} />
        </div>
      </div>
      
      {/* Conteúdo do post */}
      <div className="space-y-2">
        <Skeleton width="100%" height={20} />
        <Skeleton width="80%" height={20} />
        <Skeleton width="60%" height={20} />
      </div>
      
      {/* Imagens */}
      <div className="grid grid-cols-2 gap-2">
        <Skeleton width="100%" height={120} />
        <Skeleton width="100%" height={120} />
      </div>
      
      {/* Ações */}
      <div className="flex items-center space-x-4">
        <Skeleton width={60} height={32} />
        <Skeleton width={80} height={32} />
        <Skeleton width={60} height={32} />
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header do perfil */}
      <div className="flex items-center space-x-4">
        <Skeleton variant="avatar" width={80} height={80} />
        <div className="space-y-3 flex-1">
          <Skeleton width="40%" height={24} />
          <Skeleton width="30%" height={16} />
          <Skeleton width="50%" height={14} />
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center space-y-2">
          <Skeleton width="100%" height={20} />
          <Skeleton width="60%" height={14} />
        </div>
        <div className="text-center space-y-2">
          <Skeleton width="100%" height={20} />
          <Skeleton width="60%" height={14} />
        </div>
        <div className="text-center space-y-2">
          <Skeleton width="100%" height={20} />
          <Skeleton width="60%" height={14} />
        </div>
      </div>
      
      {/* Bio */}
      <div className="space-y-2">
        <Skeleton width="100%" height={16} />
        <Skeleton width="90%" height={16} />
        <Skeleton width="70%" height={16} />
      </div>
    </div>
  )
}

export function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  )
}

export function ClassifiedsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
          <Skeleton width="100%" height={120} />
          <Skeleton width="80%" height={18} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={16} />
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={24} />
            <Skeleton width="80%" height={12} />
          </div>
        ))}
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
          <Skeleton width="50%" height={20} />
          <Skeleton width="100%" height={200} />
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
          <Skeleton width="50%" height={20} />
          <Skeleton width="100%" height={200} />
        </div>
      </div>
    </div>
  )
}
