'use client'

import { useState } from 'react'
import { User, Briefcase, Check, X, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CompactUserBadgesProps {
  userType: 'professional' | 'client' | null
  isAvailable?: boolean
  isPremium?: boolean
  showPremium?: boolean
}

export function CompactUserBadges({ 
  userType, 
  isAvailable, 
  isPremium = false,
  showPremium = false
}: CompactUserBadgesProps) {
  const [showUserTypeTooltip, setShowUserTypeTooltip] = useState(false)
  const [showAvailabilityTooltip, setShowAvailabilityTooltip] = useState(false)
  const [showPremiumTooltip, setShowPremiumTooltip] = useState(false)

  return (
    <div className="flex items-center -space-x-1 sm:gap-0">
      {/* Ícone de Tipo de Usuário */}
      <div 
        className="relative"
        onMouseEnter={() => setShowUserTypeTooltip(true)}
        onMouseLeave={() => setShowUserTypeTooltip(false)}
      >
        <button
          className={`p-0 m-0 transition-all duration-200 hover:scale-125 flex items-center justify-center ${
            userType === 'professional'
              ? 'text-blue-600 hover:text-blue-700' 
              : 'text-purple-600 hover:text-purple-700'
          }`}
          onClick={() => setShowUserTypeTooltip(!showUserTypeTooltip)}
        >
          {userType === 'professional' ? (
            <Briefcase className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
          ) : (
            <User className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
          )}
        </button>
        
        {/* Tooltip */}
        {showUserTypeTooltip && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 whitespace-nowrap">
            <Badge 
              className={`text-xs font-medium px-2 py-1 shadow-lg ${
                userType === 'professional'
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {userType === 'professional' ? 'Profissional' : 'Cliente'}
            </Badge>
          </div>
        )}
      </div>

      {/* Ícone de Disponibilidade */}
      {isAvailable !== undefined && (
        <div 
          className="relative"
          onMouseEnter={() => setShowAvailabilityTooltip(true)}
          onMouseLeave={() => setShowAvailabilityTooltip(false)}
        >
          <button
            className={`p-0 m-0 transition-all duration-200 hover:scale-125 flex items-center justify-center ${
              isAvailable
                ? 'text-green-600 hover:text-green-700' 
                : 'text-red-600 hover:text-red-700'
            }`}
            onClick={() => setShowAvailabilityTooltip(!showAvailabilityTooltip)}
          >
            {isAvailable ? (
              <Check className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
            ) : (
              <X className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
            )}
          </button>
          
          {/* Tooltip */}
          {showAvailabilityTooltip && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 whitespace-nowrap">
              <Badge 
                className={`text-xs font-medium px-2 py-1 shadow-lg ${
                  isAvailable
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isAvailable ? 'Disponível' : 'Indisponível'}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Ícone Premium */}
      {showPremium && isPremium && (
        <div 
          className="relative"
          onMouseEnter={() => setShowPremiumTooltip(true)}
          onMouseLeave={() => setShowPremiumTooltip(false)}
        >
          <button
            className="p-0 m-0 transition-all duration-200 hover:scale-125 flex items-center justify-center text-yellow-500 hover:text-yellow-600"
            onClick={() => setShowPremiumTooltip(!showPremiumTooltip)}
          >
            <Crown className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
          </button>
          
          {/* Tooltip */}
          {showPremiumTooltip && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 whitespace-nowrap">
              <Badge className="text-xs font-medium px-2 py-1 shadow-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700">
                Post Premium
              </Badge>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

