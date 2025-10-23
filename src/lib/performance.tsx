'use client'

import { useEffect } from 'react'
import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals'
import { logger } from '@/lib/logger'

// ===================================
// TIPOS
// ===================================

interface VitalMetric extends Metric {
  rating: 'good' | 'needs-improvement' | 'poor'
}

interface PerformanceConfig {
  enableWebVitals: boolean
  enableResourceTiming: boolean
  enableNavigationTiming: boolean
  enableErrorTracking: boolean
  reportToAnalytics: boolean
  debugMode: boolean
}

// ===================================
// CONFIGURAÇÃO PADRÃO
// ===================================

const DEFAULT_CONFIG: PerformanceConfig = {
  enableWebVitals: true,
  enableResourceTiming: true,
  enableNavigationTiming: true,
  enableErrorTracking: true,
  reportToAnalytics: process.env.NODE_ENV === 'production',
  debugMode: process.env.NODE_ENV === 'development'
}

// ===================================
// UTILITÁRIOS DE RATING
// ===================================

function getVitalRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    CLS: { good: 0.1, poor: 0.25 },
    INP: { good: 200, poor: 500 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 }
  }

  const threshold = thresholds[name as keyof typeof thresholds]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// ===================================
// FUNÇÃO PRINCIPAL DE TRACKING
// ===================================

function sendToAnalytics(metric: VitalMetric, config: PerformanceConfig) {
  // Log sempre em desenvolvimento
  if (config.debugMode) {
    logger.info(
      `Web Vital: ${metric.name}`, 
      'web-vital',
      { value: metric.value, rating: metric.rating, delta: metric.delta }
    )
  }

  // Enviar para analytics em produção
  if (config.reportToAnalytics) {
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        custom_map: { metric_rating: 'custom_parameter_1' },
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        metric_rating: metric.rating,
        metric_delta: metric.delta
      })
    }

    // PostHog
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('web_vital', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
        metric_delta: metric.delta,
        page_url: window.location.href
      })
    }

    // Plausible Analytics
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('Web Vital', {
        props: {
          metric: metric.name,
          value: metric.value,
          rating: metric.rating
        }
      })
    }

    // API própria para tracking customizado
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      })
    }).catch(error => {
      logger.error('performance-analytics', error, { metric: metric.name })
    })
  }
}

// ===================================
// TRACKING DE RECURSOS
// ===================================

function trackResourceTiming(config: PerformanceConfig) {
  if (!config.enableResourceTiming) return

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry: PerformanceEntry) => {
      if (entry.entryType === 'resource') {
        const resource = entry as PerformanceResourceTiming
        
        // Filtrar apenas recursos importantes
        const isImportant = 
          resource.name.includes('/api/') ||
          resource.name.includes('.js') ||
          resource.name.includes('.css') ||
          resource.name.includes('.woff') ||
          resource.initiatorType === 'img'

        if (isImportant) {
          const loadTime = resource.responseEnd - resource.requestStart
          
          logger.debug('performance', `Resource loaded: ${resource.name} (${loadTime}ms)`, {
            type: resource.initiatorType,
            size: resource.transferSize || 0,
            cached: resource.transferSize === 0,
            duration: loadTime
          })

          // Alertar sobre recursos lentos
          if (loadTime > 2000) {
            logger.warn('performance', `Slow resource detected: ${resource.name} (${loadTime}ms)`)
          }
        }
      }
    })
  })

  observer.observe({ entryTypes: ['resource'] })
}

// ===================================
// TRACKING DE NAVEGAÇÃO
// ===================================

function trackNavigationTiming(config: PerformanceConfig) {
  if (!config.enableNavigationTiming) return

  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    if (navigation) {
      const metrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        tls: navigation.secureConnectionStart > 0 ? navigation.connectEnd - navigation.secureConnectionStart : 0,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domParse: navigation.domContentLoadedEventEnd - navigation.responseEnd,
        domReady: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        windowLoad: navigation.loadEventEnd - navigation.fetchStart
      }

      logger.debug('performance', `Page load completed: ${metrics.windowLoad}ms`, {
        dns: metrics.dns,
        tcp: metrics.tcp,
        tls: metrics.tls,
        ttfb: metrics.ttfb,
        download: metrics.download,
        domParse: metrics.domParse,
        domReady: metrics.domReady,
        url: window.location.href
      })
    }
  })
}

