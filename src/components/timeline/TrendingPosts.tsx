import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingPost } from '@/hooks/usePostRanking'
import { usePostRanking } from '@/hooks/usePostRanking'
import { usePostRankingMock } from '@/hooks/usePostRankingMock'
import { Flame, TrendingUp, Star, MapPin, Eye, Heart, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TrendingPostsProps {
  location_city?: string
  location_state?: string
  limit?: number
}

export function TrendingPosts({ 
  location_city, 
  location_state, 
  limit = 5 
}: TrendingPostsProps) {
  const { trendingPosts, isLoading, error } = usePostRankingMock({
    location_city,
    location_state,
    limit
  })

  const getTrendingIcon = (reason: TrendingPost['trending_reason']) => {
    switch (reason) {
      case 'high_engagement':
        return <TrendingUp className="h-4 w-4 text-orange-500" />
      case 'local_trending':
        return <MapPin className="h-4 w-4 text-blue-500" />
      case 'new_post':
        return <Flame className="h-4 w-4 text-red-500" />
      case 'verified_professional':
        return <Star className="h-4 w-4 text-yellow-500" />
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendingText = (reason: TrendingPost['trending_reason']) => {
    switch (reason) {
      case 'high_engagement':
        return '🔥 Em alta'
      case 'local_trending':
        return '📍 Local'
      case 'new_post':
        return '✨ Novo'
      case 'verified_professional':
        return '⭐ Verificado'
      default:
        return '📈 Trending'
    }
  }

  const getTrendingColor = (reason: TrendingPost['trending_reason']) => {
    switch (reason) {
      case 'high_engagement':
        return 'bg-orange-100 text-orange-800'
      case 'local_trending':
        return 'bg-blue-100 text-blue-800'
      case 'new_post':
        return 'bg-red-100 text-red-800'
      case 'verified_professional':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span>Posts em Alta</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span>Posts em Alta</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Erro ao carregar posts em alta</p>
        </CardContent>
      </Card>
    )
  }

  if (trendingPosts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span>Posts em Alta</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Nenhum post em alta no momento</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <span>Posts em Alta</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trendingPosts.map((post, index) => (
            <div key={post.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-sm">#{index + 1}</span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className={getTrendingColor(post.trending_reason)}>
                      {getTrendingIcon(post.trending_reason)}
                      <span className="ml-1">{getTrendingText(post.trending_reason)}</span>
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(post.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                    {post.title}
                  </h4>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {post.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{post.likes_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{post.comments_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{post.views_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{post.location_city}, {post.location_state}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-bold">
                          {post.professional_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600">{post.professional_name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Score: {Math.round(post.engagement_score)}
                    </Badge>
                  </div>
                </div>
                
                {post.images && post.images.length > 0 && (
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={post.images[0]}
                        alt={post.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" size="sm" className="w-full">
            Ver todos os posts em alta
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
