import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/authenticatedRoute'

/**
 * POST /api/economy/transfer/create
 * 
 * Cria uma transferência de pontos do usuário autenticado para outro usuário.
 * 
 * Segurança:
 * - ✅ Requer autenticação (withAuth)
 * - ✅ Sempre transfere do usuário autenticado (user.id como from_user_id)
 */
export const POST = withAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    // Parse do body
    const body = await request.json()
    const { to_user_id, points_amount, message } = body
    
    // Validar dados
    if (!to_user_id || !points_amount) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    if (to_user_id === user.id) {
      return NextResponse.json({ error: 'Não é possível transferir para si mesmo' }, { status: 400 })
    }

    if (points_amount < 100) {
      return NextResponse.json({ error: 'Valor mínimo de transferência: 100 pontos' }, { status: 400 })
    }

    // Criar transferência do usuário autenticado
    const { data, error } = await supabaseAuth.rpc('transfer_points', {
      p_from_user_id: user.id, // 🔒 Sempre ID autenticado
      p_to_user_id: to_user_id,
      p_points_amount: points_amount,
      p_message: message || null
    })

    if (error) {
      console.error('Erro ao criar transferência:', error)
      return NextResponse.json({ error: error.message || 'Erro ao criar transferência' }, { status: 500 })
    }

    // Buscar detalhes da transferência criada
    const { data: transfer, error: fetchError } = await supabaseAuth
      .from('points_transfers')
      .select(`
        *,
        from_user:profiles!points_transfers_from_user_id_fkey(id, full_name, avatar_url),
        to_user:profiles!points_transfers_to_user_id_fkey(id, full_name, avatar_url)
      `)
      .eq('id', data)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar transferência:', fetchError)
    }

    // Criar notificações para ambos os usuários
    if (transfer) {
      const fromUserName = (transfer.from_user as any)?.full_name || 'Usuário'
      const toUserName = (transfer.to_user as any)?.full_name || 'Usuário'

      // Notificação para quem RECEBEU a transferência
      try {
        const { data: notification } = await supabaseAuth
          .from('notifications')
          .insert({
            user_id: to_user_id,
            type: 'achievement',
            title: '💰 Transferência Recebida!',
            message: `${fromUserName} transferiu ${points_amount.toLocaleString('pt-BR')} ConfiPoints para você${message ? `: "${message}"` : ''}`,
            action_url: '/confipoints/dashboard',
            priority: 'high',
            metadata: {
              transfer_id: data,
              from_user_id: user.id,
              from_user_name: fromUserName,
              points_received: transfer.net_amount,
              type: 'points_transfer_received'
            },
            is_read: false
          })
          .select()
          .single()

        // Enviar push notification
        try {
          const { NotificationService } = await import('@/services/NotificationService')
          await NotificationService.sendPushNotification(
            to_user_id,
            '💰 Transferência Recebida!',
            `${fromUserName} transferiu ${points_amount.toLocaleString('pt-BR')} ConfiPoints para você`
          )
        } catch (pushError) {
          console.warn('⚠️ Erro ao enviar push notification:', pushError)
        }

        console.log('✅ Notificação criada para destinatário da transferência')
      } catch (notifError) {
        console.error('⚠️ Erro ao criar notificação para destinatário:', notifError)
      }

      // Notificação para quem ENVIOU a transferência (confirmação)
      try {
        await supabaseAuth
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'info',
            title: '✅ Transferência Enviada!',
            message: `Você transferiu ${points_amount.toLocaleString('pt-BR')} ConfiPoints para ${toUserName}`,
            action_url: '/confipoints/dashboard',
            priority: 'normal',
            metadata: {
              transfer_id: data,
              to_user_id: to_user_id,
              to_user_name: toUserName,
              points_sent: points_amount,
              net_amount: transfer.net_amount,
              fee_amount: transfer.fee_amount,
              type: 'points_transfer_sent'
            },
            is_read: false
          })
        console.log('✅ Notificação criada para remetente da transferência')
      } catch (notifError) {
        console.error('⚠️ Erro ao criar notificação para remetente:', notifError)
      }
    }

    return NextResponse.json({ 
      success: true,
      transfer_id: data,
      transfer: transfer || null,
      message: 'Transferência realizada com sucesso'
    })
  } catch (error) {
    console.error('Erro na API de criar transferência:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})
