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
    const { package_id, payment_method } = body
    
    // Validar dados
    if (!package_id || !payment_method) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Criar compra
    const { data, error } = await supabase.rpc('create_points_purchase', {
      p_user_id: user.id,
      p_package_id: package_id,
      p_payment_method: payment_method
    })

    if (error) {
      console.error('Erro ao criar compra:', error)
      return NextResponse.json({ error: 'Erro ao criar compra' }, { status: 500 })
    }

    // Buscar detalhes da compra criada
    const { data: purchase, error: fetchError } = await supabase
      .from('points_purchases')
      .select(`
        *,
        package:points_packages(*)
      `)
      .eq('id', data)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar compra:', fetchError)
    }

    return NextResponse.json({ 
      success: true,
      purchase_id: data,
      purchase: purchase || null,
      message: 'Compra criada com sucesso'
    })
  } catch (error) {
    console.error('Erro na API de criar compra:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
