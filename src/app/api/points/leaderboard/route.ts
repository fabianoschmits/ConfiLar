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

    // Parse dos query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Buscar leaderboard
    const { data, error } = await supabase
      .from('user_points_stats')
      .select(`
        user_id,
        full_name,
        points_balance,
        user_level,
        total_points_earned,
        global_rank
      `)
      .order('total_points_earned', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Erro ao buscar leaderboard:', error)
      return NextResponse.json({ error: 'Erro ao buscar leaderboard' }, { status: 500 })
    }

    return NextResponse.json({ 
      leaderboard: data || [],
      total: data?.length || 0
    })
  } catch (error) {
    console.error('Erro na API de leaderboard:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
