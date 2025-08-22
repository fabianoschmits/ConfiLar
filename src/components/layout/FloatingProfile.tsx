'use client';

import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  Heart, 
  Calendar, 
  CreditCard, 
  Bell,
  HelpCircle,
  Phone,
  Building2,
  Search,
  Users,
  Star,
  Home,
  MessageCircle,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { NotificationBell } from '@/components/notifications/NotificationBell';

import Link from 'next/link';
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications'

export const FloatingProfile: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Agora o componente só é renderizado quando o usuário está logado
  const { profile, signOut, user } = useAuthContext();
  const { unreadCount } = useSupabaseNotifications();

  // Só renderiza se tiver usuário e perfil
  if (!user || !profile) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result.error) {
        console.error('Erro ao sair:', result.error);
        return;
      }
      
      // Fechar o menu expandido
      setIsExpanded(false);
      
      // Redirecionar para a página inicial
      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999]">
      <div className="relative">
        {/* Perfil Colapsado */}
        <div className="flex items-center gap-3">
          {/* Notificações */}
          <NotificationBell />
          
          {/* Avatar e Nome - Toda a área é clicável */}
          <div 
            className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2 cursor-pointer hover:shadow-xl transition-all duration-200"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <UserAvatar 
              src={profile?.avatar_url}
              alt={profile?.full_name || 'Usuário'}
              fallback={profile?.full_name?.charAt(0) || 'U'}
              size="md"
            />
            
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-24">
                {profile?.full_name || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {profile?.user_type === 'professional' ? 'Profissional' : 'Cliente'}
              </p>
            </div>
            
            <div className="p-1 h-6 w-6 flex items-center justify-center">
              {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
            </div>
          </div>
        </div>

        {/* Menu Expandido */}
        {isExpanded && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-y-auto z-[9999]">
            <div className="p-4 space-y-4">
              {/* Navegação Principal */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  Navegação Principal
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <Home className="h-4 w-4" />
                    <span>Início</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </div>
              </div>

              {/* Serviços */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  Serviços
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/buscar"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <Search className="h-4 w-4" />
                    <span>Buscar Profissionais</span>
                  </Link>
                  <Link
                    href="/classificados"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <Briefcase className="h-4 w-4" />
                    <span>Classificados</span>
                  </Link>
                  <Link
                    href="/feed"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <Users className="h-4 w-4" />
                    <span>Feed Social</span>
                  </Link>
                </div>
              </div>

              {/* Comunicação */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Comunicação
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/mensagens"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Mensagens</span>
                    {unreadCount > 0 && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                  <Link
                    href="/notificacoes"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <Bell className="h-4 w-4" />
                    <span>Notificações</span>
                    {unreadCount > 0 && (
                      <Badge className="ml-auto bg-blue-500 text-white text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                </div>
              </div>

              {/* Gestão */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Gestão
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/agendamentos"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Agendamentos</span>
                  </Link>
                  <Link
                    href="/agenda"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Agenda Profissional</span>
                  </Link>
                  <Link
                    href="/favoritos"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <Heart className="h-4 w-4" />
                    <span>Favoritos</span>
                  </Link>
                </div>
              </div>

              {/* Profissional */}
              {profile?.user_type === 'professional' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Profissional
                  </h3>
                  <div className="space-y-1">
                    <Link
                      href="/portfolio"
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                      onClick={() => setIsExpanded(false)}
                    >
                      <Briefcase className="h-4 w-4" />
                      <span>Meu Portfólio</span>
                    </Link>
                    <Link
                      href="/ganhos"
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                      onClick={() => setIsExpanded(false)}
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>Ganhos</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Perfil e Ações */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="space-y-1">
                  <Link
                    href={`/perfil/${profile?.id}`}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Ver Meu Perfil</span>
                  </Link>
                  <Link
                    href="/perfil"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setIsExpanded(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Editar Meu Perfil</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </button>
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
