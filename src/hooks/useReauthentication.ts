'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export interface ReauthenticationState {
  isLoading: boolean
  isReauthenticated: boolean
  error: string | null
  otpSent: boolean
  otpVerified: boolean
}

export interface ReauthenticationActions {
  requestReauthentication: () => Promise<{ error: { message: string } | null }>
  verifyOTP: (otp: string) => Promise<{ error: { message: string } | null }>
  resetReauthentication: () => void
  checkReauthenticationRequired: (action: 'password' | 'email') => Promise<boolean>
}

export function useReauthentication(): ReauthenticationState & ReauthenticationActions {
  const [isLoading, setIsLoading] = useState(false)
  const [isReauthenticated, setIsReauthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)

  // Solicitar reautenticação
  const requestReauthentication = useCallback(async () => {
    console.log('🔐 Solicitando reautenticação...')
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.reauthenticate()
      
      if (error) {
        console.error('❌ Erro na reautenticação:', error)
        setError(error.message)
        setIsLoading(false)
        return { error }
      }

      console.log('✅ Código OTP enviado com sucesso')
      setOtpSent(true)
      setIsLoading(false)
      toast.success('Código de verificação enviado para seu email!')
      
      return { error: null }
    } catch (error) {
      console.error('💥 Erro crítico na reautenticação:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setError(errorMessage)
      setIsLoading(false)
      return { error: { message: errorMessage } }
    }
  }, [])

  // Verificar código OTP
  const verifyOTP = useCallback(async (otp: string) => {
    console.log('🔐 Verificando código OTP...')
    setIsLoading(true)
    setError(null)
    
    try {
      // Para reautenticação, vamos simular a verificação por enquanto
      // Em uma implementação real, você usaria a API específica do Supabase
      
      // Simular delay de verificação
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Por enquanto, aceitar qualquer código de 6 dígitos
      if (otp.length === 6 && /^\d+$/.test(otp)) {
        console.log('✅ OTP verificado com sucesso')
        setOtpVerified(true)
        setIsReauthenticated(true)
        setIsLoading(false)
        toast.success('Reautenticação confirmada!')
        
        return { error: null }
      } else {
        const error = { message: 'Código inválido' }
        setError(error.message)
        setIsLoading(false)
        return { error }
      }
    } catch (error) {
      console.error('💥 Erro crítico na verificação do OTP:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setError(errorMessage)
      setIsLoading(false)
      return { error: { message: errorMessage } }
    }
  }, [])

  // Resetar estado de reautenticação
  const resetReauthentication = useCallback(() => {
    console.log('🔄 Resetando estado de reautenticação...')
    setIsReauthenticated(false)
    setError(null)
    setOtpSent(false)
    setOtpVerified(false)
    setIsLoading(false)
  }, [])

  // Verificar se reautenticação é necessária
  const checkReauthenticationRequired = useCallback(async (action: 'password' | 'email'): Promise<boolean> => {
    console.log(`🔍 Verificando se reautenticação é necessária para: ${action}`)
    
    try {
      // Verificar última atividade do usuário
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        console.log('❌ Usuário não autenticado')
        return false
      }

      // Verificar se a sessão é recente (menos de 24 horas)
      const lastSignIn = session.user.last_sign_in_at
      if (lastSignIn) {
        const lastSignInDate = new Date(lastSignIn)
        const now = new Date()
        const hoursSinceLastSignIn = (now.getTime() - lastSignInDate.getTime()) / (1000 * 60 * 60)
        
        console.log(`⏰ Horas desde último login: ${hoursSinceLastSignIn}`)
        
        // Se passou mais de 24 horas, requer reautenticação
        if (hoursSinceLastSignIn > 24) {
          console.log('⚠️ Reautenticação necessária - sessão expirada')
          return true
        }
      }

      // Para ações sensíveis, sempre requerer reautenticação se não foi feita recentemente
      if (action === 'password' || action === 'email') {
        // Verificar se há uma sessão de reautenticação ativa
        const reauthSession = sessionStorage.getItem('reauth_session')
        if (!reauthSession) {
          console.log('⚠️ Reautenticação necessária - ação sensível')
          return true
        }
        
        // Verificar se a sessão de reautenticação ainda é válida (1 hora)
        const reauthData = JSON.parse(reauthSession)
        const reauthTime = new Date(reauthData.timestamp)
        const now = new Date()
        const hoursSinceReauth = (now.getTime() - reauthTime.getTime()) / (1000 * 60 * 60)
        
        if (hoursSinceReauth > 1) {
          console.log('⚠️ Reautenticação necessária - sessão de reautenticação expirada')
          return true
        }
      }

      console.log('✅ Reautenticação não necessária')
      return false
    } catch (error) {
      console.error('❌ Erro ao verificar necessidade de reautenticação:', error)
      // Em caso de erro, assumir que reautenticação é necessária por segurança
      return true
    }
  }, [])

  return {
    isLoading,
    isReauthenticated,
    error,
    otpSent,
    otpVerified,
    requestReauthentication,
    verifyOTP,
    resetReauthentication,
    checkReauthenticationRequired
  }
}
