'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MapPin, 
  Calendar, 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle,
  User,
  Briefcase,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface ClassifiedAd {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  location_state: string
  location_city: string
  user_name: string
  user_type: 'client' | 'professional'
  created_at: string
  is_active: boolean
  views_count?: number
  user_avatar_url?: string
  ad_type: 'service_request' | 'service_offer'
  budget?: number
  price?: number
  urgency?: 'low' | 'medium' | 'high'
  availability?: string
}

interface AdCardProps {
  ad: ClassifiedAd
  onLike?: (adId: string) => void
  onShare?: (ad: ClassifiedAd) => void
  onContact?: (ad: ClassifiedAd) => void
}

export function AdCard({ ad, onLike, onShare, onContact }: AdCardProps) {
  const [isLiked, setIsLiked] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Hoje'
    if (diffDays === 2) return 'Ontem'
    if (diffDays < 7) return `${diffDays - 1} dias atrás`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`
    return date.toLocaleDateString('pt-BR')
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyIcon = (urgency?: string) => {
    switch (urgency) {
      case 'low': return <CheckCircle className="h-3 w-3" />
      case 'medium': return <Clock className="h-3 w-3" />
      case 'high': return <AlertTriangle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const getUrgencyLabel = (urgency?: string) => {
    switch (urgency) {
      case 'low': return 'Baixa'
      case 'medium': return 'Média'
      case 'high': return 'Alta'
      default: return 'Média'
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.(ad.id)
    toast.success(isLiked ? 'Removido dos favoritos' : 'Adicionado aos favoritos')
  }

  const handleShare = () => {
    onShare?.(ad)
    toast.success('Link copiado para a área de transferência')
  }

  const handleContact = () => {
    onContact?.(ad)
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant={ad.ad_type === 'service_request' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {ad.ad_type === 'service_request' ? (
                  <><User className="h-3 w-3 mr-1" /> Pedido</>
                ) : (
                  <><Briefcase className="h-3 w-3 mr-1" /> Oferta</>
                )}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {ad.category}
              </Badge>
              {ad.urgency && (
                <Badge className={`text-xs ${getUrgencyColor(ad.urgency)}`}>
                  {getUrgencyIcon(ad.urgency)}
                  <span className="ml-1">{getUrgencyLabel(ad.urgency)}</span>
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
              {ad.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
              {ad.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Informações específicas do tipo */}
        {ad.ad_type === 'service_request' && ad.budget && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded-lg">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Orçamento: R$ {ad.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {ad.ad_type === 'service_offer' && ad.price && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-green-50 rounded-lg">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Preço: R$ {ad.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Informações de localização e data */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{ad.location_city}, {ad.location_state}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(ad.created_at)}</span>
          </div>
          {ad.views_count && (
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{ad.views_count}</span>
            </div>
          )}
        </div>

        {/* Informações do usuário */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={ad.user_avatar_url} />
              <AvatarFallback className="text-xs">
                {ad.user_name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{ad.user_name}</p>
              <p className="text-xs text-gray-500">
                {ad.user_type === 'professional' ? 'Profissional' : 'Cliente'}
              </p>
            </div>
          </div>
        </div>

        {/* Disponibilidade para ofertas */}
        {ad.ad_type === 'service_offer' && ad.availability && (
          <div className="mb-4 p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Disponibilidade:</p>
            <p className="text-sm text-gray-800">{ad.availability}</p>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLike}
            className="flex-1"
          >
            <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            Favoritar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleContact}
            className="flex-1"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Contatar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
