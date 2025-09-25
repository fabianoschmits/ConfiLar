'use client'

import { useState, useEffect, useCallback, useRef, useReducer } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/database'
import { Session } from '@supabase/supabase-js'
import { Logger } from '@/lib/logger'
import { ProfileSchema, LoginSchema, SignUpSchema } from '@/lib/validation'

// ===================================
// TIPOS E INTERFACES
// ===================================

export interface AuthState {
  user: { id: string; email: string } | null
  profile: Profile | null
  session: { user: { id: string; email: string } } | null
  loading: boolean
  isReady: boolean
  error: string | null
  isAuthenticated: boolean
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>
  signUp: (data: SignUpData) => Promise<{ error: { message: string } | null }>
  signOut: () => Promise<{ error: { message: string } | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ data: Profile | null; error: { message: string } | null }>
  uploadAvatar: (file: File) => Promise<{ data: string | null; error: { message: string } | null }>
  refreshAuth: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: { message: string } | null }>
  updatePassword: (newPassword: string) => Promise<{ error: { message: string } | null }>
  updateEmail: (newEmail: string) => Promise<{ error: { message: string } | null }>
  requireReauthentication: (action: 'password' | 'email' | 'general') => void
  isMockMode: boolean
}

export type SignUpData = {
  email: string
  password: string
  full_name: string
  user_type: 'client' | 'professional'
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
  gender?: 'male' | 'female'
  avatar_data?: {
    type: 'upload' | 'dicebear'
    file?: File
    url?: string
    preview: string
  } | null
}

// ===================================
// REDUCER PARA ESTADO DE AUTH
// ===================================

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: { id: string; email: string } | null }
  | { type: 'SET_PROFILE'; payload: Profile | null }
  | { type: 'SET_SESSION'; payload: { user: { id: string; email: string } } | null }
  | { type: 'SET_READY'; payload: boolean }
  | { type: 'RESET_AUTH' }

const initialAuthState: AuthState = {
  user: null,
  profile: null,
  session: null,
  loading: true,
  isReady: false,
  error: null,
  isAuthenticated: false
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        isAuthenticated: !!action.payload
      }
    
    case 'SET_PROFILE':
      return { ...state, profile: action.payload }
    
    case 'SET_SESSION':
      return { ...state, session: action.payload }
    
    case 'SET_READY':
      return { ...state, isReady: action.payload }
    
    case 'RESET_AUTH':
      return {
        ...initialAuthState,
        loading: false,
        isReady: true
      }
    
    default:
      return state
  }
}

// ===================================
// HOOK PRINCIPAL DE AUTENTICAÇÃO
// ===================================

