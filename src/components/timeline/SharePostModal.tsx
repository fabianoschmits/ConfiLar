'use client'

import { useState, useCallback } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { Search, Send, Loader2, X, Users, Link2, Check, Copy } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'

interface User {
  id: string
  full_name: string
  avatar_url?: string
  user_type: 'professional' | 'client'
}

interface SharePostModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
  postTitle: string
}

export function SharePostModal({ isOpen, onClose, postId, postTitle }: SharePostModalProps) {
  const { profile } = useAuthContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [message, setMessage] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'shared'>('idle')
  const [linkCopied, setLinkCopied] = useState(false)

  // Gerar URL do post
  const getPostUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/feed?post=${postId}`
    }
    return ''
  }

  // Copiar link para área de transferência
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getPostUrl())
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar link:', error)
      alert('Erro ao copiar link')
    }
  }

  // Compartilhar no WhatsApp
  const handleShareWhatsApp = () => {
    const url = getPostUrl()
    const text = `Confira este post: ${postTitle}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank')
  }

  // Compartilhar no Facebook Messenger
  const handleShareMessenger = () => {
    const url = getPostUrl()
    window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(url)}`, '_blank')
  }

  // Buscar usuários
  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setUsers([])
      return
    }

    setIsSearching(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, user_type')
        .ilike('full_name', `%${query}%`)
        .neq('id', profile?.id || '') // Não mostrar o próprio usuário
        .limit(10)

      if (error) {
        console.error('Erro ao buscar usuários:', error)
        setUsers([])
      } else {
        setUsers(data || [])
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      setUsers([])
    } finally {
      setIsSearching(false)
    }
  }, [profile?.id])

  // Adicionar usuário à lista de selecionados
  const toggleUserSelection = (user: User) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id))
    } else {
      setSelectedUsers([...selectedUsers, user])
    }
  }

  // Compartilhar post
  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      alert('Selecione pelo menos um usuário para compartilhar')
      return
    }

    if (!profile?.id || !profile?.full_name) {
      alert('Erro: Usuário não autenticado')
      return
    }

    setIsSharing(true)
    setShareStatus('sharing')
    try {
      console.log('📤 Compartilhando post:', { postId, userIds: selectedUsers.map(u => u.id) })

      const response = await fetch('/api/posts/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          userIds: selectedUsers.map(user => user.id),
          message: message || null,
          fromUserId: profile.id,
          fromUserName: profile.full_name
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Erro ao compartilhar:', data)
        alert(data.error || 'Erro ao compartilhar o post')
        setShareStatus('idle')
        return
      }

      console.log('✅ Post compartilhado:', data)
      
      // Mostrar "Enviado!" por 2 segundos antes de fechar
      setShareStatus('shared')
      setTimeout(() => {
        onClose()
        setSelectedUsers([])
        setMessage('')
        setSearchQuery('')
        setUsers([])
        setShareStatus('idle')
      }, 2000)
    } catch (error) {
      console.error('❌ Erro ao compartilhar:', error)
      alert('Erro ao compartilhar o post')
      setShareStatus('idle')
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compartilhar Post" size="md">
      <div className="space-y-4">
        {/* Informações do post */}
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
          <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">Post a compartilhar:</h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">{postTitle}</p>
        </div>

        {/* Buscar usuários */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Buscar usuários
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Digite o nome do usuário..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                searchUsers(e.target.value)
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de usuários encontrados */}
        {searchQuery && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-60 overflow-y-auto bg-white dark:bg-gray-900">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                <span className="text-sm">Buscando usuários...</span>
              </div>
            ) : users.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => toggleUserSelection(user)}
                    className={`w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedUsers.find(u => u.id === user.id) ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar_url} alt={user.full_name} />
                      <AvatarFallback>
                        {user.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm dark:text-white">{user.full_name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                      </div>
                    </div>
                    {selectedUsers.find(u => u.id === user.id) && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <span className="text-sm">Nenhum usuário encontrado</span>
              </div>
            )}
          </div>
        )}

        {/* Usuários selecionados */}
        {selectedUsers.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Selecionados ({selectedUsers.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-gray-700 dark:text-gray-200 text-sm"
                >
                  <span>{user.full_name}</span>
                  <button
                    onClick={() => toggleUserSelection(user)}
                    className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5 transition-colors"
                    title="Remover"
                  >
                    <X className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 hover:text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem opcional */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Mensagem (opcional)
          </label>
          <Textarea
            placeholder="Adicione uma mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-3">
          {/* Mensagem de status */}
          {shareStatus !== 'idle' && (
            <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg ${
              shareStatus === 'sharing' 
                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {shareStatus === 'sharing' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Compartilhando...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium">Post compartilhado com sucesso!</span>
                </>
              )}
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSharing}>
              Cancelar
            </Button>
            <Button
              onClick={handleShare}
              disabled={selectedUsers.length === 0 || isSharing}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSharing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Compartilhando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Compartilhar
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">ou compartilhe via link</span>
          </div>
        </div>

        {/* Compartilhar via Link */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 md:p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center">
            <Link2 className="h-4 w-4 mr-2 flex-shrink-0" />
            Compartilhar via Link
          </h4>
          
          {/* Copiar Link */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              value={getPostUrl()}
              readOnly
              className="flex-1 text-xs sm:text-sm bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-900 min-w-0"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="flex-shrink-0 w-full sm:w-auto"
            >
              {linkCopied ? (
                <>
                  <Check className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Copiado!</span>
                  <span className="sm:hidden">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Copiar</span>
                  <span className="sm:hidden">Copiar Link</span>
                </>
              )}
            </Button>
          </div>

          {/* Botões de Redes Sociais */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleShareWhatsApp}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white justify-center"
              size="sm"
            >
              <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span className="text-sm">WhatsApp</span>
            </Button>
            <Button
              onClick={handleShareMessenger}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white justify-center"
              size="sm"
            >
              <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
              </svg>
              <span className="text-sm">Messenger</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

