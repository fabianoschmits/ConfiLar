import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/authenticatedRoute'

/**
 * POST /api/economy/purchase/create
 * 
 * Cria uma compra de pacote de pontos para o usuário autenticado.
 * 
 * Segurança:
 * - ✅ Requer autenticação (withAuth)
 * - ✅ Sempre cria compra para o usuário autenticado (user.id)
 */
export const POST = withAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    // Parse do body
    const body = await request.json()
    const { package_id, payment_method } = body
    
    // Validar dados
    if (!package_id || !payment_method) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Criar compra para o usuário autenticado
    const { data, error } = await supabaseAuth.rpc('create_points_purchase', {
      p_user_id: user.id, // 🔒 Sempre ID autenticado
      p_package_id: package_id,
      p_payment_method: payment_method
    })

    if (error) {
      console.error('Erro ao criar compra:', error)
      return NextResponse.json({ error: 'Erro ao criar compra' }, { status: 500 })
    }

    // Buscar detalhes da compra criada
    const { data: purchase, error: fetchError } = await supabaseAuth
      .from('points_purchases')
      .select(`
        *,
        package:points_packages(*)
      `)
      .eq('id', data)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar compra:', fetchError)
    }

    // Criar notificação para o usuário sobre a compra
    if (purchase) {
      const packageData = (purchase.package as any)
      const pointsAmount = packageData?.points_amount || 0
      const price = packageData?.price || 0

      try {
        await supabaseAuth
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'achievement',
            title: '💰 Compra de ConfiPoints Realizada!',
            message: `Você comprou ${pointsAmount.toLocaleString('pt-BR')} ConfiPoints por R$ ${price.toFixed(2).replace('.', ',')}`,
            action_url: '/confipoints/dashboard',
            priority: 'high',
            metadata: {
              purchase_id: data,
              package_id: package_id,
              points_amount: pointsAmount,
              price: price,
              payment_method: payment_method,
              status: purchase.status,
              type: 'points_purchase'
            },
            is_read: false
          })

        // Enviar push notification
        try {
          const { NotificationService } = await import('@/services/NotificationService')
          await NotificationService.sendPushNotification(
            user.id,
            '💰 Compra Realizada!',
            `Você comprou ${pointsAmount.toLocaleString('pt-BR')} ConfiPoints`
          )
        } catch (pushError) {
          console.warn('⚠️ Erro ao enviar push notification:', pushError)
        }

        console.log('✅ Notificação criada para compra de pontos')
      } catch (notifError) {
        console.error('⚠️ Erro ao criar notificação de compra:', notifError)
      }
    }

    return NextResponse.json({ 
      success: true,
      purchase_id: data,
      purchase: purchase || null,
      message: 'Compra criada com sucesso'
    })
  } catch (error) {
    console.error('Erro na API de criar compra:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})
