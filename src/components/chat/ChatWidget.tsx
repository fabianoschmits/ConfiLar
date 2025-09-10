'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/UserAvatar'
// Lucide icons não utilizados removidos
import { 
  ChatTeardrop, 
  X as XPhosphor, 
  PaperPlane as SendPhosphor, 
  ArrowsInSimple as MinimizePhosphor,
  Paperclip as PaperclipPhosphor,
  Smiley,
  Microphone
} from '@phosphor-icons/react'

interface ChatWidgetProps {
  userId: string
  userName: string
  userAvatar?: string
  onSendMessage?: (message: string) => void
  onClose?: () => void
  className?: string
}

export function ChatWidget({
  userId,
  userName,
  userAvatar,
  onSendMessage,
  onClose,
  className = ''
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{
    id: string
    content: string
    sender: 'user' | 'other'
    timestamp: Date
  }>>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      content: message.trim(),
      sender: 'user' as const,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setMessage('')

    // Simular resposta automática
    setTimeout(() => {
      const replyMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Obrigado pela mensagem! Nossa equipe responderá em breve.',
        sender: 'other' as const,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, replyMessage])
    }, 1000)

    // Chamar callback se fornecido
    onSendMessage?.(message.trim())
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setUnreadCount(0)
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  // Simular mensagens não lidas
  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        setUnreadCount(prev => prev + 1)
      }, 30000) // Adiciona 1 mensagem não lida a cada 30 segundos

      return () => clearInterval(interval)
    }
  }, [isOpen])

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Widget */}
      {isOpen && (
        <Card className={`w-80 shadow-2xl border-0 ${isMinimized ? 'h-12' : 'h-96'}`}>
          <CardHeader className="p-3 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserAvatar
                  src={userAvatar}
                  alt={userName}
                  className="w-8 h-8"
                />
                <div>
                  <h3 className="font-semibold text-sm">Suporte ConfiLar</h3>
                  <p className="text-xs opacity-90">Online agora</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMinimize}
                  className="text-white hover:bg-white/20 p-1"
                >
                  <MinimizePhosphor size={16} weight="light" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose || (() => setIsOpen(false))}
                  className="text-white hover:bg-white/20 p-1"
                >
                  <XPhosphor size={16} weight="light" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              {/* Mensagens */}
              <CardContent className="p-0 flex-1 overflow-hidden">
                <div className="h-64 overflow-y-auto p-3 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      <ChatTeardrop size={32} weight="light" className="mx-auto mb-2 text-gray-300" />
                      <p>Inicie uma conversa!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                            msg.sender === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {msg.timestamp.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Input de Mensagem */}
              <div className="p-3 border-t bg-gray-50">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="p-1">
                      <PaperclipPhosphor size={16} weight="light" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Smiley size={16} weight="light" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Microphone size={16} weight="light" />
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white p-1"
                    >
                      <SendPhosphor size={16} weight="light" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Botão Flutuante */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <div className="relative">
            <ChatTeardrop size={24} weight="light" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </div>
        </Button>
      )}
    </div>
  )
}
