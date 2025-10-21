'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const REFERRAL_STORAGE_KEY = 'confilar_referral_code'
const REFERRAL_EXPIRY_DAYS = 30

export function useReferralTracking() {
  useEffect(() => {
    // Verificar se há código de referral na URL
    if (typeof window === 'undefined') return

    const urlParams = new URLSearchParams(window.location.search)
    const refCode = urlParams.get('ref')

    if (refCode) {
      // Salvar no localStorage com timestamp
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + REFERRAL_EXPIRY_DAYS)

      localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify({
        code: refCode,
        timestamp: Date.now(),
        expiry: expiryDate.getTime()
      }))

      // Limpar URL (opcional, para não ficar aparecendo o ref)
      const cleanUrl = window.location.pathname + window.location.hash
      window.history.replaceState({}, document.title, cleanUrl)
    }
  }, [])

  const getReferralCode = (): string | null => {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem(REFERRAL_STORAGE_KEY)
    if (!stored) return null

    try {
      const data = JSON.parse(stored)
      
      // Verificar se expirou
      if (Date.now() > data.expiry) {
        localStorage.removeItem(REFERRAL_STORAGE_KEY)
        return null
      }

      return data.code
    } catch (err) {
      console.error('Erro ao ler código de referral:', err)
      return null
    }
  }

  const clearReferralCode = () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(REFERRAL_STORAGE_KEY)
  }

  return {
    getReferralCode,
    clearReferralCode
  }
}

export async function createReferral(
  referredUserId: string,
  source?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Obter código de referral do localStorage
    const stored = localStorage.getItem(REFERRAL_STORAGE_KEY)
    if (!stored) {
      return { success: false, error: 'Nenhum código de referral encontrado' }
    }

    const data = JSON.parse(stored)
    const referralCode = data.code

    // Validar código
    const { data: statsData, error: statsError } = await supabase
      .from('user_referral_stats')
      .select('user_id')
      .eq('referral_code', referralCode)
      .single()

    if (statsError || !statsData) {
      return { success: false, error: 'Código de referral inválido' }
    }

    const referrerId = statsData.user_id

    // Verificar se não é auto-referral
    if (referrerId === referredUserId) {
      return { success: false, error: 'Não é possível se auto-indicar' }
    }

    // Criar referral
    const { error: insertError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: referredUserId,
        referral_code: referralCode,
        status: 'pending',
        source: source || 'link_direto',
        created_at: new Date().toISOString()
      })

    if (insertError) {
      // Pode ser duplicado, o que é ok
      if (insertError.code === '23505') {
        return { success: true }
      }
      
      console.error('Erro ao criar referral:', insertError)
      return { success: false, error: insertError.message }
    }

    // Limpar localStorage após criar referral
    localStorage.removeItem(REFERRAL_STORAGE_KEY)

    return { success: true }
  } catch (err: any) {
    console.error('Erro ao processar referral:', err)
    return { success: false, error: err.message }
  }
}

export async function updateReferralMilestone(
  userId: string,
  milestone: 'profile_completed' | 'first_post_made' | 'first_service_hired' | 'active_30_days'
): Promise<void> {
  try {
    // Verificar se o usuário foi indicado
    const { data: referralData, error: referralError } = await supabase
      .from('referrals')
      .select(`id, ${milestone}`)
      .eq('referred_id', userId)
      .maybeSingle()

    if (referralError) {
      console.error('Erro ao buscar referral:', referralError)
      return
    }

    if (!referralData) {
      // Usuário não foi indicado, não há problema
      return
    }

    // Verificar se o milestone já foi marcado (type assertion segura)
    const milestoneValue = (referralData as any)[milestone]
    if (milestoneValue === true) {
      return
    }

    // Atualizar milestone
    const updateData: any = {
      [milestone]: true,
      last_activity_at: new Date().toISOString()
    }

    // Se completou perfil, ativar referral
    if (milestone === 'profile_completed') {
      updateData.status = 'active'
      updateData.activated_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('referrals')
      .update(updateData)
      .eq('id', referralData.id)

    if (updateError) {
      console.error('Erro ao atualizar milestone de referral:', updateError)
    }
  } catch (err) {
    console.error('Erro ao processar milestone de referral:', err)
  }
}

export async function checkAndUpdate30DaysActive(userId: string): Promise<void> {
  try {
    // Verificar se o usuário foi indicado
    const { data: referralData, error: referralError } = await supabase
      .from('referrals')
      .select('id, created_at, active_30_days, activated_at')
      .eq('referred_id', userId)
      .single()

    if (referralError || !referralData || referralData.active_30_days) {
      return
    }

    // Verificar se já passou 30 dias desde a ativação
    const activatedDate = new Date(referralData.activated_at || referralData.created_at)
    const daysSinceActivation = Math.floor(
      (Date.now() - activatedDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceActivation >= 30) {
      // Marcar como ativo por 30 dias
      const { error: updateError } = await supabase
        .from('referrals')
        .update({
          active_30_days: true,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', referralData.id)

      if (updateError) {
        console.error('Erro ao marcar 30 dias ativo:', updateError)
      }
    }
  } catch (err) {
    console.error('Erro ao verificar 30 dias ativo:', err)
  }
}

