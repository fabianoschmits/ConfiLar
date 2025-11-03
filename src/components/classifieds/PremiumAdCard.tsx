'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { MapPin, Calendar, User, Eye, MessageCircle, Crown, Sparkles, Zap, Star, TrendingUp, Target } from 'lucide-react'
import Link from 'next/link'
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'
import { ReportButton } from '@/components/ReportButton'

interface PremiumAdCardProps {
  ad: {
    id: string
    user_id: string
    user_name: string
    user_avatar?: string
    user_type: string
    title: string
    description: string
    service_type?: string
    category?: string
    location_city: string
    location_state: string
    price_range?: string
    contact_phone?: string
    contact_email?: string
    images?: string[]
    is_premium?: boolean
    premium_points_spent?: number
    premium_expires_at?: string
    premium_highlight_color?: string
    created_at: string
    updated_at?: string
  }
  onEdit?: (adId: string) => void
  onDelete?: (adId: string) => void
  onReport?: (adId: string) => void
  isDeleting?: boolean
}

export function PremiumAdCard({
  ad,
  onEdit,
  onDelete,
  onReport,
  isDeleting = false
}: PremiumAdCardProps) {
  const { openChat } = useFloatingChat()
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  // Verificar se é um anúncio premium
  const isPremiumAd = ad.is_premium || false
  const premiumExpired = ad.premium_expires_at ? new Date(ad.premium_expires_at) < new Date() : false

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora mesmo'
    if (diffInHours === 1) return '1 hora atrás'
    if (diffInHours < 24) return `${diffInHours} horas atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return '1 dia atrás'
    return `${diffInDays} dias atrás`
  }

  const handleImageClick = (imageUrl: string) => {
    if (expandedImage === imageUrl) {
      setExpandedImage(null)
    } else {
      setExpandedImage(imageUrl)
    }
  }

  const handleContact = () => {
    openChat(ad.user_id, ad.user_name)
  }

  return (
    <div className="relative">
      {/* Efeito de brilho sutil */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl blur-sm opacity-40"></div>
      
      <Card 
        id={`ad-${ad.id}`} 
        className="relative overflow-hidden transition-all duration-300 border border-amber-300 bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-amber-100/40 dark:from-amber-900/20 dark:via-yellow-900/15 dark:to-amber-800/10 shadow-lg shadow-amber-200/30 dark:shadow-amber-900/20 hover:shadow-xl hover:shadow-amber-300/40 dark:hover:shadow-amber-800/30"
      >
        {/* Header com efeito sutil */}
        <CardHeader className="pb-0 p-4 -mb-2 bg-gradient-to-r from-amber-50/50 to-yellow-50/50 dark:from-amber-900/10 dark:to-yellow-900/10">
          <div className="flex items-start space-x-3">
            {/* Avatar com efeito sutil */}
            <div className="flex-shrink-0 relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full blur-sm opacity-30"></div>
              <Link href={`/perfil/${ad.user_id}`} className="hover:opacity-80 transition-opacity relative">
                <UserAvatar 
                  src={ad.user_avatar}
                  alt={ad.user_name}
                  fallback={ad.user_name?.charAt(0).toUpperCase() || 'U'}
                  size="lg"
                  userId={ad.user_id}
                  showReferralBadge={true}
                  className="cursor-pointer hover:ring-2 hover:ring-amber-400 hover:ring-offset-2 transition-all relative z-10"
                />
              </Link>
            </div>
            
            {/* Informações do Usuário */}
            <div className="flex-1 min-w-0">
              <div className="cursor-pointer">
                <h3 className="font-bold text-gray-900 dark:text-white truncate hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors text-lg">
                  <Link href={`/perfil/${ad.user_id}`}>
                    {ad.user_name}
                  </Link>
                </h3>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                {/* Tag de Tipo de Usuário */}
                <Badge 
                  variant={ad.user_type === 'professional' ? 'default' : 'secondary'}
                  className={`text-[9px] sm:text-xs font-medium px-1 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1 transition-all duration-300 ${
                    ad.user_type === 'professional'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200 shadow-sm' 
                      : 'bg-purple-100 text-purple-800 border border-purple-200 shadow-sm'
                  }`}
                >
                  {ad.user_type === 'professional' ? (
                    <>
                      <User className="h-2 w-2 sm:h-3 sm:w-3" />
                      <span className="hidden sm:inline">Profissional</span>
                      <span className="sm:hidden">Prof</span>
                    </>
                  ) : (
                    <>
                      <User className="h-2 w-2 sm:h-3 sm:w-3" />
                      <span className="hidden sm:inline">Cliente</span>
                      <span className="sm:hidden">Cliente</span>
                    </>
                  )}
                </Badge>
                
                {/* Badge de Serviço */}
                <Badge 
                  variant="outline"
                  className="text-[9px] sm:text-xs font-medium px-1 sm:px-2 py-0.5 sm:py-1 rounded-full border-green-200 text-green-700 bg-green-50 flex items-center gap-0.5 sm:gap-1 whitespace-nowrap flex-shrink-0"
                >
                  <span className="truncate">{ad.service_type || ad.category}</span>
                </Badge>
                
                {/* Tempo */}
                <span className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatTimeAgo(ad.created_at)}
                </span>
              </div>
            </div>
            
            {/* Menu de Opções */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <ReportButton 
                  type="classified" 
                  targetId={ad.id} 
                  targetName={ad.title}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-4 md:px-6 -mt-2 pb-4 md:pb-6">
          {/* Título com efeito sutil */}
          <div className="-mt-2">
            <h4 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-amber-700 via-amber-800 to-yellow-800 bg-clip-text text-transparent">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {ad.title}
              </div>
            </h4>
            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {ad.description}
            </p>
          </div>

          {/* Informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {ad.location_city}, {ad.location_state}
              </span>
            </div>
            
            {ad.price_range && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {ad.price_range}
                </span>
              </div>
            )}
            
            {ad.contact_phone && (
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {ad.contact_phone}
                </span>
              </div>
            )}
            
            {ad.contact_email && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {ad.contact_email}
                </span>
              </div>
            )}
          </div>

          {/* Galeria de Imagens */}
          {ad.images && ad.images.length > 0 && (
            <div className="mt-4">
              {expandedImage ? (
                // Imagem expandida centralizada
                <div className="relative w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-xl p-4 min-h-[400px]">
                  <div className="absolute top-2 right-2 z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedImage(null)}
                      className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full p-2 shadow-lg"
                    >
                      <span className="text-xl">×</span>
                    </Button>
                  </div>
                  <img
                    src={expandedImage}
                    alt="Imagem expandida do anúncio premium"
                    className="max-w-full max-h-[600px] w-auto h-auto object-contain rounded-lg shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              ) : ad.images.length === 1 ? (
                // Uma única imagem
                <div className="relative w-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300 to-yellow-400 rounded-xl blur-sm opacity-20"></div>
                  <img
                    src={ad.images[0]}
                    alt="Imagem do anúncio premium"
                    className="relative w-full h-[300px] rounded-xl cursor-pointer hover:opacity-90 transition-all duration-300 border border-amber-200 object-cover"
                    onClick={() => handleImageClick(ad.images[0])}
                  />
                </div>
              ) : (
                // Múltiplas imagens em grid
                <div className="grid grid-cols-2 gap-2">
                  {ad.images.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300 to-yellow-400 rounded-lg blur-sm opacity-20"></div>
                      <img
                        src={image}
                        alt={`Imagem ${index + 1}`}
                        className="relative w-full h-[150px] rounded-lg cursor-pointer hover:opacity-90 transition-all duration-300 border border-amber-200 object-cover"
                        onClick={() => handleImageClick(image)}
                      />
                      {index === 3 && ad.images.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            +{ad.images.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center justify-between pt-4 border-t border-amber-200 dark:border-amber-800">
            <div className="flex items-center space-x-4">
              {/* Botão de Contato */}
              <Button
                onClick={handleContact}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contatar Agora
              </Button>
            </div>
            
            {/* Indicadores sutis */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
