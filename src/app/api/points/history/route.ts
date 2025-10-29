import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    // Parse dos query parameters
    const type = searchParams.get('type')
    const source = searchParams.get('source')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Construir query
    let query = supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)
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
      // Se a tabela não existir, retornar array vazio
      if (error.code === 'PGRST205' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return NextResponse.json({ 
          transactions: [],
          pagination: {
            limit,
            offset,
            has_more: false
          }
        })
      }
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
