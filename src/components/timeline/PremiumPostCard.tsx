'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Heart, MessageCircle, Share2, Crown, Sparkles, Zap, Flame, Star, Trophy, Clock, MapPin, User, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { TimelinePost as TimelinePostType } from '@/types/timeline'
import { CommentSection } from './CommentSection'
import { PostOptionsMenu } from './PostOptionsMenu'
import { MentionText } from '@/components/ui/MentionText'
import { SharePostModal } from './SharePostModal'
import { PremiumLikeButton } from '@/components/points/PremiumLikeButton'
import { useCommentsCount } from '@/hooks/useCommentsCount'
import { ReactionButton } from './ReactionButton'
import { useAuthContext } from '@/contexts/AuthContext'
import { DynamicAvailabilityBadge } from '@/components/ui/DynamicAvailabilityBadge'
import { CompactUserBadges } from '@/components/ui/CompactUserBadges'
import { YouTubePlayer } from '@/components/ui/YouTubePlayer'
import { detectYouTubeUrls, removeYouTubeUrls } from '@/utils/youtube'
import { getCategoryById } from '@/data/serviceCategories'

interface PremiumPostCardProps {
  post: TimelinePostType
  onShare: (postId: string) => void
  onLike?: (postId: string) => void
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
  showComments?: boolean
  isTrending?: boolean
  trendingReason?: string
  isDeleting?: boolean
}

