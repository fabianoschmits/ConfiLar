'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/database'
import { Session } from '@supabase/supabase-js'
import { useReauthentication } from './useReauthentication'

export interface AuthState {
  user: { id: string; email: string } | null
  profile: Profile | null
  session: { user: { id: string; email: string } } | null
  loading: boolean
  isReady: boolean
  error: string | null
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>
  signUp: SignUpFn
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
		gender?: 'male' | 'female'
		avatar_data?: {
			type: 'upload' | 'dicebear'
			file?: File
			url?: string
			preview: string
		} | null
	}
) => Promise<{ error: { message: string } | null }>

export function useRobustAuth(initialSession?: Session | null): AuthState & AuthActions {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<{ user: { id: string; email: string } } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Hook de reautenticação
  const { checkReauthenticationRequired } = useReauthentication()
  
  // Usar o client Supabase configurado
  const initializationRef = useRef(false)
  const timeoutRefs = useRef<NodeJS.Timeout[]>([])

  // Função para limpar todos os timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
    timeoutRefs.current = []
  }, [])

  // Função para adicionar timeout com limpeza automática
  const addTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(callback, delay)
    timeoutRefs.current.push(timeout)
    return timeout
  }, [])

  // Perfil padrão
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

  // Buscar perfil com timeout e retry
  const fetchUserProfile = useCallback(async (userId: string, email: string, retries = 3): Promise<Profile> => {
    // Verificar se ainda há uma sessão ativa antes de buscar o perfil
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session?.user) {
        console.log('⚠️ Sem sessão ativa, não buscando perfil')
        return createDefaultProfile(userId, email)
      }
    } catch (error) {
      console.log('⚠️ Erro ao verificar sessão ativa, não buscando perfil:', error)
      return createDefaultProfile(userId, email)
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔍 Buscando perfil (tentativa ${attempt}/${retries}):`, userId)
        
        const { data, error } = await Promise.race([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single(),
          new Promise<{ data: null; error: { message: string } }>((_, reject) => 
            setTimeout(() => reject({ data: null, error: { message: 'Timeout' } }), 2000)
          )
        ])

        if (error) {
          console.log(`⚠️ Erro na tentativa ${attempt}:`, error.message)
          if (attempt === retries) {
            console.log('⚠️ Todas as tentativas falharam, criando perfil padrão')
            return createDefaultProfile(userId, email)
          }
          continue
        }

        console.log('✅ Perfil encontrado:', data.full_name)
        return data as Profile
      } catch (error) {
        console.error(`❌ Erro na tentativa ${attempt}:`, error)
        if (attempt === retries) {
          console.log('⚠️ Todas as tentativas falharam, criando perfil padrão')
          return createDefaultProfile(userId, email)
        }
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, 500 * attempt))
      }
    }
    
    return createDefaultProfile(userId, email)
  }, [supabase, createDefaultProfile])

  // Inicialização robusta
  const initializeAuth = useCallback(async () => {
    if (initializationRef.current) return
    initializationRef.current = true

    console.log('🚀 Iniciando sistema robusto de autenticação...')
    setError(null)

    // Timeout de segurança principal (6 segundos)
    addTimeout(() => {
      console.log('⚠️ Timeout principal atingido - finalizando loading')
      setLoading(false)
      setIsReady(true)
    }, 6000)

    // Timeout de emergência (10 segundos)
    addTimeout(() => {
      console.log('🚨 Timeout de emergência - forçando finalização')
      setLoading(false)
      setIsReady(true)
      setError('Timeout na inicialização')
    }, 10000)

    try {
      // Se temos sessão inicial do servidor
      if (initialSession?.user?.email) {
        console.log('✅ Usando sessão inicial do servidor:', initialSession.user.email)
        const userData = { id: initialSession.user.id, email: initialSession.user.email }
        setUser(userData)
        setSession({ user: userData })
        
        // Buscar perfil com retry
        const userProfile = await fetchUserProfile(initialSession.user.id, initialSession.user.email)
        setProfile(userProfile)
        
        setLoading(false)
        setIsReady(true)
        clearAllTimeouts()
        return
      }

      // Verificar sessão atual
      console.log('🔍 Verificando sessão atual...')
      let currentSession = null
      let error = null
      
      try {
        const result = await supabase.auth.getSession()
        currentSession = result.data.session
        error = result.error
      } catch (authError) {
        console.log('⚠️ Erro ao verificar sessão (não crítico):', authError)
        // Não definir como erro crítico, apenas continuar sem sessão
        error = null
        currentSession = null
      }
      
      if (error) {
        console.error('❌ Erro ao buscar sessão:', error)
        setError(error.message)
        setLoading(false)
        setIsReady(true)
        clearAllTimeouts()
        return
      }

      if (currentSession?.user?.email) {
        console.log('✅ Sessão encontrada:', currentSession.user.email)
        const userData = { id: currentSession.user.id, email: currentSession.user.email }
        setUser(userData)
        setSession({ user: userData })
        
        // Buscar perfil com retry
        const userProfile = await fetchUserProfile(currentSession.user.id, currentSession.user.email)
        setProfile(userProfile)
      } else {
        console.log('❌ Nenhuma sessão ativa')
        setUser(null)
        setProfile(null)
        setSession(null)
      }
    } catch (error) {
      console.error('❌ Erro crítico na inicialização:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
      setUser(null)
      setProfile(null)
      setSession(null)
    } finally {
      setLoading(false)
      setIsReady(true)
      clearAllTimeouts()
    }
  }, [initialSession, supabase, fetchUserProfile, addTimeout, clearAllTimeouts])

  // Listener de mudanças de autenticação
  useEffect(() => {
    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Evento de auth:', event, session?.user?.email)
        
        // Evitar processamento desnecessário se já estamos processando
        if (loading) {
          console.log('⏳ Já processando auth, ignorando evento:', event)
          return
        }
        
        if (event === 'SIGNED_IN' && session?.user?.email) {
          const userData = { id: session.user.id, email: session.user.email }
          setUser(userData)
          setSession({ user: userData })
          setError(null)
          
          // Buscar perfil com retry apenas se há sessão válida
          const userProfile = await fetchUserProfile(session.user.id, session.user.email)
          setProfile(userProfile)
        } else if (event === 'SIGNED_OUT') {
          console.log('❌ Usuário deslogado')
          setUser(null)
          setProfile(null)
          setSession(null)
          setError(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
      clearAllTimeouts()
    }
  }, [initializeAuth, supabase, fetchUserProfile, clearAllTimeouts, loading])

  // Função de login robusta
  const signIn = useCallback(async (email: string, password: string) => {
    console.log('🔐 Tentando login robusto para:', email)
    setError(null)
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ Erro no login:', error)
        setError(error.message)
        setLoading(false)
        return { error }
      }

      if (data.user) {
        console.log('✅ Login bem-sucedido para:', data.user.email)
        const userData = { id: data.user.id, email: data.user.email }
        setUser(userData)
        setSession({ user: userData })
        
        // Buscar perfil com retry
        const userProfile = await fetchUserProfile(data.user.id, data.user.email)
        setProfile(userProfile)
        
        // Timeout para garantir finalização
        addTimeout(() => {
          setLoading(false)
        }, 1000)
      }

      return { error: null }
    } catch (error) {
      console.error('💥 Erro crítico no login:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
      setLoading(false)
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'Erro desconhecido' 
        } 
      }
    }
  }, [supabase, fetchUserProfile, addTimeout])

  // Função de logout robusta
  const signOut = useCallback(async () => {
    console.log('🚪 Executando logout robusto...')
    setError(null)
    setLoading(true)
    
    try {
      // Limpar todos os timeouts pendentes primeiro
      clearAllTimeouts()
      
      // Executar logout no Supabase primeiro
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Erro no logout:', error)
        setError(error.message)
        setLoading(false)
        return { error }
      }

      // Depois limpar estado local para evitar race conditions
      setUser(null)
      setProfile(null)
      setSession(null)
      
      // Limpeza de dados
      if (typeof window !== 'undefined') {
        const keysToRemove = [
          'mockUser', 'mockProfile', 'user-preferences', 'chat-history',
          'notification-preferences', 'search-history'
        ]
        keysToRemove.forEach(key => localStorage.removeItem(key))
        sessionStorage.clear()
      }
      
      console.log('✅ Logout bem-sucedido')
      setLoading(false)
      return { error: null }
    } catch (error) {
      console.error('💥 Erro crítico no logout:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
      setLoading(false)
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'Erro desconhecido' 
        } 
      }
    }
  }, [supabase, clearAllTimeouts])

  // Função de refresh
  const refreshAuth = useCallback(async () => {
    console.log('🔄 Atualizando autenticação...')
    setError(null)
    
    try {
      let currentSession = null
      let error = null
      
      try {
        const result = await supabase.auth.getSession()
        currentSession = result.data.session
        error = result.error
      } catch (authError) {
        console.log('⚠️ Erro ao verificar sessão no refresh (não crítico):', authError)
        // Não definir como erro crítico, apenas continuar sem sessão
        error = null
        currentSession = null
      }
      
      if (error) {
        setError(error.message)
        return
      }

      if (currentSession?.user?.email) {
        const userData = { id: currentSession.user.id, email: currentSession.user.email }
        setUser(userData)
        setSession({ user: userData })
        
        const userProfile = await fetchUserProfile(currentSession.user.id, currentSession.user.email)
        setProfile(userProfile)
      } else {
        setUser(null)
        setProfile(null)
        setSession(null)
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar auth:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }, [supabase, fetchUserProfile])

  // Função de cadastro (simplificada)
  const signUp: SignUpFn = useCallback(async (email, password, additionalData) => {
    console.log('📝 Tentando cadastro robusto para:', email)
    console.log('📋 Dados adicionais:', additionalData)
    console.log('🎨 Dados do avatar:', additionalData?.avatar_data)
    setError(null)
    setLoading(true)
    
    try {
      // Primeiro, criar o usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: additionalData?.full_name || 'Usuário',
            phone: additionalData?.phone || '',
            user_type: additionalData?.user_type || 'client',
            cpf_cnpj: additionalData?.cpf_cnpj || '',
            birth_date: additionalData?.birth_date || '',
            location_state: additionalData?.location_state || '',
            location_city: additionalData?.location_city || '',
            neighborhood: additionalData?.neighborhood || '',
            bio: additionalData?.bio || '',
            gender: additionalData?.gender || 'male',
            experience_years: additionalData?.experience_years || '',
            emergency_service: additionalData?.emergency_service || false,
            insurance_coverage: additionalData?.insurance_coverage || false,
            services_offered: additionalData?.services_offered || []
          }
        }
      })

      if (error) {
        console.error('❌ Erro no cadastro:', error)
        setError(error.message)
        setLoading(false)
        return { error }
      }

      if (data.user) {
        console.log('✅ Cadastro bem-sucedido para:', data.user.email)
        
        // Aguardar um pouco para garantir que o usuário foi criado
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        console.log('✅ Usuário criado com ID:', data.user.id)
        
        // Processar avatar se fornecido
        let avatarUrl = null
        if (additionalData?.avatar_data) {
          try {
            if (additionalData.avatar_data.type === 'dicebear') {
              // Para avatars Dicebear, usar a URL diretamente
              avatarUrl = additionalData.avatar_data.url
              console.log('🎨 Avatar Dicebear definido:', avatarUrl)
            } else if (additionalData.avatar_data.type === 'upload') {
              // Para upload de arquivo, fazer upload para o Supabase Storage
              const file = additionalData.avatar_data.file as File
              const fileExt = file.name.split('.').pop()
              const fileName = `${data.user.id}-avatar.${fileExt}`
              
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                  cacheControl: '3600',
                  upsert: true
                })
              
              if (uploadError) {
                console.error('❌ Erro no upload do avatar:', uploadError)
                // Usar avatar Dicebear como fallback
                avatarUrl = additionalData.avatar_data.preview
              } else {
                // Obter URL pública do arquivo
                const { data: urlData } = supabase.storage
                  .from('avatars')
                  .getPublicUrl(fileName)
                avatarUrl = urlData.publicUrl
                console.log('🎨 Avatar enviado com sucesso:', avatarUrl)
              }
            }
          } catch (avatarError) {
            console.error('❌ Erro ao processar avatar:', avatarError)
            // Continuar mesmo com erro no avatar
          }
        }
        
        // Criar perfil com todos os dados fornecidos
        try {
          const profileData = {
            id: data.user.id, // Usar o ID do usuário retornado pelo signUp
            email: data.user.email, // Usar o email do usuário retornado pelo signUp
            full_name: additionalData?.full_name || 'Usuário',
            phone: additionalData?.phone || '',
            user_type: additionalData?.user_type || 'client',
            cpf_cnpj: additionalData?.cpf_cnpj || '',
            birth_date: additionalData?.birth_date || null,
            location_state: additionalData?.location_state || '',
            location_city: additionalData?.location_city || '',
            neighborhood: additionalData?.neighborhood || '',
            bio: additionalData?.bio || '',
            professional_services: additionalData?.services_offered || [],
            professional_experience_years: additionalData?.experience_years ? parseInt(additionalData.experience_years) || 0 : 0,
            avatar_url: avatarUrl,
            profile_completed: true, // Marcar como completo se temos dados básicos
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          console.log('📝 Criando perfil com dados:', profileData)
          
          const { data: profileResult, error: profileError } = await supabase
            .from('profiles')
            .insert(profileData)
            .select()
            .single()
          
          if (profileError) {
            console.error('❌ Erro ao criar perfil:', profileError)
            console.error('❌ Dados que causaram erro:', profileData)
          } else {
            console.log('✅ Perfil criado com sucesso:', profileResult.full_name)
            console.log('✅ Avatar URL:', profileResult.avatar_url)
          }
        } catch (profileError) {
          console.error('❌ Erro crítico ao criar perfil:', profileError)
        }
        
        setLoading(false)
      }

      return { error: null }
    } catch (error) {
      console.error('💥 Erro crítico no cadastro:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
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

  // Função para requerer reautenticação
  const requireReauthentication = useCallback((action: 'password' | 'email' | 'general') => {
    console.log(`🔐 Requerendo reautenticação para: ${action}`)
    if (typeof window !== 'undefined') {
      window.location.href = `/reautenticacao?action=${action}`
    }
  }, [])

  // Função para verificar se reautenticação é necessária
  const checkReauthNeeded = useCallback(async (action: 'password' | 'email' | 'general'): Promise<boolean> => {
    try {
      // Para 'general', usar verificação simples baseada em sessionStorage
      if (action === 'general') {
        const reauthSession = sessionStorage.getItem('reauth_session')
        return !reauthSession
      }
      
      // Para 'password' e 'email', usar a função específica
      return await checkReauthenticationRequired(action)
    } catch (error) {
      console.error('❌ Erro ao verificar reautenticação:', error)
      return true // Em caso de erro, assumir que é necessária
    }
  }, [checkReauthenticationRequired])

  // Função para atualizar senha com reautenticação automática
  const updatePassword = useCallback(async (newPassword: string) => {
    console.log('🔐 Tentando atualizar senha')
    
    try {
      setLoading(true)
      
      // Verificar se reautenticação é necessária
      const needsReauth = await checkReauthNeeded('password')
      if (needsReauth) {
        console.log('⚠️ Reautenticação necessária para alterar senha')
        setLoading(false)
        requireReauthentication('password')
        return { error: { message: 'Reautenticação necessária' } }
      }
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('❌ Erro ao atualizar senha:', error)
        setLoading(false)
        return { error }
      }

      console.log('✅ Senha atualizada com sucesso')
      // Limpar sessão de reautenticação após sucesso
      sessionStorage.removeItem('reauth_session')
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
  }, [supabase, checkReauthNeeded, requireReauthentication])

  // Função para atualizar email com reautenticação automática
  const updateEmail = useCallback(async (newEmail: string) => {
    console.log('📧 Tentando atualizar email')
    
    try {
      setLoading(true)
      
      // Verificar se reautenticação é necessária
      const needsReauth = await checkReauthNeeded('email')
      if (needsReauth) {
        console.log('⚠️ Reautenticação necessária para alterar email')
        setLoading(false)
        requireReauthentication('email')
        return { error: { message: 'Reautenticação necessária' } }
      }
      
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (error) {
        console.error('❌ Erro ao atualizar email:', error)
        setLoading(false)
        return { error }
      }

      console.log('✅ Email atualizado com sucesso')
      // Limpar sessão de reautenticação após sucesso
      sessionStorage.removeItem('reauth_session')
      setLoading(false)
      return { error: null }
    } catch (error) {
      console.error('💥 Erro crítico ao atualizar email:', error)
      setLoading(false)
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'Erro desconhecido' 
        } 
      }
    }
  }, [supabase, checkReauthNeeded, requireReauthentication])

  return {
    user,
    profile,
    session,
    loading,
    isReady,
    error,
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
    isMockMode: false
  }
}

