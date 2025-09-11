'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Profile } from '@/types/database'
import { Session } from '@supabase/supabase-js'

// Re-exportar Profile para compatibilidade
export type { Profile }

export type SignUpFn = (
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
	}
) => Promise<{ error: { message: string } | null }>

export function useAuth(initialSession?: Session | null) {
	const [user, setUser] = useState<{ id: string; email: string } | null>(null)
	const [profile, setProfile] = useState<Profile | null>(null)
	const [session, setSession] = useState<{ user: { id: string; email: string } } | null>(null)
	const [loading, setLoading] = useState(true)
	const [initialized, setInitialized] = useState(false)
	const [profileLoading, setProfileLoading] = useState(false)

	const supabase = createClientComponentClient()

	// Perfil padrão reutilizável
	const createDefaultProfile = useCallback((userId: string, email: string): Profile => {
		return {
			id: userId,
			email: email,
			full_name: 'Usuário',
			user_type: 'client',
			phone: '',
			cpf_cnpj: '',
			birth_date: null,
			location_state: 'SP',
			location_city: 'São Paulo',
			neighborhood: '',
			address: '',
			bio: '',
			professional_services: [],
			professional_experience_years: 0,
			is_verified: false,
			badge: 'bronze',
			rating: 0,
			total_reviews: 0,
			is_available: true,
			profile_completed: false,
			profile_completion_score: 0,
			avatar_url: null,
			whatsapp: '',
			professional_certifications: [],
			professional_portfolio_url: null,
			profile_photo_url: null,
			selfie_document_url: null,
			residence_proof_url: null,
			client_verification_document: null,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		} as Profile
	}, [])

	// Buscar perfil do usuário com debounce
	const fetchUserProfile = useCallback(async (userId: string, email: string) => {
		// Evitar múltiplas chamadas simultâneas
		if (profileLoading) {
			console.log('⏳ Busca de perfil já em andamento, aguardando...')
			return profile
		}

		try {
			setProfileLoading(true)
			console.log('🔍 Buscando perfil do usuário:', userId)
			
			const { data, error } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', userId)
				.single()

			if (error) {
				console.log('⚠️ Perfil não encontrado, criando perfil padrão')
				const defaultProfile = createDefaultProfile(userId, email)
				setProfile(defaultProfile)
				return defaultProfile
			}

			console.log('✅ Perfil encontrado:', data.full_name)
			setProfile(data as Profile)
			return data as Profile
		} catch (error) {
			console.error('❌ Erro ao buscar perfil:', error)
			const defaultProfile = createDefaultProfile(userId, email)
			setProfile(defaultProfile)
			return defaultProfile
		} finally {
			setProfileLoading(false)
		}
	}, [supabase, createDefaultProfile, profileLoading])

	// Inicialização do sistema de autenticação
	useEffect(() => {
		if (initialized) return

		console.log('🔍 Inicializando sistema de autenticação...')
		
		// Timeout de segurança mais agressivo (5 segundos)
		const safetyTimeout = setTimeout(() => {
			if (loading) {
				console.log('⚠️ Timeout de segurança atingido - finalizando loading')
				setLoading(false)
				setInitialized(true)
			}
		}, 5000)

		// Timeout adicional para garantir que o loading seja finalizado
		const forceFinishTimeout = setTimeout(() => {
			console.log('🚨 Forçando finalização do loading após 8 segundos')
			setLoading(false)
			setInitialized(true)
		}, 8000)

		const initializeAuth = async () => {
			try {
				// Se temos sessão inicial do servidor, usar ela (mais rápido)
				if (initialSession?.user?.email) {
					console.log('✅ Usando sessão inicial do servidor:', initialSession.user.email)
					const userData = { id: initialSession.user.id, email: initialSession.user.email }
					setUser(userData)
					setSession({ user: userData })
					
					// Buscar perfil do usuário com timeout
					try {
						await Promise.race([
							fetchUserProfile(initialSession.user.id, initialSession.user.email),
							new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
						])
					} catch (profileError) {
						console.warn('⚠️ Timeout na busca do perfil, usando perfil padrão')
						const defaultProfile = createDefaultProfile(initialSession.user.id, initialSession.user.email)
						setProfile(defaultProfile)
					}
					
					setLoading(false)
					setInitialized(true)
					clearTimeout(safetyTimeout)
					clearTimeout(forceFinishTimeout)
					return
				}

				// Se não temos sessão inicial, verificar sessão atual
				console.log('🔍 Verificando sessão existente...')
				const { data: { session }, error } = await supabase.auth.getSession()
				
				if (error) {
					console.error('❌ Erro ao buscar sessão:', error)
					setLoading(false)
					setInitialized(true)
					clearTimeout(safetyTimeout)
					clearTimeout(forceFinishTimeout)
					return
				}

				if (session?.user?.email) {
					console.log('✅ Usuário encontrado na sessão:', session.user.email)
					
					// Definir usuário e sessão imediatamente
					const userData = { id: session.user.id, email: session.user.email }
					setUser(userData)
					setSession({ user: userData })
					
					// Buscar perfil com timeout
					try {
						await Promise.race([
							fetchUserProfile(session.user.id, session.user.email),
							new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
						])
					} catch (profileError) {
						console.warn('⚠️ Timeout na busca do perfil, usando perfil padrão')
						const defaultProfile = createDefaultProfile(session.user.id, session.user.email)
						setProfile(defaultProfile)
					}
				} else {
					console.log('❌ Nenhum usuário na sessão')
					setUser(null)
					setProfile(null)
					setSession(null)
				}
			} catch (error) {
				console.error('❌ Erro na inicialização:', error)
				setUser(null)
				setProfile(null)
				setSession(null)
			} finally {
				setLoading(false)
				setInitialized(true)
				clearTimeout(safetyTimeout)
				clearTimeout(forceFinishTimeout)
			}
		}

		initializeAuth()

		// Listener de mudanças de autenticação - OTIMIZADO
		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				console.log('🔄 Evento de auth:', event, session?.user?.email)
				
				// Evitar processamento desnecessário durante inicialização
				if (!initialized && event === 'INITIAL_SESSION') {
					return
				}

				// Evitar processamento duplicado
				if (event === 'SIGNED_IN' && user?.id === session?.user?.id) {
					console.log('⏭️ Usuário já logado, pulando processamento')
					return
				}

				if (session?.user?.email) {
					const userData = { id: session.user.id, email: session.user.email }
					setUser(userData)
					setSession({ user: userData })
					
					// Buscar perfil apenas se necessário e não estiver carregando
					if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && !profileLoading) {
						try {
							await Promise.race([
								fetchUserProfile(session.user.id, session.user.email),
								new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
							])
						} catch (profileError) {
							console.warn('⚠️ Timeout na busca do perfil durante auth change')
							const defaultProfile = createDefaultProfile(session.user.id, session.user.email)
							setProfile(defaultProfile)
						}
					}
				} else {
					console.log('❌ Usuário deslogado')
					setUser(null)
					setProfile(null)
					setSession(null)
				}
				
				setLoading(false)
			}
		)

		return () => {
			subscription.unsubscribe()
			clearTimeout(safetyTimeout)
			clearTimeout(forceFinishTimeout)
		}
	}, [initialized, supabase, initialSession])

	// Função de login OTIMIZADA
	const signIn = useCallback(async (email: string, password: string) => {
		console.log('🔐 Tentando login para:', email)
		
		try {
			setLoading(true)
			
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			})

			if (error) {
				console.error('❌ Erro no login:', error)
				setLoading(false)
				return { error }
			}

			if (data.user) {
				console.log('✅ Login bem-sucedido para:', data.user.email)
				
				// Definir usuário e sessão imediatamente
				const userData = { id: data.user.id, email: data.user.email }
				setUser(userData)
				setSession({ user: userData })
				
				// Buscar perfil com timeout mais agressivo
				try {
					await Promise.race([
						fetchUserProfile(data.user.id, data.user.email),
						new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
					])
				} catch (profileError) {
					console.warn('⚠️ Timeout na busca do perfil após login, usando perfil padrão')
					const defaultProfile = createDefaultProfile(data.user.id, data.user.email)
					setProfile(defaultProfile)
				}
				
				// Garantir que o loading seja finalizado
				setTimeout(() => {
					setLoading(false)
				}, 1000)
			}

			return { error: null }
		} catch (error) {
			console.error('💥 Erro crítico no login:', error)
			setLoading(false)
			return { 
				error: { 
					message: error instanceof Error ? error.message : 'Erro desconhecido' 
				} 
			}
		}
	}, [supabase, fetchUserProfile, createDefaultProfile])

	// Função de logout OTIMIZADA
	const signOut = useCallback(async () => {
		console.log('🚪 Executando logout...')
		
		try {
			setLoading(true)
			
			// Logout do Supabase
			const { error } = await supabase.auth.signOut()
			
			if (error) {
				console.error('❌ Erro no logout:', error)
				setLoading(false)
				return { error }
			}

			// Limpar estado local
			setUser(null)
			setProfile(null)
			setSession(null)
			
			// Limpeza básica de dados
			if (typeof window !== 'undefined') {
				// Limpar apenas dados específicos do app
				const keysToRemove = [
					'mockUser',
					'mockProfile',
					'user-preferences',
					'chat-history',
					'notification-preferences',
					'search-history'
				]
				
				keysToRemove.forEach(key => {
					localStorage.removeItem(key)
				})
				
				sessionStorage.clear()
			}
			
			console.log('✅ Logout bem-sucedido')
			setLoading(false)
			return { error: null }
		} catch (error) {
			console.error('💥 Erro crítico no logout:', error)
			setLoading(false)
			return { 
				error: { 
					message: error instanceof Error ? error.message : 'Erro desconhecido' 
				} 
			}
		}
	}, [supabase])

	// Função de cadastro (simplificada)
	const signUp: SignUpFn = useCallback(async (email, password, additionalData) => {
		console.log('📝 Tentando cadastro para:', email)
		
		try {
			setLoading(true)
			
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						full_name: additionalData?.full_name || 'Usuário',
						phone: additionalData?.phone || '',
						user_type: additionalData?.user_type || 'client'
					}
				}
			})

			if (error) {
				console.error('❌ Erro no cadastro:', error)
				setLoading(false)
				return { error }
			}

			if (data.user) {
				console.log('✅ Cadastro bem-sucedido para:', data.user.email)
				
				// Criar perfil básico
				const profileData = {
					id: data.user.id,
					email: data.user.email || email,
					full_name: additionalData?.full_name || 'Usuário',
					user_type: additionalData?.user_type || 'client',
					phone: additionalData?.phone || '',
					location_state: additionalData?.location_state || 'SP',
					location_city: additionalData?.location_city || 'São Paulo',
					professional_experience_years: additionalData?.experience_years ? parseInt(additionalData.experience_years) : 0,
					is_verified: false,
					badge: 'bronze' as const,
					rating: 0,
					total_reviews: 0,
					is_available: true,
					profile_completed: false,
					profile_completion_score: 0,
					avatar_url: null,
					whatsapp: additionalData?.phone || '',
					professional_certifications: [],
					professional_portfolio_url: null,
					profile_photo_url: null,
					selfie_document_url: null,
					residence_proof_url: null,
					client_verification_document: null
				}

				try {
					const { error: profileError } = await supabase
						.from('profiles')
						.insert([profileData])

					if (profileError) {
						console.error('❌ Erro ao criar perfil:', profileError)
						// Não falhar o cadastro por causa do perfil
					} else {
						console.log('✅ Perfil criado com sucesso')
					}
				} catch (profileError) {
					console.error('❌ Erro ao criar perfil:', profileError)
				}
			}

			setLoading(false)
			return { error: null }
		} catch (error) {
			console.error('💥 Erro crítico no cadastro:', error)
			setLoading(false)
			return { 
				error: { 
					message: error instanceof Error ? error.message : 'Erro desconhecido' 
				} 
			}
		}
	}, [supabase])

	// Função de atualização de perfil
	const updateProfile = useCallback(async (updates: Partial<Profile>) => {
		if (!user?.id) {
			return { data: null, error: { message: 'Usuário não autenticado' } }
		}

		try {
			const { data, error } = await supabase
				.from('profiles')
				.update(updates)
				.eq('id', user.id)
				.select()
				.single()

			if (error) {
				console.error('❌ Erro ao atualizar perfil:', error)
				return { data: null, error }
			}

			if (data) {
				setProfile(data as Profile)
				console.log('✅ Perfil atualizado com sucesso')
			}

			return { data: data as Profile, error: null }
		} catch (error) {
			console.error('💥 Erro crítico ao atualizar perfil:', error)
			return { 
				data: null, 
				error: { 
					message: error instanceof Error ? error.message : 'Erro desconhecido' 
				} 
			}
		}
	}, [supabase, user?.id])

	// Função de upload de avatar
	const uploadAvatar = useCallback(async (file: File) => {
		if (!user?.id) {
			return { data: null, error: { message: 'Usuário não autenticado' } }
		}

		try {
			const fileExt = file.name.split('.').pop()
			const fileName = `${user.id}-${Date.now()}.${fileExt}`
			const filePath = `avatars/${fileName}`

			const { error: uploadError } = await supabase.storage
				.from('avatars')
				.upload(filePath, file)

			if (uploadError) {
				console.error('❌ Erro no upload:', uploadError)
				return { data: null, error: uploadError }
			}

			const { data: { publicUrl } } = supabase.storage
				.from('avatars')
				.getPublicUrl(filePath)

			// Atualizar perfil com nova URL
			await updateProfile({ avatar_url: publicUrl })

			return { data: publicUrl, error: null }
		} catch (error) {
			console.error('💥 Erro crítico no upload:', error)
			return { 
				data: null, 
				error: { 
					message: error instanceof Error ? error.message : 'Erro desconhecido' 
				} 
			}
		}
	}, [supabase, user?.id, updateProfile])

	// Função para recuperação de senha
	const resetPassword = useCallback(async (email: string) => {
		console.log('🔐 Tentando enviar email de recuperação para:', email)
		
		try {
			setLoading(true)
			
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/nova-senha`
			})

			if (error) {
				console.error('❌ Erro ao enviar email de recuperação:', error)
				setLoading(false)
				return { error }
			}

			console.log('✅ Email de recuperação enviado com sucesso')
			setLoading(false)
			return { error: null }
		} catch (error) {
			console.error('💥 Erro crítico ao enviar email de recuperação:', error)
			setLoading(false)
			return { 
				error: { 
					message: error instanceof Error ? error.message : 'Erro desconhecido' 
				} 
			}
		}
	}, [supabase])

	// Função para atualizar senha
	const updatePassword = useCallback(async (newPassword: string) => {
		console.log('🔐 Tentando atualizar senha')
		
		try {
			setLoading(true)
			
			const { error } = await supabase.auth.updateUser({
				password: newPassword
			})

			if (error) {
				console.error('❌ Erro ao atualizar senha:', error)
				setLoading(false)
				return { error }
			}

			console.log('✅ Senha atualizada com sucesso')
			setLoading(false)
			return { error: null }
		} catch (error) {
			console.error('💥 Erro crítico ao atualizar senha:', error)
			setLoading(false)
			return { 
				error: { 
					message: error instanceof Error ? error.message : 'Erro desconhecido' 
				} 
			}
		}
	}, [supabase])

	return {
		user,
		profile,
		session,
		loading,
		signIn,
		signUp,
		signOut,
		updateProfile,
		uploadAvatar,
		resetPassword,
		updatePassword,
		isMockMode: false,
	}
}
