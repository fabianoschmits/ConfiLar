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
      console.log('🔍 [useReferralTracking] Código de referral detectado na URL:', refCode)
      
      // Salvar no localStorage com timestamp
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + REFERRAL_EXPIRY_DAYS)

      localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify({
        code: refCode,
        timestamp: Date.now(),
        expiry: expiryDate.getTime()
      }))

      console.log('✅ [useReferralTracking] Código salvo no localStorage')
      
      // NÃO limpar a URL aqui - deixar o formulário ler o parâmetro primeiro
      // A URL será limpa apenas após o usuário se cadastrar
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
    console.log('🔍 [createReferral] Iniciando criação de referral para userId:', referredUserId)
    
    // Obter código de referral do localStorage
    const stored = localStorage.getItem(REFERRAL_STORAGE_KEY)
    console.log('🔍 [createReferral] Dados no localStorage:', stored)
    
    if (!stored) {
      console.log('❌ [createReferral] Nenhum código de referral encontrado no localStorage')
      return { success: false, error: 'Nenhum código de referral encontrado' }
    }

    const data = JSON.parse(stored)
    const referralCode = data.code
    console.log('🔍 [createReferral] Código de referral extraído:', referralCode)

    // Validar código
    console.log('🔍 [createReferral] Buscando dados do referrer no banco...')
    const { data: statsData, error: statsError } = await supabase
      .from('user_referral_stats')
      .select('user_id')
      .eq('referral_code', referralCode)
      .single()

    console.log('🔍 [createReferral] Resultado da busca:', { statsData, statsError })

    if (statsError || !statsData) {
      console.error('❌ [createReferral] Código de referral inválido:', statsError)
      return { success: false, error: 'Código de referral inválido' }
    }

    const referrerId = statsData.user_id
    console.log('🔍 [createReferral] ID do referrer encontrado:', referrerId)

    // Verificar se não é auto-referral
    if (referrerId === referredUserId) {
      console.error('❌ [createReferral] Tentativa de auto-indicação detectada')
      return { success: false, error: 'Não é possível se auto-indicar' }
    }

    // Criar referral
    console.log('🔍 [createReferral] Inserindo referral no banco:', {
      referrer_id: referrerId,
      referred_id: referredUserId,
      referral_code: referralCode,
      status: 'pending',
      source: source || 'link_direto'
    })
    
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
        console.log('⚠️ [createReferral] Referral duplicado (já existe), considerando como sucesso')
        return { success: true }
      }
      
      console.error('❌ [createReferral] Erro ao inserir referral:', insertError)
      return { success: false, error: insertError.message }
    }

    console.log('✅ [createReferral] Referral inserido com sucesso!')

    // Limpar localStorage após criar referral
    localStorage.removeItem(REFERRAL_STORAGE_KEY)
    console.log('🧹 [createReferral] localStorage limpo')

    return { success: true }
  } catch (err: any) {
    console.error('❌ [createReferral] Erro ao processar referral:', err)
    return { success: false, error: err.message }
  }
}

export async function updateReferralMilestone(
  userId: string,
  milestone: 'profile_completed' | 'first_post_made' | 'first_review_made' | 'active_30_days'
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
    console.log('🔍 [30 dias] Verificando se usuário está ativo por 30 dias:', userId)
    
    // Verificar se o usuário foi indicado
    const { data: referralData, error: referralError } = await supabase
      .from('referrals')
      .select('id, created_at, active_30_days, activated_at, status')
      .eq('referred_id', userId)
      .maybeSingle()

    if (referralError) {
      // Silenciar erro se for problema de permissão ou tabela não acessível
      if (referralError.code === 'PGRST116' || referralError.code === '42501') {
        console.log('ℹ️ [30 dias] Usuário não foi indicado ou sem permissão de acesso')
        return
      }
      console.warn('⚠️ [30 dias] Erro ao buscar referral:', referralError.message)
      return
    }

    if (!referralData) {
      console.log('ℹ️ [30 dias] Usuário não foi indicado')
      return
    }

    if (referralData.active_30_days) {
      console.log('✅ [30 dias] Milestone já marcado anteriormente')
      return
    }

    // Verificar se já passou 30 dias desde a ativação (ou criação)
    const referenceDate = referralData.activated_at || referralData.created_at
    const activatedDate = new Date(referenceDate)
    const now = Date.now()
    const daysSinceActivation = Math.floor(
      (now - activatedDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    console.log('📅 [30 dias] Dias desde ativação:', daysSinceActivation)

    if (daysSinceActivation >= 30) {
      console.log('🎉 [30 dias] Usuário completou 30 dias ativo! Marcando milestone...')
      
      // Marcar como ativo por 30 dias
      const { error: updateError } = await supabase
        .from('referrals')
        .update({
          active_30_days: true,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', referralData.id)

      if (updateError) {
        console.error('❌ [30 dias] Erro ao marcar 30 dias ativo:', updateError)
      } else {
        console.log('✅ [30 dias] Milestone active_30_days marcado! (+150 pontos para indicador)')
        console.log('✅ [30 dias] Status mudará para "completed" via trigger do banco')
      }
    } else {
      console.log(`⏳ [30 dias] Faltam ${30 - daysSinceActivation} dias para completar 30 dias`)
    }
  } catch (err) {
    console.error('❌ [30 dias] Erro ao verificar 30 dias ativo:', err)
  }
}

