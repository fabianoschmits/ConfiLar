'use client'

import dynamic from 'next/dynamic'

// Dynamic imports para componentes pesados
export const FloatingChatWrapper = dynamic(() => import("@/components/chat/FloatingChatWrapper"), {
  ssr: false,
  loading: () => null
})

export const MetaMaskErrorSuppressor = dynamic(() => import("@/components/MetaMaskErrorSuppressor"), {
  ssr: false,
  loading: () => null
})
