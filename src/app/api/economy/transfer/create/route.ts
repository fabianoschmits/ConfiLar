import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/authenticatedRoute'

/**
 * POST /api/economy/transfer/create
 * 
 * Cria uma transferência de pontos do usuário autenticado para outro usuário.
 * 
 * Segurança:
 * - ✅ Requer autenticação (withAuth)
 * - ✅ Sempre transfere do usuário autenticado (user.id como from_user_id)
 */
export const POST = withAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    // Parse do body
    const body = await request.json()
    const { to_user_id, points_amount, message } = body
    
    // Validar dados
    if (!to_user_id || !points_amount) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    if (to_user_id === user.id) {
      return NextResponse.json({ error: 'Não é possível transferir para si mesmo' }, { status: 400 })
    }

    if (points_amount < 100) {
      return NextResponse.json({ error: 'Valor mínimo de transferência: 100 pontos' }, { status: 400 })
    }

    // Criar transferência do usuário autenticado
    const { data, error } = await supabaseAuth.rpc('transfer_points', {
      p_from_user_id: user.id, // 🔒 Sempre ID autenticado
      p_to_user_id: to_user_id,
      p_points_amount: points_amount,
      p_message: message || null
    })

    if (error) {
      console.error('Erro ao criar transferência:', error)
      return NextResponse.json({ error: error.message || 'Erro ao criar transferência' }, { status: 500 })
    }

    // Buscar detalhes da transferência criada
    const { data: transfer, error: fetchError } = await supabaseAuth
      .from('points_transfers')
      .select(`
        *,
        from_user:profiles!points_transfers_from_user_id_fkey(id, full_name, avatar_url),
        to_user:profiles!points_transfers_to_user_id_fkey(id, full_name, avatar_url)
      `)
      .eq('id', data)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar transferência:', fetchError)
    }

    return NextResponse.json({ 
      success: true,
      transfer_id: data,
      transfer: transfer || null,
      message: 'Transferência realizada com sucesso'
    })
  } catch (error) {
    console.error('Erro na API de criar transferência:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})