export function PremiumPostCard({
  post,
  onShare,
  onLike,
  onEdit,
  onDelete,
  showComments = true,
  isTrending = false,
  trendingReason,
  isDeleting = false
}: PremiumPostCardProps) {
  const [showCommentSection, setShowCommentSection] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const { user, profile } = useAuthContext()
  
  // Hook para gerenciar contagem de comentários
  const { count: commentsCount } = useCommentsCount(post.id)
  
  // Pegar disponibilidade do profile (se for do próprio usuário)
  const isAvailable = user?.id === post.user_id ? profile?.is_available : undefined

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    // Se foi há menos de 1 minuto
    if (diffInMinutes < 1) {
      return 'Agora'
    }

    // Se foi há menos de 1 hora
    if (diffInMinutes < 60) {
      return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`
    }

    // Se foi há menos de 24 horas
    if (diffInHours < 24) {
      return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
    }

    // Se foi há menos de 7 dias
    if (diffInDays < 7) {
      return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`
    }

    // Se foi há mais de 7 dias, mostrar data completa
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

  const daysLeft = post.metadata?.expires_at 
    ? Math.ceil((new Date(post.metadata.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 7

  const handleImageClick = (imageUrl: string) => {
    if (expandedImage === imageUrl) {
      setExpandedImage(null)
    } else {
      setExpandedImage(imageUrl)
    }
  }

  // Detectar vídeos do YouTube no conteúdo do post
  const youtubeVideos = detectYouTubeUrls(post.description || '')
  const cleanDescription = removeYouTubeUrls(post.description || '')
  
  // Buscar categoria de serviço se houver service_category_id
  const serviceCategory = post.service_category_id ? getCategoryById(post.service_category_id) : null
  
  // Debug: verificar service_category_id
  if (post.service_category_id) {
    console.log('🔍 [PremiumPostCard] service_category_id encontrado:', {
      postId: post.id,
      service_category_id: post.service_category_id,
      categoryFound: !!serviceCategory,
      categoryName: serviceCategory?.name
    })
  }
  
  // Debug: verificar se está detectando vídeos
  if (post.description && post.description.includes('youtube')) {
    console.log('🔍 PremiumPostCard Debug:', {
      postId: post.id,
      description: post.description,
      youtubeVideos: youtubeVideos,
      cleanDescription: cleanDescription
    })
  }

  return (
    <>
      <div className="relative group">
        {/* Efeito de brilho dourado externo ao card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 rounded-2xl blur-xl opacity-25 group-hover:opacity-35" style={{ animation: 'pulse 3s ease-in-out infinite' }}></div>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 rounded-2xl blur opacity-20" style={{ animation: 'pulse 3s ease-in-out infinite' }}></div>
        
        <Card 
          id={`post-${post.id}`} 
          className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-amber-500/15 dark:shadow-amber-800/20 hover:shadow-amber-500/20 transition-all duration-300"
        >
        {/* Badge Premium Fixo no Topo */}
        <div className="absolute top-0 right-0 z-20">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-bl-xl opacity-70"></div>
            <div className="relative bg-gradient-to-r from-yellow-400 to-amber-500 px-3 py-1.5 rounded-bl-xl shadow-md">
              <div className="flex items-center gap-1">
                <Crown className="h-3 w-3 text-white" fill="white" />
                <span className="text-xs font-semibold text-white uppercase tracking-wide">Premium</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Header Premium */}
        <CardHeader className="pb-0 p-2 sm:p-3 md:p-4 -mb-2">
          <div className="flex items-start space-x-2 sm:space-x-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Link href={`/perfil/${post.user_id}`} className="hover:opacity-80 transition-opacity">
                <UserAvatar 
                  src={post.user_avatar}
                  alt={post.user_name}
                  fallback={post.user_name?.charAt(0).toUpperCase() || 'U'}
                  size="lg"
                  userId={post.user_id}
                  showReferralBadge={true}
                  className="cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all"
                />
              </Link>
            </div>
            
            {/* Informações do Usuário */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1 sm:gap-2">
                <h3 className="flex-1 min-w-0 max-w-[60%] sm:max-w-[70%] text-xs sm:text-sm md:text-base font-semibold text-gray-900 dark:text-white overflow-hidden">
                  <Link href={`/perfil/${post.user_id}`} className="truncate block hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {post.user_name || 'Usuário'}
                  </Link>
                </h3>
                
                {/* Badge de Serviço */}
                {serviceCategory && (
                  <Badge 
                    variant="outline" 
                    className="text-[9px] sm:text-xs font-medium px-1 sm:px-2 py-0.5 sm:py-1 rounded-full border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 flex items-center gap-0.5 sm:gap-1 flex-shrink-0"
                  >
                    <span>{serviceCategory.icon}</span>
                    <span>{serviceCategory.name}</span>
                  </Badge>
                )}
                
                {/* Ícones Compactos no lado direito */}
                <div className="flex items-center gap-0 flex-shrink-0">
                  <CompactUserBadges 
                    userType={post.user_type}
                    isAvailable={isAvailable}
                    isPremium={true}
                    showPremium={true}
                    userId={post.user_id}
                  />
                  
                  {/* Badge Destacado (mantém visível) */}
                  <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 text-[9px] sm:text-xs font-medium px-1 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1">
                    <Sparkles className="h-2 w-2 sm:h-3 sm:w-3" />
                    <span className="hidden sm:inline">Destacado</span>
                    <span className="sm:hidden">⭐</span>
                  </Badge>
                </div>
              </div>
              
              {/* Localização */}
              <div className="flex items-center text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                <span className="truncate">
                  {post.location_city && post.location_city !== 'null' ? post.location_city : 'Cidade'}, {post.location_state || 'UF'}
                </span>
              </div>
              
              {/* Data e Hora da Postagem */}
              <div className="flex items-center text-[9px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1 flex-wrap">
                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                <span>{formatDateTime(post.created_at)}</span>
                {user?.id === post.user_id && daysLeft > 0 && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="font-medium flex items-center gap-0.5 sm:gap-1 text-amber-600 dark:text-amber-400">
                      <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="hidden sm:inline">{daysLeft} dias restantes</span>
                      <span className="sm:hidden">{daysLeft}d</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-3 sm:px-4 md:px-6 -mt-2 pb-0">
          <div className="-mt-2">
            {/* Título Premium */}
            <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent font-bold">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 text-yellow-500" />
              <MentionText text={post.title} />
            </h4>

            {/* Descrição */}
            {cleanDescription && (
              <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">
                <MentionText text={cleanDescription} />
              </p>
            )}
          </div>

          {/* Galeria de Imagens - Estilo Instagram Responsivo */}
          {post.images && post.images.length > 0 && (
            <div className="mt-4">
              {post.images.length === 1 ? (
                // Uma imagem - tamanho médio quadrado
                <div className="relative w-full">
                  <img
                    src={post.images[0]}
                    alt="Imagem do post"
                    className={`w-full rounded-lg cursor-pointer hover:opacity-90 transition-all duration-300 ${
                      expandedImage === post.images[0] ? 'object-contain max-h-screen' : 'h-[250px] sm:h-[350px] md:h-[400px] object-cover'
                    }`}
                    onClick={() => handleImageClick(post.images[0])}
                  />
                </div>
              ) : post.images.length === 2 ? (
                // Duas imagens - lado a lado
                <div className={`${expandedImage ? 'block' : 'grid grid-cols-2 gap-1'}`}>
                  {post.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Imagem ${index + 1}`}
                        className={`w-full rounded-lg cursor-pointer hover:opacity-90 transition-all duration-300 ${
                          expandedImage === image 
                            ? 'object-contain max-h-screen' 
                            : expandedImage 
                              ? 'hidden' 
                              : 'h-[200px] sm:h-[250px] md:h-[300px] object-cover'
                        }`}
                        onClick={() => handleImageClick(image)}
                      />
                    </div>
                  ))}
                </div>
              ) : post.images.length === 3 ? (
                // Três imagens - uma grande e duas pequenas
                <div className={`${expandedImage ? 'block' : 'grid grid-cols-2 gap-1'}`}>
                  {post.images.map((image, index) => (
                    <div key={index} className={expandedImage && expandedImage !== image ? 'hidden' : index === 0 && !expandedImage ? 'row-span-2' : ''}>
                      <img
                        src={image}
                        alt={`Imagem ${index + 1}`}
                        className={`w-full rounded-lg cursor-pointer hover:opacity-90 transition-all duration-300 ${
                          expandedImage === image 
                            ? 'object-contain max-h-screen' 
                            : index === 0 
                              ? 'h-[250px] sm:h-[350px] md:h-[400px] object-cover' 
                              : 'h-[120px] sm:h-[170px] md:h-[195px] object-cover'
                        }`}
                        onClick={() => handleImageClick(image)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                // Quatro ou mais imagens - grid 2x2
                <div className={`${expandedImage ? 'block' : 'grid grid-cols-2 gap-1'}`}>
                  {post.images.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Imagem ${index + 1}`}
                        className={`w-full rounded-lg cursor-pointer hover:opacity-90 transition-all duration-300 ${
                          expandedImage === image 
                            ? 'object-contain max-h-screen' 
                            : expandedImage 
                              ? 'hidden' 
                              : 'h-[150px] sm:h-[200px] md:h-[250px] object-cover'
                        }`}
                        onClick={() => handleImageClick(image)}
                      />
                      {index === 3 && post.images.length > 4 && !expandedImage && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center pointer-events-none">
                          <span className="text-white text-xl sm:text-2xl font-bold">
                            +{post.images.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
            )}
          </div>
        )}

        {/* Vídeos do YouTube */}
        {youtubeVideos.length > 0 && (
          <div className="mt-4 space-y-3">
            {youtubeVideos.map((video, index) => (
              <YouTubePlayer
                key={`${video.id}-${index}`}
                videoId={video.id}
                title="Vídeo do YouTube"
                thumbnail={video.thumbnail}
                className="w-full"
              />
            ))}
          </div>
        )}

          {/* Stats Premium - Responsivo */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-4 md:gap-6 pt-3 pb-3 border-t border-gray-200 dark:border-gray-700">
            {/* Likes Normal */}
            <div className="flex-shrink-0">
              <ReactionButton 
                postId={post.id}
                postOwnerId={post.user_id}
                postOwnerName={post.user_name || 'Usuário'}
              />
            </div>

            {/* Likes Premium */}
            <div className="flex-shrink-0">
              <PremiumLikeButton 
                postId={post.id}
                postCreatorId={post.user_id}
                size="sm"
                showStats={true}
              />
            </div>

            {/* Comentários */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommentSection(!showCommentSection)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 px-2 sm:px-3"
            >
              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              <span className="text-xs sm:text-sm">{commentsCount}</span>
            </Button>

            {/* Share */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareModal(true)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 px-2 sm:px-3"
            >
              <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline text-xs sm:text-sm">Compartilhar</span>
              <span className="sm:hidden text-xs">Share</span>
            </Button>

            {/* Menu de Opções - Movido para o canto direito */}
            <div className="ml-auto flex-shrink-0">
              <PostOptionsMenu
                postId={post.id}
                postUserId={post.user_id}
                postTitle={post.title}
                onEdit={onEdit || (() => {})}
                onDelete={onDelete || (() => {})}
                isDeleting={isDeleting}
              />
            </div>
            
            {/* Badge Trending no canto inferior direito */}
            {isTrending && trendingReason && (
              <div className="absolute bottom-2 right-2 z-10">
                <Badge variant="default" className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg text-xs">
                  <Flame className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Trending</span>
                  <span className="sm:hidden">🔥</span>
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
        </Card>
      </div>

      {/* Seção de comentários */}
      {showCommentSection && showComments && (
        <div className="mt-4 bg-white dark:bg-gray-900 rounded-lg">
          <CommentSection 
            postId={post.id}
          />
        </div>
      )}

      {/* Modal de compartilhamento */}
      <SharePostModal
        isOpen={showShareModal}
        postId={post.id}
        postTitle={post.title}
        onClose={() => setShowShareModal(false)}
      />
    </>
  )
}