'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  MessageCircle, 
  Search, 
  Filter, 
  MoreVertical, 
  Archive, 
  Trash2,
  Pin,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Calendar
} from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Conversation } from '@/hooks/useMessages'
import { ConversationMenu } from './ConversationMenu'

interface ConversationListProps {
  conversations: Conversation[]
  currentUserId: string
  onSelectConversation: (conversation: Conversation) => void
  onArchiveConversation?: (conversationId: string) => void
  onDeleteConversation?: (conversationId: string) => void
  loading?: boolean
  className?: string
}

export function ConversationList({ 
  conversations, 
  currentUserId, 
  onSelectConversation,
  onArchiveConversation,
  onDeleteConversation,
  loading = false,
  className 
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'archived'>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Filtrar conversas
  const filteredConversations = conversations.filter(conversation => {
    const otherUser = currentUserId === conversation.client_id 
      ? conversation.professional 
      : conversation.client
    
    const matchesSearch = searchTerm === '' || 
      otherUser.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.last_message_preview?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.ad?.title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'unread' && (
        (currentUserId === conversation.client_id && conversation.unread_count_client > 0) ||
        (currentUserId === conversation.professional_id && conversation.unread_count_professional > 0)
      )) ||
      (filterStatus === 'archived' && conversation.status === 'archived')

    return matchesSearch && matchesFilter
  })

  // Calcular estatísticas
  const totalUnread = conversations.reduce((total, conv) => {
    if (currentUserId === conv.client_id) {
      return total + conv.unread_count_client
    } else if (currentUserId === conv.professional_id) {
      return total + conv.unread_count_professional
    }
    return total
  }, 0)

  const activeConversations = conversations.filter(c => c.status === 'active').length
  const archivedConversations = conversations.filter(c => c.status === 'archived').length

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-300 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center py-12">
          <div className="bg-gray-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8">
            <div className="bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-4 inline-block mb-4">
              <MessageCircle className="h-8 w-8 text-black mx-auto" />
            </div>
            <h3 className="font-black text-black uppercase text-lg mb-2">
              NENHUMA CONVERSA
            </h3>
            <p className="text-sm text-gray-600 font-bold">
              Inicie uma conversa com outro usuário
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header com Estatísticas */}
      <div className="bg-yellow-400 border-b-4 border-black p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-black" />
            <h3 className="font-black text-black uppercase text-lg">
              CONVERSAS
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {totalUnread > 0 && (
              <Badge className="bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black">
                {totalUnread}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-black text-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black p-2 rounded-none"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-2">
            <p className="font-black text-black text-sm">{activeConversations}</p>
            <p className="text-xs text-gray-600 font-bold">ATIVAS</p>
          </div>
          <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-2">
            <p className="font-black text-black text-sm">{totalUnread}</p>
            <p className="text-xs text-gray-600 font-bold">NÃO LIDAS</p>
          </div>
          <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-2">
            <p className="font-black text-black text-sm">{archivedConversations}</p>
            <p className="text-xs text-gray-600 font-bold">ARQUIVADAS</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white border-b-2 border-black p-4">
          <div className="space-y-3">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="BUSCAR CONVERSAS..."
                className="pl-10 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-black placeholder:text-gray-500 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none"
              />
            </div>

            {/* Filtros de Status */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'TODAS', icon: Users },
                { key: 'unread', label: 'NÃO LIDAS', icon: AlertCircle },
                { key: 'archived', label: 'ARQUIVADAS', icon: Archive }
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={filterStatus === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(key as any)}
                  className={`${
                    filterStatus === key 
                      ? 'bg-black text-yellow-400' 
                      : 'bg-white text-black'
                  } border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-xs rounded-none`}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lista de Conversas */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center">
            <div className="bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-6">
              <Search className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="font-black text-black uppercase text-sm">
                NENHUMA CONVERSA ENCONTRADA
              </p>
              <p className="text-xs text-gray-600 font-bold">
                Tente ajustar os filtros de busca
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => {
              const otherUser = currentUserId === conversation.client_id 
                ? conversation.professional 
                : conversation.client
              const unreadCount = currentUserId === conversation.client_id 
                ? conversation.unread_count_client 
                : conversation.unread_count_professional
              const isArchived = conversation.status === 'archived'

              return (
                <Card
                  key={conversation.id}
                  className={`cursor-pointer transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                    isArchived ? 'bg-gray-100' : 'bg-white'
                  } border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <UserAvatar
                          src={otherUser.avatar_url}
                          alt={otherUser.full_name}
                          fallback={otherUser.full_name.charAt(0).toUpperCase()}
                          size="lg"
                          className="w-12 h-12 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        />
                        {unreadCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] font-black text-xs min-w-5 h-5 flex items-center justify-center">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-black text-black text-sm truncate">
                            {otherUser.full_name}
                          </h4>
                          <div className="flex items-center gap-1">
                            {isArchived && (
                              <Archive className="h-3 w-3 text-gray-500" />
                            )}
                            <ConversationMenu
                              conversationId={conversation.id}
                              onDelete={onDeleteConversation || (() => {})}
                              onArchive={onArchiveConversation}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-blue-500 text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] font-black text-xs">
                            {otherUser.user_type}
                          </Badge>
                          {conversation.ad && (
                            <Badge className="bg-green-500 text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] font-black text-xs">
                              {conversation.ad.category}
                            </Badge>
                          )}
                        </div>

                        {conversation.last_message_preview && (
                          <p className="text-xs text-gray-600 font-bold truncate mb-1">
                            {conversation.last_message_preview}
                          </p>
                        )}

                        {conversation.last_message_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500 font-bold">
                              {new Date(conversation.last_message_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