// ===================================
// TRACKING DE ERROS
// ===================================

function trackErrorMetrics(config: PerformanceConfig) {
  if (!config.enableErrorTracking) return

  // Erros JavaScript
  window.addEventListener('error', (event) => {
    logger.error('js-error', new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      url: window.location.href
    })
  })

  // Promises rejeitadas
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('unhandled-promise', new Error(event.reason), {
      url: window.location.href,
      stack: event.reason?.stack
    })
  })

  // Erros de recursos
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      const target = event.target as HTMLElement
      logger.error('resource-error', new Error(`Failed to load: ${target.tagName}`), {
        tagName: target.tagName,
        src: (target as any).src || (target as any).href,
        url: window.location.href
      })
    }
  }, true)
}

// ===================================
// COMPONENTE PRINCIPAL
// ===================================

interface PerformanceMonitorProps {
  config?: Partial<PerformanceConfig>
}

export function PerformanceMonitor({ config: userConfig }: PerformanceMonitorProps) {
  const config = { ...DEFAULT_CONFIG, ...userConfig }

  useEffect(() => {
    // Web Vitals
    if (config.enableWebVitals) {
      const vitalsCallback = (metric: Metric) => {
        const vitalMetric: VitalMetric = {
          ...metric,
          rating: getVitalRating(metric.name, metric.value)
        }
        sendToAnalytics(vitalMetric, config)
      }

      onCLS(vitalsCallback)
      onINP(vitalsCallback)
      onFCP(vitalsCallback)
      onLCP(vitalsCallback)
      onTTFB(vitalsCallback)
    }

    // Resource Timing
    trackResourceTiming(config)

    // Navigation Timing
    trackNavigationTiming(config)

    // Error Tracking
    trackErrorMetrics(config)

    logger.info('performance-monitor', 'Performance monitoring initialized', { config })

  }, [config])

  return null // Componente invisível
}

// ===================================
// HOOK PARA MÉTRICAS CUSTOMIZADAS
// ===================================

export function usePerformanceMetrics() {
  const measureComponent = (name: string, fn: () => void | Promise<void>) => {
    const startTime = performance.now()
    
    const result = fn()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - startTime
        logger.info(`Render time: ${name}`, 'renderTime', { duration })
      })
    } else {
      const duration = performance.now() - startTime
      logger.info(`Render time: ${name}`, 'renderTime', { duration })
      return result
    }
  }

  const measureRender = (componentName: string) => {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      logger.info(`Render time: ${componentName}`, 'renderTime', { duration })
    }
  }

  const trackUserAction = (action: string, metadata?: Record<string, any>) => {
    logger.info(`User action: ${action}`, 'interaction', metadata)
  }

  return {
    measureComponent,
    measureRender,
    trackUserAction
  }
}

// ===================================
// UTILITÁRIOS DE PERFORMANCE
// ===================================

export const PerformanceUtils = {
  // Verificar suporte a recursos
  checkSupport: () => ({
    webVitals: 'requestIdleCallback' in window,
    observer: 'PerformanceObserver' in window,
    navigation: 'navigation' in performance,
    resource: 'getEntriesByType' in performance
  }),

  // Obter métricas atuais
  getCurrentMetrics: () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    return {
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.fetchStart,
      loadComplete: navigation?.loadEventEnd - navigation?.fetchStart,
      firstByte: navigation?.responseStart - navigation?.requestStart,
      memory: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      } : null
    }
  },

  // Limpar métricas antigas
  clearMetrics: () => {
    if ('clearResourceTimings' in performance) {
      performance.clearResourceTimings()
    }
  }
}

// ===================================
// TIPOS GLOBAIS
// ===================================

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    posthog?: {
      capture: (event: string, properties?: Record<string, any>) => void
    }
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void
  }
}
