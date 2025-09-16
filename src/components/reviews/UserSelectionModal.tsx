'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Search, Star, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useSupabaseReviews } from '@/hooks/useSupabaseReviews'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EligibleUser {
  id: string
  name: string
  avatar?: string
  userType: string
  agreementId: string
  contactsRevealedAt: string
}

interface UserSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectUser: (user: EligibleUser) => void
  reviewerId: string
}

export function UserSelectionModal({ 
  isOpen, 
  onClose, 
  onSelectUser, 
  reviewerId 
}: UserSelectionModalProps) {
  const [eligibleUsers, setEligibleUsers] = useState<EligibleUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<EligibleUser[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const { getEligibleUsersForReview } = useSupabaseReviews()

  useEffect(() => {
    if (isOpen && reviewerId) {
      loadEligibleUsers()
    }
  }, [isOpen, reviewerId])

  useEffect(() => {
    if (searchTerm) {
      const filtered = eligibleUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userType.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(eligibleUsers)
    }
  }, [searchTerm, eligibleUsers])

  const loadEligibleUsers = async () => {
    setLoading(true)
    try {
      const users = await getEligibleUsersForReview(reviewerId)
      setEligibleUsers(users)
      setFilteredUsers(users)
    } catch (error) {
      console.error('Erro ao carregar usuários elegíveis:', error)
      toast.error('Erro ao carregar usuários elegíveis')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectUser = (user: EligibleUser) => {
    onSelectUser(user)
    onClose()
  }

  const getTimeSinceAgreement = (contactsRevealedAt: string) => {
    try {
      return formatDistanceToNow(new Date(contactsRevealedAt), { 
        addSuffix: true, 
        locale: ptBR 
      })
    } catch {
      return 'Data não disponível'
    }
  }

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'professional':
        return 'bg-green-500 text-white'
      case 'client':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'professional':
        return 'PROFISSIONAL'
      case 'client':
        return 'CLIENTE'
      default:
        return 'USUÁRIO'
    }
  }

  const canUserReview = (contactsRevealedAt: string) => {
    const revealedDate = new Date(contactsRevealedAt)
    const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000)
    return revealedDate <= twentyHoursAgo
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-poetsen-one text-black uppercase tracking-wider">
            SELECIONAR USUÁRIO PARA AVALIAR
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações sobre o sistema */}
          <div className="bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-black mt-0.5" />
              <div>
                <h3 className="font-black text-black uppercase mb-2">
                  USUÁRIOS ELEGÍVEIS PARA AVALIAÇÃO
                </h3>
                <p className="text-sm text-black font-bold">
                  Você só pode avaliar usuários com quem teve um acordo aceito há pelo menos 1 dia.
                  Estes são os usuários que você conversou no chat e que têm acordos válidos.
                </p>
              </div>
            </div>
          </div>

          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
            <Input
              placeholder="BUSCAR USUÁRIO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-black placeholder:text-gray-500 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
            />
          </div>

          {/* Lista de usuários */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-4 border-black border-t-transparent"></div>
                <span className="font-black text-black">CARREGANDO USUÁRIOS...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-black mx-auto mb-4" />
              <h3 className="text-lg font-black text-black mb-2 uppercase">
                {searchTerm ? 'NENHUM USUÁRIO ENCONTRADO' : 'NENHUM USUÁRIO ELEGÍVEL'}
              </h3>
              <p className="text-black font-bold mb-4">
                {searchTerm 
                  ? 'Tente buscar com outros termos.'
                  : 'Você ainda não tem acordos aceitos há pelo menos 1 dia com outros usuários.'
                }
              </p>
              {!searchTerm && (
                <div className="bg-red-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 max-w-md mx-auto">
                  <p className="text-white font-bold text-sm">
                    Para poder avaliar outros usuários, você precisa:
                  </p>
                  <ul className="text-white font-bold text-sm mt-2 space-y-1">
                    <li>• Conversar com eles no chat</li>
                    <li>• Fazer um acordo de contato</li>
                    <li>• Aguardar 1 dia após o acordo ser aceito</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <UserAvatar
                        src={user.avatar}
                        alt={user.name}
                        fallback={user.name.charAt(0).toUpperCase()}
                        size="lg"
                        className="w-16 h-16 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      />
                      <div>
                        <h4 className="font-black text-black text-lg uppercase">
                          {user.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-black border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${getUserTypeColor(user.userType)}`}>
                            {getUserTypeLabel(user.userType)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="h-4 w-4 text-black" />
                          <span className="text-sm text-black font-bold">
                            Acordo aceito {getTimeSinceAgreement(user.contactsRevealedAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-black" />
                          <span className="text-sm text-black font-bold">
                            {canUserReview(user.contactsRevealedAt) ? '✅ Pode avaliar' : '⏳ Aguardando 20h'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <Button
                        className="bg-black text-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                      >
                        AVALIAR
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botão de fechar */}
          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-white text-black border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
            >
              FECHAR
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
