'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  MapPin, 
  Calendar, 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle,
  User
} from 'lucide-react'
import { ClassifiedAd } from '@/hooks/useClassifiedAds'
import { toast } from 'sonner'

interface ClassifiedAdCardProps {
  ad: ClassifiedAd
  onLike?: (adId: string) => void
  onShare?: (ad: ClassifiedAd) => void
  onContact?: (ad: ClassifiedAd) => void
}

import { serviceCategories } from '@/data/serviceCategories'

export function ClassifiedAdCard({ 
  ad, 
  onLike, 
  onShare, 
  onContact 
}: ClassifiedAdCardProps) {
  const [isLiked, setIsLiked] = useState(false)

  // Formatar data
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

  // Obter ícone da categoria
  const getCategoryIcon = (categoryId: string) => {
    const category = serviceCategories.find(cat => cat.id === categoryId)
    return category ? category.icon : '📋'
  }

  // Obter nome da categoria
  const getCategoryName = (categoryId: string) => {
    const category = serviceCategories.find(cat => cat.id === categoryId)
    return category ? category.name : 'Categoria'
  }

  // Handle like
  const handleLike = () => {
    if (onLike) {
      onLike(ad.id)
    }
    setIsLiked(!isLiked)
  }

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: ad.title,
        text: ad.description,
        url: window.location.href
      })
    } else {
      // Fallback para copiar para clipboard
      navigator.clipboard.writeText(`${ad.title}\n\n${ad.description}\n\n${window.location.href}`)
      toast.success('Link copiado para a área de transferência!')
    }
    
    if (onShare) {
      onShare(ad)
    }
  }

  // Handle contact
  const handleContact = () => {
    if (onContact) {
      onContact(ad)
    } else {
      // Mostrar mensagem sobre acordo de contato
      toast.info('Para entrar em contato, inicie uma conversa através da plataforma')
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Ícone da categoria */}
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">{getCategoryIcon(ad.category)}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Título e tipo de usuário */}
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {ad.title}
                </h3>
                <Badge variant={ad.user_type === 'professional' ? 'default' : 'secondary'}>
                  {ad.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                </Badge>
              </div>
              
              {/* Descrição */}
              <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {ad.description}
              </p>
              
              {/* Informações do anúncio */}
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{ad.user_name}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{ad.location_city || ad.location_state}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(ad.created_at)}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{ad.views} visualizações</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="flex items-center space-x-2 ml-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleLike}
                    className={isLiked ? 'text-red-500 hover:text-red-600' : ''}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isLiked ? 'Descurtir' : 'Curtir'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Compartilhar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleContact}>
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Entrar em contato</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
