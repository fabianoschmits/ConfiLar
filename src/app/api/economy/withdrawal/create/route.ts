import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Parse do body
    const body = await request.json()
    const { points_amount, pix_key, pix_key_type } = body
    
    // Validar dados
    if (!points_amount || !pix_key || !pix_key_type) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    if (points_amount < 10000) {
      return NextResponse.json({ error: 'Valor mínimo de saque: 10.000 pontos' }, { status: 400 })
    }

    // Criar saque
    const { data, error } = await supabase.rpc('create_withdrawal', {
      p_user_id: user.id,
      p_points_amount: points_amount,
      p_pix_key: pix_key,
      p_pix_key_type: pix_key_type
    })

    if (error) {
      console.error('Erro ao criar saque:', error)
      return NextResponse.json({ error: error.message || 'Erro ao criar saque' }, { status: 500 })
    }

    // Buscar detalhes do saque criado
    const { data: withdrawal, error: fetchError } = await supabase
      .from('points_withdrawals')
      .select('*')
      .eq('id', data)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar saque:', fetchError)
    }

    return NextResponse.json({ 
      success: true,
      withdrawal_id: data,
      withdrawal: withdrawal || null,
      message: 'Saque solicitado com sucesso. Aguarde aprovação.'
    })
  } catch (error) {
    console.error('Erro na API de criar saque:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
