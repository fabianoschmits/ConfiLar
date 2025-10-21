'use client'

import { useState, useEffect, useCallback, useRef, useReducer } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/database'
import { Session } from '@supabase/supabase-js'
import { Logger } from '@/lib/logger'
import { useRateLimit, RateLimitConfigs } from '@/hooks/useRateLimit'
import { ProfileSchema, LoginSchema, SignUpSchema } from '@/lib/validation'
import { useAutoNotifications } from './useAutoNotifications'
import { getBioOrDefault } from '@/utils/autoBioGenerator'

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
  signUpBasic: (data: BasicSignUpData) => Promise<{ error: { message: string } | null }>
  completeProfile: (data: CompleteProfileData) => Promise<{ error: { message: string } | null }>
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
  gender?: 'male' | 'female' | 'other'
  avatar_data?: {
    type: 'upload' | 'dicebear'
    file?: File
    url?: string
    preview: string
  } | null
}

export type BasicSignUpData = {
  email: string
  password: string
  cpf_cnpj?: string
}

export type CompleteProfileData = {
  full_name: string
  phone: string
  cpf_cnpj: string
  birth_date: string
  location_state: string
  location_city: string
  neighborhood: string
  address?: string
  bio?: string
  services_offered?: string[]
  experience_years?: string
  emergency_service?: boolean
  insurance_coverage?: boolean
  gender: 'male' | 'female'
  user_type: 'client' | 'professional'
  avatar_data?: {
    type: 'upload' | 'dicebear'
    file?: File
    url?: string
    preview: string
  }
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
  const { checkRateLimit, recordAttempt } = useRateLimit()

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
        .maybeSingle()

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
      
      // Verificar rate limiting
      const rateLimitResult = checkRateLimit(email, RateLimitConfigs.LOGIN)
      if (!rateLimitResult.allowed) {
        const errorMessage = rateLimitResult.isBlocked 
          ? `Muitas tentativas de login. Tente novamente em ${rateLimitResult.retryAfter} segundos.`
          : `Muitas tentativas de login. Tente novamente em ${rateLimitResult.retryAfter} segundos.`
        
        Logger.warn('auth', `Rate limit exceeded for ${email}`, {
          attempts: rateLimitResult.remainingAttempts,
          isBlocked: rateLimitResult.isBlocked,
          retryAfter: rateLimitResult.retryAfter
        })
        
        return { error: { message: errorMessage } }
      }
      
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
        // Registrar tentativa de login falhada
        recordAttempt(email, RateLimitConfigs.LOGIN)
        
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

  const signUpBasic = useCallback(async (userData: BasicSignUpData) => {
    try {
      Logger.info('auth', `Attempting basic signup for ${userData.email}`)
      
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            cpf_cnpj: userData.cpf_cnpj || null
            // Nome será preenchido no onboarding
          }
        }
      })

      if (error) {
        Logger.error('auth', error, { context: 'signUpBasic' })
        dispatch({ type: 'SET_ERROR', payload: error.message })
        return { error }
      }

      if (data.user) {
        Logger.info('auth', `Basic signup successful for ${userData.email}`)
      }

      return { error: null }
    } catch (error) {
      Logger.error('auth', error as Error, { context: 'signUpBasic' })
      const errorMessage = (error as Error).message
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      return { error: { message: errorMessage } }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Hook para notificações automáticas
  const { createWelcomePost } = useAutoNotifications()

  const completeProfile = useCallback(async (profileData: CompleteProfileData) => {
    try {
      Logger.info('auth', `Completing profile for user`)
      console.log('🔍 CompleteProfile recebeu dados:', profileData)
      
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      if (!state.user) {
        throw new Error('Usuário não autenticado')
      }
      
      console.log('👤 Usuário autenticado:', state.user.id)

      // Processar avatar se fornecido
      let avatarUrl = null
      if (profileData.avatar_data) {
        if (profileData.avatar_data.type === 'dicebear' && profileData.avatar_data.url) {
          avatarUrl = profileData.avatar_data.url
        } else if (profileData.avatar_data.type === 'upload' && profileData.avatar_data.file) {
          // Upload do arquivo para o storage
          const uploadResult = await uploadAvatar(profileData.avatar_data.file)
          if (uploadResult.data) {
            avatarUrl = uploadResult.data
          }
        }
      }

      // Gerar biografia automática se não fornecida
      const autoBio = getBioOrDefault(
        profileData.bio,
        profileData.user_type,
        {
          location_state: profileData.location_state,
          professional_services: profileData.services_offered,
          full_name: profileData.full_name
        }
      )

      // Preparar dados do perfil
      const profileInsertData = {
        id: state.user.id,
        email: state.user.email!,
        full_name: profileData.full_name,
        user_type: profileData.user_type,
        phone: profileData.phone,
        cpf_cnpj: profileData.cpf_cnpj,
        birth_date: profileData.birth_date || null,
        location_state: profileData.location_state,
        location_city: profileData.location_city,
        neighborhood: profileData.neighborhood,
        address: profileData.address || '',
        bio: autoBio,
        professional_services: profileData.services_offered || [],
        professional_experience_years: profileData.experience_years ? 
          (isNaN(parseInt(profileData.experience_years)) ? 0 : parseInt(profileData.experience_years)) : 0,
        professional_certifications: [],
        avatar_url: avatarUrl,
        is_verified: false,
        badge: 'bronze' as const,
        rating: 0,
        total_reviews: 0,
        is_available: true,
        profile_completed: true,
        profile_completion_score: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Preparar dados das preferências
      const preferencesData = {
        user_id: state.user.id,
        push_enabled: true,
        message_notifications: true,
        review_notifications: true,
        booking_notifications: true,
        achievement_notifications: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('💾 Dados que serão salvos no banco:', profileInsertData)
      
      // Criar/atualizar perfil e preferências em paralelo
      const [profileResult, preferencesResult] = await Promise.allSettled([
        supabase.from('profiles').upsert(profileInsertData, { onConflict: 'id' }),
        supabase.from('notification_preferences').upsert(preferencesData, { onConflict: 'user_id' })
      ])

      // Verificar resultado do perfil
      if (profileResult.status === 'fulfilled') {
        if (profileResult.value.error) {
          Logger.error('auth', profileResult.value.error, { context: 'completeProfile - profile creation' })
          throw new Error(`Erro ao criar perfil: ${profileResult.value.error.message}`)
        } else {
          Logger.info('auth', `Profile completed successfully`)
          
          // Atualizar o contexto com o perfil criado
          dispatch({ type: 'SET_PROFILE', payload: profileInsertData as Profile })
          
          // Criar post de boas-vindas
          try {
            await createWelcomePost(
              state.user.id,
              profileData.full_name,
              profileData.user_type
            )
            Logger.info('auth', `Welcome post created for ${profileData.full_name}`)
          } catch (welcomeError) {
            Logger.warn('auth', `Failed to create welcome post: ${welcomeError}`)
            // Não falhar o cadastro se o post de boas-vindas falhar
          }
        }
      } else {
        Logger.error('auth', profileResult.reason, { context: 'completeProfile - profile creation' })
        throw new Error(`Erro ao criar perfil: ${profileResult.reason}`)
      }

      // Verificar resultado das preferências
      if (preferencesResult.status === 'fulfilled') {
        if (preferencesResult.value.error) {
          Logger.error('auth', preferencesResult.value.error, { context: 'completeProfile - preferences creation' })
          // Não falhar se as preferências não forem criadas
        } else {
          Logger.info('auth', `Notification preferences created successfully`)
        }
      } else {
        Logger.error('auth', preferencesResult.reason, { context: 'completeProfile - preferences creation' })
        // Não falhar se as preferências não forem criadas
      }

      return { error: null }
    } catch (error) {
      Logger.error('auth', error as Error, { context: 'completeProfile' })
      const errorMessage = (error as Error).message
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      return { error: { message: errorMessage } }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.user])

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
        
        // Criar perfil e preferências diretamente no frontend (solução recomendada pelo ChatGPT)
        Logger.info('auth', `Creating profile and preferences directly for ${userData.email}`)
        
        // Preparar dados do perfil
        const profileData = {
          id: data.user.id,
          email: data.user.email!,
          full_name: validation.data.full_name,
          user_type: validation.data.user_type,
          phone: validation.data.phone || '',
          cpf_cnpj: validation.data.cpf_cnpj || '',
          birth_date: validation.data.birth_date || null,
          location_state: validation.data.location_state || '',
          location_city: validation.data.location_city || '',
          neighborhood: validation.data.neighborhood || '',
          bio: validation.data.bio || '',
          professional_services: validation.data.services_offered || [],
          professional_experience_years: validation.data.experience_years ? 
            (isNaN(parseInt(validation.data.experience_years)) ? 0 : parseInt(validation.data.experience_years)) : 0,
          professional_certifications: [], // Adicionar coluna que estava faltando
          avatar_url: null, // Adicionar coluna que estava faltando
          is_verified: false,
          badge: 'bronze' as const,
          rating: 0,
          total_reviews: 0,
          is_available: true,
          profile_completed: false,
          profile_completion_score: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // Preparar dados das preferências
        const preferencesData = {
          user_id: data.user.id,
          push_enabled: true,
          message_notifications: true,
          review_notifications: true,
          booking_notifications: true,
          achievement_notifications: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // Criar perfil e preferências em paralelo para melhor performance
        const [profileResult, preferencesResult] = await Promise.allSettled([
          supabase.from('profiles').insert(profileData),
          supabase.from('notification_preferences').insert(preferencesData)
        ])

        // Verificar resultado do perfil
        if (profileResult.status === 'fulfilled') {
          if (profileResult.value.error) {
            Logger.error('auth', profileResult.value.error, { context: 'signUp - profile creation' })
          } else {
            Logger.info('auth', `Profile created successfully for ${userData.email}`)
          }
        } else {
          Logger.error('auth', profileResult.reason, { context: 'signUp - profile creation' })
        }

        // Verificar resultado das preferências
        if (preferencesResult.status === 'fulfilled') {
          if (preferencesResult.value.error) {
            Logger.error('auth', preferencesResult.value.error, { context: 'signUp - preferences creation' })
          } else {
            Logger.info('auth', `Notification preferences created successfully for ${userData.email}`)
          }
        } else {
          Logger.error('auth', preferencesResult.reason, { context: 'signUp - preferences creation' })
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
        
        // Também recarregar o perfil do banco de dados
        await fetchUserProfile(data.session.user.id, data.session.user.email!)
      }
    } catch (error) {
      Logger.error('auth', error as Error, { context: 'refreshAuth' })
    }
  }, [fetchUserProfile])

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
    signUpBasic,
    completeProfile,
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
