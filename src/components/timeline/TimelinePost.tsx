import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Heart, MessageCircle, MapPin, User, Eye, TrendingUp, Star, Share2, Briefcase, Crown, Sparkles, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { TimelinePost as TimelinePostType } from '@/types/timeline'
import { ReactionButton } from './ReactionButton'
import { CommentSection } from './CommentSection'
import { PostOptionsMenu } from './PostOptionsMenu'
import { AutomaticPost } from './AutomaticPost'
import { WelcomePost } from './WelcomePost'
import { SimpleAutomaticPost } from './SimpleAutomaticPost'
import { WelcomeUserPost } from './WelcomeUserPost'
import { NewUserWelcomePost } from './NewUserWelcomePost'
import { MentionText } from '@/components/ui/MentionText'
import { PremiumPostCard } from './PremiumPostCard'
import { PremiumLikeButton } from '@/components/points/PremiumLikeButton'
import { SharePostModal } from './SharePostModal'
import { usePostViews, usePostViewTracker } from '@/hooks/usePostViews'
import { useCommentsCount } from '@/hooks/useCommentsCount'
import { DynamicAvailabilityBadge } from '@/components/ui/DynamicAvailabilityBadge'
import { CompactUserBadges } from '@/components/ui/CompactUserBadges'
import { useAuthContext } from '@/contexts/AuthContext'
import { services } from '@/data/services'
import { YouTubePlayer } from '@/components/ui/YouTubePlayer'
import { detectYouTubeUrls, removeYouTubeUrls } from '@/utils/youtube'

