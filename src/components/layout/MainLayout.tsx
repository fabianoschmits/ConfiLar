'use client'

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { BrutalistHeader } from './BrutalistHeader';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { LoginPrompt } from './LoginPrompt';
import { useAuthContext } from '@/contexts/AuthContext'
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useAutoRedirect } from '@/hooks/useAutoRedirect';
import { usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean; // Nova prop para indicar se a página requer autenticação
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, requireAuth = false }) => {
  const { user, profile, loading, isReady, error } = useAuthContext();
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
    console.log('🏗️ MainLayout:', { 
      hasUser: !!user, 
      hasProfile: !!profile, 
      loading, 
      isReady,
      error,
      requireAuth 
    });
  }
  
  return (
    <>
      {/* Sidebar sempre visível para navegação */}
      <Sidebar />
      
      {/* Header Brutalista - substitui MobileHeader e FloatingProfile */}
      <BrutalistHeader />
      
      <main className={`min-h-screen bg-yellow-400 transition-colors duration-200 lg:ml-72 pb-20 lg:pb-0 pt-20`}>
        {loading || !isReady ? (
          <LoadingOverlay isLoading={true} message={loading ? 'Verificando autenticação...' : 'Preparando interface...'} />
        ) : requireAuth && !isLoggedIn ? (
          // Mostrar prompt de login se a página requer autenticação
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4 max-w-md mx-auto p-6">
              <div className="w-16 h-16 bg-black border-4 border-black flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-black">ACESSO RESTRITO</h2>
              <p className="text-black font-bold">
                Esta página requer que você esteja logado para acessar o conteúdo.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (mounted) {
                      window.location.href = `/auth?redirect=${encodeURIComponent(pathname)}`
                    }
                  }}
                  className="w-full bg-black text-yellow-400 px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                >
                  FAZER LOGIN
                </button>
                <button
                  onClick={() => {
                    if (mounted) {
                      window.location.href = `/auth?redirect=${encodeURIComponent(pathname)}`
                    }
                  }}
                  className="w-full bg-white text-black px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
                >
                  CRIAR CONTA
                </button>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
      <MobileBottomNavigation />
      <LoginPrompt />
    </>
  );
};
