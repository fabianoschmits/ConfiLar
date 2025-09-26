import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Share2, MapPin, User, Eye, TrendingUp, Star } from 'lucide-react'
import Image from 'next/image'
import { TimelinePost as TimelinePostType } from '@/types/timeline'
import { ReactionButton } from './ReactionButton'
import { CommentSection } from './CommentSection'

interface TimelinePostProps {
  post: TimelinePostType
  onShare: (postId: string) => void
  showComments?: boolean
  isTrending?: boolean
  trendingReason?: string
}

export function TimelinePost({
  post,
  onShare,
  showComments = true,
  isTrending = false,
  trendingReason
}: TimelinePostProps) {
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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            {post.user_avatar ? (
              <Image
                src={post.user_avatar}
                alt={post.user_name || 'Usuário'}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{post.user_name}</h3>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{post.user_type === 'professional' ? 'Profissional' : 'Cliente'}</span>
              {getTrendingBadge()}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MapPin className="h-3 w-3" />
              <span>{post.location_city || 'Cidade'}, {post.location_state || 'UF'}</span>
              <span>•</span>
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {post.title}
          </h4>
          <p className="text-gray-700">{post.description}</p>
        </div>

        {/* Galeria de Imagens */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-2 ${
            post.images.length === 1 ? 'grid-cols-1' :
            post.images.length === 2 ? 'grid-cols-2' :
            post.images.length === 3 ? 'grid-cols-3' :
            post.images.length === 4 ? 'grid-cols-2' : 'grid-cols-3'
          }`}>
            {post.images.map((image, index) => (
              <div 
                key={index} 
                className={`relative overflow-hidden rounded-lg ${
                  post.images!.length === 1 ? 'h-96' :
                  post.images!.length === 2 ? 'h-64' :
                  post.images!.length === 3 ? 'h-48' :
                  post.images!.length === 4 ? 'h-48' : 'h-32'
                }`}
              >
                <Image
                  src={image}
                  alt={`Imagem ${index + 1} do trabalho`}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                />
                {post.images!.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      +{post.images!.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ações do Post */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-6">
            <ReactionButton postId={post.id} />
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
              <MessageCircle className="h-5 w-5" />
              <span>{post.comments_count}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-500 transition-colors">
              <Eye className="h-5 w-5" />
              <span>0</span>
            </button>
            <button 
              onClick={() => onShare(post.id)}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors"
            >
              <Share2 className="h-5 w-5" />
              <span>Compartilhar</span>
            </button>
          </div>
        </div>

        {/* Comentários */}
        {showComments && (
          <CommentSection postId={post.id} />
        )}
      </CardContent>
    </Card>
  )
}
