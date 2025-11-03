import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withRateLimit } from '@/lib/rateLimitMiddleware'

/**
 * GET /api/points/leaderboard
 * 
 * Retorna o ranking de pontos dos usuários.
 * 
 * Segurança:
 * - ⚠️ Rota pública (mas com rate limiting)
 * - ⚠️ Expõe user_id (considerar mascarar em produção)
 */
const handler = async (request: NextRequest) => {
  try {
    // Parse dos query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Buscar leaderboard usando cliente público
    const { data, error } = await supabase
      .from('user_points_stats')
      .select(`
        user_id,
        balance,
        level,
        total_earned,
        total_spent
      `)
      .order('total_earned', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Erro ao buscar leaderboard:', error)
      // Se a tabela não existir, retornar array vazio
      if (error.code === 'PGRST205' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.log('Tabela user_points_stats não existe, retornando array vazio')
        return NextResponse.json({ 
          leaderboard: [],
          total: 0
        })
      }
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

export const GET = withRateLimit(handler, 'API_DEFAULT')