export function useAuth(initialSession?: Session | null): AuthState & AuthActions {
  const [state, dispatch] = useReducer(authReducer, initialAuthState)
  const initializationRef = useRef(false)
  const timeoutRefs = useRef<NodeJS.Timeout[]>([])

  // ===================================
  // UTILITÁRIOS
  // ===================================

  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
    timeoutRefs.current = []
  }, [])

  const addTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(callback, delay)
    timeoutRefs.current.push(timeout)
    return timeout
  }, [])

  // Criar perfil padrão
  const createDefaultProfile = useCallback((userId: string, email: string): Profile => {
    Logger.auth.profileFetch(userId, false)
    
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

  // ===================================
  // CORE FUNCTIONS
  // ===================================

  // Buscar perfil do usuário
  const fetchUserProfile = useCallback(async (userId: string, email: string, retries = 2): Promise<Profile> => {
    const startTime = Date.now()
    
    try {
      Logger.debug('auth', `Fetching profile for user ${userId}`, { userId, retries })

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const duration = Date.now() - startTime
      Logger.api.request('profiles', 'GET', duration)

      if (error) {
        if (error.code === 'PGRST116') {
          // Perfil não encontrado - criar padrão
          Logger.warn('auth', `Profile not found for ${userId}, creating default profile`)
          const defaultProfile = createDefaultProfile(userId, email)
          dispatch({ type: 'SET_PROFILE', payload: defaultProfile })
          return defaultProfile
        }
        
        throw error
      }

      if (data) {
        // Validar dados do perfil
        const validation = ProfileSchema.safeParse(data)
        if (!validation.success) {
          Logger.warn('auth', `Profile validation failed for ${userId}`, {
            errors: validation.error.issues
          })
          // Usar dados mesmo com erros de validação, mas registrar
        }

        Logger.auth.profileFetch(userId, true, false)
        dispatch({ type: 'SET_PROFILE', payload: data as Profile })
        return data as Profile
      }

      throw new Error('No profile data returned')
    } catch (error) {
      Logger.error('auth', error as Error, { userId, retries })
      
      if (retries > 0) {
        Logger.debug('auth', `Retrying profile fetch for ${userId}`, { retriesLeft: retries - 1 })
        await new Promise(resolve => setTimeout(resolve, 1000))
        return fetchUserProfile(userId, email, retries - 1)
      }
      
      // Último recurso - criar perfil padrão
      const defaultProfile = createDefaultProfile(userId, email)
      dispatch({ type: 'SET_PROFILE', payload: defaultProfile })
      return defaultProfile
    }
  }, [createDefaultProfile])

  // Inicializar autenticação
  const initializeAuth = useCallback(async () => {
    if (initializationRef.current) return
    initializationRef.current = true

    try {
      Logger.info('auth', 'Initializing authentication')
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      // Verificar sessão inicial
      if (initialSession?.user) {
        const userData = { id: initialSession.user.id, email: initialSession.user.email! }
        dispatch({ type: 'SET_USER', payload: userData })
        dispatch({ type: 'SET_SESSION', payload: { user: userData } })
        
        await fetchUserProfile(initialSession.user.id, initialSession.user.email!)
      } else {
        // Verificar sessão atual
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          Logger.error('auth', error, { context: 'getSession' })
          throw error
        }

        if (session?.user) {
          const userData = { id: session.user.id, email: session.user.email! }
          dispatch({ type: 'SET_USER', payload: userData })
          dispatch({ type: 'SET_SESSION', payload: { user: userData } })
          
          await fetchUserProfile(session.user.id, session.user.email!)
        } else {
          Logger.info('auth', 'No active session found')
          dispatch({ type: 'SET_USER', payload: null })
          dispatch({ type: 'SET_PROFILE', payload: null })
          dispatch({ type: 'SET_SESSION', payload: null })
        }
      }
    } catch (error) {
      Logger.error('auth', error as Error, { context: 'initialization' })
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
      dispatch({ type: 'SET_READY', payload: true })
    }
  }, [initialSession, fetchUserProfile])

  // ===================================
  // AUTH ACTIONS
  // ===================================

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      Logger.info('auth', `Attempting login for ${email}`)
      
      // Validar dados de entrada
      const validation = LoginSchema.safeParse({ email, password })
      if (!validation.success) {
        const error = validation.error.issues[0].message
        Logger.warn('auth', `Login validation failed: ${error}`)
        return { error: { message: error } }
      }

      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const startTime = Date.now()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validation.data.email,
        password: validation.data.password
      })

      const duration = Date.now() - startTime
      Logger.api.request('auth/sign-in', 'POST', duration)

      if (error) {
        Logger.auth.login(email, false, { error: error.message })
        dispatch({ type: 'SET_ERROR', payload: error.message })
        return { error }
      }

      if (data.user) {
        Logger.auth.login(email, true)
        const userData = { id: data.user.id, email: data.user.email! }
        
        dispatch({ type: 'SET_USER', payload: userData })
        dispatch({ type: 'SET_SESSION', payload: { user: userData } })
        
        // Buscar perfil em background
        fetchUserProfile(data.user.id, data.user.email!)
          .catch(error => {
            Logger.error('auth', error, { context: 'post-login-profile-fetch' })
          })
      }

      return { error: null }
    } catch (error) {
      Logger.error('auth', error as Error, { context: 'signIn' })
      const errorMessage = (error as Error).message
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      return { error: { message: errorMessage } }
    } finally {
      // Garantir que loading seja false após timeout
      addTimeout(() => {
        dispatch({ type: 'SET_LOADING', payload: false })
      }, 1000)
    }
  }, [fetchUserProfile, addTimeout])

  const signUp = useCallback(async (userData: SignUpData) => {
    try {
      Logger.info('auth', `Attempting signup for ${userData.email}`)
      
      // Validar dados de entrada
      const validation = SignUpSchema.safeParse(userData)
      if (!validation.success) {
        const error = validation.error.issues[0].message
        Logger.warn('auth', `Signup validation failed: ${error}`)
        return { error: { message: error } }
      }

      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const { data, error } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          data: {
            full_name: validation.data.full_name,
            user_type: validation.data.user_type
          }
        }
      })

      if (error) {
        Logger.error('auth', error, { context: 'signUp' })
        dispatch({ type: 'SET_ERROR', payload: error.message })
        return { error }
      }

      if (data.user) {
        Logger.info('auth', `Signup successful for ${userData.email}`)
        
        // Aguardar um pouco para o trigger do banco criar o perfil básico
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Salvar dados adicionais no perfil
        try {
          const profileUpdates: Partial<Profile> = {}
          
          // Mapear dados do formulário para campos do perfil
          if (validation.data.phone) profileUpdates.phone = validation.data.phone
          if (validation.data.cpf_cnpj) profileUpdates.cpf_cnpj = validation.data.cpf_cnpj
          if (validation.data.birth_date) profileUpdates.birth_date = validation.data.birth_date
          if (validation.data.location_state) profileUpdates.location_state = validation.data.location_state
          if (validation.data.location_city) profileUpdates.location_city = validation.data.location_city
          if (validation.data.neighborhood) profileUpdates.neighborhood = validation.data.neighborhood
          if (validation.data.bio) profileUpdates.bio = validation.data.bio
          if (validation.data.services_offered) profileUpdates.professional_services = validation.data.services_offered
          if (validation.data.experience_years) profileUpdates.professional_experience_years = parseInt(validation.data.experience_years) || 0
          
          // Se há dados do avatar, salvar
          if (validation.data.avatar_data) {
            profileUpdates.avatar_url = validation.data.avatar_data
          }

          // Atualizar perfil com dados adicionais
          if (Object.keys(profileUpdates).length > 0) {
            Logger.info('auth', `Updating profile with additional data for ${userData.email}`)
            
            const { error: updateError } = await supabase
              .from('profiles')
              .update(profileUpdates)
              .eq('id', data.user.id)

            if (updateError) {
              Logger.error('auth', updateError, { context: 'signUp - profile update' })
              // Não falhar o registro se a atualização do perfil falhar
            } else {
              Logger.info('auth', `Profile updated successfully for ${userData.email}`)
            }
          }
        } catch (profileError) {
          Logger.error('auth', profileError as Error, { context: 'signUp - profile update' })
          // Não falhar o registro se a atualização do perfil falhar
        }
      }

      return { error: null }
    } catch (error) {
      Logger.error('auth', error as Error, { context: 'signUp' })
      const errorMessage = (error as Error).message
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      return { error: { message: errorMessage } }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      Logger.info('auth', 'Attempting logout')
      
      const userId = state.user?.id
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        Logger.error('auth', error, { context: 'signOut' })
        return { error }
      }

      if (userId) {
        Logger.auth.logout(userId)
      }

      dispatch({ type: 'RESET_AUTH' })
      clearAllTimeouts()

      return { error: null }
    } catch (error) {
      Logger.error('auth', error as Error, { context: 'signOut' })
      return { error: { message: (error as Error).message } }
    }
  }, [state.user?.id, clearAllTimeouts])

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    try {
      if (!state.user?.id) {
        throw new Error('User not authenticated')
      }

      Logger.debug('auth', `Updating profile for user ${state.user.id}`, { updates: Object.keys(updates) })

      // Validar updates
      const validation = ProfileSchema.partial().safeParse(updates)
      if (!validation.success) {
        const error = validation.error.issues[0].message
        Logger.warn('auth', `Profile update validation failed: ${error}`)
        return { data: null, error: { message: error } }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          ...validation.data, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', state.user.id)
        .select()
        .single()

      if (error) {
        Logger.error('auth', error, { context: 'updateProfile' })
        return { data: null, error: { message: error.message } }
      }

      if (data) {
        Logger.info('auth', `Profile updated successfully for user ${state.user.id}`)
        dispatch({ type: 'SET_PROFILE', payload: data as Profile })
        return { data: data as Profile, error: null }
      }

      return { data: null, error: { message: 'No data returned' } }
    } catch (error) {
      Logger.error('auth', error as Error, { context: 'updateProfile' })
      return { data: null, error: { message: (error as Error).message } }
    }
  }, [state.user?.id])

  const uploadAvatar = useCallback(async (file: File) => {
    try {
      if (!state.user?.id) {
        throw new Error('User not authenticated')
      }

      Logger.debug('auth', `Uploading avatar for user ${state.user.id}`, { 
        fileName: file.name, 
        fileSize: file.size 
      })

      const fileExt = file.name.split('.').pop()
      const fileName = `${state.user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        Logger.error('auth', uploadError, { context: 'uploadAvatar' })
        return { data: null, error: { message: uploadError.message } }
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Atualizar perfil com nova URL do avatar
      await updateProfile({ avatar_url: publicUrl })

      Logger.info('auth', `Avatar uploaded successfully for user ${state.user.id}`)
      return { data: publicUrl, error: null }
    } catch (error) {
      Logger.error('auth', error as Error, { context: 'uploadAvatar' })
      return { data: null, error: { message: (error as Error).message } }
    }
  }, [state.user?.id, updateProfile])

  const refreshAuth = useCallback(async () => {
    try {
      Logger.debug('auth', 'Refreshing authentication')
      
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        Logger.error('auth', error, { context: 'refreshAuth' })
        throw error
      }

      if (data.session?.user) {
        const userData = { id: data.session.user.id, email: data.session.user.email! }
        dispatch({ type: 'SET_USER', payload: userData })
        dispatch({ type: 'SET_SESSION', payload: { user: userData } })
      }
    } catch (error) {
      Logger.error('auth', error as Error, { context: 'refreshAuth' })
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    try {
      Logger.info('auth', `Password reset requested for ${email}`)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      
      if (error) {
        Logger.error('auth', error, { context: 'resetPassword' })
        return { error }
      }

      Logger.info('auth', `Password reset email sent to ${email}`)
      return { error: null }
    } catch (error) {
      Logger.error('auth', error as Error, { context: 'resetPassword' })
      return { error: { message: (error as Error).message } }
    }
  }, [])

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      Logger.info('auth', 'Updating password')
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) {
        Logger.error('auth', error, { context: 'updatePassword' })
        return { error }
      }

      Logger.info('auth', 'Password updated successfully')
      return { error: null }
    } catch (error) {
      Logger.error('auth', error as Error, { context: 'updatePassword' })
      return { error: { message: (error as Error).message } }
    }
  }, [])

  const updateEmail = useCallback(async (newEmail: string) => {
    try {
      Logger.info('auth', `Updating email to ${newEmail}`)
      
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })
      
      if (error) {
        Logger.error('auth', error, { context: 'updateEmail' })
        return { error }
      }

      Logger.info('auth', 'Email update initiated')
      return { error: null }
    } catch (error) {
      Logger.error('auth', error as Error, { context: 'updateEmail' })
      return { error: { message: (error as Error).message } }
    }
  }, [])

  const requireReauthentication = useCallback((action: 'password' | 'email' | 'general') => {
    Logger.info('auth', `Reauthentication required for action: ${action}`)
    
    // Para compatibilidade - implementação básica
    // Em uma implementação completa, você redirecionaria para página de reautenticação
    console.warn('Reauthentication required but not fully implemented:', action)
  }, [])

  // Mock mode para desenvolvimento/testes
  const isMockMode = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

  // ===================================
  // EFFECTS
  // ===================================

  // Inicialização
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Listener de mudanças de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        Logger.debug('auth', `Auth state change: ${event}`, { 
          hasSession: !!session,
          userEmail: session?.user?.email 
        })

        // Ignorar evento inicial se já inicializamos
        if (event === 'INITIAL_SESSION' && initializationRef.current) {
          return
        }

        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              const userData = { id: session.user.id, email: session.user.email! }
              dispatch({ type: 'SET_USER', payload: userData })
              dispatch({ type: 'SET_SESSION', payload: { user: userData } })
              dispatch({ type: 'SET_ERROR', payload: null })
              
              // Buscar perfil em background
              fetchUserProfile(session.user.id, session.user.email!)
                .catch(error => {
                  Logger.error('auth', error, { context: 'auth-state-change-profile-fetch' })
                })
            }
            break

          case 'SIGNED_OUT':
            Logger.info('auth', 'User signed out via auth state change')
            dispatch({ type: 'RESET_AUTH' })
            break

          case 'TOKEN_REFRESHED':
            Logger.debug('auth', 'Token refreshed')
            break

          default:
            Logger.debug('auth', `Unhandled auth event: ${event}`)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      clearAllTimeouts()
    }
  }, [fetchUserProfile, clearAllTimeouts])

  // Limpeza
  useEffect(() => {
    return () => {
      clearAllTimeouts()
    }
  }, [clearAllTimeouts])

  // ===================================
  // RETORNO
  // ===================================

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    uploadAvatar,
    refreshAuth,
    resetPassword,
    updatePassword,
    updateEmail,
    requireReauthentication,
    isMockMode
  }
}

// Re-exportar tipos para compatibilidade
export type { Profile } from '@/types/database'
