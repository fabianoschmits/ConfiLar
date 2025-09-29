'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MapPin, Eye, MessageCircle, Loader2, MoreHorizontal } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { ReportButton } from '@/components/ReportButton'
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

interface NewUserWelcomePostProps {
  post: {
    id: string
    title: string
    user_id?: string
    professional_id?: string
    created_at: string
    likes_count: number
    comments_count: number
    location_city?: string
    location_state?: string
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

export function NewUserWelcomePost({ 
  post, 
  onDelete, 
  isDeleting = false, 
  showComments = true 
}: NewUserWelcomePostProps) {
  const { user } = useAuthContext()
  const { openChat } = useFloatingChat()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const canDelete = user?.id === post.user_id

  // Debug: verificar os dados recebidos
  console.log('🔍 NewUserWelcomePost Debug:', {
    postId: post.id,
    title: post.title,
    user_id: post.user_id,
    professional_id: post.professional_id,
    location_city: post.location_city,
    location_state: post.location_state,
    metadata: post.metadata
  })

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return 'Agora mesmo'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}h atrás`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days}d atrás`
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id)
      setShowDeleteDialog(false)
    }
  }

  // Extrair dados do usuário - priorizando metadata, depois post
  const userName = post.metadata?.user || 'Usuário'
  const userAvatar = post.metadata?.avatar_url || ''
  const userBio = post.metadata?.bio || 'Profissional qualificado e experiente.'
  const userLocationCity = post.metadata?.location_city || post.location_city || 'Cidade'
  const userLocationState = post.metadata?.location_state || post.location_state || 'Estado'
  const userType = post.metadata?.user_type || 'profissional'

  return (
    <>
      <Card className="mb-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          {/* Header - Estilo exato da imagem */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="flex-shrink-0">
              <Link href={`/perfil/${post.user_id || ''}`}>
                <Avatar className="w-16 h-16 cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all">
                  <AvatarImage src={userAvatar} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-lg">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
                  <Link href={`/perfil/${post.user_id || ''}`}>
                    {userName}
                  </Link>
                </h3>
                <Badge 
                  variant="secondary"
                  className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 flex items-center gap-1"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Disponível
                </Badge>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {userLocationCity}, {userLocationState}
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                {userBio}
              </div>
              
              {/* Mensagem de boas-vindas personalizada */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">🎉</span>
                  </div>
                  <h4 className="font-semibold text-blue-900">Bem-vindo à comunidade ConfiLar!</h4>
                </div>
                <p className="text-blue-800 text-sm leading-relaxed">
                  {userType === 'professional' 
                    ? `Olá! Sou ${userName} e acabei de me juntar à plataforma ConfiLar! 🎉 Estou aqui para oferecer meus serviços profissionais e ajudar outros usuários com seus projetos. Fico feliz em fazer parte desta comunidade!`
                    : `Olá! Sou ${userName} e acabei de me juntar à plataforma ConfiLar! 🎉 Estou aqui para encontrar profissionais qualificados para meus projetos. Mal posso esperar para conhecer a comunidade!`
                  }
                </p>
              </div>
              
              <div className="text-xs text-gray-500">
                {formatTimeAgo(post.created_at)}
              </div>
            </div>
            
            {/* Menu de opções */}
            <div className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {canDelete ? (
                    // Opções para o dono do post
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <Loader2 className="h-4 w-4 mr-2" />
                      Deletar Post
                    </DropdownMenuItem>
                  ) : (
                    // Opções para outros usuários
                    <DropdownMenuItem asChild>
                      <ReportButton 
                        type="post" 
                        targetId={post.id}
                        targetName={post.title}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
                      />
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Botões de ação - Estilo da imagem */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-gray-500">
                <Eye className="h-4 w-4 mr-1" />
                <span className="text-sm">12</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                asChild
                className="text-xs"
              >
                <Link href={`/perfil/${post.user_id || ''}`}>
                  Ver Perfil
                </Link>
              </Button>
              <Button 
                size="sm"
                onClick={() => openChat(post.user_id || '', userName)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Contatar
              </Button>
            </div>
          </div>

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