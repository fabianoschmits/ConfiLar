import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar saldo de pontos
    const { data, error } = await supabase
      .rpc('get_user_points_balance', { p_user_id: user.id })
      .single()

    if (error) {
      console.error('Erro ao buscar saldo de pontos:', error)
      return NextResponse.json({ error: 'Erro ao buscar saldo' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Erro na API de saldo de pontos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
