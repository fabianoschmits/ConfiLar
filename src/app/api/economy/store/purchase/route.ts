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
    const { item_id } = body
    
    // Validar dados
    if (!item_id) {
      return NextResponse.json({ error: 'ID do item é obrigatório' }, { status: 400 })
    }

    // Buscar item
    const { data: item, error: itemError } = await supabase
      .from('points_store_items')
      .select('*')
      .eq('id', item_id)
      .eq('is_active', true)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    // Verificar saldo
    const { data: profile } = await supabase
      .from('profiles')
      .select('points_balance')
      .eq('id', user.id)
      .single()

    if (!profile || profile.points_balance < item.points_price) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 })
    }

    // Criar compra na loja
    const { data: purchase, error: purchaseError } = await supabase
      .from('points_store_purchases')
      .insert({
        user_id: user.id,
        item_id: item_id,
        points_spent: item.points_price,
        expires_at: item.duration_days 
          ? new Date(Date.now() + item.duration_days * 24 * 60 * 60 * 1000).toISOString()
          : null
      })
      .select(`
        *,
        item:points_store_items(*)
      `)
      .single()

    if (purchaseError) {
      console.error('Erro ao criar compra na loja:', purchaseError)
      return NextResponse.json({ error: 'Erro ao processar compra' }, { status: 500 })
    }

    // Remover pontos do usuário (usar deduct_points ao invés de add_points negativo)
    await supabase.rpc('deduct_points', {
      p_user_id: user.id,
      p_points: item.points_price,
      p_source: 'store_purchase',
      p_description: `Comprou: ${item.name}`
    })

    return NextResponse.json({ 
      success: true,
      purchase,
      message: 'Item comprado com sucesso!'
    })
  } catch (error) {
    console.error('Erro na API de compra na loja:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
