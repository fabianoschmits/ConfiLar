import { NextRequest, NextResponse } from 'next/server'
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

    // Buscar transferências do usuário
    const { data, error } = await supabase
      .from('points_transfers')
      .select(`
        *,
        from_user:profiles!points_transfers_from_user_id_fkey(id, full_name, avatar_url),
        to_user:profiles!points_transfers_to_user_id_fkey(id, full_name, avatar_url)
      `)
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Erro ao buscar transferências:', error)
      return NextResponse.json({ error: 'Erro ao buscar transferências' }, { status: 500 })
    }

    return NextResponse.json({ transfers: data || [] })
  } catch (error) {
    console.error('Erro na API de listar transferências:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
