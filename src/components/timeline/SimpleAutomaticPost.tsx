'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Lightbulb, Trash2, Loader2 } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
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

interface SimpleAutomaticPostProps {
  post: {
    id: string
    title: string
    user_id?: string
    professional_id?: string
    created_at: string
    location_city?: string
    location_state?: string
    metadata?: {
      type?: string
      user?: string
      favorited?: string
      from_user?: string
      to_user?: string
      user_id?: string
      favorited_id?: string
      from_user_id?: string
      to_user_id?: string
      location_city?: string
      location_state?: string
    }
  }
  onDelete?: (postId: string) => void
  isDeleting?: boolean
}

export function SimpleAutomaticPost({ post, onDelete, isDeleting = false }: SimpleAutomaticPostProps) {
  const { user } = useAuthContext()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const canDelete = user?.id === post.user_id

  // Debug: Log para verificar dados do post
  console.log('🔍 SimpleAutomaticPost Debug:', {
    postId: post.id,
    title: post.title,
    user_id: post.user_id,
    professional_id: post.professional_id,
    metadata: post.metadata,
    location_city: post.metadata?.location_city,
    location_state: post.metadata?.location_state
  })

  const getPostIcon = (type: string | undefined) => {
    switch (type) {
      case 'favorite':
        return <Heart className="h-4 w-4 text-red-500 mr-2" />
      case 'recommendation':
        return <Lightbulb className="h-4 w-4 text-yellow-500 mr-2" />
      default:
        return '📢'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return 'Agora mesmo'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`
    } else if (diffInMinutes < 1440) {
      const diffInHours = Math.floor(diffInMinutes / 60)
      return `${diffInHours}h atrás`
    } else {
      const diffInDays = Math.floor(diffInMinutes / 1440)
      return `${diffInDays}d atrás`
    }
  }

  const getPostMessage = () => {
    const { type, user, favorited, from_user, to_user, user_id, favorited_id, from_user_id, to_user_id } = post.metadata || {}
    
    // Debug: verificar os dados recebidos
    console.log('🔍 SimpleAutomaticPost - Dados do post:', {
      postId: post.id,
      user_id: post.user_id,
      professional_id: post.professional_id,
      metadata: post.metadata
    })
    
    switch (type) {
      case 'favorite':
        return (
          <span className="text-sm">
            {getPostIcon(type)} 
            <Link href={`/perfil/${user_id || post.user_id || ''}`} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
              {user}
            </Link> 
            {' '}favoritou{' '}
            <Link href={`/perfil/${favorited_id || post.professional_id || ''}`} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
              {favorited}
            </Link>
          </span>
        )
      case 'recommendation':
        return (
          <span className="text-sm">
            {getPostIcon(type)} 
            <Link href={`/perfil/${from_user_id || post.user_id || ''}`} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
              {from_user}
            </Link> 
            {' '}recomendou{' '}
            <Link href={`/perfil/${to_user_id || post.professional_id || ''}`} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
              {to_user}
            </Link>
          </span>
        )
      default:
        return <span className="text-sm">{post.title}</span>
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
      <Card className="mb-2 bg-gray-50 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <CardContent className="py-2 px-3">
          {/* Linha principal com ação */}
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {getPostMessage()}
            </div>
            
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
                className="h-6 w-6 p-0 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2"
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>

          {/* Linha de informações (localização e tempo) - mais compacta */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <div className="flex items-center">
              <span>📍 {post.metadata?.location_city || post.location_city || 'Cidade'}, {post.metadata?.location_state || post.location_state || 'Estado'}</span>
            </div>
            <div className="flex items-center">
              <span>🕒 {formatTimeAgo(post.created_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Post Automático</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este post automático? Esta ação não pode ser desfeita.
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
