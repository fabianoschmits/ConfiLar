'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  spacing?: 'none' | 'sm' | 'md' | 'lg'
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = 'xl',
  padding = 'md',
  spacing = 'md'
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  }

  const paddingClasses = {
    none: '',
    sm: 'px-2 py-2',
    md: 'px-4 py-4 lg:px-6 lg:py-6',
    lg: 'px-6 py-6 lg:px-8 lg:py-8'
  }

  const spacingClasses = {
    none: '',
    sm: 'space-y-2',
    md: 'space-y-4 lg:space-y-6',
    lg: 'space-y-6 lg:space-y-8'
  }

  return (
    <div className={cn(
      'mx-auto w-full',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      spacingClasses[spacing],
      className
    )}>
      {children}
    </div>
  )
}

interface MobileCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

export function MobileCard({
  children,
  className,
  padding = 'md',
  shadow = 'md',
  rounded = 'lg'
}: MobileCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4 lg:p-6',
    lg: 'p-6 lg:p-8'
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }

  const roundedClasses = {
    none: '',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl'
  }

  return (
    <div className={cn(
      'bg-white border border-gray-200',
      paddingClasses[padding],
      shadowClasses[shadow],
      roundedClasses[rounded],
      className
    )}>
      {children}
    </div>
  )
}

interface MobileGridProps {
  children: React.ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4
  gap?: 'none' | 'sm' | 'md' | 'lg'
}

export function MobileGrid({
  children,
  className,
  cols = 1,
  gap = 'md'
}: MobileGridProps) {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  const gapClasses = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  return (
    <div className={cn(
      'grid',
      colsClasses[cols],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}

interface MobileListProps {
  children: React.ReactNode
  className?: string
  spacing?: 'none' | 'sm' | 'md' | 'lg'
  dividers?: boolean
}

export function MobileList({
  children,
  className,
  spacing = 'md',
  dividers = false
}: MobileListProps) {
  const spacingClasses = {
    none: '',
    sm: 'space-y-1',
    md: 'space-y-2',
    lg: 'space-y-3'
  }

  return (
    <div className={cn(
      'divide-y divide-gray-200',
      spacingClasses[spacing],
      !dividers && 'divide-y-0',
      className
    )}>
      {children}
    </div>
  )
}

interface MobileListItemProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  clickable?: boolean
  onClick?: () => void
}

export function MobileListItem({
  children,
  className,
  padding = 'md',
  clickable = false,
  onClick
}: MobileListItemProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-3 lg:p-4',
    lg: 'p-4 lg:p-6'
  }

  return (
    <div
      className={cn(
        paddingClasses[padding],
        clickable && 'cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
