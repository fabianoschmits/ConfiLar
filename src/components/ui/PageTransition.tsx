'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [targetPage, setTargetPage] = useState<string>('')

  useEffect(() => {
    // Interceptar cliques em links para mostrar loading
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
        const url = new URL(link.href)
        
        // Se for navegação interna
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          setTargetPage(url.pathname)
          setIsTransitioning(true)
          
          // Auto-hide após um tempo para evitar loading infinito
          setTimeout(() => {
            setIsTransitioning(false)
          }, 3000)
        }
      }
    }

    // Ouvir mudanças de rota
    const handleRouteChange = () => {
      setIsTransitioning(false)
    }

    document.addEventListener('click', handleLinkClick)
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleLinkClick)
    }
  }, [pathname])

  // Esconder loading quando a rota mudar
  useEffect(() => {
    setIsTransitioning(false)
  }, [pathname])

  const getPageName = (path: string) => {
    const routes: Record<string, string> = {
      '/home': 'Home',
      '/buscar': 'Buscar',
      '/classificados': 'Classificados',
      '/dashboard': 'Dashboard',
      '/perfil': 'Perfil',
      '/favoritos': 'Favoritos',
      '/feed': 'Feed',
      '/avaliacoes': 'Avaliações',
      '/editarperfil': 'Editar Perfil',
      '/portfolio': 'Portfólio',
      '/mensagens': 'Mensagens',
      '/ajuda': 'Ajuda',
      '/sobre': 'Sobre',
      '/auth': 'Login'
    }
    
    return routes[path] || 'Página'
  }

  return (
    <>
      {children}
      
      {/* Overlay de Transição Rápida */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[200] bg-white/70 backdrop-blur-lg flex items-center justify-center transition-all duration-200">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl px-8 py-6 flex items-center space-x-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-200">
            
            {/* Spinner minimalista */}
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">C</span>
              </div>
              <Loader2 className="absolute inset-0 w-8 h-8 text-blue-600/40 animate-spin" strokeWidth={1.5} />
            </div>
            
            {/* Texto da transição */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-700 font-medium">
                Abrindo {getPageName(targetPage)}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            
          </div>
        </div>
      )}
    </>
  )
}

// Hook para controlar loading manual
export function usePageTransition() {
  const [isLoading, setIsLoading] = useState(false)

  const showLoading = (message?: string) => {
    setIsLoading(true)
  }

  const hideLoading = () => {
    setIsLoading(false)
  }

  return {
    isLoading,
    showLoading,
    hideLoading,
    LoadingComponent: ({ message = 'Carregando...' }: { message?: string }) => (
      isLoading ? (
        <div className="fixed inset-0 z-[200] bg-white/60 backdrop-blur-md flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg px-6 py-4 flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-gray-700 font-medium">{message}</span>
          </div>
        </div>
      ) : null
    )
  }
}

// Componente para loading inline
export function InlineLoading({ 
  message = 'Carregando...',
  size = 'default'
}: { 
  message?: string
  size?: 'sm' | 'default' | 'lg'
}) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm'
      case 'lg':
        return 'px-6 py-4 text-lg'
      default:
        return 'px-4 py-3'
    }
  }

  const getSpinnerSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4'
      case 'lg':
        return 'w-6 h-6'
      default:
        return 'w-5 h-5'
    }
  }

  return (
    <div className={cn(
      "bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center space-x-3",
      getSizeClasses()
    )}>
      <Loader2 className={cn("text-blue-600 animate-spin", getSpinnerSize())} />
      <span className="text-gray-700 font-medium">{message}</span>
    </div>
  )
}

// Componente para loading de botão
export function ButtonLoading({ 
  isLoading,
  children,
  loadingText = 'Carregando...',
  className
}: {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
}) {
  return (
    <button 
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        isLoading && "cursor-not-allowed opacity-80",
        className
      )}
      disabled={isLoading}
    >
      <div className={cn(
        "flex items-center justify-center space-x-2 transition-all duration-200",
        isLoading ? "opacity-0" : "opacity-100"
      )}>
        {children}
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText}</span>
        </div>
      )}
    </button>
  )
}

