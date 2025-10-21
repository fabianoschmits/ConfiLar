import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, MapPin, User, Eye, TrendingUp, Star, Share2, Briefcase } from 'lucide-react'
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
import { SharePostModal } from './SharePostModal'
import { usePostViews, usePostViewTracker } from '@/hooks/usePostViews'
import { useCommentsCount } from '@/hooks/useCommentsCount'
import { DynamicAvailabilityBadge } from '@/components/ui/DynamicAvailabilityBadge'
import { services } from '@/data/services'

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
  
  // Hook para gerenciar visualizações
  const { viewsCount } = usePostViews(post.id)
  usePostViewTracker(post.id) // Registra visualização automaticamente
  
  // Hook para gerenciar contagem de comentários
  const { count: commentsCount } = useCommentsCount(post.id)

  // Verificar tipos de posts automáticos
  const postType = post.metadata?.type
  const isSimpleAutomaticPost = postType && ['favorite', 'recommendation'].includes(postType)
  const isWelcomeUserPost = postType === 'welcome'
  const isOldAutomaticPost = postType && ['review'].includes(postType)
  
  // Verificação adicional: se o título contém emojis de sistema, também considerar como post automático
  const isSystemPostByTitle = post.title.includes('💡') || post.title.includes('❤️') || post.title.includes('⭐') || post.title.includes('🎉')
  const isSystemPost = isSimpleAutomaticPost || isWelcomeUserPost || isOldAutomaticPost || isSystemPostByTitle
  
  // Se for um post de boas-vindas de novo usuário, renderizar o componente NewUserWelcomePost
  if (isWelcomeUserPost || (isSystemPostByTitle && post.title.includes('🎉'))) {
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

  return (
    <Card id={`post-${post.id}`} className="overflow-hidden transition-all duration-300">
      <CardHeader className="pb-0 p-3 -mb-2">
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Link href={`/perfil/${post.user_id}`} className="hover:opacity-80 transition-opacity">
              <Avatar className="w-12 h-12 cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all">
                <AvatarImage src={post.user_avatar || ''} alt={`Avatar de ${post.user_name}`} />
                <AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-sm">
                  {post.user_name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
          
          {/* Informações do Usuário */}
          <div className="flex-1 min-w-0">
            <div className="cursor-pointer">
              <h3 className="font-semibold text-gray-900 truncate hover:text-blue-600 cursor-pointer transition-colors">
                <Link href={`/perfil/${post.user_id}`}>
                  {post.user_name}
                </Link>
              </h3>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
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
              
              {/* Badge de Serviço */}
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
            
            {/* Localização */}
            <div className="flex items-center text-[9px] sm:text-xs text-gray-500 mt-1">
              <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
              <span className="truncate">{post.location_city || 'Cidade'}, {post.location_state || 'UF'}</span>
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

            <CardContent className="space-y-3 px-3 md:px-6 -mt-2 pb-3 md:pb-6">
              <div className="-mt-2">
                <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                  <MentionText text={post.title} />
                </h4>
                <p className="text-sm md:text-base text-gray-700">
                  <MentionText text={post.description} />
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
                    <Image
                      src={image}
                      alt={`Imagem ${index + 1}`}
                      width={250}
                      height={index === 0 ? 400 : 195}
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

        {/* Ações do Post - Responsivas */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-3 md:space-x-6">
            <ReactionButton 
              postId={post.id}
              postOwnerId={post.user_id}
              postOwnerName={post.user_name || 'Usuário'}
            />
            <button 
              onClick={() => setShowCommentSection(!showCommentSection)}
              className="flex items-center space-x-1 md:space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">{commentsCount}</span>
            </button>
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center space-x-1 md:space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors"
              title="Compartilhar post"
            >
              <Share2 className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base hidden sm:inline">Compartilhar</span>
            </button>
            <button className="flex items-center space-x-1 md:space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
              <Eye className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">{viewsCount}</span>
            </button>
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
  )
}
