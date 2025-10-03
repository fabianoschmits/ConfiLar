'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, Bell, Grid3X3 } from 'lucide-react'

export type FeedType = 'all' | 'posts' | 'notifications'

interface FeedTypeFilterProps {
  currentFilter: FeedType
  onFilterChange: (filter: FeedType) => void
  className?: string
}

export function FeedTypeFilter({ 
  currentFilter, 
  onFilterChange, 
  className = '' 
}: FeedTypeFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const filterOptions = [
    {
      value: 'all' as FeedType,
      label: 'Todos',
      icon: Grid3X3,
      description: 'Posts e notificações'
    },
    {
      value: 'posts' as FeedType,
      label: 'Posts',
      icon: MessageSquare,
      description: 'Apenas posts do feed'
    },
    {
      value: 'notifications' as FeedType,
      label: 'Notificações',
      icon: Bell,
      description: 'Apenas notificações'
    }
  ]

  const currentOption = filterOptions.find(option => option.value === currentFilter)

  return (
    <div className={`relative ${className}`}>
      {/* Mobile: Filtro discreto acima do menu */}
      <div className="lg:hidden">
        <div className="fixed top-16 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200/30 px-3 py-1.5">
          <div className="flex items-center justify-center space-x-0.5">
            {filterOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => onFilterChange(option.value)}
                  className={`flex items-center space-x-1 px-1.5 py-1 rounded-md text-xs transition-all duration-200 ${
                    currentFilter === option.value
                      ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span className="hidden xs:inline text-xs">{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Desktop: Filtro discreto no canto */}
      <div className="hidden lg:block">
        <div className="fixed top-20 right-4 z-30">
          <div className="bg-white/70 backdrop-blur-md border border-gray-200/40 rounded-lg shadow-sm p-1 opacity-80 hover:opacity-100 transition-opacity duration-200">
            <div className="flex flex-col space-y-0.5">
              {filterOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => onFilterChange(option.value)}
                    className={`flex items-center space-x-2 px-2 py-1.5 rounded-md text-xs transition-all duration-200 ${
                      currentFilter === option.value
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    title={option.description}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de filtro ativo (apenas mobile) */}
      {currentFilter !== 'all' && (
        <div className="lg:hidden fixed top-12 right-3 z-50">
          <div className="bg-blue-500/90 text-white text-xs px-1.5 py-0.5 rounded-full shadow-sm">
            {currentOption?.label}
          </div>
        </div>
      )}
    </div>
  )
}
