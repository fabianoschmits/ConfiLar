'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxStars?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  showCount?: boolean
  count?: number
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
}

export function StarRating({ 
  rating, 
  maxStars = 5, 
  size = 'md', 
  showValue = false,
  showCount = false,
  count,
  className,
  variant = 'default'
}: StarRatingProps) {
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3'
      case 'lg':
        return 'h-5 w-5'
      default:
        return 'h-4 w-4'
    }
  }

  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs'
      case 'lg':
        return 'text-base'
      default:
        return 'text-sm'
    }
  }

  const renderStars = () => {
    return Array.from({ length: maxStars }).map((_, i) => {
      const starValue = i + 1
      const isFullStar = starValue <= Math.floor(rating)
      const isHalfStar = starValue === Math.ceil(rating) && rating % 1 !== 0
      
      return (
        <Star
          key={i}
          className={cn(
            getSizeClasses(),
            {
              'text-yellow-400 fill-current': isFullStar,
              'text-yellow-400 fill-current opacity-50': isHalfStar,
              'text-gray-300': !isFullStar && !isHalfStar,
            }
          )}
        />
      )
    })
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <div className="flex">
          {renderStars()}
        </div>
        {showValue && (
          <span className={cn('font-medium text-gray-700', getTextSizeClasses())}>
            {rating.toFixed(1)}
          </span>
        )}
        {showCount && count !== undefined && (
          <span className={cn('text-gray-500', getTextSizeClasses())}>
            ({count})
          </span>
        )}
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('flex flex-col space-y-1', className)}>
        <div className="flex items-center gap-2">
          <div className="flex">
            {renderStars()}
          </div>
          <span className={cn('font-semibold text-gray-900', getTextSizeClasses())}>
            {rating.toFixed(1)}
          </span>
        </div>
        {showCount && count !== undefined && (
          <span className={cn('text-gray-500', getTextSizeClasses())}>
            Baseado em {count} {count === 1 ? 'avaliação' : 'avaliações'}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {renderStars()}
      </div>
      {showValue && (
        <span className={cn('font-medium text-gray-700 ml-1', getTextSizeClasses())}>
          {rating.toFixed(1)}
        </span>
      )}
      {showCount && count !== undefined && (
        <span className={cn('text-gray-500 ml-1', getTextSizeClasses())}>
          ({count})
        </span>
      )}
    </div>
  )
}

// Componente para exibir apenas o número de estrelas sem valor
export function StarCount({ 
  count, 
  size = 'md', 
  className 
}: { 
  count: number
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3'
      case 'lg':
        return 'h-5 w-5'
      default:
        return 'h-4 w-4'
    }
  }

  return (
    <div className={cn('flex items-center', className)}>
      <Star className={cn(getSizeClasses(), 'text-yellow-400 fill-current mr-1')} />
      <span className="font-medium text-gray-700">{count}</span>
    </div>
  )
}

// Componente para input de avaliação (clicável)
interface InteractiveStarRatingProps {
  rating: number
  onRatingChange: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}

export function InteractiveStarRating({
  rating,
  onRatingChange,
  size = 'md',
  className,
  disabled = false
}: InteractiveStarRatingProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4'
      case 'lg':
        return 'h-6 w-6'
      default:
        return 'h-5 w-5'
    }
  }

  return (
    <div className={cn('flex gap-1', className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1
        const isActive = starValue <= rating
        
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onRatingChange(starValue)}
            className={cn(
              'transition-colors duration-200',
              {
                'hover:scale-110 cursor-pointer': !disabled,
                'cursor-not-allowed opacity-50': disabled,
              }
            )}
          >
            <Star
              className={cn(
                getSizeClasses(),
                {
                  'text-yellow-400 fill-current': isActive,
                  'text-gray-300 hover:text-yellow-300': !isActive && !disabled,
                }
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

