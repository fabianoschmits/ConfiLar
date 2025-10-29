'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { YouTubePlayer } from '@/components/ui/YouTubePlayer'
import { detectYouTubeUrls, removeYouTubeUrls } from '@/utils/youtube'

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
  const { user } = useAuthContext()
  
  // Hook para gerenciar contagem de comentários
  const { count: commentsCount } = useCommentsCount(post.id)

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
        <CardContent className="pt-5 pb-0 px-6">
          {/* Header do usuário */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Link href={`/perfil/${post.user_id}`} className="hover:opacity-80 transition-opacity relative">
                  <UserAvatar 
                    src={post.user_avatar}
                    alt={post.user_name}
                    fallback={post.user_name?.charAt(0).toUpperCase() || 'U'}
                    size="lg"
                    userId={post.user_id}
                    className="cursor-pointer hover:ring-2 hover:ring-gray-400 hover:ring-offset-2 transition-all relative z-10 w-14 h-14"
                  />
                </Link>
              </div>
              
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/perfil/${post.user_id}`}
                  className="font-semibold text-gray-900 dark:text-gray-100 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  {post.user_name || 'Usuário'}
                </Link>
                
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDateTime(post.created_at)}</span>
                  {user?.id === post.user_id && daysLeft > 0 && (
                    <>
                      <span>•</span>
                      <span className="font-medium flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Zap className="h-3 w-3" />
                        {daysLeft} dias restantes
                      </span>
                    </>
                  )}
                </div>
                
                {/* Localização */}
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{post.location_city || 'Cidade'}, {post.location_state || 'UF'}</span>
                </div>
              </div>
            </div>

            {/* Badges do lado esquerdo do botão de denúncia */}
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              {/* Tag de Tipo de Usuário */}
              <Badge 
                variant={post.user_type === 'professional' ? 'default' : 'secondary'}
                className={`text-[9px] sm:text-xs font-medium px-1 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1 transition-all duration-300 ${
                  post.user_type === 'professional'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200 shadow-sm' 
                    : 'bg-purple-100 text-purple-800 border border-purple-200 shadow-sm'
                }`}
              >
                {post.user_type === 'professional' ? (
                  <>
                    <Briefcase className="h-2 w-2 sm:h-3 sm:w-3" />
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
              
              {/* Badge de Status (Disponível/Indisponível) - Dinâmico */}
              <DynamicAvailabilityBadge userId={post.user_id} />
              
              {/* Badge Premium */}
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-[9px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1 shadow-md">
                <Crown className="h-2 w-2 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline">Premium</span>
                <span className="sm:hidden">⭐</span>
              </Badge>
              
              {/* Badge Destacado */}
              <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 text-[9px] sm:text-xs font-medium px-1 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1">
                <Sparkles className="h-2 w-2 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline">Destacado</span>
                <span className="sm:hidden">⭐</span>
              </Badge>
            </div>

            {/* Menu de opções */}
            <PostOptionsMenu
              postId={post.id}
              postUserId={post.user_id}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          </div>

          {/* Título Premium */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 pr-12">
            {post.title}
          </h3>

          {/* Conteúdo */}
          {cleanDescription && (
            <div className="mb-4">
              <MentionText 
                text={cleanDescription} 
                className="text-gray-800 dark:text-gray-200 leading-relaxed"
              />
            </div>
          )}

          {/* Galeria de Imagens - Estilo Instagram */}
          {post.images && post.images.length > 0 && (
            <div className="mt-4">
              {post.images.length === 1 ? (
                // Uma imagem - tamanho médio quadrado
                <div className="relative w-full">
                  <img
                    src={post.images[0]}
                    alt="Imagem do post"
                    className={`w-full rounded-lg cursor-pointer hover:opacity-90 transition-all duration-300 ${
                      expandedImage === post.images[0] ? 'object-contain max-h-screen' : 'h-[400px] object-cover'
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
                              : 'h-[300px] object-cover'
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
                              ? 'h-[400px] object-cover' 
                              : 'h-[195px] object-cover'
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
                              : 'h-[250px] object-cover'
                        }`}
                        onClick={() => handleImageClick(image)}
                      />
                      {index === 3 && post.images.length > 4 && !expandedImage && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center pointer-events-none">
                          <span className="text-white text-2xl font-bold">
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

          {/* Stats Premium */}
          <div className="flex items-center gap-6 pt-0 pb-0 border-t border-gray-200 dark:border-gray-700">
            {/* Likes */}
            <ReactionButton 
              postId={post.id}
              postOwnerId={post.user_id}
              postOwnerName={post.user_name || 'Usuário'}
            />

            {/* Comentários */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommentSection(!showCommentSection)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span>{commentsCount}</span>
            </Button>

            {/* Share */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareModal(true)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Compartilhar
            </Button>

            {/* Curtida Premium */}
            <PremiumLikeButton 
              postId={post.id}
              postCreatorId={post.user_id}
              size="sm"
              showStats={false}
            />
            
            {/* Badge Trending no canto inferior direito */}
            {isTrending && trendingReason && (
              <div className="absolute bottom-2 right-2 z-10">
                <Badge variant="default" className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
                  <Flame className="h-3 w-3 mr-1" />
                  Trending
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