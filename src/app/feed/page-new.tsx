'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MainLayout } from '@/components/layout/MainLayout'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus, 
  MapPin,
  User,
  Send,
  Loader2
} from 'lucide-react'
import { FeedPost } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { ImageUploadFeed } from '@/components/ui/ImageUploadFeed'

export default function FeedPage() {
  const [mounted, setMounted] = useState(false)
  const { profile, isMockMode } = useAuthContext()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)
  
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    images: [] as string[]
  })

  // Estados para curtidas e comentários
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [postComments, setPostComments] = useState<Record<string, string[]>>({})
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})

  const categories = [
    { id: 'all', name: 'Todos', icon: '🏠' },
    { id: 'cat-1', name: 'Reformas', icon: '🔨' },
    { id: 'cat-2', name: 'Limpeza', icon: '🧹' },
    { id: 'cat-3', name: 'Tecnologia', icon: '💻' },
    { id: 'cat-4', name: 'Beleza', icon: '💄' },
    { id: 'cat-5', name: 'Transporte', icon: '🚗' }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Carregar posts otimizado
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('feed_posts')
          .select('id, professional_id, title, description, images, location_state, location_city, likes_count, comments_count, created_at, updated_at')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .range(0, 19) // 20 posts por vez

        if (error) throw error
        setPosts(data as FeedPost[])
        setHasNextPage(data && data.length === 20)
      } catch (err) {
        setError('Erro ao carregar posts')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadPosts()
  }, [])

  const handleLike = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes_count: likedPosts.has(postId) 
                ? post.likes_count - 1 
                : post.likes_count + 1 
            }
          : post
      )
    )
    
    setLikedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const handleComment = (postId: string, comment: string) => {
    if (comment.trim()) {
      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment]
      }))
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, comments_count: post.comments_count + 1 }
            : post
        )
      )
      
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ''
      }))
    }
  }

  const handleCommentInputChange = (postId: string, value: string) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
    }))
  }

  const handleCommentSubmit = (postId: string) => {
    const comment = commentInputs[postId]
    if (comment?.trim()) {
      handleComment(postId, comment)
    }
  }

  const loadMore = async () => {
    if (isFetchingNextPage) return
    
    setIsFetchingNextPage(true)
    try {
      const { data, error } = await supabase
        .from('feed_posts')
        .select('id, professional_id, title, description, images, location_state, location_city, likes_count, comments_count, created_at, updated_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(posts.length, posts.length + 19)

      if (error) throw error
      
      if (data && data.length > 0) {
        setPosts(prev => [...prev, ...data as FeedPost[]])
        setHasNextPage(data.length === 20)
      } else {
        setHasNextPage(false)
      }
    } catch (err) {
      console.error('Erro ao carregar mais posts:', err)
    } finally {
      setIsFetchingNextPage(false)
    }
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

  return (
    <MainLayout requireAuth={true}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Feed Social</h1>
              <span className="text-sm text-gray-500">Descubra trabalhos incríveis</span>
            </div>
            {profile?.user_type === 'professional' && (
              <Button 
                onClick={() => setShowNewPostForm(!showNewPostForm)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Post
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Feed de Posts */}
        <div className="space-y-6">
          {isLoading && posts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Carregando posts...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Erro ao carregar posts. Tente novamente.</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Recarregar
              </Button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Nenhum post encontrado.</p>
            </div>
          ) : (
            <>
              {posts.map((post) => {
                const isLiked = likedPosts.has(post.id)
                const postCommentsList = postComments[post.id] || []
                const commentInput = commentInputs[post.id] || ''

                return (
                  <Card key={post.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">Profissional</h3>
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
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center space-x-2 transition-colors ${
                              isLiked 
                                ? 'text-red-500 hover:text-red-600' 
                                : 'text-gray-600 hover:text-red-500'
                            }`}
                          >
                            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                            <span>{post.likes_count}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                            <MessageCircle className="h-5 w-5" />
                            <span>{post.comments_count}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
                            <Share2 className="h-5 w-5" />
                            <span>Compartilhar</span>
                          </button>
                        </div>
                      </div>

                      {/* Comentários */}
                      <div className="pt-4 border-t">
                        {postCommentsList.length > 0 && (
                          <div className="mb-4 space-y-2">
                            {postCommentsList.map((comment, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-700">{comment}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Adicione um comentário..."
                            className="flex-1"
                            value={commentInput}
                            onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleCommentSubmit(post.id)
                              }
                            }}
                          />
                          <Button 
                            size="sm"
                            onClick={() => handleCommentSubmit(post.id)}
                            disabled={!commentInput.trim()}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              
              {/* Botão Carregar Mais */}
              {hasNextPage && (
                <div className="flex justify-center py-6">
                  <Button 
                    onClick={loadMore}
                    disabled={isFetchingNextPage}
                    variant="outline"
                    className="min-w-[200px]"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Carregando...
                      </>
                    ) : (
                      'Carregar mais posts'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </MainLayout>
  )
}
