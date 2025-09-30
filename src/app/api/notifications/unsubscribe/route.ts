import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 })
    }

    const adminSupabase = createAdminSupabaseClient()

    // Remover subscription do banco
    const { error } = await adminSupabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Erro ao remover subscription:', error)
      return NextResponse.json({ error: 'Erro ao remover subscription' }, { status: 500 })
    }

    console.log('✅ Push subscription removida para usuário:', userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro na API de unsubscription:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

