'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useRobustAuth } from '@/hooks/useRobustAuth'
import { Profile } from '@/types/database'
import { Session } from '@supabase/supabase-js'

type SignUpFn = (
	email: string,
	password: string,
	additionalData?: {
		full_name?: string
		phone?: string
		user_type?: 'client' | 'professional'
		cpf_cnpj?: string
		birth_date?: string
		location_state?: string
		location_city?: string
		neighborhood?: string
		bio?: string
		services_offered?: string[]
		experience_years?: string
		emergency_service?: boolean
		insurance_coverage?: boolean
		avatar_data?: {
			type: 'upload' | 'dicebear'
			file?: File
			url?: string
			preview: string
		} | null
	}
) => Promise<{ error: { message: string } | null }>

interface AuthContextType {
	user: { id: string; email: string } | null
	profile: Profile | null
	session: { user: { id: string; email: string } } | null
	loading: boolean
	isReady: boolean
	error: string | null
	signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>
	signUp: SignUpFn
	signOut: () => Promise<{ error: { message: string } | null }>
	updateProfile: (updates: Partial<Profile>) => Promise<{ data: Profile | null; error: { message: string } | null }>
	uploadAvatar: (file: File) => Promise<{ data: string | null; error: { message: string } | null }>
	refreshAuth: () => Promise<void>
	isMockMode: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
	children: ReactNode
	initialSession?: Session | null
}

export function AuthProvider({ children, initialSession }: AuthProviderProps) {
	const auth = useRobustAuth(initialSession)

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
