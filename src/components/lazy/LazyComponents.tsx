'use client'

import { lazy, Suspense, ComponentType, ReactNode } from 'react'
import { InlineLoading } from '@/components/ui/LoadingOverlay'
import { Logger } from '@/lib/logger'

// ===================================
// LAZY LOADING WRAPPER
// ===================================

interface LazyWrapperProps {
  fallback?: ReactNode
  name?: string
}

export function withLazyLoading<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: LazyWrapperProps = {}
) {
  const LazyComponent = lazy(() => {
    const startTime = Date.now()
    
    return importFn().then(module => {
      const duration = Date.now() - startTime
      Logger.performance.renderTime(options.name || 'LazyComponent', duration)
      return module
    }).catch(error => {
      Logger.error('lazy-loading', error, { 
        componentName: options.name 
      })
      throw error
    })
  })

  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={options.fallback || <InlineLoading message="Carregando componente..." />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// ===================================
// COMPONENTES LAZY PRÉ-CONFIGURADOS
// ===================================

// Dashboard (comentado até os componentes serem criados)
// export const LazyDashboardCharts = withLazyLoading(
//   () => import('@/components/dashboard/DashboardCharts'),
//   { 
//     name: 'DashboardCharts',
//     fallback: <InlineLoading message="Carregando gráficos..." />
//   }
// )

// Lazy components serão habilitados conforme necessário
// Todos comentados para evitar erros de imports

// Outros componentes comentados até serem verificados
// export const LazyFloatingChat = withLazyLoading(
//   () => import('@/components/chat/FloatingChat'),
//   { 
//     name: 'FloatingChat',
//     fallback: <InlineLoading message="Carregando conversa..." />
//   }
// )

// ===================================
// INTERSECTION OBSERVER PARA LAZY LOADING
// ===================================

interface LazyLoadOnScrollProps {
  children: ReactNode
  threshold?: number
  rootMargin?: string
  fallback?: ReactNode
  once?: boolean
}

export function LazyLoadOnScroll({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  fallback = <InlineLoading />,
  once = true
}: LazyLoadOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [ref, inView] = useInView({
    threshold,
    rootMargin,
    triggerOnce: once
  })

  useEffect(() => {
    if (inView && !isVisible) {
      setIsVisible(true)
      Logger.performance.renderTime('LazyLoadOnScroll', 0)
    }
  }, [inView, isVisible])

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  )
}

// ===================================
// HOOK PARA LAZY LOADING MANUAL
// ===================================

export function useLazyLoading() {
  const [loadedComponents, setLoadedComponents] = useState<Set<string>>(new Set())

  const loadComponent = useCallback((componentName: string) => {
    if (!loadedComponents.has(componentName)) {
      Logger.debug('lazy-loading', `Loading component: ${componentName}`)
      setLoadedComponents(prev => new Set(Array.from(prev).concat(componentName)))
    }
  }, [loadedComponents])

  const isLoaded = useCallback((componentName: string) => {
    return loadedComponents.has(componentName)
  }, [loadedComponents])

  return {
    loadComponent,
    isLoaded,
    loadedComponents: Array.from(loadedComponents)
  }
}

// ===================================
// COMPONENTE PARA LAZY LOADING DE IMAGENS
// ===================================

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
}

export function LazyImage({
  src,
  alt,
  className,
  placeholder = '/placeholder-image.png',
  onLoad,
  onError
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  useEffect(() => {
    if (inView && !isLoaded) {
      const img = new Image()
      
      img.onload = () => {
        setImageSrc(src)
        setIsLoaded(true)
        onLoad?.()
        Logger.performance.renderTime('LazyImage', 0)
      }
      
      img.onerror = () => {
        onError?.()
        Logger.error('lazy-loading', new Error('Failed to load image'), { src })
      }
      
      img.src = src
    }
  }, [inView, src, isLoaded, onLoad, onError])

  return (
    <div ref={ref}>
      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-70',
          className
        )}
      />
    </div>
  )
}

// ===================================
// UTILS
// ===================================

import { cn } from '@/lib/utils'
import { useInView } from 'react-intersection-observer'
import { useCallback, useEffect, useState } from 'react'

// Preload de componentes críticos
export function preloadCriticalComponents() {
  const criticalComponents = [
    () => import('@/components/chat/ChatWidget'),
    () => import('@/components/search/SearchResults'),
    () => import('@/components/notifications/NotificationBell')
  ]

  criticalComponents.forEach((importFn, index) => {
    // Preload com delay progressivo
    setTimeout(() => {
      importFn().then(() => {
        Logger.debug('preload', `Critical component ${index + 1} preloaded`)
      }).catch(error => {
        Logger.error('preload', error, { componentIndex: index })
      })
    }, index * 100)
  })
}

// Hook para detectar idle time e fazer preload
export function useIdlePreload() {
  useEffect(() => {
    let idleTimer: NodeJS.Timeout

    const resetIdleTimer = () => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        Logger.debug('idle-preload', 'User is idle, starting component preload')
        preloadCriticalComponents()
      }, 2000) // 2 segundos de idle
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true)
    })

    resetIdleTimer()

    return () => {
      clearTimeout(idleTimer)
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true)
      })
    }
  }, [])
}
