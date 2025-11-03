import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, Reply, MoreHorizontal, ChevronDown, Check, X } from 'lucide-react'
import { useComments } from '@/hooks/useComments'
import { Comment as CommentType } from '@/types/comments'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CommentOptionsMenu } from './CommentOptionsMenu'
import { MentionInput } from '@/components/ui/MentionInput'
import { MentionText } from '@/components/ui/MentionText'
import { cn } from '@/lib/utils'

// CSS para animação de batida do coração
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes heartBeat {
      0%, 100% {
        transform: scale(1);
      }
      25% {
        transform: scale(1.3) rotate(-5deg);
      }
      50% {
        transform: scale(1.2) rotate(5deg);
      }
      75% {
        transform: scale(1.15) rotate(-3deg);
      }
    }
  `
  if (!document.head.querySelector('#comment-like-animations')) {
    style.id = 'comment-like-animations'
    document.head.appendChild(style)
  }
}

interface CommentSectionProps {
  postId: string
  postOwnerId?: string
  postOwnerName?: string
  className?: string
}

export function CommentSection({ postId, postOwnerId, postOwnerName, className }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [visibleComments, setVisibleComments] = useState(3)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [replyingToUser, setReplyingToUser] = useState<string | null>(null)
  const observerRef = useRef<HTMLDivElement>(null)
  
  const {
    comments,
    isLoading,
    addComment,
    likeComment,
    editComment,
    deleteComment,
    startReply,
    cancelReply,
    replyTo,
    isAddingComment,
    isLikingComment,
    isEditingComment,
    isDeletingComment
  } = useComments({ 
    post_id: postId, 
    postOwnerId,
    postOwnerName,
    limit: 50 
  }) // Carregar mais comentários

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      addComment(newComment, replyTo || undefined)
      setNewComment('')
      // Limpar replyTo após enviar
      if (replyTo) {
        cancelReply()
        setReplyingToUser(null)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitComment()
    }
  }

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingComment(commentId)
    setEditContent(currentContent)
  }

  const handleSaveEdit = () => {
    if (editingComment && editContent.trim()) {
      editComment(editingComment, editContent)
      setEditingComment(null)
      setEditContent('')
    }
  }

  const handleCancelEdit = () => {
    setEditingComment(null)
    setEditContent('')
  }

  const handleDeleteComment = (commentId: string) => {
    if (confirm('Tem certeza que deseja deletar este comentário?')) {
      deleteComment(commentId)
    }
  }

  // Função para carregar mais comentários
  const loadMoreComments = useCallback(() => {
    if (isLoadingMore || visibleComments >= comments.length) return
    
    setIsLoadingMore(true)
    setTimeout(() => {
      setVisibleComments(prev => Math.min(prev + 10, comments.length))
      setIsLoadingMore(false)
    }, 500)
  }, [visibleComments, comments.length, isLoadingMore])

  // Observer para scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleComments < comments.length) {
          loadMoreComments()
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loadMoreComments, visibleComments, comments.length])

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: ptBR 
    })
  }

  // Componente para botão de like dos comentários
  const CommentLikeButton = ({ comment }: { comment: CommentType }) => {
    const [isAnimating, setIsAnimating] = useState(false)

    const handleLikeComment = () => {
      // Ativar animação
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 600) // Duração da animação
      
      likeComment(comment.id)
    }

    return (
      <button
        onClick={handleLikeComment}
        disabled={isLikingComment}
        className={cn(
          "flex items-center space-x-1 text-sm transition-all duration-200 relative overflow-visible",
          comment.is_liked 
            ? 'text-red-500 hover:text-red-600' 
            : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400',
          isAnimating && 'scale-110'
        )}
      >
        <Heart 
          className={cn(
            "w-4 h-4 transition-all duration-300",
            comment.is_liked && 'fill-current',
            isAnimating && 'animate-[heartBeat_0.6s_ease-in-out]'
          )}
          style={{
            animation: isAnimating ? 'heartBeat 0.6s ease-in-out' : undefined
          }}
        />
        <span className={cn(
          "text-sm font-medium transition-all duration-300",
          isAnimating && "scale-110 font-bold"
        )}>
          {comment.likes_count || 0}
        </span>
        
        {/* Efeito de partículas ao clicar */}
        {isAnimating && comment.is_liked && (
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="absolute animate-ping text-red-400 opacity-75 text-xs">
              ❤️
            </span>
          </span>
        )}
      </button>
    )
  }

  const renderComment = (comment: CommentType, isReply = false) => {

    return (
      <div key={comment.id} className={`${isReply ? 'relative' : ''}`}>
        <Card className={`${isReply ? 'px-3 pt-1 pb-0 border-l-2 border-blue-200 bg-blue-50/30' : 'px-3 pt-1 pb-0'}`}>
          <div className="flex items-start space-x-3">
            <Avatar className="w-9 h-9">
              <AvatarImage src={comment.user.avatar_url} alt={`Avatar de ${comment.user.full_name}`} />
              <AvatarFallback>
                {comment.user.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-base dark:text-white">{comment.user.full_name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {comment.user.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatTimeAgo(comment.created_at)}
                </span>
                
                {/* Indicador de resposta */}
                {isReply && (
                  <>
                    <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                      <Reply className="w-3 h-3" />
                      Resposta
                    </span>
                  </>
                )}
              </div>
              
              {/* Conteúdo do comentário - modo edição ou visualização */}
              {editingComment === comment.id ? (
                <div className="mb-2">
                  <MentionInput
                    value={editContent}
                    onChange={(value) => setEditContent(value)}
                    placeholder="Editar comentário... Digite @ para mencionar"
                    className="w-full"
                    minHeight="60px"
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={!editContent.trim() || isEditingComment}
                      className="h-7 px-2"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="h-7 px-2"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-base text-gray-700 dark:text-gray-200 mb-2">
                  <MentionText text={comment.content} />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CommentLikeButton comment={comment} />
                
                  {!isReply && (
                    <button
                      onClick={() => {
                        startReply(comment.id)
                        setReplyingToUser(comment.user.full_name)
                      }}
                      className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                      <span>Responder</span>
                    </button>
                  )}
                </div>
                
                {/* Menu de opções */}
                <CommentOptionsMenu
                  commentId={comment.id}
                  commentUserId={comment.user.id}
                  onEdit={() => handleEditComment(comment.id, comment.content)}
                  onDelete={() => handleDeleteComment(comment.id)}
                  isDeleting={isDeletingComment}
                />
              </div>
            </div>
          </div>
        </Card>
        
        {/* Renderizar respostas */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 ml-10 relative">
            {/* Linha vertical principal para conectar todas as respostas */}
            <div className="absolute -left-10 top-0 bottom-0 w-px bg-gray-200"></div>
            
            {/* Container das respostas */}
            <div className="space-y-2">
              {comment.replies.map((reply, index) => (
                <div key={reply.id} className="relative">
                  {/* Linha horizontal para cada resposta */}
                  <div className="absolute -left-10 top-6 w-10 h-px bg-gray-200"></div>
                  {renderComment(reply, true)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Lista de comentários */}
      <div className="space-y-3 w-full">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {comments.slice(0, visibleComments).map(comment => 
              renderComment(comment)
            )}
            
            {/* Botão para carregar mais comentários */}
            {visibleComments < comments.length && (
              <div ref={observerRef} className="text-center py-4">
                {isLoadingMore ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadMoreComments}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Carregar mais comentários ({comments.length - visibleComments} restantes)
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Formulário de novo comentário */}
      <div className="mt-4 w-full">
        {replyTo && (
          <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Respondendo a <span className="font-medium">{replyingToUser || 'usuário'}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  cancelReply()
                  setReplyingToUser(null)
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
        
        <div className="w-full">
          <MentionInput
            placeholder={replyTo ? "Responder ao comentário... Digite @ para mencionar" : "Adicione um comentário... Digite @ para mencionar"}
            value={newComment}
            onChange={(value) => setNewComment(value)}
            onKeyPress={handleKeyPress}
            className="w-full"
            disabled={isAddingComment}
            minHeight="80px"
          />
          <div className="flex justify-end mt-2">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isAddingComment}
              className="px-4"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          💡 Use @nome para mencionar alguém • Use #hashtag para categorizar
        </div>
      </div>
    </div>
  )
}