interface TimelinePostProps {
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

export function TimelinePost({
  post,
  onShare,
  onLike,
  onEdit,
  onDelete,
  showComments = true,
  isTrending = false,
  trendingReason,
  isDeleting = false
}: TimelinePostProps) {
  const [showCommentSection, setShowCommentSection] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const { user, profile } = useAuthContext()
  
  // Hook para gerenciar visualizações
  const { viewsCount } = usePostViews(post.id)
  usePostViewTracker(post.id) // Registra visualização automaticamente
  
  // Hook para gerenciar contagem de comentários
  const { count: commentsCount } = useCommentsCount(post.id)
  
  // Pegar disponibilidade do profile (se for do próprio usuário)
  const isAvailable = user?.id === post.user_id ? profile?.is_available : undefined

  // Verificar tipos de posts automáticos
  const postType = post.metadata?.type
  const isSimpleAutomaticPost = postType && ['favorite', 'recommendation'].includes(postType)
  const isWelcomeUserPost = postType === 'welcome'
  const isOldAutomaticPost = postType && ['review'].includes(postType)
  
  // Verificação adicional: se o título contém emojis de sistema, também considerar como post automático
  const isSystemPostByTitle = post.title?.includes('💡') || post.title?.includes('❤️') || post.title?.includes('⭐') || post.title?.includes('🎉')
  const isSystemPost = isSimpleAutomaticPost || isWelcomeUserPost || isOldAutomaticPost || isSystemPostByTitle
  
  // Se for um post de boas-vindas de novo usuário, renderizar o componente NewUserWelcomePost
  if (isWelcomeUserPost || (isSystemPostByTitle && post.title?.includes('🎉'))) {
    return (
      <NewUserWelcomePost
        post={post}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />
    )
  }
  
  // Se for um post automático simples (favoritos/recomendações), renderizar o componente SimpleAutomaticPost
  if (isSimpleAutomaticPost || (isSystemPostByTitle && (post.title.includes('💡') || post.title.includes('❤️')))) {
    return (
      <SimpleAutomaticPost
        post={post}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />
    )
  }
  
  // Se for um post automático antigo (avaliações), renderizar o componente AutomaticPost
  if (isOldAutomaticPost || (isSystemPostByTitle && post.title.includes('⭐'))) {
    return (
      <AutomaticPost
        post={post}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />
    )
  }
  
  // Se for um post de favorito (detectado pelo título), renderizar o componente SimpleAutomaticPost
  if (isSystemPostByTitle && post.title.includes('❤️')) {
    return (
      <SimpleAutomaticPost
        post={post}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />
    )
  }
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

  const getTrendingBadge = () => {
    if (!isTrending) return null
    
    const badges = {
      'high_engagement': { 
        icon: TrendingUp, 
        text: '🔥 Em alta', 
        shortText: '🔥',
        color: 'bg-orange-100 text-orange-800' 
      },
      'new_post': { 
        icon: Star, 
        text: '✨ Novo', 
        shortText: '✨',
        color: 'bg-red-100 text-red-800' 
      },
      'verified_professional': { 
        icon: Star, 
        text: '⭐ Verificado', 
        shortText: '⭐',
        color: 'bg-yellow-100 text-yellow-800' 
      }
    }
    
    const badge = badges[trendingReason as keyof typeof badges] || badges['high_engagement']
    const Icon = badge.icon
    
    return (
      <Badge className={`${badge.color} text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 whitespace-nowrap flex items-center gap-0.5 sm:gap-1`}>
        <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3 hidden sm:inline" />
        <span className="hidden sm:inline">{badge.text}</span>
        <span className="sm:hidden">{badge.shortText}</span>
      </Badge>
    )
  }

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
  
  // Debug: verificar se está detectando vídeos
  if (post.description && post.description.includes('youtube')) {
    console.log('🔍 TimelinePost Debug:', {
      postId: post.id,
      description: post.description,
      youtubeVideos: youtubeVideos,
      cleanDescription: cleanDescription
    })
  }

  // Verificar se é um post premium
  const isPremiumPost = Boolean(post.is_featured || post.tags?.includes('premium'))
  const premiumExpired = post.metadata?.expires_at ? new Date(post.metadata.expires_at) < new Date() : false
  
  // Se for um post premium ativo, usar o componente premium
  if (isPremiumPost && !premiumExpired) {
    return (
      <PremiumPostCard
        post={post}
        onShare={onShare}
        onLike={onLike}
        onEdit={onEdit}
        onDelete={onDelete}
        showComments={showComments}
        isTrending={isTrending}
        trendingReason={trendingReason}
        isDeleting={isDeleting}
      />
    )
  }
  
  return (
    <div className={`relative ${
      isPremiumPost && !premiumExpired 
        ? '' 
        : 'shadow-sm shadow-black/10 dark:shadow-white/10'
    }`}>
      <Card 
        id={`post-${post.id}`} 
        className={`overflow-hidden transition-all duration-300 ${
          isPremiumPost && !premiumExpired 
            ? 'border-2 border-yellow-400 bg-gradient-to-br from-yellow-50/50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20 shadow-lg shadow-yellow-200/50 dark:shadow-yellow-900/20' 
            : ''
        }`}
      >
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
                  {post.user_name}
                </Link>
              </h3>
              
              {/* Ícones Compactos no lado direito */}
              <div className="flex items-center gap-0 flex-shrink-0">
                <CompactUserBadges 
                  userType={post.user_type}
                  isAvailable={isAvailable}
                  isPremium={isPremiumPost && !premiumExpired}
                  showPremium={isPremiumPost && !premiumExpired}
                />
                
                {/* Badge de Serviço (mantém visível) */}
                {post.service_category_id && (() => {
                  const service = services.find(s => s.id === post.service_category_id)
                  if (!service) return null
                  return (
                    <Badge 
                      variant="outline"
                      className="text-[9px] sm:text-xs font-medium px-1 sm:px-2 py-0.5 sm:py-1 rounded-full border-green-200 text-green-700 bg-green-50 flex items-center gap-0.5 sm:gap-1 whitespace-nowrap flex-shrink-0 max-w-[90px] sm:max-w-[120px] md:max-w-none"
                    >
                      <Briefcase className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
                      <span className="truncate">{service.name}</span>
                    </Badge>
                  )
                })()}
                
                <div className="flex-shrink-0">
                  {getTrendingBadge()}
                </div>
              </div>
            </div>
            
            {/* Localização */}
            <div className="flex items-center text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
              <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
              <span className="truncate">{post.location_city || 'Cidade'}, {post.location_state || 'UF'}</span>
            </div>
            
            {/* Data e Hora da Postagem */}
            <div className="flex items-center text-[9px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1">
              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
              <span>{formatDateTime(post.created_at)}</span>
            </div>
          </div>
          
          {/* Menu de Opções */}
          <div className="flex-shrink-0">
            <PostOptionsMenu
              postId={post.id}
              postUserId={post.user_id}
              postTitle={post.title}
              onEdit={onEdit || (() => {})}
              onDelete={onDelete || (() => {})}
              isDeleting={isDeleting}
            />
          </div>
        </div>
      </CardHeader>

            <CardContent className="space-y-3 px-3 sm:px-4 md:px-6 -mt-2 pb-0">
              <div className="-mt-2">
                <h4 className={`text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2 ${
                  isPremiumPost && !premiumExpired 
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent font-bold' 
                    : ''
                }`}>
                  {isPremiumPost && !premiumExpired && (
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 text-yellow-500" />
                  )}
                  <MentionText text={post.title} />
                </h4>
                <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">
                  <MentionText text={cleanDescription} />
                </p>
              </div>

        {/* Galeria de Imagens - Estilo Instagram */}
        {post.images && post.images.length > 0 && (
          <div className="mt-4">
            {post.images.length === 1 ? (
              // Uma imagem - tamanho médio quadrado
              <div className="relative w-full">
                <Image
                  src={post.images[0]}
                  alt="Imagem do post"
                  width={500}
                  height={500}
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
                    <Image
                      src={image}
                      alt={`Imagem ${index + 1}`}
                      width={250}
                      height={250}
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
                    <Image
                      src={image}
                      alt={`Imagem ${index + 1}`}
                      width={250}
                      height={index === 0 ? 400 : 195}
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
                    <Image
                      src={image}
                      alt={`Imagem ${index + 1}`}
                      width={250}
                      height={250}
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

        {/* Ações do Post - Responsivo */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-4 md:gap-6 pt-3 pb-3 border-t border-gray-200 dark:border-gray-700">
          {/* Likes */}
          <div className="flex-shrink-0">
            <ReactionButton 
              postId={post.id}
              postOwnerId={post.user_id}
              postOwnerName={post.user_name || 'Usuário'}
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
            onClick={() => setIsShareModalOpen(true)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 px-2 sm:px-3"
          >
            <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline text-xs sm:text-sm">Compartilhar</span>
            <span className="sm:hidden text-xs">Share</span>
          </Button>

          {/* Curtida Premium */}
          <div className="flex-shrink-0">
            <PremiumLikeButton 
              postId={post.id}
              postCreatorId={post.user_id}
              size="sm"
              showStats={false}
            />
          </div>
        </div>

      {/* Comentários */}
      {showComments && showCommentSection && (
        <CommentSection 
          postId={post.id}
          postOwnerId={post.user_id}
          postOwnerName={post.user_name || 'Usuário'}
        />
      )}
      </CardContent>

      {/* Modal de compartilhamento */}
      <SharePostModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        postId={post.id}
        postTitle={post.title}
      />
    </Card>
    </div>
  )
}
