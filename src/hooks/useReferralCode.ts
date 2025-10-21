'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useReferralCode(userId?: string) {
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referralLink, setReferralLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    loadReferralCode()
  }, [userId])

  const loadReferralCode = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('user_referral_stats')
        .select('referral_code')
        .eq('user_id', userId)
        .single()

      if (fetchError) throw fetchError

      setReferralCode(data.referral_code)
      
      // Gerar link completo
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : 'https://appconfilar.com.br'
      
      setReferralLink(`${baseUrl}/?ref=${data.referral_code}`)
    } catch (err: any) {
      console.error('Erro ao carregar código de referral:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!referralLink) return false

    try {
      await navigator.clipboard.writeText(referralLink)
      return true
    } catch (err) {
      console.error('Erro ao copiar link:', err)
      return false
    }
  }

  const shareViaWhatsApp = () => {
    if (!referralLink) return

    const message = encodeURIComponent(
      `Olá! 👋\n\nEstou usando o ConfiLar para encontrar profissionais qualificados e está sendo ótimo!\n\nUse meu link e ganhe benefícios exclusivos:\n${referralLink}\n\nNos vemos lá! 🚀`
    )
    
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const shareViaTelegram = () => {
    if (!referralLink) return

    const message = encodeURIComponent(
      `Olá! Estou usando o ConfiLar e recomendo! Use meu link: ${referralLink}`
    )
    
    window.open(`https://t.me/share/url?url=${referralLink}&text=${message}`, '_blank')
  }

  const shareViaEmail = () => {
    if (!referralLink) return

    const subject = encodeURIComponent('Convite para o ConfiLar')
    const body = encodeURIComponent(
      `Olá!\n\nGostaria de te convidar para conhecer o ConfiLar, uma plataforma incrível para conectar profissionais e clientes.\n\nUsando meu link de indicação, você ganha acesso a benefícios exclusivos:\n${referralLink}\n\nEspero te ver por lá!\n\nAbraços`
    )
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return {
    referralCode,
    referralLink,
    loading,
    error,
    copyToClipboard,
    shareViaWhatsApp,
    shareViaTelegram,
    shareViaEmail,
    refresh: loadReferralCode
  }
}

export function useValidateReferralCode() {
  const [validating, setValidating] = useState(false)

  const validateCode = async (code: string): Promise<{
    valid: boolean
    userId?: string
    userName?: string
  }> => {
    try {
      setValidating(true)

      const { data, error } = await supabase
        .from('user_referral_stats')
        .select(`
          user_id,
          profiles!inner (
            full_name
          )
        `)
        .eq('referral_code', code)
        .single()

      if (error || !data) {
        return { valid: false }
      }

      // profiles vem como array, pegar o primeiro
      const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles

      return {
        valid: true,
        userId: data.user_id,
        userName: profile?.full_name || 'Usuário'
      }
    } catch (err) {
      console.error('Erro ao validar código de referral:', err)
      return { valid: false }
    } finally {
      setValidating(false)
    }
  }

  return { validateCode, validating }
}

