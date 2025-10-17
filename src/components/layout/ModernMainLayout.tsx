'use client'

import React, { useState, useEffect } from 'react'
import { ModernSidebar } from './ModernSidebar'
import { ModernHeader } from './ModernHeader'
import { ModernBottomNavigation } from './ModernBottomNavigation'
import { LoginPrompt } from './LoginPrompt'
import { useAuthContext } from '@/contexts/AuthContext'
import { PageLoadingOverlay } from "@/components/ui/LoadingOverlay"
import { useAutoRedirect } from '@/hooks/useAutoRedirect'
import { usePathname } from 'next/navigation'

interface ModernMainLayoutProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export const ModernMainLayout: React.FC<ModernMainLayoutProps> = ({ 
  children, 
  requireAuth = false 
}) => {
  const { user, profile, loading, isReady, error } = useAuthContext()
  const pathname = usePathname()
  const isLoggedIn = user && profile
  const [mounted, setMounted] = useState(false)
  
  // Hook para redirecionamento automático
  useAutoRedirect()
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Debug em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('🏗️ ModernMainLayout:', { 
      hasUser: !!user, 
      hasProfile: !!profile, 
      loading, 
      isReady,
      error,
      requireAuth 
    })
  }
  
  return (
    <>
      {/* Sidebar sempre visível para navegação */}
      <ModernSidebar />
      
      {/* Header Moderno */}
      <ModernHeader />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 lg:ml-64 pb-20 lg:pb-0 pt-16">
        {loading || !isReady ? (
          <PageLoadingOverlay isLoading={true} message={loading ? 'Verificando autenticação...' : 'Preparando interface...'} />
        ) : requireAuth && !isLoggedIn ? (
          // Mostrar prompt de login se a página requer autenticação
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-6 max-w-md mx-auto p-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Acesso Restrito</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Esta página requer que você esteja logado para acessar o conteúdo.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (mounted) {
                      window.location.href = `/auth?redirect=${encodeURIComponent(pathname)}`
                    }
                  }}
                  className="w-full bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  Fazer Login
                </button>
                <button
                  onClick={() => {
                    if (mounted) {
                      window.location.href = `/auth?redirect=${encodeURIComponent(pathname)}`
                    }
                  }}
                  className="w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
      
      <ModernBottomNavigation />
      <LoginPrompt />
    </>
  )
}
