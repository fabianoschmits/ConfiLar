import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    console.log('🔍 [API validate] Validando código:', code)

    if (!code) {
      return NextResponse.json(
        { error: 'Código de referral é obrigatório' },
        { status: 400 }
      )
    }

    // Converter para maiúsculas para garantir case-insensitive
    const normalizedCode = code.toUpperCase().trim()
    console.log('🔍 [API validate] Código normalizado:', normalizedCode)

    // Usar admin client para bypass RLS (usuário ainda não está autenticado)
    const supabase = createAdminSupabaseClient()

    // Buscar o código de referral (case-insensitive)
    const { data: referralData, error: referralError } = await supabase
      .from('user_referral_stats')
      .select('user_id, referral_code')
      .ilike('referral_code', normalizedCode)
      .single()

    console.log('🔍 [API validate] Resultado da busca:', { data: referralData, error: referralError })

    if (referralError || !referralData) {
      console.error('❌ [API validate] Código não encontrado ou erro:', referralError)
      return NextResponse.json(
        { error: 'Código de referral inválido' },
        { status: 404 }
      )
    }

    console.log('✅ [API validate] Código válido encontrado para user_id:', referralData.user_id)

    // Buscar dados do perfil separadamente
    console.log('🔍 [API validate] Buscando perfil para user_id:', referralData.user_id)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', referralData.user_id)
      .single()

    console.log('🔍 [API validate] Resultado do perfil:', { data: profileData, error: profileError })

    if (profileError || !profileData) {
      console.error('❌ [API validate] Perfil não encontrado:', profileError)
      return NextResponse.json(
        { error: 'Perfil do referrer não encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ [API validate] Retornando sucesso para:', profileData.full_name)

    return NextResponse.json({
      valid: true,
      userName: profileData.full_name,
      avatarUrl: profileData.avatar_url,
      referralCode: referralData.referral_code
    })

  } catch (error) {
    console.error('Erro ao validar código de referral:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
