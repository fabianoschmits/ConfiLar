'use client'

import { Badge } from '@/components/ui/badge'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Eye
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'

interface ProtectedContactInfoProps {
  userId: string
  userType: 'professional' | 'client'
  phone?: string
  email?: string
  address?: string
  location?: string
  showActions?: boolean
  className?: string
}

export function ProtectedContactInfo({ 
  userId, 
  userType,
  phone, 
  email, 
  address, 
  location,
  showActions = true,
  className = ""
}: ProtectedContactInfoProps) {
  const { profile } = useAuthContext()

  // Se é o próprio usuário, sempre mostrar dados completos
  if (profile?.id === userId) {
    return (
      <div className={`space-y-3 ${className}`}>
        {phone && (
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{phone}</span>
          </div>
        )}
        {email && (
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{email}</span>
          </div>
        )}
        {(address || location) && (
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{address || location}</span>
          </div>
        )}
      </div>
    )
  }

  // Contatos sempre visíveis para outros usuários
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dados Sempre Visíveis */}
      <div className="space-y-3">
        {phone && (
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-4 w-4 text-green-600" />
            <span className="font-medium">{phone}</span>
            <Eye className="h-3 w-3 text-green-500" />
          </div>
        )}
        {email && (
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-green-600" />
            <span className="font-medium">{email}</span>
            <Eye className="h-3 w-3 text-green-500" />
          </div>
        )}
        {(address || location) && (
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-green-600" />
            <span className="font-medium">{address || location}</span>
            <Eye className="h-3 w-3 text-green-500" />
          </div>
        )}
      </div>

      {/* Badge de Contatos Visíveis */}
      <div className="flex items-center gap-2">
        <Badge variant="default" className="bg-green-500">
          <Eye className="h-3 w-3 mr-1" />
          Contatos Visíveis
        </Badge>
      </div>
    </div>
  )
}






