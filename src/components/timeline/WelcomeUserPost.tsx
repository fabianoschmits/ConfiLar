'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MapPin, Eye, MessageCircle, Star, Loader2, Trash2, UserPlus } from 'lucide-react'
import { ReactionButton } from './ReactionButton'
import { CommentSection } from './CommentSection'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { RecommendationButton } from '@/components/ui/RecommendationButton'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface WelcomeUserPostProps {
  post: {
    id: string
    title: string
    user_id?: string
    created_at: string
    likes_count: number
    comments_count: number
    metadata?: {
      type?: string
      user?: string
      user_type?: string
      location_city?: string
      location_state?: string
      bio?: string
      avatar_url?: string
    }
  }
  onDelete?: (postId: string) => void
  isDeleting?: boolean
  showComments?: boolean
}

export function WelcomeUserPost({ 
  post, 
  onDelete, 
  isDeleting = false, 
  showComments = true 
}: WelcomeUserPostProps) {
  const { user } = useAuthContext()
  const { openChat } = useFloatingChat()
  const [showCommentSection, setShowCommentSection] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const canDelete = user?.id === post.user_id

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes} min atrás`
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d atrás`
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <Card className="mb-4 hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          {/* Header do Card - Estilo da página de busca */}
          <div className="flex items-start space-x-3 mb-4">
            <div className="flex-shrink-0">
              <Link href={`/perfil/${post.user_id || ''}`}>
                <Avatar className="w-16 h-16 cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all">
                  <AvatarImage src={post.metadata?.avatar_url || ''} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                    {post.metadata?.user?.charAt(0).toUpperCase() || 'N'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
                  <Link href={`/perfil/${post.user_id || ''}`}>
                    {post.metadata?.user}
                  </Link>
                </h3>
                <Badge 
                  variant="default"
                  className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 shadow-sm flex items-center gap-1"
                >
                  <UserPlus className="h-3 w-3" />
                  Novo Membro
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  {post.metadata?.location_city}, {post.metadata?.location_state}
                </div>
                <div className="text-xs text-gray-500">
                  {formatTimeAgo(post.created_at)}
                </div>
              </div>
            </div>
            
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          {/* Mensagem de Boas-vindas */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">🎉 Bem-vindo(a) à comunidade!</span>
            </div>
            <p className="text-sm text-blue-700">
              {post.metadata?.bio || 'Seja bem-vindo(a) à nossa plataforma! Estamos felizes em tê-lo(a) conosco e ansiosos para ver suas contribuições na comunidade.'}
            </p>
          </div>

          {/* Bio do usuário */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {post.metadata?.bio || 'Profissional qualificado e experiente.'}
          </p>

          {/* Avaliações - Simuladas para novo usuário */}
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 text-gray-300"
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              Novo membro - Sem avaliações ainda
            </span>
          </div>

          {/* Footer do Card - Estilo da página de busca */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center text-xs text-gray-500">
              <div className="flex items-center mb-0.5">
                <Eye className="h-3 w-3 mr-1" />
                <span className="font-medium">0</span>
              </div>
              <span className="text-xs">visualizações</span>
            </div>
            
            <div className="flex gap-2">
              <FavoriteButton 
                userId={post.user_id || ''}
                userName={post.metadata?.user || 'Usuário'}
                size="sm"
                variant="outline"
              />
              <RecommendationButton 
                userId={post.user_id || ''}
                userName={post.metadata?.user || 'Usuário'}
                size="sm"
                variant="outline"
                showCount={false}
                className="text-xs"
              />
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs"
                asChild
              >
                <Link href={`/perfil/${post.user_id || ''}`}>
                  Ver Perfil
                </Link>
              </Button>
              <Button 
                size="sm"
                onClick={() => openChat(post.user_id || '', post.metadata?.user || 'Usuário')}
                className="bg-blue-600 hover:bg-blue-700"
                title="Contatar"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Comentários */}
          {showComments && showCommentSection && (
            <div className="mt-4 pt-4 border-t">
              <CommentSection postId={post.id} />
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Post de Boas-Vindas</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este post de boas-vindas? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                'Deletar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
