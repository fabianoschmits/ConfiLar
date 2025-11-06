'use client'

import React, { useState, useEffect } from 'react';
import { ModernSidebar } from './ModernSidebar'
import { ModernHeader } from './ModernHeader'
// import { ModernBottomNavigation } from './ModernBottomNavigation' // COMENTADO PARA TESTAR NOVO MENU
import { QuickActionMenu } from '@/components/navigation/QuickActionMenu'
import { LoginPrompt } from './LoginPrompt';
import { ReferralTicker } from '@/components/referral/ReferralTicker'
import { useAuthContext } from '@/contexts/AuthContext'
import { useAutoRedirect } from '@/hooks/useAutoRedirect';
import { useProfileCheck } from '@/hooks/useProfileCheck';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/common/BrandLogo'

interface MainLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean; // Nova prop para indicar se a página requer autenticação
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, requireAuth = false }) => {
  const { user, profile } = useAuthContext();
  const pathname = usePathname();
  const isLoggedIn = user && profile;
  const [mounted, setMounted] = useState(false);
  
  // Hook para redirecionamento automático
  useAutoRedirect();
  
  // Hook para verificar se o perfil está completo
  const { isChecking: isCheckingProfile } = useProfileCheck();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Se ainda não montou, mostrar loading
  if (!mounted) {
    return null
  }
  
  return (
    <>
      {/* Sidebar sempre visível para navegação */}
      <ModernSidebar />
      
      {/* Header Moderno */}
      <ModernHeader />
      
      <main className={`min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200 lg:ml-48 pb-20 lg:pb-0 pt-12 sm:pt-16`}>
        {requireAuth && !isLoggedIn ? (
          // Mostrar prompt de login se a página requer autenticação
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4 max-w-md mx-auto p-6">
              <div className="h-10 flex items-center">
                <BrandLogo width={120} height={28} />
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
      
      {/* Ticker de Top Indicadores - aparece em todo o projeto - RODAPÉ DA PÁGINA */}
      {isLoggedIn && <ReferralTicker />}
      
      {/* Bottom Navigation para mobile - COMENTADO PARA TESTAR NOVO QUICK ACTION MENU */}
      {/* <ModernBottomNavigation /> */}
      
      {/* Quick Action Menu para mobile - NOVO MENU EM TESTE - FLUTUANTE ACIMA DO TICKER */}
      <QuickActionMenu />
    </>
  );
};
