'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Eye, 
  EyeOff, 
  Shield, 
  Lock,
  MessageSquare,
  Handshake
} from 'lucide-react'
import { useContactAgreements } from '@/hooks/useContactAgreements'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContext'
import Link from 'next/link'

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
  const { openChat } = useFloatingChat()
  const { areContactsRevealed } = useContactAgreements()
  const [contactsRevealed, setContactsRevealed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar se contatos estão revelados
  useEffect(() => {
    if (profile?.id && userId && profile.id !== userId) {
      setIsLoading(true)
      areContactsRevealed(userId)
        .then(setContactsRevealed)
        .finally(() => setIsLoading(false))
    } else {
      // Se é o próprio usuário, sempre mostrar contatos
      setContactsRevealed(profile?.id === userId)
      setIsLoading(false)
    }
  }, [profile?.id, userId, areContactsRevealed])

  // Função para mascarar dados
  const maskData = (data: string, type: 'phone' | 'email' | 'address') => {
    if (!data) return 'Não informado'
    
    switch (type) {
      case 'phone':
        // (11) 99999-9999 -> (11) 9****-****
        return data.replace(/(\(\d{2}\)\s?\d{1})(\d+)(\d{4})/, '$1****-****')
      case 'email':
        // email@domain.com -> e****@****.com
        const [localPart, domain] = data.split('@')
        if (!domain) return 'e****@****.com'
        const maskedLocal = localPart.charAt(0) + '****'
        const maskedDomain = '****.' + domain.split('.').pop()
        return `${maskedLocal}@${maskedDomain}`
      case 'address':
        // Rua das Flores, 123 -> Rua das ******, ***
        return data.replace(/([^,]+,?\s?)(.+)/, '$1******')
      default:
        return '******'
    }
  }

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

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center space-x-2 text-sm">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  // Se contatos não estão revelados, mostrar dados mascarados
  if (!contactsRevealed) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Dados Mascarados */}
        <div className="space-y-3">
          {phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Phone className="h-4 w-4" />
              <span className="font-mono">{maskData(phone, 'phone')}</span>
              <Lock className="h-3 w-3 text-gray-400" />
            </div>
          )}
          {email && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Mail className="h-4 w-4" />
              <span className="font-mono">{maskData(email, 'email')}</span>
              <Lock className="h-3 w-3 text-gray-400" />
            </div>
          )}
          {(address || location) && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span className="font-mono">{maskData(address || location || '', 'address')}</span>
              <Lock className="h-3 w-3 text-gray-400" />
            </div>
          )}
        </div>

        {/* Card de Proteção */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-800 mb-1">
                  Dados de Contato Protegidos
                </h4>
                <p className="text-sm text-orange-700 mb-3">
                  Os dados de contato deste {userType === 'professional' ? 'profissional' : 'cliente'} 
                  {' '}só são liberados após um acordo de serviço.
                </p>
                
                {showActions && (
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      size="sm" 
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={() => openChat(userId, 'Usuário')}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Iniciar Conversa
                    </Button>
                    <Button size="sm" variant="outline" className="border-orange-300 text-orange-700">
                      <Handshake className="h-4 w-4 mr-1" />
                      Fazer Proposta
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Contatos revelados - mostrar dados completos
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dados Revelados */}
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

      {/* Badge de Contatos Liberados */}
      <div className="flex items-center gap-2">
        <Badge variant="default" className="bg-green-500">
          <Eye className="h-3 w-3 mr-1" />
          Contatos Liberados
        </Badge>
      </div>
    </div>
  )
}






