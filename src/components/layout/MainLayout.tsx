'use client'

import React, { useState, useEffect } from 'react';
import { ModernSidebar } from './ModernSidebar'
import { ModernHeader } from './ModernHeader'
import { ModernBottomNavigation } from './ModernBottomNavigation'
import { LoginPrompt } from './LoginPrompt';
import { ReferralTicker } from '@/components/referral/ReferralTicker'
import { useAuthContext } from '@/contexts/AuthContext'
import { PageLoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useAutoRedirect } from '@/hooks/useAutoRedirect';
import { useProfileCheck } from '@/hooks/useProfileCheck';
import { usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean; // Nova prop para indicar se a página requer autenticação
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, requireAuth = false }) => {
  const { user, profile, loading, isReady, error } = useAuthContext();
  const pathname = usePathname();
  const isLoggedIn = user && profile;
  const isProfileLoading = user && !profile && !loading;
  const [mounted, setMounted] = useState(false);
  
  // Hook para redirecionamento automático
  useAutoRedirect();
  
  // Hook para verificar se o perfil está completo
  const { isChecking: isCheckingProfile } = useProfileCheck();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Debug em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('🏗️ MainLayout:', { 
      hasUser: !!user, 
      hasProfile: !!profile, 
      loading, 
      isReady,
      error,
      requireAuth,
      pathname,
      isLoggedIn,
      isProfileLoading,
      isCheckingProfile
    });
  }
  
  // Se ainda não montou, mostrar loading
  if (!mounted) {
    return <PageLoadingOverlay isLoading={true} message="Carregando..." />
  }
  
  return (
    <>
      {/* Sidebar sempre visível para navegação */}
      <ModernSidebar />
      
      {/* Header Moderno */}
      <ModernHeader />
      
      <main className={`min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200 lg:ml-48 pb-20 lg:pb-0 pt-12 sm:pt-16`}>
        {loading || !isReady || isCheckingProfile || isProfileLoading ? (
          <PageLoadingOverlay isLoading={true} message={loading ? 'Verificando autenticação...' : isCheckingProfile ? 'Verificando perfil...' : isProfileLoading ? 'Carregando perfil...' : 'Preparando interface...'} />
        ) : requireAuth && !isLoggedIn ? (
          // Mostrar prompt de login se a página requer autenticação
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4 max-w-md mx-auto p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto">
                <img 
                  src="/imagens/logo/confilarlogo5.png" 
                  alt="ConfiLar Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Acesso Restrito</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Esta página requer que você esteja logado para acessar o conteúdo.
                </p>
              </div>
              <div className="space-y-3">
                <LoginPrompt />
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
      
      {/* Bottom Navigation para mobile */}
      <ModernBottomNavigation />
      
      {/* Ticker de Top Indicadores - aparece em todo o projeto */}
      {isLoggedIn && <ReferralTicker />}
    </>
  );
};
