'use client'

import React, { useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  Check, 
  CheckCheck, 
  Clock, 
  User, 
  Reply,
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Message } from '@/hooks/useMessages'

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  onReply?: (messageId: string) => void
  onEdit?: (messageId: string) => void
  onDelete?: (messageId: string) => void
  className?: string
}

export function MessageList({ 
  messages, 
  currentUserId, 
  onReply, 
  onEdit, 
  onDelete,
  className 
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="bg-gray-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
          <div className="bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-4 inline-block mb-4">
            <User className="h-8 w-8 text-black mx-auto" />
          </div>
          <h3 className="font-black text-black uppercase text-lg mb-2">
            NENHUMA MENSAGEM
          </h3>
          <p className="text-sm text-gray-600 font-bold">
            Seja o primeiro a enviar uma mensagem!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col space-y-3 p-4 ${className}`}>
      {messages.map((message) => {
        const isOwn = message.sender_id === currentUserId
        const isSystem = message.message_type === 'system'
        const isContactRequest = message.message_type === 'contact_request'
        
        return (
          <div
            key={message.id}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${
              isSystem ? 'justify-center' : ''
            }`}
          >
            <div className={`max-w-[80%] ${isSystem ? 'w-full' : ''}`}>
              {/* Mensagem do Sistema */}
              {isSystem && (
                <div className="bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 text-center">
                  <p className="font-black text-black text-sm uppercase">
                    {message.content}
                  </p>
                  <p className="text-xs text-gray-600 font-bold mt-1">
                    {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}

              {/* Mensagem Normal */}
              {!isSystem && (
                <div className="flex items-start gap-2">
                  {/* Avatar do Remetente */}
                  {!isOwn && (
                    <UserAvatar
                      src={message.sender?.avatar_url}
                      alt={message.sender?.full_name || 'Usuário'}
                      fallback={message.sender?.full_name?.charAt(0).toUpperCase() || 'U'}
                      size="md"
                      className="w-8 h-8 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0"
                    />
                  )}

                  {/* Conteúdo da Mensagem */}
                  <div className="flex flex-col">
                    {/* Nome do Remetente */}
                    {!isOwn && (
                      <div className="mb-1">
                        <span className="text-xs font-black text-black uppercase">
                          {message.sender.full_name}
                        </span>
                        <Badge className="ml-2 bg-blue-500 text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] font-black text-xs">
                          {message.sender.user_type}
                        </Badge>
                      </div>
                    )}

                    {/* Mensagem */}
                    <div
                      className={`p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                        isOwn 
                          ? 'bg-black text-yellow-400' 
                          : 'bg-white text-black'
                      } ${
                        isContactRequest 
                          ? 'bg-green-100 border-green-500 text-green-800' 
                          : ''
                      }`}
                    >
                      {/* Conteúdo */}
                      <p className="font-bold text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>

                      {/* Metadados */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          {/* Timestamp */}
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 opacity-70" />
                            <span className="text-xs opacity-70 font-bold">
                              {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {/* Status de Leitura */}
                          {isOwn && (
                            <div className="flex items-center">
                              {message.is_read ? (
                                <CheckCheck className="h-3 w-3 text-blue-400" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Ações da Mensagem */}
                        {!isSystem && (
                          <div className="flex items-center gap-1">
                            {/* Responder */}
                            {onReply && (
                              <button
                                onClick={() => onReply(message.id)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Responder"
                              >
                                <Reply className="h-3 w-3" />
                              </button>
                            )}

                            {/* Editar (apenas mensagens próprias) */}
                            {isOwn && onEdit && (
                              <button
                                onClick={() => onEdit(message.id)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Editar"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                            )}

                            {/* Deletar (apenas mensagens próprias) */}
                            {isOwn && onDelete && (
                              <button
                                onClick={() => onDelete(message.id)}
                                className="p-1 hover:bg-red-200 rounded transition-colors"
                                title="Deletar"
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </button>
                            )}

                            {/* Menu de Opções */}
                            <button
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Mais opções"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Mensagem de Resposta */}
                      {message.reply_to_id && (
                        <div className="mt-2 p-2 bg-gray-100 border border-black">
                          <p className="text-xs font-bold text-gray-600">
                            Respondendo a uma mensagem anterior...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Avatar do Remetente (lado direito) */}
                  {isOwn && (
                    <UserAvatar
                      src={message.sender?.avatar_url}
                      alt={message.sender?.full_name || 'Usuário'}
                      fallback={message.sender?.full_name?.charAt(0).toUpperCase() || 'U'}
                      size="md"
                      className="w-8 h-8 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
      
      {/* Referência para scroll automático */}
      <div ref={messagesEndRef} />
    </div>
  )
}
