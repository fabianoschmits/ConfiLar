import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Código de referral é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar o código de referral
    const { data: referralData, error: referralError } = await supabase
      .from('user_referral_stats')
      .select(`
        user_id,
        referral_code,
        profiles!inner(full_name, avatar_url)
      `)
      .eq('referral_code', code)
      .single()

    if (referralError || !referralData) {
      return NextResponse.json(
        { error: 'Código de referral inválido' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      valid: true,
      userName: (referralData.profiles as any).full_name,
      avatarUrl: (referralData.profiles as any).avatar_url,
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
