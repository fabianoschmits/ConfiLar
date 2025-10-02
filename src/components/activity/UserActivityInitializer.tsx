'use client'

import { useUserActivity } from '@/hooks/useUserActivity'

/**
 * Componente para inicializar o sistema de atividade do usuário
 * Deve ser incluído no layout principal para funcionar corretamente
 */
export function UserActivityInitializer() {
  // Inicializar o hook de atividade do usuário
  useUserActivity()

  // Este componente não renderiza nada, apenas inicializa o sistema
  return null
}
