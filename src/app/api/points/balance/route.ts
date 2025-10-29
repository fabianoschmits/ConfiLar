import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    // Buscar saldo de pontos usando cliente admin (bypass RLS)
    const supabaseAdmin = createAdminSupabaseClient()
    const { data, error } = await supabaseAdmin
      .from('user_points_balance')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return NextResponse.json({ data: { balance: 0, total_earned: 0, total_spent: 0, available_balance: 0, daily_earned: 0 } })
      }
      // Se a tabela não existir, retornar dados padrão
      if (error.code === 'PGRST205' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.log('Tabela user_points_balance não existe, retornando dados padrão')
        return NextResponse.json({ data: { balance: 0, total_earned: 0, total_spent: 0, available_balance: 0, daily_earned: 0 } })
      }
      console.error('Erro ao buscar saldo de pontos:', error)
      return NextResponse.json({ error: 'Erro ao buscar saldo' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Erro na API de saldo de pontos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
