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

    // Criar transferência
    const { data, error } = await supabase.rpc('transfer_points', {
      p_from_user_id: user.id,
      p_to_user_id: to_user_id,
      p_points_amount: points_amount,
      p_message: message || null
    })

    if (error) {
      console.error('Erro ao criar transferência:', error)
      return NextResponse.json({ error: error.message || 'Erro ao criar transferência' }, { status: 500 })
    }

    // Buscar detalhes da transferência criada
    const { data: transfer, error: fetchError } = await supabase
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
}
