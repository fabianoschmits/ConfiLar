'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, Send, Heart, Reply } from 'lucide-react'
import { usePostCommentsWithNotifications } from '@/hooks/usePostCommentsWithNotifications'
import { useCommentsDebug } from '@/hooks/useCommentsDebug'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CommentSectionWithNotificationsProps {
  postId: string
  postOwnerId: string
  postOwnerName: string
  isOpen: boolean
  onToggle: () => void
  className?: string
}

export function CommentSectionWithNotifications({
  postId,
  postOwnerId,
  postOwnerName,
  isOpen,
  onToggle,
  className = ''
}: CommentSectionWithNotificationsProps) {
  const [commentText, setCommentText] = useState('')
  const { addComment, addCommentMutation, replyTo, setReplyTo } = usePostCommentsWithNotifications({
    postId,
    postOwnerId,
    postOwnerName
  })

  // Carregar comentários existentes
  const { comments, isLoading: commentsLoading, error: commentsError } = useCommentsDebug({
    post_id: postId
  })

  // Debug apenas uma vez quando os dados mudam
  React.useEffect(() => {
    if (commentsLoading) {
      console.log('🔍 Carregando comentários para post:', postId)
    } else if (commentsError) {
      console.log('❌ Erro ao carregar comentários:', commentsError)
    } else if (comments) {
      console.log('✅ Comentários carregados:', comments.length, 'para post:', postId)
    }
  }, [commentsLoading, commentsError, comments, postId])

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    addComment(commentText.trim(), replyTo || undefined)
    setCommentText('')
    setReplyTo(null)
  }

  if (!isOpen) {
    return null // Não renderiza nada quando fechado (botão está na linha de ações)
  }

  return (
    <div className={`mt-4 space-y-3 ${className}`}>
      <form onSubmit={handleSubmitComment} className="space-y-2">
        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={replyTo ? "Responder comentário..." : "Adicione um comentário... Digite @ para mencionar"}
          className="min-h-[100px] resize-none w-full"
          disabled={addCommentMutation.isPending}
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {replyTo && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReplyTo(null)}
                className="text-xs"
              >
                Cancelar resposta
              </Button>
            )}
          </div>
          
          <Button
            type="submit"
            size="sm"
            disabled={!commentText.trim() || addCommentMutation.isPending}
            className="flex items-center gap-2"
          >
            <Send className="h-3 w-3" />
            {addCommentMutation.isPending ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </form>

      {/* Instruções para menções e hashtags */}
      <div className="text-xs text-gray-500">
        Use @nome para mencionar alguém • Use #hashtag para categorizar
      </div>


      {/* Lista de comentários existentes */}
      <div className="space-y-3">
        {commentsLoading ? (
          <div className="text-sm text-gray-500">Carregando comentários...</div>
        ) : commentsError ? (
          <div className="text-sm text-red-500">Erro ao carregar comentários: {commentsError.message}</div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={comment.user?.avatar_url} alt={comment.user?.full_name} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                  {comment.user?.full_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">
                    {comment.user?.full_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
                
                <div className="flex items-center gap-4 mt-2">
                  <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500">
                    <Heart className="h-3 w-3" />
                    Curtir
                  </button>
                  <button 
                    onClick={() => setReplyTo(comment.id)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500"
                  >
                    <Reply className="h-3 w-3" />
                    Responder
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 text-center py-4">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </div>
        )}
      </div>
    </div>
  )
}
