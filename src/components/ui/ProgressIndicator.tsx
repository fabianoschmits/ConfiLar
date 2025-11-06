'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressIndicatorProps {
  progress?: number // 0-100
  message?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'bar' | 'dots'
  className?: string
}

export function ProgressIndicator({
  progress,
  message,
  size = 'md',
  variant = 'spinner',
  className
}: ProgressIndicatorProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  if (variant === 'spinner') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
        <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />
        {message && (
          <p className={cn('text-gray-600 dark:text-gray-400', textSizeClasses[size])}>
            {message}
          </p>
        )}
      </div>
    )
  }

  if (variant === 'bar' && progress !== undefined) {
    return (
      <div className={cn('w-full space-y-2', className)}>
        {message && (
          <div className="flex items-center justify-between">
            <p className={cn('text-gray-700 dark:text-gray-300', textSizeClasses[size])}>
              {message}
            </p>
            <span className={cn('text-gray-500 dark:text-gray-400', textSizeClasses[size])}>
              {Math.round(progress)}%
            </span>
          </div>
        )}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {message && (
          <p className={cn('text-gray-600 dark:text-gray-400', textSizeClasses[size])}>
            {message}
          </p>
        )}
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'bg-blue-600 rounded-full animate-bounce',
                size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5'
              )}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return null
}

