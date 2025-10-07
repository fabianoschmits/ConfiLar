import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, MapPin, User, Eye, TrendingUp, Star } from 'lucide-react'
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
import { ImageModal } from '@/components/ui/ImageModal'
import { usePostViews, usePostViewTracker } from '@/hooks/usePostViews'
import { useCommentsCount } from '@/hooks/useCommentsCount'
import { DynamicAvailabilityBadge } from '@/components/ui/DynamicAvailabilityBadge'

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showCommentSection, setShowCommentSection] = useState(false)
  
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
  
  // Debug: Log para verificar o tipo de post
  console.log('🔍 TimelinePost Debug:', {
    postId: post.id,
    title: post.title,
    metadata: post.metadata,
    type: postType,
    isSimpleAutomaticPost,
    isWelcomeUserPost,
    isOldAutomaticPost,
    shouldUseSimpleComponent: isSimpleAutomaticPost || isWelcomeUserPost || isOldAutomaticPost
  })
  
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
      'high_engagement': { icon: TrendingUp, text: '🔥 Em alta', color: 'bg-orange-100 text-orange-800' },
      'local_trending': { icon: MapPin, text: '📍 Local', color: 'bg-blue-100 text-blue-800' },
      'new_post': { icon: Star, text: '✨ Novo', color: 'bg-red-100 text-red-800' },
      'verified_professional': { icon: Star, text: '⭐ Verificado', color: 'bg-yellow-100 text-yellow-800' }
    }
    
    const badge = badges[trendingReason as keyof typeof badges] || badges['high_engagement']
    const Icon = badge.icon
    
    return (
      <Badge className={badge.color}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.text}
      </Badge>
    )
  }

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  return (
    <Card className="overflow-hidden">
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
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors truncate">
                <Link href={`/perfil/${post.user_id}`}>
                  {post.user_name}
                </Link>
              </h3>
              
              {/* Badge de Status (Disponível/Indisponível) - Dinâmico */}
              <DynamicAvailabilityBadge userId={post.user_id} />
              
              {/* Badge de Tipo (Cliente/Profissional) */}
              <Badge 
                variant="outline"
                className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  post.user_type === 'professional' 
                    ? 'border-blue-200 text-blue-700 bg-blue-50' 
                    : 'border-purple-200 text-purple-700 bg-purple-50'
                }`}
              >
                <User className="h-3 w-3" />
                <span>
                  {post.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                </span>
              </Badge>
              
              {/* Badge Local */}
              <Badge 
                variant="outline"
                className="text-xs font-medium px-2 py-0.5 rounded-full border-blue-200 text-blue-700 bg-blue-50 flex items-center gap-1"
              >
                <MapPin className="h-3 w-3" />
                <span>Local</span>
              </Badge>
              
              {getTrendingBadge()}
            </div>
            
            {/* Localização */}
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="h-3 w-3 mr-1" />
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
                  {post.title}
                </h4>
                <p className="text-sm md:text-base text-gray-700">{post.description}</p>
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
                  className="w-full h-[400px] object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(post.images[0])}
                />
              </div>
            ) : post.images.length === 2 ? (
              // Duas imagens - lado a lado
              <div className="grid grid-cols-2 gap-1">
                {post.images.map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={image}
                      alt={`Imagem ${index + 1}`}
                      width={250}
                      height={250}
                      className="w-full h-[300px] object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleImageClick(image)}
                    />
                  </div>
                ))}
              </div>
            ) : post.images.length === 3 ? (
              // Três imagens - uma grande e duas pequenas
              <div className="grid grid-cols-2 gap-1">
                <div className="row-span-2">
                  <Image
                    src={post.images[0]}
                    alt="Imagem principal"
                    width={250}
                    height={400}
                    className="w-full h-[400px] object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(post.images[0])}
                  />
                </div>
                <div className="space-y-1">
                  {post.images.slice(1, 3).map((image, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={image}
                        alt={`Imagem ${index + 2}`}
                        width={250}
                        height={195}
                        className="w-full h-[195px] object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleImageClick(image)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Quatro ou mais imagens - grid 2x2
              <div className="grid grid-cols-2 gap-1">
                {post.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={image}
                      alt={`Imagem ${index + 1}`}
                      width={250}
                      height={250}
                      className="w-full h-[250px] object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleImageClick(image)}
                    />
                    {index === 3 && post.images.length > 4 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
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
            <ReactionButton postId={post.id} />
            <button 
              onClick={() => setShowCommentSection(!showCommentSection)}
              className="flex items-center space-x-1 md:space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">{commentsCount}</span>
            </button>
            <button className="flex items-center space-x-1 md:space-x-2 text-gray-600 hover:text-gray-500 transition-colors">
              <Eye className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">{viewsCount}</span>
            </button>
          </div>
          
        </div>

      {/* Comentários */}
      {showComments && showCommentSection && (
        <CommentSection postId={post.id} />
      )}
      </CardContent>

      {/* Modal de visualização de imagem */}
      {selectedImage && (
        <ImageModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          imageUrl={selectedImage}
          alt="Imagem do post"
          title={post.title}
        />
      )}
    </Card>
  )
}
