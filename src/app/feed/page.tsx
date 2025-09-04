'use client'

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/MainLayout'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus, 
  Filter,
  MapPin,
  Star,
  User,
  Image as ImageIcon,
  Send
} from 'lucide-react'
import { FeedPost, Profile } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { ImageUploadFeed } from '@/components/ui/ImageUploadFeed'

// Posts serão carregados do Supabase

// Perfis serão resolvidos do Supabase quando necessário

export default function FeedPage() {
  const { profile, isMockMode } = useAuthContext()
  const [posts, setPosts] = useState<FeedPost[]>([])

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('feed_posts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) setPosts(data as FeedPost[])
    }
    load()
  }, [])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
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
      // Adicionar comentário à lista
      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment]
      }))
      
      // Atualizar contador de comentários
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, comments_count: post.comments_count + 1 }
            : post
        )
      )
      
      // Limpar input do comentário
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

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'gold': return 'bg-yellow-500 text-white'
      case 'silver': return 'bg-gray-400 text-white'
      case 'bronze': return 'bg-amber-600 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getBadgeText = (badge: string) => {
    switch (badge) {
      case 'gold': return '🥇 Ouro'
      case 'silver': return '🥈 Prata'
      case 'bronze': return '🥉 Bronze'
      default: return 'Sem Badge'
    }
  }

  return (
    <MainLayout>
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

        {/* Formulário de Novo Post */}
        {showNewPostForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Compartilhar Trabalho</CardTitle>
              <CardDescription>
                Mostre aos clientes o que você é capaz de fazer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título do Trabalho</label>
                <Input
                  placeholder="Ex: Reforma de Cozinha Moderna"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  placeholder="Descreva o trabalho realizado, materiais usados, tempo de execução..."
                  value={newPost.description}
                  onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Fotos do Trabalho</label>
                <ImageUploadFeed
                  onImagesUpload={(imageUrls) => setNewPost({ ...newPost, images: imageUrls })}
                  currentImages={newPost.images}
                  maxImages={5}
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  className="flex-1"
                  disabled={!newPost.title.trim() || !newPost.description.trim() || newPost.images.length === 0}
                  onClick={() => {
                    // Simular criação de post
                    const newPostData: FeedPost = {
                      id: Date.now().toString(),
                      professional_id: profile?.id || 'mock-prof',
                      title: newPost.title,
                      description: newPost.description,
                      images: newPost.images,
                      service_category_id: null,
                      location_state: profile?.location_state || null,
                      location_city: profile?.location_city || null,
                      likes_count: 0,
                      comments_count: 0,
                      is_active: true,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    }
                    setPosts([newPostData, ...posts])
                    setNewPost({ title: '', description: '', images: [] })
                    setShowNewPostForm(false)
                  }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {newPost.images.length === 0 ? 'Adicione fotos primeiro' : 'Publicar Trabalho'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowNewPostForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feed de Posts */}
        <div className="space-y-6">
          {posts.map((post) => {
            const isLiked = likedPosts.has(post.id)
            const postCommentsList = postComments[post.id] || []
            const commentInput = commentInputs[post.id] || ''

            return (
              <Card key={post.id} className="overflow-hidden">
                {/* Header do Post */}
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

                {/* Conteúdo do Post */}
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
                          <img
                            src={image}
                            alt={`Imagem ${index + 1} do trabalho`}
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
                    {/* Lista de comentários existentes */}
                    {postCommentsList.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {postCommentsList.map((comment, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700">{comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Input para novo comentário */}
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
        </div>

        {/* Aviso de Modo Mock */}
        {isMockMode && (
          <div className="mt-8 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
            <p className="text-yellow-800 text-sm">
              ⚠️ Modo de desenvolvimento ativo - Dados simulados para demonstração
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
