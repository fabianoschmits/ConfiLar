'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';

// Phosphor Icons Light
import {
  User as UserPhosphor,
  Gear,
  SignOut,
  CaretDown,
  CaretUp,
  ChatTeardrop,
  Heart as HeartPhosphor,
  Calendar as CalendarPhosphor,
  Bell as BellPhosphor,
  Question,
  Phone as PhonePhosphor,
  Briefcase as BriefcasePhosphor,
  TrendUp,
  Lightning,
  Eye as EyePhosphor,
  PencilSimple,
  Info as InfoPhosphor
} from '@phosphor-icons/react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useFloatingChat } from '@/contexts/FloatingChatContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { Card, CardContent } from '@/components/ui/card';

import Link from 'next/link';
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications'

export const FloatingProfile: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Agora o componente só é renderizado quando o usuário está logado
  const { profile, signOut, user } = useAuthContext();
  const { openChat } = useFloatingChat();
  const { unreadCount } = useSupabaseNotifications();

  // Só renderiza se tiver usuário e perfil
  if (!user || !profile) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      // Fechar o menu expandido
      setIsExpanded(false)
      
      // Redirecionar para a página de logout
      window.location.href = '/logout'
    } catch (error) {
      console.error('Erro ao sair:', error)
    }
  };

  // Dados mockados para demonstração
  const accountStats = {
    totalServices: profile?.user_type === 'professional' ? 45 : 12,
    completedServices: profile?.user_type === 'professional' ? 38 : 10,
    rating: 4.8,
    totalEarnings: profile?.user_type === 'professional' ? 15420.50 : 0,
    memberSince: profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024',
    verificationStatus: profile?.user_type === 'professional' ? 'verified' : 'basic',
    premiumStatus: false
  }

  const getVerificationBadge = () => {
    if (accountStats.verificationStatus === 'verified') {
      return <Badge className="bg-green-100 text-green-800 text-xs">✓ Verificado</Badge>
    }
    return <Badge variant="outline" className="text-xs">Básico</Badge>
  }

  const getPremiumBadge = () => {
    if (accountStats.premiumStatus) {
      return <Badge className="bg-yellow-100 text-yellow-800 text-xs">👑 Premium</Badge>
    }
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-[9999]">
      <div className="relative">
        {/* Perfil Colapsado */}
        <div className="flex items-center gap-3">
          {/* Notificações */}
            <NotificationDropdown />
          
          {/* Avatar e Nome - Toda a área é clicável */}
          <div 
            className="flex items-center gap-1.5 bg-white rounded-full shadow-md border border-gray-200 px-2 py-1.5 cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <UserAvatar 
              src={profile?.avatar_url}
              alt={profile?.full_name || 'Usuário'}
              fallback={profile?.full_name?.charAt(0) || 'U'}
              size="sm"
            />
            
            <div className="block">
              <p className="text-xs font-medium text-gray-900 truncate max-w-20">
                {profile?.full_name || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500">
                {profile?.user_type === 'professional' ? 'Profissional' : 'Cliente'}
              </p>
            </div>
            
            <div className="p-0.5 h-5 w-5 flex items-center justify-center">
              {isExpanded ? <CaretUp size={14} weight="light" className="text-gray-500" /> : <CaretDown size={14} weight="light" className="text-gray-500" />}
            </div>
          </div>
        </div>

        {/* Menu Expandido */}
        {isExpanded && (
          <div className="absolute top-full right-0 mt-2 w-72 sm:w-64 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[70vh] overflow-y-auto z-[9999]">
            <div className="p-4 space-y-4">
              {/* Header do Perfil */}
              <div className="text-center pb-4 border-b border-gray-100">
                <div className="flex justify-center mb-2">
                  <UserAvatar 
                    src={profile?.avatar_url}
                    alt={profile?.full_name || 'Usuário'}
                    fallback={profile?.full_name?.charAt(0) || 'U'}
                    size="md"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 text-base">
                  {profile?.full_name || 'Usuário'}
                </h3>
                <p className="text-xs text-gray-600 mb-2">
                  {profile?.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                </p>
                <div className="flex items-center justify-center gap-2">
                  {getVerificationBadge()}
                  {getPremiumBadge()}
                </div>
              </div>

              {/* Estatísticas Rápidas */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{accountStats.totalServices}</div>
                      <div className="text-xs text-gray-600">Serviços</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{accountStats.rating}</div>
                      <div className="text-xs text-gray-600">Avaliação</div>
                    </div>
                  </div>
                  {profile?.user_type === 'professional' && (
                    <div className="mt-2 pt-2 border-t border-blue-200 text-center">
                      <div className="text-sm font-bold text-green-600">
                        R$ {accountStats.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-600">Ganhos Totais</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ações Rápidas */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                  <Lightning size={14} weight="light" className="mr-1 text-yellow-500" />
                  Ações Rápidas
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      openChat()
                      setIsExpanded(false)
                    }}
                    className="flex flex-col items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors w-full"
                  >
                    <ChatTeardrop size={16} weight="light" className="text-blue-600 mb-1" />
                    <span className="text-xs font-medium">Mensagens</span>
                    {unreadCount > 0 && (
                      <Badge className="mt-1 bg-red-500 text-white text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </button>
                  <Link
                    href="/notificacoes"
                    className="flex flex-col items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <BellPhosphor size={16} weight="light" className="text-purple-600 mb-1" />
                    <span className="text-xs font-medium">Notificações</span>
                    {unreadCount > 0 && (
                      <Badge className="mt-1 bg-blue-500 text-white text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                  <Link
                    href="/favoritos"
                    className="flex flex-col items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <HeartPhosphor size={16} weight="light" className="text-red-600 mb-1" />
                    <span className="text-xs font-medium">Favoritos</span>
                  </Link>
                </div>
              </div>

              {/* Conta e Perfil */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                  <UserPhosphor size={14} weight="light" className="mr-1 text-blue-500" />
                  Minha Conta
                </h3>
                <div className="space-y-1">
                  <Link
                    href={`/perfil/${profile?.id}`}
                    className="flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <EyePhosphor size={14} weight="light" className="text-blue-600" />
                    <span>Ver Meu Perfil</span>
                  </Link>
                  <Link
                    href="/editarperfil"
                    className="flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <PencilSimple size={14} weight="light" className="text-green-600" />
                    <span>Editar Perfil</span>
                  </Link>
                  {profile?.user_type === 'professional' && (
                    <>
                      <Link
                        href="/portfolio"
                        className="flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setIsExpanded(false)}
                      >
                        <BriefcasePhosphor size={14} weight="light" className="text-purple-600" />
                        <span>Meu Portfólio</span>
                      </Link>
                      <Link
                        href="/_public/ganhos"
                        className="flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setIsExpanded(false)}
                      >
                        <TrendUp size={14} weight="light" className="text-green-600" />
                        <span>Meus Ganhos</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Configurações e Segurança */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                  <Gear size={14} weight="light" className="mr-1 text-gray-500" />
                  Configurações
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/ajuda"
                    className="flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <Question size={14} weight="light" className="text-blue-600" />
                    <span>Central de Ajuda</span>
                  </Link>
                  <Link
                    href="/_public/contato"
                    className="flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <PhonePhosphor size={14} weight="light" className="text-green-600" />
                    <span>Contato</span>
                  </Link>
                  <Link
                    href="/sobre"
                    className="flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <InfoPhosphor size={14} weight="light" className="text-purple-600" />
                    <span>Sobre a ConfiLar</span>
                  </Link>
                </div>
              </div>

              {/* Botão de Sair - Mais Destacado */}
              <div className="border-t border-gray-200 pt-3">
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors w-full"
                >
                  <SignOut size={14} weight="light" />
                  <span>Sair da Conta</span>
                </button>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>Membro desde {accountStats.memberSince}</span>
                  <span>v5.0</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overlay para fechar ao clicar fora - com z-index menor */}
        {isExpanded && (
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </div>
    </div>
  );
};
