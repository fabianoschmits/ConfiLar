import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/authenticatedRoute'

/**
 * POST /api/economy/withdrawal/create
 * 
 * Cria uma solicitação de saque de pontos para o usuário autenticado.
 * 
 * Segurança:
 * - ✅ Requer autenticação (withAuth)
 * - ✅ Sempre cria saque para o usuário autenticado (user.id)
 */
export const POST = withAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
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

    // Criar saque para o usuário autenticado
    const { data, error } = await supabaseAuth.rpc('create_withdrawal', {
      p_user_id: user.id, // 🔒 Sempre ID autenticado
      p_points_amount: points_amount,
      p_pix_key: pix_key,
      p_pix_key_type: pix_key_type
    })

    if (error) {
      console.error('Erro ao criar saque:', error)
      return NextResponse.json({ error: error.message || 'Erro ao criar saque' }, { status: 500 })
    }

    // Buscar detalhes do saque criado
    const { data: withdrawal, error: fetchError } = await supabaseAuth
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
})
