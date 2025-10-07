import { useEffect, useCallback, useRef } from 'react'

interface UseInfiniteScrollOptions {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  threshold?: number // Distância do final da página para triggerar o carregamento (em pixels)
}

export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  threshold = 200
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement | null>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      
      console.log('🔍 Intersection Observer:', {
        isIntersecting: target.isIntersecting,
        hasNextPage,
        isFetchingNextPage,
        shouldLoad: target.isIntersecting && hasNextPage && !isFetchingNextPage
      })
      
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        console.log('🔄 Carregando mais posts automaticamente...')
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  useEffect(() => {
    const element = loadingRef.current
    
    if (!element) return

    // Criar observer
    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null, // Usar viewport como root
      rootMargin: `${threshold}px`, // Triggerar quando estiver a X pixels do final
      threshold: 0.1
    })

    // Observar o elemento
    observerRef.current.observe(element)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleObserver, threshold])

  return { loadingRef }
}
