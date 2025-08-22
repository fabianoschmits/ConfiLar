'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth, Profile, SignUpFn } from '@/hooks/useAuth'

interface AuthContextType {
	user: { id: string; email: string } | null
	profile: Profile | null
	session: { user: { id: string; email: string } } | null
	loading: boolean
	signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>
	signUp: SignUpFn
	signOut: () => Promise<{ error: { message: string } | null }>
	updateProfile: (updates: Partial<Profile>) => Promise<{ data: Profile | null; error: { message: string } | null }>
	uploadAvatar: (file: File) => Promise<{ data: string | null; error: { message: string } | null }>
	isMockMode: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
	const auth = useAuth()

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
