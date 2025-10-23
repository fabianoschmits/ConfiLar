'use client'

import { supabase } from '@/lib/supabase'

/**
 * Verifica se o usuário ficou inativo por 7 dias e atualiza sua disponibilidade
 * automaticamente para indisponível.
 */
export async function checkAndUpdateInactiveAvailability(userId: string): Promise<void> {
  try {
    console.log('🔍 [Auto Disponibilidade] Verificando inatividade do usuário:', userId)
    
    // Buscar dados do perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('last_login_at, is_available, full_name')
      .eq('id', userId)
      .single()

    if (profileError) {
      // Se a coluna last_login_at não existe ainda, apenas avisar e retornar
      if (profileError.code === '42703') {
        console.warn('⚠️ [Auto Disponibilidade] Coluna last_login_at ainda não existe. Execute o SQL de migração.')
        return
      }
      console.error('❌ [Auto Disponibilidade] Erro ao buscar perfil:', profileError)
      return
    }

    if (!profile) {
      console.log('⚠️ [Auto Disponibilidade] Perfil não encontrado')
      return
    }

    // Se já está indisponível, não precisa fazer nada
    if (!profile.is_available) {
      console.log('ℹ️ [Auto Disponibilidade] Usuário já está indisponível')
      
      // Mas ainda assim atualiza o last_login_at para o próximo login
      await updateLastLogin(userId)
      return
    }

    // Verificar se há last_login_at
    if (!profile.last_login_at) {
      console.log('ℹ️ [Auto Disponibilidade] Primeiro login do usuário, definindo data inicial')
      await updateLastLogin(userId)
      return
    }

    // Calcular dias desde o último login
    const lastLoginDate = new Date(profile.last_login_at)
    const now = new Date()
    const daysSinceLastLogin = Math.floor(
      (now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    console.log('📅 [Auto Disponibilidade] Dias desde último login:', daysSinceLastLogin)

    // Se passou 7 ou mais dias, marcar como indisponível
    if (daysSinceLastLogin >= 7) {
      console.log('⏰ [Auto Disponibilidade] Usuário inativo por 7+ dias. Marcando como indisponível...')
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          is_available: false,
          last_login_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        console.error('❌ [Auto Disponibilidade] Erro ao marcar indisponível:', updateError)
      } else {
        console.log('✅ [Auto Disponibilidade] Usuário marcado como indisponível devido à inatividade')
        console.log(`   ${profile.full_name} ficou ${daysSinceLastLogin} dias sem acessar`)
      }
    } else {
      console.log(`✅ [Auto Disponibilidade] Usuário ativo. Faltam ${7 - daysSinceLastLogin} dias para inativação automática`)
      
      // Atualizar o last_login_at para este login
      await updateLastLogin(userId)
    }
  } catch (err) {
    console.error('❌ [Auto Disponibilidade] Erro ao verificar inatividade:', err)
  }
}

/**
 * Atualiza a data do último login do usuário
 */
async function updateLastLogin(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      // Se a coluna não existe, apenas avisar
      if (error.code === '42703') {
        console.warn('⚠️ [Auto Disponibilidade] Coluna last_login_at ainda não existe.')
        return
      }
      console.error('❌ [Auto Disponibilidade] Erro ao atualizar last_login_at:', error)
    } else {
      console.log('✅ [Auto Disponibilidade] last_login_at atualizado')
    }
  } catch (err) {
    console.error('❌ [Auto Disponibilidade] Erro ao atualizar last_login_at:', err)
  }
}

