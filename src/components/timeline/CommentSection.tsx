import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, Reply, MoreHorizontal } from 'lucide-react'
import { useComments } from '@/hooks/useComments'
import { Comment as CommentType } from '@/types/comments'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CommentSectionProps {
  postId: string
  className?: string
}

export function CommentSection({ postId, className }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [showAllComments, setShowAllComments] = useState(false)
  
  const {
    comments,
    isLoading,
    addComment,
    likeComment,
    startReply,
    cancelReply,
    replyTo,
    isAddingComment,
    isLikingComment
  } = useComments({ post_id: postId, limit: showAllComments ? undefined : 3 })

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      addComment(newComment, replyTo || undefined)
      setNewComment('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitComment()
    }
  }

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: ptBR 
    })
  }

  const renderComment = (comment: CommentType, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-6 mt-2' : ''}`}>
      <Card className="p-3">
        <div className="flex items-start space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.user.avatar_url} />
            <AvatarFallback>
              {comment.user.full_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-semibold text-sm">{comment.user.full_name}</span>
              <span className="text-xs text-gray-500">
                {comment.user.user_type === 'professional' ? 'Profissional' : 'Cliente'}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400">
                {formatTimeAgo(comment.created_at)}
              </span>
            </div>
            
            <div className="text-sm text-gray-700 mb-2">
              {comment.content.split(' ').map((word, index) => {
                if (word.startsWith('@')) {
                  return (
                    <span key={index} className="text-blue-600 font-medium">
                      {word}{' '}
                    </span>
                  )
                }
                if (word.startsWith('#')) {
                  return (
                    <span key={index} className="text-purple-600 font-medium">
                      {word}{' '}
                    </span>
                  )
                }
                return <span key={index}>{word} </span>
              })}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => likeComment(comment.id)}
                disabled={isLikingComment}
                className={`flex items-center space-x-1 text-xs hover:text-red-500 transition-colors ${
                  comment.is_liked ? 'text-red-500' : 'text-gray-500'
                }`}
              >
                <Heart className={`w-3 h-3 ${comment.is_liked ? 'fill-current' : ''}`} />
                <span>{comment.likes_count}</span>
              </button>
              
              {!isReply && (
                <button
                  onClick={() => startReply(comment.id)}
                  className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <Reply className="w-3 h-3" />
                  <span>Responder</span>
                </button>
              )}
              
              <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                <MoreHorizontal className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Renderizar respostas */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  )

  return (
    <div className={className}>
      {/* Lista de comentários */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {comments.slice(0, showAllComments ? comments.length : 3).map(comment => 
              renderComment(comment)
            )}
            
            {comments.length > 3 && !showAllComments && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllComments(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                Ver mais {comments.length - 3} comentários
              </Button>
            )}
          </>
        )}
      </div>

      {/* Formulário de novo comentário */}
      <div className="mt-4">
        {replyTo && (
          <div className="mb-2 p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                Respondendo a um comentário...
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelReply}
                className="text-blue-600 hover:text-blue-700"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Textarea
            placeholder={replyTo ? "Responder ao comentário..." : "Adicione um comentário..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 min-h-[80px] resize-none"
            disabled={isAddingComment}
          />
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isAddingComment}
            className="self-end"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Use @nome para mencionar alguém • Use #hashtag para categorizar
        </div>
      </div>
    </div>
  )
}
