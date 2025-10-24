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
    const type = searchParams.get('type')
    const source = searchParams.get('source')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Construir query
    let query = supabase
      .from('point_transactions')
      .select(`
        *,
        referral:referrals(id, referred_id),
        post:feed_posts(id, content),
        related_user:profiles!point_transactions_related_user_id_fkey(id, full_name, avatar_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (type) {
      query = query.eq('type', type)
    }
    
    if (source) {
      query = query.eq('source', source)
    }
    
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar histórico de pontos:', error)
      return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 })
    }

    return NextResponse.json({ 
      transactions: data || [],
      pagination: {
        limit,
        offset,
        has_more: (data?.length || 0) === limit
      }
    })
  } catch (error) {
    console.error('Erro na API de histórico de pontos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
