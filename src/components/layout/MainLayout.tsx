'use client'

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { FloatingProfile } from './FloatingProfile';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { MobileQuickActions } from './MobileQuickActions';
import { MobileHeader } from './MobileHeader';
import { LoginPrompt } from './LoginPrompt';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAutoRedirect } from '@/hooks/useAutoRedirect';
import { usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean; // Nova prop para indicar se a página requer autenticação
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, requireAuth = false }) => {
  const { user, profile, loading } = useAuthContext();
  const pathname = usePathname();
  const isLoggedIn = user && profile;
  const [mounted, setMounted] = useState(false);
  
  // Hook para redirecionamento automático
  useAutoRedirect();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Debug em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('🏗️ MainLayout:', { hasUser: !!user, hasProfile: !!profile, loading, requireAuth });
  }
  
  return (
    <>
      {/* Sidebar sempre visível para navegação */}
      <Sidebar />
      
      <MobileHeader />
      <main className={`min-h-screen bg-gray-50 transition-colors duration-200 lg:ml-16 pb-20 lg:pb-0 pt-16 lg:pt-0`}>
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          </div>
        ) : requireAuth && !isLoggedIn ? (
          // Mostrar prompt de login se a página requer autenticação
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4 max-w-md mx-auto p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Acesso Restrito</h2>
              <p className="text-gray-600">
                Esta página requer que você esteja logado para acessar o conteúdo.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (mounted) {
                      window.location.href = `/auth?redirect=${encodeURIComponent(pathname)}`
                    }
                  }}
                  className="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Fazer Login
                </button>
                <button
                  onClick={() => {
                    if (mounted) {
                      window.location.href = `/auth?redirect=${encodeURIComponent(pathname)}`
                    }
                  }}
                  className="w-full border border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/5 transition-colors"
                >
                  Criar Conta
                </button>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
      <FloatingProfile />
      <MobileBottomNavigation />
      <MobileQuickActions />
      <LoginPrompt />
    </>
  );
};
