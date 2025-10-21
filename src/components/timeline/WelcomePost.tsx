'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, MapPin, Star, Eye, User, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'
import { ReactionButton } from './ReactionButton'
import { CommentSection } from './CommentSection'
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
import { Trash2, Loader2 } from 'lucide-react'

interface WelcomePostProps {
  post: {
    id: string
    title: string
    user_id?: string
    created_at: string
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

export function WelcomePost({ 
  post, 
  onDelete, 
  isDeleting = false, 
  showComments = true 
}: WelcomePostProps) {
  const { user } = useAuthContext()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCommentSection, setShowCommentSection] = useState(false)

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}m`
    } else if (diffInHours < 24) {
      return `${diffInHours}h`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d`
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id)
      setShowDeleteDialog(false)
    }
  }

  const canDelete = user && user.id === post.user_id

  return (
    <>
      <Card className="hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          {/* Header do Post */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Avatar className="w-12 h-12 cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all">
                  <AvatarImage src={post.metadata?.avatar_url || ''} alt={`Avatar de ${post.metadata?.user || 'Usuário'}`} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                    {post.metadata?.user?.charAt(0).toUpperCase() || 'P'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 cursor-pointer transition-colors">
                    <Link href={`/perfil/${post.user_id || ''}`}>
                      {post.metadata?.user}
                    </Link>
                  </h3>
                  <Badge 
                    variant="default"
                    className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 shadow-sm flex items-center gap-1"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Novo membro
                  </Badge>
                </div>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  {post.metadata?.location_city}, {post.metadata?.location_state}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
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

          {/* Conteúdo do Post */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-2xl">🎉</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {post.metadata?.user} se juntou à comunidade!
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Seja bem-vindo(a) à nossa plataforma de profissionais qualificados.
                </p>
              </div>
            </div>
            
            {/* Bio do usuário */}
            {post.metadata?.bio && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {post.metadata.bio}
              </p>
            )}

            {/* Tipo de usuário - Ambos em azul */}
            <div className="flex items-center gap-2 mb-4">
              <Badge 
                variant="outline"
                className="text-xs font-medium px-2 py-1 rounded-full border-blue-200 text-blue-700 bg-blue-50"
              >
                {post.metadata?.user_type === 'professional' ? (
                  <>
                    <UserCheck className="h-3 w-3 mr-1" />
                    Profissional
                  </>
                ) : (
                  <>
                    <User className="h-3 w-3 mr-1" />
                    Cliente
                  </>
                )}
              </Badge>
            </div>
          </div>

          {/* Ações do Post */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-3 md:space-x-6">
              <ReactionButton postId={post.id} />
              <button 
                onClick={() => setShowCommentSection(!showCommentSection)}
                className="flex items-center space-x-1 md:space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-sm md:text-base">0</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-xs"
                >
                  <Link href={`/perfil/${post.user_id || ''}`}>
                    Ver Perfil
                  </Link>
                </Button>
            </div>
          </div>

          {/* Comentários */}
          {showComments && showCommentSection && (
            <CommentSection postId={post.id} />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Post</AlertDialogTitle>
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
