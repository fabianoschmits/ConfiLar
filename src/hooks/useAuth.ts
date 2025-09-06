import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

// Usar o tipo do database como base
export type Profile = Database['public']['Tables']['profiles']['Row'] & {
	// Campos adicionais específicos do hook se necessário
	profile_completion_score?: number
	professional_services?: string[]
	last_profile_update?: string
	profile_photo_url?: string | null
	selfie_document_url?: string | null
	residence_proof_url?: string | null
	client_verification_document?: string | null
	emergency_service?: boolean
	insurance_coverage?: boolean
	created_at?: string
	updated_at?: string
	weeklyAvailability?: {
		monday: { morning: boolean; afternoon: boolean; evening: boolean }
		tuesday: { morning: boolean; afternoon: boolean; evening: boolean }
		wednesday: { morning: boolean; afternoon: boolean; evening: boolean }
		thursday: { morning: boolean; afternoon: boolean; evening: boolean }
		friday: { morning: boolean; afternoon: boolean; evening: boolean }
		saturday: { morning: boolean; afternoon: boolean; evening: boolean }
		sunday: { morning: boolean; afternoon: boolean; evening: boolean }
	}
}

// Gerador simples de IDs únicos para modo mock
const generateUniqueId = (): string => {
	return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

// Tipos de assinatura para signUp
export type SignUpFn = (
	email: string, 
	password: string, 
	additionalData?: {
		full_name?: string
		user_type?: 'client' | 'professional'
		phone?: string
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

export function useAuth() {
	const [user, setUser] = useState<{ id: string; email: string } | null>(null)
	const [profile, setProfile] = useState<Profile | null>(null)
	const [session, setSession] = useState<{ user: { id: string; email: string } } | null>(null)
	const [loading, setLoading] = useState(true)

	// Modo real com Supabase
	const isMockMode = false

	useEffect(() => {
		console.log('🔍 useAuth useEffect iniciado', { isMockMode })
		
		// Timeout de segurança para evitar loading infinito
		const safetyTimeout = setTimeout(() => {
			if (loading) {
				console.log('⚠️ Loading há mais de 15 segundos - possível problema de sessão')
				setLoading(false)
			}
		}, 15000)
		
		if (isMockMode) {
			// Modo mock para desenvolvimento
			console.log('🧪 Modo mock ativado')
			// Verificar se há usuário salvo no localStorage
			const savedUser = localStorage.getItem('mockUser')
			const savedProfile = localStorage.getItem('mockProfile')

			if (savedUser && savedProfile) {
				const parsedUser = JSON.parse(savedUser)
				const parsedProfile = JSON.parse(savedProfile)
				
				// Garantir que o email existe
				if (parsedUser.email) {
					setUser({ id: parsedUser.id, email: parsedUser.email })
					setProfile(parsedProfile)
					setSession({
						user: { id: parsedUser.id, email: parsedUser.email }
					})
				}
			}

			setLoading(false)
			clearTimeout(safetyTimeout)
			return
		}

		// Buscar sessão inicial com timeout
		const fetchSession = async () => {
			console.log('🔄 Buscando sessão inicial...')
			try {
				// Timeout de 10 segundos para a busca de sessão
				const sessionPromise = supabase.auth.getSession()
				const timeoutPromise = new Promise((_, reject) => 
					setTimeout(() => reject(new Error('Timeout na busca de sessão')), 10000)
				)
				
				const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any
				console.log('📋 Sessão obtida:', !!session?.user)
				
				if (session?.user?.email) {
					console.log('✅ Usuário encontrado na sessão:', session.user.email)
					setSession({ user: { id: session.user.id, email: session.user.email } })
					setUser({ id: session.user.id, email: session.user.email })
					
					// Buscar perfil de forma simplificada com timeout
					console.log('🔍 Buscando perfil do usuário...')
					try {
						const profilePromise = supabase
							.from('profiles')
							.select('*')
							.eq('id', session.user.id)
							.single()
						
						const profileTimeoutPromise = new Promise((_, reject) => 
							setTimeout(() => reject(new Error('Timeout na busca do perfil')), 8000)
						)
						
						const { data, error } = await Promise.race([profilePromise, profileTimeoutPromise]) as any
						
						console.log('📊 Resultado da busca do perfil:', { data: !!data, error: !!error })
						
						if (error) {
							console.error('❌ Erro ao buscar perfil:', error)
							// Se houver erro 406 (Not Acceptable), criar perfil padrão
							if (error.code === '406' || error.message?.includes('406')) {
								console.log('⚠️ Erro 406 detectado, criando perfil padrão')
							}
						}
						
						if (data) {
							setProfile(data as Profile)
						} else {
							console.log('⚠️ Perfil não encontrado, criando perfil padrão')
							// Criar perfil padrão completo
							const defaultProfile: Profile = {
								id: session.user.id,
								email: session.user.email,
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
							setProfile(defaultProfile)
						}
					} catch (profileError) {
						console.error('Erro ao buscar perfil:', profileError)
						// Criar perfil padrão completo em caso de erro
						const defaultProfile: Profile = {
							id: session.user.id,
							email: session.user.email,
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
						setProfile(defaultProfile)
					}
				} else {
					console.log('❌ Nenhum usuário na sessão')
					setSession(null)
					setUser(null)
					setProfile(null)
				}
			} catch (sessionError) {
				console.error('Erro ao buscar sessão:', sessionError)
				setSession(null)
				setUser(null)
				setProfile(null)
			}
			
			console.log('✅ FetchSession finalizada, definindo loading = false')
			setLoading(false)
			clearTimeout(safetyTimeout)
		}

		fetchSession()

		// Escutar mudanças de autenticação
		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				if (session?.user?.email) {
					setSession({ user: { id: session.user.id, email: session.user.email } })
					setUser({ id: session.user.id, email: session.user.email })
					
					// Buscar perfil apenas quando a autenticação mudar
					try {
						const { data, error } = await supabase
							.from('profiles')
							.select('*')
							.eq('id', session.user.id)
							.single()

						if (!error && data) {
							setProfile(data as Profile)
						} else {
							// Criar perfil padrão completo se não existir
							const defaultProfile: Profile = {
								id: session.user.id,
								email: session.user.email,
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
							setProfile(defaultProfile)
						}
					} catch (error) {
						console.error('Erro ao buscar perfil na mudança de auth:', error)
						// Criar perfil padrão completo em caso de erro
						const defaultProfile: Profile = {
							id: session.user.id,
							email: session.user.email,
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
						setProfile(defaultProfile)
					}
				} else {
					console.log('❌ Usuário não autenticado')
					setSession(null)
					setUser(null)
					setProfile(null)
				}
				
				console.log('✅ Loading finalizado')
				setLoading(false)
			}
		)

		return () => subscription.unsubscribe()
	}, [isMockMode])

	// Função para testar conectividade com o Supabase
	const testSupabaseConnection = async () => {
		console.log('🧪 Testando conectividade com o Supabase...')
		
		try {
			// Teste 1: Verificar se o cliente está configurado
			console.log('📋 Cliente Supabase configurado:', !!supabase)
			
			// Teste 2: Tentar uma consulta simples
			console.log('📡 Testando consulta simples...')
			const { data, error } = await supabase
				.from('profiles')
				.select('count')
				.limit(1)
			
			console.log('📊 Resultado do teste:', { data, error })
			
			if (error) {
				console.error('❌ Erro no teste de conectividade:', error)
				return false
			}
			
			console.log('✅ Conectividade com Supabase funcionando!')
			return true
		} catch (error) {
			console.error('💥 Erro crítico no teste de conectividade:', error)
			return false
		}
	}

	// Função de login
	const signIn = async (email: string, password: string) => {
		console.log('🔐 Tentando login para:', email)
		
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			})

			if (error) {
				console.error('❌ Erro no login:', error)
				return { error }
			}

			if (data.user) {
				console.log('✅ Login bem-sucedido para:', data.user.email)
				setUser({ id: data.user.id, email: data.user.email || 'usuario@email.com' })
				setSession({ user: { id: data.user.id, email: data.user.email || 'usuario@email.com' } })
				
				// Buscar perfil após login
				try {
					const { data: profileData, error: profileError } = await supabase
						.from('profiles')
						.select('*')
						.eq('id', data.user.id)
						.single()

					if (!profileError && profileData) {
						setProfile(profileData as Profile)
					} else {
						// Criar perfil padrão se não existir
						const defaultProfile: Profile = {
							id: data.user.id,
							email: data.user.email || 'usuario@email.com',
							full_name: 'Usuário',
							user_type: 'client'
						} as Profile
						setProfile(defaultProfile)
					}
				} catch (profileError) {
					console.error('Erro ao buscar perfil após login:', profileError)
					// Criar perfil padrão em caso de erro
					const defaultProfile: Profile = {
						id: data.user.id,
						email: data.user.email || 'usuario@email.com',
						full_name: 'Usuário',
						user_type: 'client'
					} as Profile
					setProfile(defaultProfile)
				}
			}

			return { error: null }
		} catch (error) {
			console.error('💥 Erro crítico no login:', error)
			return { 
				error: { 
					message: error instanceof Error ? error.message : 'Erro desconhecido' 
				} 
			}
		}
	}

	// Função de cadastro
	const signUp: SignUpFn = async (email: string, password: string, additionalData?: {
		full_name?: string
		user_type?: 'client' | 'professional'
		phone?: string
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
	}) => {
		console.log('📝 Tentando cadastro para:', email)
		
		if (isMockMode) {
			// Modo mock para desenvolvimento
			const mockUser = {
				id: generateUniqueId(),
				email,
				full_name: additionalData?.full_name || 'Usuário Mock',
				user_type: additionalData?.user_type || 'client'
			}

			const mockProfile = {
				...mockUser,
				phone: additionalData?.phone || '',
				cpf_cnpj: additionalData?.cpf_cnpj || '',
				birth_date: additionalData?.birth_date || null,
				location_state: additionalData?.location_state || 'SP',
				location_city: additionalData?.location_city || 'São Paulo',
				neighborhood: additionalData?.neighborhood || '',
				address: '',
				bio: additionalData?.bio || '',
				professional_services: additionalData?.services_offered || [],
				professional_experience_years: additionalData?.experience_years ? parseInt(additionalData.experience_years) : 0,
				is_verified: false,
				badge: 'bronze',
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
				// REMOVIDO: emergency_service, insurance_coverage (não existem na tabela)
				// REMOVIDO: created_at, updated_at (têm padrão now())
			}

			// Salvar no localStorage
			localStorage.setItem('mockUser', JSON.stringify(mockUser))
			localStorage.setItem('mockProfile', JSON.stringify(mockProfile))

			// Atualizar estado
			setUser({ id: mockUser.id, email: mockUser.email })
			setProfile(mockProfile as unknown as Profile)
			setSession({ user: { id: mockUser.id, email: mockUser.email } })

			console.log('✅ Cadastro mock bem-sucedido')
			return { error: null }
		}

		try {
			// Cadastro real com Supabase
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						full_name: additionalData?.full_name || 'Usuário',
						user_type: additionalData?.user_type || 'client'
					}
				}
			})

			if (error) {
				console.error('❌ Erro no cadastro:', error)
				return { error }
			}

			if (data.user) {
				console.log('✅ Cadastro bem-sucedido para:', data.user.email)
				
				// Criar perfil no banco com dados padrão mais completos
				const profileData = {
					id: data.user.id,
					email: data.user.email || '',
					full_name: additionalData?.full_name || 'Usuário',
					user_type: additionalData?.user_type || 'client',
					phone: additionalData?.phone || '',
					cpf_cnpj: additionalData?.cpf_cnpj || '',
					birth_date: additionalData?.birth_date || null,
					location_state: additionalData?.location_state || 'SP', // Padrão SP
					location_city: additionalData?.location_city || 'São Paulo', // Padrão São Paulo
					neighborhood: additionalData?.neighborhood || '',
					address: '',
					bio: additionalData?.bio || '',
					professional_services: additionalData?.services_offered || [],
					professional_experience_years: additionalData?.experience_years ? parseInt(additionalData.experience_years) : 0,
					// Campos obrigatórios com valores padrão
					is_verified: false,
					badge: 'bronze' as const,
					rating: 0,
					total_reviews: 0,
					is_available: true,
					profile_completed: false,
					profile_completion_score: 0, // Score inicial
					avatar_url: null,
					whatsapp: additionalData?.phone || '', // Usar telefone como WhatsApp padrão
					professional_certifications: [],
					professional_portfolio_url: null,
					profile_photo_url: null,
					selfie_document_url: null,
					residence_proof_url: null,
					client_verification_document: null
					// REMOVIDO: created_at, updated_at (têm padrão now())
					// REMOVIDO: emergency_service e insurance_coverage (não existem na tabela)
				}

				try {
					console.log('🔄 Criando perfil no banco...', profileData)
					
					// Log detalhado dos campos sendo enviados
					console.log('📋 Campos do perfil:', Object.keys(profileData))
					console.log('📊 Valores do perfil:', profileData)
					
					const { error: profileError } = await supabase
						.from('profiles')
						.insert([profileData])

					if (profileError) {
						console.error('❌ Erro ao criar perfil:', profileError)
						console.error('❌ Código do erro:', profileError.code)
						console.error('❌ Mensagem do erro:', profileError.message)
						console.error('❌ Detalhes do erro:', profileError.details)
						
						// Se for erro de duplicata, tentar atualizar
						if (profileError.code === '23505') {
							console.log('🔄 Perfil já existe, tentando atualizar...')
							const { error: updateError } = await supabase
								.from('profiles')
								.update(profileData)
								.eq('id', data.user.id)
							
							if (updateError) {
								console.error('❌ Erro ao atualizar perfil:', updateError)
								return { error: { message: `Erro ao criar perfil: ${updateError.message}` } }
							} else {
								console.log('✅ Perfil atualizado com sucesso')
							}
						} else {
							return { error: { message: `Erro ao criar perfil: ${profileError.message}` } }
						}
					} else {
						console.log('✅ Perfil criado com sucesso')
					}
				} catch (profileError) {
					console.error('❌ Erro crítico ao criar perfil:', profileError)
					return { error: { message: `Erro crítico ao criar perfil: ${profileError instanceof Error ? profileError.message : 'Erro desconhecido'}` } }
				}

				// Atualizar estado local
				setUser({ id: data.user.id, email: data.user.email || '' })
				setProfile(profileData as unknown as Profile)
				setSession({ user: { id: data.user.id, email: data.user.email || '' } })
			}

			return { error: null }
		} catch (error) {
			console.error('💥 Erro crítico no cadastro:', error)
			return { 
				error: { 
					message: error instanceof Error ? error.message : 'Erro desconhecido' 
				} 
			}
		}
	}

	// Função de logout
	const signOut = async () => {
		console.log('🚪 Tentando logout...')
		
		try {
			// Executar logout do Supabase primeiro
			if (!isMockMode) {
				const { error } = await supabase.auth.signOut()
				
				if (error) {
					console.error('❌ Erro no logout:', error)
					return { error }
				}
			}

			// Limpar estado local
			setUser(null)
			setProfile(null)
			setSession(null)
			
			// Limpeza completa de dados persistentes
			await clearAllUserData()
			
			console.log('✅ Logout bem-sucedido')
			return { error: null }
		} catch (error) {
			console.error('💥 Erro crítico no logout:', error)
			return { 
				error: { 
					message: error instanceof Error ? error.message : 'Erro desconhecido' 
				} 
			}
		}
	}

	// Função para limpeza completa de dados do usuário
	const clearAllUserData = async () => {
		console.log('🧹 Iniciando limpeza completa de dados...')
		
		try {
			// 1. Limpar localStorage
			if (typeof window !== 'undefined') {
				// Limpar dados específicos do app
				const keysToRemove = [
					'mockUser',
					'mockProfile',
					'supabase.auth.token',
					'auth-token',
					'user-session',
					'user-profile',
					'user-preferences',
					'chat-history',
					'notification-preferences',
					'search-history',
					'recent-searches'
				]
				
				keysToRemove.forEach(key => {
					localStorage.removeItem(key)
				})
				
				// Limpar todos os dados do localStorage (opcional - mais agressivo)
				// localStorage.clear()
				
				// 2. Limpar sessionStorage
				sessionStorage.clear()
				
				// 3. Limpar cache do Service Worker
				if ('caches' in window) {
					const cacheNames = await caches.keys()
					await Promise.all(
						cacheNames.map(cacheName => {
							console.log('🗑️ Removendo cache:', cacheName)
							return caches.delete(cacheName)
						})
					)
				}
				
				// 4. Desregistrar Service Workers
				if ('serviceWorker' in navigator) {
					const registrations = await navigator.serviceWorker.getRegistrations()
					await Promise.all(
						registrations.map(registration => {
							console.log('🗑️ Desregistrando Service Worker:', registration.scope)
							return registration.unregister()
						})
					)
				}
				
				// 5. Limpar IndexedDB (se existir)
				if ('indexedDB' in window) {
					try {
						const databases = await indexedDB.databases()
						await Promise.all(
							databases.map(db => {
								console.log('🗑️ Removendo database:', db.name)
								return new Promise((resolve, reject) => {
									const deleteReq = indexedDB.deleteDatabase(db.name)
									deleteReq.onsuccess = () => resolve(true)
									deleteReq.onerror = () => reject(deleteReq.error)
								})
							})
						)
					} catch (error) {
						console.warn('⚠️ Erro ao limpar IndexedDB:', error)
					}
				}
				
				console.log('✅ Limpeza completa de dados concluída')
			}
		} catch (error) {
			console.error('❌ Erro durante limpeza de dados:', error)
		}
	}

	// Função para atualizar perfil
	const updateProfile = async (updates: Partial<Profile>) => {
		console.log('🔄 Tentando atualizar perfil...')
		console.log('🔍 Dados recebidos para atualização:', JSON.stringify(updates, null, 2))
		console.log('👤 Usuário atual:', user)
		console.log('📊 Perfil atual:', profile)
		
		if (!user || !profile) {
			console.error('❌ Usuário ou perfil não encontrado')
			return { 
				data: null, 
				error: { message: 'Usuário não autenticado' } 
			}
		}



		if (isMockMode) {
			// Modo mock: atualizar localStorage
			const updatedProfile = { ...profile, ...updates }
			localStorage.setItem('mockProfile', JSON.stringify(updatedProfile))
			setProfile(updatedProfile)
			
			console.log('✅ Perfil mock atualizado')
			return { data: updatedProfile, error: null }
		}

		try {
			// Primeiro verificar se o perfil existe no banco
			console.log('🔍 Verificando se perfil existe no banco...')
			const { data: existingProfile, error: checkError } = await supabase
				.from('profiles')
				.select('id')
				.eq('id', user.id)
				.single()
			
			const profileExists = !checkError && existingProfile
			console.log('📊 Perfil existe no banco:', profileExists)
			
			// Filtrar campos válidos para atualização
			const validUpdates: Record<string, unknown> = {}
			const allowedFields = [
				'full_name', 'avatar_url', 'phone', 'bio', 'location_state', 
				'location_city', 'address', 'cpf_cnpj', 'birth_date', 'neighborhood',
				'user_type', 'is_verified', 'badge', 'rating', 'total_reviews',
				'is_available', 'profile_completed', 'profile_completion_score',
				'whatsapp', 'professional_services', 'professional_experience_years',
				'professional_certifications', 'professional_portfolio_url',
				'profile_photo_url', 'selfie_document_url', 'residence_proof_url',
				'client_verification_document'
				// REMOVIDO: 'emergency_service', 'insurance_coverage' (não existem na tabela)
			]

			Object.keys(updates).forEach(key => {
				const value = updates[key as keyof Profile]
				if (allowedFields.includes(key) && value !== undefined) {
					// Permitir valores null para alguns campos específicos
					validUpdates[key] = value
				}
			})

			console.log('✅ Campos válidos para atualização:', validUpdates)



			// Adicionar timestamp de atualização
			validUpdates.updated_at = new Date().toISOString()

			// Se não há campos válidos para atualizar (além do updated_at), retornar sucesso
			if (Object.keys(validUpdates).length <= 1) {
				console.log('ℹ️ Nenhum campo válido para atualizar (apenas updated_at)')
				return { data: profile, error: null }
			}

			let operationError: { message: string; code?: string; details?: string; hint?: string } | null = null

			if (!profileExists) {
				// Se perfil não existe, fazer INSERT
				console.log('📝 Perfil não existe, criando novo...')
				const profileToCreate = {
					id: user.id,
					email: user.email || '',
					full_name: 'Usuário',
					user_type: 'client',
					location_state: 'SP',
					location_city: 'São Paulo',
					profile_completion_score: 0,
					badge: 'bronze',
					rating: 0,
					total_reviews: 0,
					is_available: true,
					profile_completed: false,
					professional_services: [],
					professional_certifications: [],
					...validUpdates
				}

				const { error: insertError } = await supabase
					.from('profiles')
					.insert([profileToCreate])
				
				operationError = insertError
			} else {
				// Se perfil existe, fazer UPDATE
				console.log('🔄 Perfil existe, atualizando...')
				const { error: updateError } = await supabase
					.from('profiles')
					.update(validUpdates)
					.eq('id', user.id)
				
				operationError = updateError
			}

			if (operationError) {
				console.error('❌ Erro do Supabase na operação:', operationError)
				console.error('🔍 Detalhes do erro:', {
					message: operationError.message,
					details: operationError.details,
					hint: operationError.hint,
					code: operationError.code
				})
				console.error('🔍 Dados sendo enviados:', validUpdates)
				console.error('🔍 ID do usuário:', user.id)
				console.error('🔍 Operação:', profileExists ? 'UPDATE' : 'INSERT')
				
				throw operationError
			}

			console.log('✅ Update realizado com sucesso, buscando perfil atualizado...')

			// Primeiro atualizar estado local imediatamente para melhor UX
			console.log('⚡ Atualizando estado local imediatamente...')
			const localUpdatedProfile = { ...profile, ...validUpdates } as Profile
			setProfile(localUpdatedProfile)
			
			// Depois tentar buscar o perfil atualizado do banco para confirmar
			console.log('🔄 Buscando perfil atualizado do banco para confirmação...')
			const { data, error: selectError } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', user.id)
				.single()

			if (selectError) {
				console.error('❌ Erro ao buscar perfil após update:', selectError)
				console.error('🔍 Detalhes do erro:', {
					message: selectError.message,
					details: selectError.details,
					hint: selectError.hint,
					code: selectError.code
				})
				
				// Manter os dados locais já atualizados
				console.log('⚠️ Mantendo dados locais atualizados (erro ao buscar do banco)')
				return { data: localUpdatedProfile, error: null }
			}



			console.log('✅ Perfil atualizado com sucesso:', data)
			
			// Atualizar o estado local com os novos dados
			if (data) {
				const updatedProfile: Profile = {
					...profile!,
					...data,
					updated_at: data.updated_at || new Date().toISOString()
				}
				setProfile(updatedProfile)
			}
			
			return { data, error: null }
				} catch (error) {
			console.error('💥 Erro crítico ao atualizar perfil:', error)
			console.error('🔍 Tipo do erro:', typeof error)
			console.error('🔍 Stack trace:', error instanceof Error ? error.stack : 'N/A')
			
			// Log detalhado para Supabase errors
			if (error && typeof error === 'object' && 'message' in error) {
				console.error('🔍 Supabase Error Details:', {
					message: error.message,
					details: (error as { details?: unknown }).details,
					hint: (error as { hint?: unknown }).hint,
					code: (error as { code?: unknown }).code
				})
			}
			
			return { 
				data: null, 
				error: { 
					message: error instanceof Error ? error.message : 'Erro desconhecido' 
				} 
			}
		}
	}

	// Função para fazer upload de avatar via API (contorna RLS)
	const uploadAvatar = async (file: File) => {
		try {
			console.log('=== INICIANDO UPLOAD VIA API ===');
			
			if (!user) {
				console.error('❌ Usuário não autenticado');
				return { 
					data: null, 
					error: { message: 'Usuário não autenticado. Faça login novamente.' } 
				};
			}

			console.log('✅ Usuário autenticado:', user.id);

			// Validar arquivo
			if (!file) {
				console.error('❌ Nenhum arquivo selecionado');
				return { 
					data: null, 
					error: { message: 'Nenhum arquivo selecionado' } 
				};
			}

			// Validar tipo de arquivo
			const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
			if (!allowedTypes.includes(file.type)) {
				console.error('❌ Tipo de arquivo não suportado:', file.type);
				return { 
					data: null, 
					error: { message: 'Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.' } 
				};
			}

			// Validar tamanho (máximo 5MB)
			const maxSize = 5 * 1024 * 1024; // 5MB
			if (file.size > maxSize) {
				console.error('❌ Arquivo muito grande:', file.size);
				return { 
					data: null, 
					error: { message: 'Arquivo muito grande. Máximo 5MB.' } 
				};
			}

			console.log('✅ Validações passaram');

			// Preparar FormData para envio
			const formData = new FormData();
			formData.append('file', file);
			formData.append('userId', user.id);

			console.log('📤 Enviando arquivo para API...');

			// Upload via API
			const response = await fetch('/api/upload-avatar', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error('❌ Erro na API:', errorData);
				return { 
					data: null, 
					error: { message: errorData.error || 'Erro no upload' } 
				};
			}

			const result = await response.json();
			console.log('✅ Upload realizado com sucesso via API!');
			console.log('🔗 URL do avatar:', result.avatarUrl);

			// Atualizar estado local
			if (profile) {
				const updatedProfile = { ...profile, avatar_url: result.avatarUrl };
				setProfile(updatedProfile);
				console.log('✅ Estado local atualizado');
			}

			console.log('🎉 Upload de avatar concluído com sucesso!');
			return { data: result.avatarUrl, error: null };

		} catch (error) {
			console.error('💥 Erro crítico no upload de avatar:', error);
			
			const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no upload';
			return { 
				data: null, 
				error: { message: errorMessage } 
			};
		}
	}

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
		isMockMode,
	}
}
