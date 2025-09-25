'use client'

import { useFloatingChat } from '@/contexts/FloatingChatContextSimple'

/**
 * Hook personalizado para gerenciar a abertura do sistema de mensagens flutuante
 * Centraliza a lógica de abrir mensagens em qualquer lugar do projeto
 */
export function useOpenMessages() {
  const { openChat } = useFloatingChat()

  /**
   * Abre o sistema de mensagens flutuante (lista de conversas)
   * Funciona igual ao ícone de mensagens no header
   */
  const openMessagesList = () => {
    console.log('💬 Abrindo lista de mensagens (como ícone do header)...')
    openChat() // Sem parâmetros = abre lista de conversas
  }

  /**
   * Abre o sistema de mensagens flutuante com usuário específico
   * @param userId - ID do usuário para iniciar conversa
   * @param userName - Nome do usuário para exibir
   */
  const openMessages = (userId?: string, userName?: string) => {
    console.log('💬 Abrindo mensagens com usuário específico...', { userId, userName })
    openChat(userId, userName)
  }

  return {
    openMessages,
    openMessagesList
  }
}
