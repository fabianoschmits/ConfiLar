'use client'

/**
 * Hook para feedback háptico em dispositivos móveis
 * Suporta diferentes tipos de vibração para diferentes ações
 */
export function useHapticFeedback() {
  const vibrate = (pattern: number | number[] = 10) => {
    // Verificar se a API de vibração está disponível (mobile)
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern)
      } catch (error) {
        // Silenciosamente falhar se a vibração não for suportada
        console.debug('Vibração não suportada:', error)
      }
    }
  }

  return {
    // Feedback suave para ações de sucesso
    success: () => vibrate([10, 20, 10]),
    
    // Feedback médio para ações normais
    light: () => vibrate(10),
    
    // Feedback médio para ações importantes
    medium: () => vibrate(20),
    
    // Feedback forte para ações críticas
    heavy: () => vibrate([30, 20, 30]),
    
    // Feedback para erros
    error: () => vibrate([20, 10, 20, 10, 20]),
    
    // Feedback para seleção
    selection: () => vibrate(5),
    
    // Feedback customizado
    custom: (pattern: number | number[]) => vibrate(pattern)
  }
}

