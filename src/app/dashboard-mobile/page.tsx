'use client'

import React from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ChatTeardrop, 
  Bell, 
  Heart, 
  Calendar, 
  Eye, 
  PencilSimple, 
  Question, 
  Phone, 
  Info, 
  SignOut,
  Lightning
} from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'

export default function DashboardMobilePage() {
  const { user, profile, signOut } = useAuthContext()
  const { unreadCount } = useSupabaseNotifications()
  const router = useRouter()

  if (!user || !profile) {
    return null
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Erro ao sair:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white pb-40">
      {/* Header com informações do usuário */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 pt-12">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">
              {profile.full_name?.charAt(0) || 'U'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Olá, {profile.full_name?.split(' ')[0] || 'Usuário'}!
          </h1>
          <p className="text-gray-600">
            {profile.user_type === 'professional' ? 'Profissional' : 'Cliente'}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Card de Resumo */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">12</div>
                <div className="text-sm text-gray-600">Serviços</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">4.8</div>
                <div className="text-sm text-gray-600">Avaliação</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div>
          <div className="flex items-center mb-4">
            <Lightning size={20} weight="light" className="text-yellow-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Ações Rápidas</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Mensagens */}
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-white hover:bg-gray-50 border-gray-200"
              onClick={() => router.push('/mensagens')}
            >
              <div className="relative">
                <ChatTeardrop size={24} weight="light" className="text-blue-600" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">Mensagens</span>
            </Button>

            {/* Notificações */}
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-white hover:bg-gray-50 border-gray-200"
              onClick={() => router.push('/notificacoes')}
            >
              <div className="relative">
                <Bell size={24} weight="light" className="text-purple-600" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="default" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-blue-600"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">Notificações</span>
            </Button>

            {/* Favoritos */}
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-white hover:bg-gray-50 border-gray-200"
              onClick={() => router.push('/favoritos')}
            >
              <Heart size={24} weight="light" className="text-red-600" />
              <span className="text-sm font-medium text-gray-700">Favoritos</span>
            </Button>

            {/* Agendamentos */}
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-white hover:bg-gray-50 border-gray-200"
              onClick={() => router.push('/agendamentos')}
            >
              <div className="relative">
                <Calendar size={24} weight="light" className="text-green-600" />
                <span className="absolute -top-1 -right-1 text-xs font-bold text-green-600">12</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Agendamentos</span>
            </Button>
          </div>
        </div>

        {/* Minha Conta */}
        <div>
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-blue-600 text-sm">👤</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Minha Conta</h2>
          </div>
          
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-gray-700 hover:bg-gray-50"
              onClick={() => router.push('/perfil')}
            >
              <Eye size={20} weight="light" className="text-blue-600 mr-3" />
              Perfil
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-gray-700 hover:bg-gray-50"
              onClick={() => router.push('/editarperfil')}
            >
              <PencilSimple size={20} weight="light" className="text-green-600 mr-3" />
              Editar Perfil
            </Button>
          </div>
        </div>

        {/* Configurações */}
        <div>
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-gray-600 text-sm">⚙️</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Configurações</h2>
          </div>
          
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-gray-700 hover:bg-gray-50"
              onClick={() => router.push('/ajuda')}
            >
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Question size={16} weight="light" className="text-blue-600" />
              </div>
              Central de Ajuda
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-gray-700 hover:bg-gray-50"
              onClick={() => router.push('/contato')}
            >
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <Phone size={16} weight="light" className="text-green-600" />
              </div>
              Contato
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-gray-700 hover:bg-gray-50"
              onClick={() => router.push('/sobre')}
            >
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <Info size={16} weight="light" className="text-purple-600" />
              </div>
              Sobre a ConfiLar
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
            <span>Membro desde 2025</span>
            <span>v5.0</span>
          </div>
          
          <Button
            variant="ghost"
            className="w-full justify-start h-12 text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <SignOut size={16} weight="light" className="text-red-600" />
            </div>
            Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  )
}
