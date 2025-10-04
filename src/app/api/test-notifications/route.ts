import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { type, title, message, userId } = await request.json()

    if (!type || !title || !message) {
      return NextResponse.json({ 
        error: 'type, title e message são obrigatórios' 
      }, { status: 400 })
    }

    const adminSupabase = createAdminSupabaseClient()

    // Se userId for 'current', buscar o usuário atual
    let targetUserId = userId
    if (userId === 'current') {
      // Para teste, vamos usar o primeiro usuário disponível
      const { data: users, error: usersError } = await adminSupabase
        .from('profiles')
        .select('id')
        .limit(1)
        .single()

      if (usersError || !users) {
        return NextResponse.json({ 
          error: 'Nenhum usuário encontrado para teste' 
        }, { status: 404 })
      }

      targetUserId = users.id
    }

    // Criar notificação no banco
    const { data: notification, error: notificationError } = await adminSupabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        type,
        title,
        message,
        is_read: false
      })
      .select()
      .single()

    if (notificationError) {
      console.error('Erro ao criar notificação:', notificationError)
      return NextResponse.json({ 
        error: `Erro ao criar notificação: ${notificationError.message}` 
      }, { status: 500 })
    }

    console.log('✅ Notificação de teste criada:', notification)

    return NextResponse.json({ 
      success: true, 
      notification,
      message: 'Notificação de teste criada com sucesso!' 
    })

  } catch (error) {
    console.error('Erro na API de teste de notificações:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 })
  }
}
