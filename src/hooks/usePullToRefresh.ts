'use client'

import { useEffect, useRef, useState } from 'react'
import { soundManager } from '@/lib/soundManager'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number // Distância mínima para ativar o refresh (em pixels)
  maxDistance?: number // Distância máxima que pode puxar
  resistance?: number // Resistência do puxar (quanto maior, mais difícil puxar)
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxDistance = 150,
  resistance = 2.5
}: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  
  const startY = useRef<number>(0)
  const currentY = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let touchStartY = 0
    let scrollTop = 0

    const handleTouchStart = (e: TouchEvent) => {
      // Só iniciar o pull-to-refresh se estiver no topo da página
      scrollTop = window.scrollY || document.documentElement.scrollTop
      
      if (scrollTop === 0) {
        touchStartY = e.touches[0].clientY
        startY.current = touchStartY
        setIsPulling(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || isRefreshing || scrollTop > 0) return

      currentY.current = e.touches[0].clientY
      const distance = currentY.current - startY.current

      // Só permitir puxar para baixo
      if (distance > 0) {
        // Aplicar resistência
        const adjustedDistance = Math.min(distance / resistance, maxDistance)
        setPullDistance(adjustedDistance)

        // Prevenir scroll padrão se estiver puxando
        if (adjustedDistance > 10) {
          e.preventDefault()
        }
      }
    }

    const handleTouchEnd = async () => {
      if (!isPulling || isRefreshing) return

      setIsPulling(false)

      // Se puxou o suficiente, fazer o refresh
      if (pullDistance >= threshold) {
        setIsRefreshing(true)
        
        // Tocar som de atualização
        soundManager.play('/sounds/New/atualizar.mp3', { volume: 0.5 }).catch(err => {
          console.warn('⚠️ Erro ao tocar som de atualização:', err)
        })

        try {
          await onRefresh()
        } catch (error) {
          console.error('Erro ao atualizar:', error)
        } finally {
          setTimeout(() => {
            setIsRefreshing(false)
            setPullDistance(0)
          }, 500) // Animação de conclusão
        }
      } else {
        // Animação de cancelamento
        setPullDistance(0)
      }
    }

    // Adicionar event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    // Cleanup
    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isPulling, isRefreshing, pullDistance, threshold, maxDistance, resistance, onRefresh])

  // Pré-carregar som de atualização
  useEffect(() => {
    soundManager.preload('/sounds/New/atualizar.mp3').catch(err => {
      console.warn('⚠️ Erro ao pré-carregar som de atualização:', err)
    })
  }, [])

  return {
    containerRef,
    isPulling,
    isRefreshing,
    pullDistance,
    shouldRefresh: pullDistance >= threshold
  }
}

