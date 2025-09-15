'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Paperclip, 
  Image, 
  Smile, 
  X, 
  Plus,
  FileText,
  Camera,
  Mic,
  MoreHorizontal
} from 'lucide-react'
import { Message } from '@/hooks/useMessages'

interface MessageInputProps {
  onSendMessage: (content: string, messageType?: 'text' | 'image' | 'file' | 'system' | 'contact_request') => Promise<void>
  onSendContactRequest?: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
  replyTo?: Message | null
  onCancelReply?: () => void
}

export function MessageInput({ 
  onSendMessage, 
  onSendContactRequest,
  disabled = false, 
  placeholder = "DIGITE SUA MENSAGEM...",
  className,
  replyTo,
  onCancelReply
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSend = async () => {
    if (!message.trim() || sending || disabled) return

    try {
      setSending(true)
      await onSendMessage(message.trim())
      setMessage('')
      setIsExpanded(false)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleAttachmentClick = (type: 'image' | 'file') => {
    // Implementar upload de arquivos
    console.log(`Upload de ${type}`)
    setShowAttachments(false)
  }

  return (
    <div className={`bg-white border-t-4 border-black ${className}`}>
      {/* Mensagem de Resposta */}
      {replyTo && (
        <div className="bg-yellow-100 border-b-2 border-yellow-500 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-yellow-400 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] p-1">
                <FileText className="h-3 w-3 text-black" />
              </div>
              <div>
                <p className="text-xs font-black text-yellow-800 uppercase">
                  RESPONDENDO A:
                </p>
                <p className="text-xs font-bold text-yellow-700 truncate max-w-48">
                  {replyTo.content}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelReply}
              className="bg-red-500 text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-black p-1 rounded-none"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Input Principal */}
      <div className="p-4">
        <div className="flex gap-2">
          {/* Botão de Anexos */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAttachments(!showAttachments)}
            className="bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black p-2 rounded-none"
          >
            <Plus className="h-4 w-4" />
          </Button>

          {/* Campo de Texto */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled || sending}
              className="min-h-[40px] max-h-32 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-black placeholder:text-gray-500 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none resize-none"
              onFocus={() => setIsExpanded(true)}
            />
            
            {/* Contador de Caracteres */}
            {message.length > 0 && (
              <div className="absolute bottom-1 right-1">
                <Badge className="bg-gray-500 text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] font-black text-xs">
                  {message.length}
                </Badge>
              </div>
            )}
          </div>

          {/* Botão de Enviar */}
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sending || disabled}
            className="bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black px-4 rounded-none"
          >
            {sending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">ENVIANDO...</span>
              </div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Menu de Anexos */}
        {showAttachments && (
          <Card className="mt-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleAttachmentClick('image')}
                  className="bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black rounded-none"
                >
                  <Image className="h-4 w-4 mr-2" />
                  IMAGEM
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAttachmentClick('file')}
                  className="bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black rounded-none"
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  ARQUIVO
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botões de Ação Rápida */}
        {isExpanded && (
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSendContactRequest}
              className="bg-green-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-xs rounded-none"
            >
              <FileText className="h-3 w-3 mr-1" />
              SOLICITAR CONTATO
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-xs rounded-none"
            >
              <Smile className="h-3 w-3 mr-1" />
              EMOJI
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="bg-purple-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-xs rounded-none"
            >
              <Mic className="h-3 w-3 mr-1" />
              VOZ
            </Button>
          </div>
        )}

        {/* Dicas de Uso */}
        {message.length === 0 && (
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500 font-bold">
              Pressione ENTER para enviar • SHIFT+ENTER para nova linha
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
