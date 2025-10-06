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

interface CommentSectionProps {
  postId: string
  className?: string
}

export function CommentSection({ postId, className }: CommentSectionProps) {
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
  } = useComments({ post_id: postId, limit: 50 }) // Carregar mais comentários

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      console.log('🔍 Enviando comentário:', {
        content: newComment,
        replyTo: replyTo,
        isReply: !!replyTo
      })
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
            
            {/* Conteúdo do comentário - modo edição ou visualização */}
            {editingComment === comment.id ? (
              <div className="mb-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px] resize-none"
                  placeholder="Editar comentário..."
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
            )}
            
            <div className="flex items-center justify-between">
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
                    onClick={() => {
                      console.log('🔍 Clicou em Responder:', comment.id, 'Usuário:', comment.user.full_name)
                      startReply(comment.id)
                      setReplyingToUser(comment.user.full_name)
                    }}
                    className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    <Reply className="w-3 h-3" />
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
      <div className="mt-4">
        {replyTo && (
          <div className="mb-2 p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                Respondendo a <span className="font-medium">{replyingToUser || 'usuário'}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('🔍 Cancelando resposta')
                  cancelReply()
                  setReplyingToUser(null)
                }}
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
