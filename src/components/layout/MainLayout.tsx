'use client'

import React from 'react';
import { Sidebar } from './Sidebar';
import { FloatingProfile } from './FloatingProfile';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { MobileQuickActions } from './MobileQuickActions';
import { MobileHeader } from './MobileHeader';
import { useAuthContext } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, profile, loading } = useAuthContext();
  const pathname = usePathname();
  const isLoggedIn = user && profile;
  
  // Debug em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('🏗️ MainLayout:', { hasUser: !!user, hasProfile: !!profile, loading });
  }
  
  return (
    <>
      {/* Sidebar apenas para desktop */}
      <Sidebar />
      
      <MobileHeader />
      <main className={`min-h-screen bg-gray-50 transition-colors duration-200 ${isLoggedIn ? 'lg:ml-16' : ''} pb-20 lg:pb-0 pt-16 lg:pt-0`}>
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
      <FloatingProfile />
      <MobileBottomNavigation />
      <MobileQuickActions />
    </>
  );
};
