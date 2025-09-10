'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Profile } from '@/types/database'
import { Session } from '@supabase/supabase-js'

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
  signOut: () => Promise<{ error: { message: string } | null }>
  refreshAuth: () => Promise<void>
}

export function useRobustAuth(initialSession?: Session | null): AuthState & AuthActions {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<{ user: { id: string; email: string } } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()
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
    const mainTimeout = addTimeout(() => {
      console.log('⚠️ Timeout principal atingido - finalizando loading')
      setLoading(false)
      setIsReady(true)
    }, 6000)

    // Timeout de emergência (10 segundos)
    const emergencyTimeout = addTimeout(() => {
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
      console.log('🔍 Verificando sessão existente...')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Erro ao buscar sessão:', error)
        setError(error.message)
        setLoading(false)
        setIsReady(true)
        clearAllTimeouts()
        return
      }

      if (session?.user?.email) {
        console.log('✅ Usuário encontrado na sessão:', session.user.email)
        const userData = { id: session.user.id, email: session.user.email }
        setUser(userData)
        setSession({ user: userData })
        
        // Buscar perfil com retry
        const userProfile = await fetchUserProfile(session.user.id, session.user.email)
        setProfile(userProfile)
      } else {
        console.log('❌ Nenhum usuário na sessão')
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
        
        if (event === 'SIGNED_IN' && session?.user?.email) {
          const userData = { id: session.user.id, email: session.user.email }
          setUser(userData)
          setSession({ user: userData })
          setError(null)
          
          // Buscar perfil com retry
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
  }, [initializeAuth, supabase, fetchUserProfile, clearAllTimeouts])

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
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Erro no logout:', error)
        setError(error.message)
        setLoading(false)
        return { error }
      }

      // Limpar estado local
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
  }, [supabase])

  // Função de refresh
  const refreshAuth = useCallback(async () => {
    console.log('🔄 Atualizando autenticação...')
    setError(null)
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setError(error.message)
        return
      }

      if (session?.user?.email) {
        const userData = { id: session.user.id, email: session.user.email }
        setUser(userData)
        setSession({ user: userData })
        
        const userProfile = await fetchUserProfile(session.user.id, session.user.email)
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

  return {
    user,
    profile,
    session,
    loading,
    isReady,
    error,
    signIn,
    signOut,
    refreshAuth
  }
}

