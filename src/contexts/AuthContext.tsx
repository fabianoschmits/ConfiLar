'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth, AuthState, AuthActions } from '@/hooks/useUnifiedAuth'
import { Profile } from '@/types/database'
import { Session } from '@supabase/supabase-js'

// Usar os tipos do hook unificado
type AuthContextType = AuthState & AuthActions

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
	children: ReactNode
	initialSession?: Session | null
}

export function AuthProvider({ children, initialSession }: AuthProviderProps) {
  const auth = useAuth(initialSession)

	return (
		<AuthContext.Provider value={auth}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuthContext() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuthContext deve ser usado dentro de um AuthProvider')
	}
	return context
}

// Re-exportar tipos para compatibilidade
export type { Profile } from '@/types/database'
